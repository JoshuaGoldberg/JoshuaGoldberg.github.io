const container = document.getElementById("projects");

const projects = [
  {
    title: "Lean Measure",
    preview:
      "An ongoing project to define probabilistic programming in Lean 4.",
    link: "lean_project.html",
  },
  {
    title: "Owl Lean",
    preview:
      "Bidirectional Typechecker for the security language Owl, written in Lean.",
    link: "owl_project.html",
  },
  {
    title: "JustinBot 3000",
    preview:
      "Agentic Chatbot created to assist TA's within foundational Cybersecurity courses.",
    link: "cybersecurity_project.html",
  },
  {
    title: "Osu!Mania Replay Renderer",
    preview:
      "A replay renderer for the rhythm game osu!mania, utilizing LZMA decompression and" +
      " a ground up recreation of the game for recording purposes.",
    link: "osu_project.html",
  },
  {
    title: "Tap.py",
    preview:
      "A small (and currently incomplete) clicker game written in Python, with the goal of fleshing out complex systems.",
    link: "osu_project.html",
  },
  {
    title: "Powerdle",
    preview:
      "Initially just a joke, this is a basic implementation of an evil Wordle clone. Mainly created to showcase skills learned from" +
      " CS2510, Northeastern's second fundamental computer science course.",
    link: "osu_project.html",
  },
];

projects.forEach((project) => {
  container.innerHTML += `
      <div class="works-panel">  
          <div class="works-header">
            <a href=${project.link}>
                <span class="works-title">${project.title}</span>
            </a>
          </div>
          <hr style="width:100%; border: 1px solid black; margin-top: 3px">
          <p> ${project.preview} </p>
      </div>
    `;
});
