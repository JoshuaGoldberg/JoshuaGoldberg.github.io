pdfjsLib.getDocument("/web-resume.pdf").promise.then((pdf) => {
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
  });
});

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "/web-resume.pdf";
    document.body.appendChild(iframe);
    iframe.addEventListener("load", () => {
      iframe.contentWindow.print();
    });
  }
});
