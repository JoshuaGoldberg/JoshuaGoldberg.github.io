const loginButton = document.getElementById("search-button");

loginButton.addEventListener("click", () => {
  const username = document.getElementById("search");

  if (username.value === "web-resume.pdf") {
    window.open("/web-resume.pdf", "_blank");
  } else {
    alert("Cannot find file. Please try again.");
  }
});

// Also trigger on Enter key
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loginButton.click();
  }
});