const resume = "/resume_Joshua_Goldberg.pdf"

const resumePdf = pdfjsLib.getDocument(resume).promise;

resumePdf.then((pdf) => {
  pdf.getPage(1).then((page) => {
    const canvas = document.getElementById("pdf-viewer");
    const context = canvas.getContext("2d");

    const containerWidth = canvas.parentElement.clientWidth;
    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / unscaledViewport.width;

    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    canvas.style.width = containerWidth + "px";
    canvas.style.height = (viewport.height / dpr) + "px";

    page.render({ canvasContext: context, viewport });

    addLinkOverlay(page, canvas.parentElement, unscaledViewport);
  });
});

// Place a clickable area over each link in the PDF. Positions are in
// percentages so they stay aligned however the canvas is sized.
function addLinkOverlay(page, container, viewport) {
  page.getAnnotations().then((annotations) => {
    container.style.position = "relative";
    for (const a of annotations) {
      if (!a.url) continue;
      const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(a.rect);
      const link = document.createElement("a");
      link.className = "pdf-link";
      link.href = a.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.title = a.url.replace(/^mailto:/, "");
      link.style.left = (Math.min(x1, x2) / viewport.width) * 100 + "%";
      link.style.top = (Math.min(y1, y2) / viewport.height) * 100 + "%";
      link.style.width = (Math.abs(x2 - x1) / viewport.width) * 100 + "%";
      link.style.height = (Math.abs(y2 - y1) / viewport.height) * 100 + "%";
      container.appendChild(link);
    }
  });
}

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = resume;
    document.body.appendChild(iframe);
    iframe.addEventListener("load", () => {
      iframe.contentWindow.print();
    });
  }
});
