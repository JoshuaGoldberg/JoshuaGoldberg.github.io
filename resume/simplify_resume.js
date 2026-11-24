const BULLET = /^[●•▪◦]\s*/;
const KEY_VALUE = /^([^:]{1,40}?)\s*:\s*(.+)$/;
// A citation starts with an author like "J. M. Li," or "C. Zimmerman,".
const CITATION_START = /^(?:\p{Lu}\.\s?)+\p{Lu}[^,.]*,/u;
const PUBLICATIONS = /publication|papers/i;

function fontStyle(page, fontName) {
  try {
    const name = page.commonObjs.get(fontName).name || "";
    return { bold: /bold|black|heavy/i.test(name), italic: /italic|oblique/i.test(name) };
  } catch {
    return { bold: false, italic: false };
  }
}

function linkAt(links, x, y) {
  const hit = links.find(
    (l) => x >= l.rect[0] - 1 && x <= l.rect[2] + 1 && y >= l.rect[1] - 1 && y <= l.rect[3] + 1,
  );
  return hit ? hit.url : null;
}

// Group raw text items into visual lines, split into a left part and a
// right-aligned part (the date column).
function buildLines(page, items, links, pageWidth) {
  const rows = [];
  for (const item of items) {
    if (item.str === "" && !item.hasEOL) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    let row = rows.find((r) => Math.abs(r.y - y) < 2);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    if (item.str !== "") row.items.push({ ...item, x, y });
  }

  return rows
    .filter((r) => r.items.some((i) => i.str.trim()))
    .sort((a, b) => b.y - a.y)
    .map((row) => {
      const parts = row.items.sort((a, b) => a.x - b.x);
      const left = [];
      const right = [];
      let prevEnd = null;
      for (const p of parts) {
        const gap = prevEnd === null ? 0 : p.x - prevEnd;
        const target =
          right.length || (p.x > pageWidth * 0.6 && gap > pageWidth * 0.05) ? right : left;
        target.push(p);
        // Whitespace items can stretch across the gap before the date column.
        if (p.str.trim()) prevEnd = p.x + p.width;
      }
      const toSegments = (list) =>
        list.map((p) => ({
          text: p.str,
          ...fontStyle(page, p.fontName),
          href: p.str.trim() ? linkAt(links, p.x + p.width / 2, p.y + p.height / 2) : null,
        }));
      return {
        y: row.y,
        x: left.length ? left[0].x : parts[0].x,
        height: Math.max(...parts.map((p) => p.height)),
        segments: toSegments(left),
        right: right.map((p) => p.str).join("").trim(),
      };
    });
}

const lineText = (segments) => segments.map((s) => s.text).join("");

// Drop the first `count` characters from a list of segments.
function sliceSegments(segments, count) {
  const out = [];
  for (const s of segments) {
    if (count >= s.text.length) {
      count -= s.text.length;
      continue;
    }
    out.push({ ...s, text: s.text.slice(count) });
    count = 0;
  }
  return out;
}

function parseResume(lines) {
  const heights = lines.map((l) => Math.round(l.height));
  const bodyHeight = heights
    .slice()
    .sort((a, b) => heights.filter((h) => h === b).length - heights.filter((h) => h === a).length)[0];
  const lineGap = lines
    .slice(1)
    .map((l, i) => Math.round((lines[i].y - l.y) * 10) / 10)
    .filter((g) => g > 0)
    .sort((a, b) => a - b)[0];

  const nameLine = lines.reduce((a, b) => (b.height > a.height ? b : a));
  const resume = {
    name: lineText(nameLine.segments).trim(),
    contact: [],
    sections: [],
  };

  let section = null;
  let entry = null;
  let bullet = null;
  let citation = null;
  let prevY = null;

  for (const line of lines) {
    const gap = prevY === null ? 0 : prevY - line.y;
    prevY = line.y;
    const text = lineText(line.segments).trim();
    const newBlock = gap > lineGap * 1.1;

    if (line === nameLine) continue;

    // Contact line: everything between the name and the first header.
    if (!section && line.height <= bodyHeight + 0.5) {
      resume.contact.push(...splitContact(line.segments));
      continue;
    }

    if (line.height > bodyHeight + 1) {
      section = { title: text, facts: [], entries: [] };
      if (PUBLICATIONS.test(text)) section.citations = [];
      resume.sections.push(section);
      entry = bullet = citation = null;
      continue;
    }

    // Publications: one citation per author-led line, with wrapped lines
    // (hanging indent) joined onto the previous citation.
    if (section.citations) {
      const bulletMatch = text.match(BULLET);
      const lead = lineText(line.segments).length - lineText(line.segments).trimStart().length;
      const segments = sliceSegments(line.segments, lead + (bulletMatch ? bulletMatch[0].length : 0));
      if (!citation || bulletMatch || CITATION_START.test(text)) {
        citation = segments;
        section.citations.push(citation);
      } else {
        citation.push({ text: " " }, ...segments);
      }
      continue;
    }

    const bulletMatch = text.match(BULLET);
    if (bulletMatch) {
      const lead = lineText(line.segments).length - lineText(line.segments).trimStart().length;
      bullet = sliceSegments(line.segments, lead + bulletMatch[0].length);
      (entry ? entry.bullets : section.facts).push(bullet);
      continue;
    }

    if (bullet && !newBlock && !line.right) {
      bullet.push({ text: " " }, ...line.segments);
      continue;
    }
    bullet = null;

    const kv = !line.right && text.match(KEY_VALUE);
    if (kv) {
      const fact = { label: kv[1].trim(), value: valueSegments(line.segments) };
      if (newBlock && section.entries.length) {
        // A standalone "Label: value" block after entries becomes its own section.
        section = { title: fact.label, facts: [], entries: [], inline: fact.value };
        resume.sections.push(section);
        entry = null;
      } else if (entry && !newBlock) {
        entry.details.push(fact);
      } else {
        section.facts.push(fact);
      }
      continue;
    }

    if (newBlock || !entry) {
      entry = makeEntry(line);
      section.entries.push(entry);
    } else {
      entry.subtitles.push({ segments: line.segments, right: line.right });
    }
  }

  return resume;
}

