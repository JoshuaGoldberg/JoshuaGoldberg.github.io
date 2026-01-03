const greetings = ["Hello", "Hola", "Bonjour", "Hallo", "Ciao", "Olá"];

const titleElement = document.querySelector(".title");

let currentIndex = 0;
titleElement.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % greetings.length;
  titleElement.textContent = greetings[currentIndex] + ", I'm Josh";

  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;

  void confetti({
    particleCount: 50,
    spread: 25,
    startVelocity: 25,
    origin: { x: x, y: y },
  });
});
