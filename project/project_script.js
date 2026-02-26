const container = document.getElementById("projects");

const tags = {
  RESEARCH: "Research",
  ACADEMIC: "Academic",
  PERSONAL: "Personal",
};

const projects = [
  {
    title: "Lean Measure",
    preview: "An ongoing project to define probabilistic spaces in Lean 4.",
    link: "/project/projects/lean_project.html",
    source: undefined,
    tag: tags.RESEARCH,
  },
  {
    title: "Owl Lean",
    preview:
      "Bidirectional Typechecker for the security language Owl, written in Lean 4. Implements bidirectional typing systems, and support for information flow.",
    link: "/project/projects/owl_project.html",
    source: "https://github.com/JoshuaGoldberg/owl-lean",
    tag: tags.RESEARCH,
  },
  {
    title: "JustinBot 3000",
    preview:
      "Agentic Chatbot created to assist TA's within foundational Cybersecurity courses. Utilizes Retrieval-Augmented Generation (RAG) for targeted responses.",
    link: "/project/projects/cybersecurity_project.html",
    source: "https://github.com/FrueanA/JustinBot3000",
    tag: tags.ACADEMIC,
  },
  {
    title: "Osu!Mania Replay Renderer",
    preview:
      "A replay renderer for the rhythm game osu!mania, utilizing LZMA decompression and" +
      " a ground up recreation of the game for recording purposes.",
    link: "/project/projects/osu_project.html",
    source: "https://github.com/JoshuaGoldberg/ManiaRenderer",
    tag: tags.PERSONAL,
  },
  {
    title: "ELEMENTS",
    preview:
      "Also known as the <b>E</b>xtensive <b>L</b>anguage for the <b>E</b>fficient <b>M</b>onitoring of <b>E</b>ffective <b>N</b>umerical <b>T</b>eam-wide <b>S</b>tatistics (if you're not into the whole brevity thing). A Racket based DSL for calculating and optimizing damage rotations in Genshin Impact.",
    link: "/project/projects/dsl_project.html",
    source: "https://github.com/w1lldu/elements",
    tag: tags.ACADEMIC,
  },
  {
    title: "Tap.py",
    preview:
      "A small (and currently in progress) clicker game written in Python, with the goal of fleshing out complex systems. Currently features a robust worker management, shop, and inventory mechanics.",
    link: "/project/projects/clicker_project.html",
    source: "https://github.com/JoshuaGoldberg/Tap.py",
    tag: tags.PERSONAL,
  },
  {
    title: "Powerdle",
    preview:
      "Initially just a joke, this is a basic implementation of an evil Wordle clone aiming to be as annoying and unfair as possible. Mainly created to showcase skills learned from" +
      " CS2510, Northeastern's second fundamental computer science course.",
    link: "/project/projects/wordle_project.html",
    source: "https://github.com/JoshuaGoldberg/powerdle",
    tag: tags.PERSONAL,
  },
];

projects.forEach((project) => {
  container.innerHTML += `
      <div class="works-panel">  
          <div class="works-header">
            <a href=${project.link}>
                <span class="works-title">${project.title}</span>
            </a>
            <span class="project-tag">${project.tag}</span>
          </div>
          <hr style="width:100%; border: 1px solid black; margin-top: 3px">
          <p> ${project.preview} </p>
          ${
            project.source
              ? `<p><a href="${project.source}" class="github-link" target="_blank"
            rel="noopener noreferrer">(Source)</a></p>`
              : `<p>(No Source Available)</p>`
          }
      </div>
    `;
});

const key_sequence = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowRight', 'ArrowDown'];
let key_index = 0;
let complete = false

document.addEventListener("keydown", (e) => {
  if (e.key === key_sequence[key_index] && !complete) {
        key_index++;

        if (key_index === key_sequence.length) {
            console.log("Welcome Aboard")
            complete = true;
            key_index = 0;
            const div = document.createElement("div");
            div.innerHTML = `
                <div class="works-panel">  
                    <div class="works-header">
                      <a href="/below/main.html">
                          <span class="works-title">Divine Parthenogenesis Θ</span>
                      </a>
                      <span class="project-tag">■■■■■■■■</span>
                    </div>
                    <hr style="width:100%; border: 1px solid black; margin-top: 3px">
                    <p>Last record updated on ■■/■■/■■■■. You are not supposed to be here.</p>
                </div>
            `;
            const returnLink = document.getElementById("return");
            container.insertBefore(div, returnLink);
        }
  } else {
    key_index = 0;
  }
});
