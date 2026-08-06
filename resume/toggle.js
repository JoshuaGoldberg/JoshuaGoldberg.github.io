const resumeSwitch = document.getElementById("resume-switch");
const resumeView = document.getElementById("resume-view");
const otherView = document.getElementById("other-view");

function setMode(mode) {
  switch (mode) {
    case "default":
      resumeView.style.display = "";
      otherView.style.display = "none";
      break;
    case "simple":
      resumeView.style.display = "none";
      otherView.style.display = "";
      break;
  }
}

resumeSwitch.addEventListener("change", function () {
  setMode(this.checked ? "simple" : "default");
});

setMode("default");
