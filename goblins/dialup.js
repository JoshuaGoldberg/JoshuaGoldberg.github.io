// Fakes a 56k dial-up page load: gray background first, then text trickles in
// with random stalls, marquees/links pop in when reached, images scan in top-down.
// Click or press any key to skip.

(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  root.classList.add("dialup");

  const style = document.createElement("style");
  style.textContent = `
    html.dialup:not(.dl-colors) body { background: #c0c0c0; }
    html.dialup:not(.dl-ready) body { visibility: hidden; }
    html.dialup .dl-pending { visibility: hidden; }
    .dl-scan { animation: dl-scan 2.4s steps(10) both; }
    @keyframes dl-scan {
      from { clip-path: inset(0 0 100% 0); }
      to { clip-path: inset(0 0 0 0); }
    }
    #dl-status {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
      display: flex; gap: 4px; padding: 2px;
      background: #c0c0c0; color: #000;
      font: 12px "MS Sans Serif", Tahoma, Arial, sans-serif;
      border-top: 1px solid #fff;
    }
    #dl-status > span {
      padding: 1px 6px;
      border: 1px solid; border-color: #808080 #fff #fff #808080;
      white-space: nowrap; overflow: hidden;
    }
    #dl-status-text { flex: 1; }
  `;
  document.head.appendChild(style);

  document.addEventListener("DOMContentLoaded", () => {
    const steps = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    );
    let totalChars = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement.closest("script, style")) continue;
        steps.push({ node, text: node.textContent });
        totalChars += node.textContent.length;
        node.textContent = "";
      } else if (node.matches("marquee, img, a")) {
        node.classList.add("dl-pending");
        steps.push({ el: node });
      }
    }

    const status = document.createElement("div");
    status.id = "dl-status";
    status.innerHTML =
      '<span id="dl-status-text">Opening page http://www.geocities.com/goblinsightingclub/...</span>' +
      '<span id="dl-status-pct"></span><span>Internet zone</span>';
    document.body.appendChild(status);
    root.classList.add("dl-ready");
    const statusText = status.querySelector("#dl-status-text");
    const statusPct = status.querySelector("#dl-status-pct");

    let stepIndex = 0;
    let charIndex = 0;
    let loadedChars = 0;
    let timer;

    const reveal = (el) => {
      el.classList.remove("dl-pending");
      if (el.tagName === "IMG") el.classList.add("dl-scan");
    };

    const finish = () => {
      clearTimeout(timer);
      for (; stepIndex < steps.length; stepIndex++) {
        const step = steps[stepIndex];
        if (step.el) reveal(step.el);
        else step.node.textContent = step.text;
      }
      root.classList.add("dl-colors");
      statusText.textContent = "Done";
      statusPct.textContent = "";
      document.removeEventListener("click", finish);
      document.removeEventListener("keydown", finish);
      setTimeout(() => status.remove(), 2500);
    };

    const tick = () => {
      let budget = 8 + Math.floor(Math.random() * 24);
      while (budget > 0 && stepIndex < steps.length) {
        const step = steps[stepIndex];
        if (step.el) {
          reveal(step.el);
          stepIndex++;
          continue;
        }
        const chunk = step.text.slice(charIndex, charIndex + budget);
        step.node.textContent += chunk;
        charIndex += chunk.length;
        loadedChars += chunk.length;
        budget -= chunk.length;
        if (charIndex >= step.text.length) {
          stepIndex++;
          charIndex = 0;
        }
      }

      if (stepIndex >= steps.length) return finish();

      const pct = Math.floor((loadedChars / totalChars) * 100);
      statusText.textContent =
        "Transferring data from www.geocities.com...";
      statusPct.textContent = `${pct}%`;

      // Every so often the "connection" hangs for a moment.
      const stall = Math.random() < 0.03;
      timer = setTimeout(tick, stall ? 400 + Math.random() * 1200 : 30);
    };

    document.addEventListener("click", finish);
    document.addEventListener("keydown", finish);

    // Gray screen while "connecting", then the page colors arrive.
    timer = setTimeout(() => {
      statusText.textContent = "Web site found. Waiting for reply...";
      timer = setTimeout(() => {
        root.classList.add("dl-colors");
        tick();
      }, 700);
    }, 900);
  });
})();