function valueSegments(segments) {
  const colon = lineText(segments).indexOf(":");
  const value = sliceSegments(segments, colon + 1);
  if (value.length) value[0] = { ...value[0], text: value[0].text.trimStart() };
  return value;
}

function splitContact(segments) {
  const parts = [[]];
  for (const s of segments) {
    const pieces = s.text.split("|");
    pieces.forEach((piece, i) => {
      if (i > 0) parts.push([]);
      if (piece.trim()) parts[parts.length - 1].push({ ...s, text: piece.trim() });
    });
  }
  return parts.filter((p) => p.length);
}

// "OwlLean [source] - Lean 4" -> title "OwlLean", tag "Lean 4", source link.
function makeEntry(line) {
  const sources = [];
  const kept = line.segments.filter((s) => {
    if (/^\[.+\]$/.test(s.text.trim()) && s.href) {
      sources.push({ label: s.text.trim().slice(1, -1), href: s.href });
      return false;
    }
    return true;
  });
  const full = lineText(kept).replace(/\s+/g, " ").trim();
  const split = full.indexOf(" - ");
  const title = split === -1 ? full : full.slice(0, split).trim();
  const tag = split === -1 ? "" : full.slice(split + 3).trim();
  const titleLink = kept.find((s) => s.href && s.text.trim());
  return {
    title,
    tag,
    href: titleLink ? titleLink.href : null,
    hrefLabel: titleLink ? titleLink.text.trim() : null,
    date: line.right,
    sources,
    subtitles: [],
    details: [],
    bullets: [],
  };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderSegments(segments) {
  const frag = document.createDocumentFragment();
  for (const s of segments) {
    let node = document.createTextNode(s.text);
    if (s.bold) {
      const b = el("b");
      b.append(node);
      node = b;
    }
    if (s.italic) {
      const i = el("i");
      i.append(node);
      node = i;
    }
    if (s.href) {
      const a = el("a");
      a.href = s.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.append(node);
      node = a;
    }
    frag.append(node);
  }
  return frag;
}

// Text with `label` (if present in it) turned into a link.
function linkText(text, label, href) {
  const frag = document.createDocumentFragment();
  const at = label && href ? text.indexOf(label) : -1;
  if (at === -1) {
    frag.append(text);
    return frag;
  }
  const a = el("a", null, label);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  frag.append(text.slice(0, at), a, text.slice(at + label.length));
  return frag;
}

function renderFact(fact) {
  const p = el("p", "resume-fact");
  p.append(el("b", null, fact.label + ": "), renderSegments(fact.value));
  return p;
}

function collapsible(summaryContent, className) {
  const details = el("details", "resume-box" + (className ? " " + className : ""));
  const summary = el("summary");
  summary.append(...summaryContent);
  details.append(summary);
  const body = el("div", "resume-box-body");
  details.append(body);
  return { details, body };
}

function renderEntry(entry) {
  const head = el("span", "resume-box-head");
  const titleWrap = el("span", "resume-box-title");
  const titleLine = el("span", "resume-title-line");
  titleLine.append(el("b", null, entry.title));
  for (const s of entry.sources) {
    const a = el("a", "resume-source", s.label[0].toUpperCase() + s.label.slice(1));
    a.href = s.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    titleLine.append(a);
  }
  titleWrap.append(titleLine);
  if (entry.tag) {
    const tag = el("span", "resume-tag");
    tag.append(linkText(entry.tag, entry.hrefLabel, entry.href));
    titleWrap.append(tag);
  }
  head.append(titleWrap);
  if (entry.date) head.append(el("span", "resume-date", entry.date));
  const { details, body } = collapsible([head]);

  for (const sub of entry.subtitles) {
    const p = el("p", "resume-subtitle");
    p.append(renderSegments(sub.segments));
    if (sub.right) p.append(el("span", "resume-date", sub.right));
    body.append(p);
  }
  entry.details.forEach((f) => body.append(renderFact(f)));
  if (entry.bullets.length) {
    const ul = el("ul");
    for (const b of entry.bullets) {
      const li = el("li");
      li.append(renderSegments(b));
      ul.append(li);
    }
    body.append(ul);
  }
  if (!body.childNodes.length) {
    details.classList.add("empty");
    body.remove();
  }
  return details;
}

// 'A. B, C. D. "Title." Venue. DOI: 10.x' -> { authors, title, venue, doi }.
// Falls back to the raw text when there is no quoted title.
function splitCitation(segments) {
  const text = lineText(segments).replace(/\s+/g, " ").trim();
  const links = segments.filter((s) => s.href && s.text.trim()).map((s) => s.href);
  const m = text.match(/^(.*?)\s*["“](.+?)["”]\s*(.*)$/);
  if (!m) return { text, href: links[0] || null };

  let venue = m[3];
  let doi = null;
  const d = venue.match(/\s*DOI:?\s*(10\.\S+?)\.?$/i);
  if (d) {
    doi = {
      label: d[1],
      href: links.find((l) => l.includes(d[1])) || "https://doi.org/" + d[1],
    };
    venue = venue.slice(0, d.index);
  }
  return {
    authors: m[1].trim().replace(/,$/, ""),
    title: m[2].replace(/[\s.,]+$/, ""),
    venue: venue.replace(/[\s.,]+$/, ""),
    doi,
    href: links.find((l) => !doi || l !== doi.href) || null,
  };
}

// Author list with the resume owner's name ("J. Goldberg") in bold.
function authorList(authors, ownerName) {
  const frag = document.createDocumentFragment();
  const parts = ownerName.split(/\s+/);
  const short = parts[0][0] + ". " + parts[parts.length - 1];
  const at = authors.indexOf(short);
  if (at === -1) {
    frag.append(authors);
  } else {
    frag.append(authors.slice(0, at), el("b", null, short), authors.slice(at + short.length));
  }
  return frag;
}

function renderCitation(segments, ownerName) {
  const c = splitCitation(segments);
  const titleWrap = el("span", "resume-box-title");
  if (!c.title) {
    titleWrap.append(renderSegments(segments));
  } else {
    const titleLine = el("span", "resume-title-line");
    const title = el("b", null, c.title);
    if (c.href) {
      const a = el("a");
      a.href = c.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.append(title);
      titleLine.append(a);
    } else {
      titleLine.append(title);
    }
    if (c.doi) {
      const a = el("a", "resume-source resume-doi", "DOI");
      a.href = c.doi.href;
      a.title = c.doi.label;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      titleLine.append(a);
    }
    titleWrap.append(titleLine);
    const authors = el("span", "resume-authors");
    authors.append(authorList(c.authors, ownerName));
    titleWrap.append(authors);
    if (c.venue) titleWrap.append(el("span", "resume-tag", c.venue));
  }
  const head = el("span", "resume-box-head");
  head.append(titleWrap);
  const { details, body } = collapsible([head], "empty");
  body.remove();
  return details;
}

function renderResume(resume, container) {
  container.replaceChildren();

  // Only sections made of dated entries (or publications) are shown; the
  // name/contact header, skill lists, and standalone lines like Interests
  // are left out.
  for (const section of resume.sections) {
    const citations = section.citations || [];
    if (!section.entries.length && !citations.length) continue;

    const wrap = el("section", "resume-section");
    wrap.append(el("h3", null, section.title));
    wrap.append(el("hr", "resume-rule"));
    section.entries.forEach((e) => wrap.append(renderEntry(e)));
    citations.forEach((c) => wrap.append(renderCitation(c, resume.name)));
    container.append(wrap);
  }
}

async function buildSimplifiedResume(pdfPromise, container) {
  try {
    const pdf = await pdfPromise;
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      await page.getOperatorList(); // loads fonts so bold/italic can be detected
      const [content, annotations] = await Promise.all([
        page.getTextContent(),
        page.getAnnotations(),
      ]);
      const links = annotations.filter((a) => a.url).map((a) => ({ url: a.url, rect: a.rect }));
      const width = page.getViewport({ scale: 1 }).width;
      pages.push(...buildLines(page, content.items, links, width));
    }
    renderResume(parseResume(pages), container);
  } catch (err) {
    console.error("Could not build simplified resume", err);
    container.replaceChildren(
      el("p", "centered", "Couldn't build the simplified view. Try the default view instead."),
    );
  }
}

buildSimplifiedResume(resumePdf, document.getElementById("other-view"));
