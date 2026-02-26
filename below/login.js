const loginButton = document.getElementById("login-button");

loginButton.addEventListener("click", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  if (username.value === "Daedalus" && password.value === "Heliophobia") {
    window.location.href = "/below/lab_main.html";
  } else {
    username.value = ""
    password.value = ""
    alert("Invalid credentials.");
  }
});

// Also trigger on Enter key
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    loginButton.click();
  }
});