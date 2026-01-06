const returnButton = document.getElementById("return");

returnButton.addEventListener("click", (e) => {
  if (
    history.length > 1 &&
    document.referrer.indexOf(window.location.host) !== -1
  ) {
    e.preventDefault();
    history.back();
  }
});
