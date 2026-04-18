const body = document.querySelector(".front-page-body");

body.innerHTML += `<div class="page-box thin">
      <div class="nav-bar">
        <button onclick="location.href = '/'">
          <img src="/assets/favicon.png" alt="home" /> Home
        </button>
        <span></span>
        <button onclick="location.href = '/resume/'">
          <img src="/assets/blue.png" alt="resume" /> Resume
        </button>
        <span></span>
        <button onclick="location.href = '/project/'">
          <img src="/assets/red.png" alt="projects" /> Projects
        </button>
        <span></span>
        <button onclick="location.href = '/blog/'">
          <img src="/assets/purple.png" alt="blog" />Blog
        </button>
      </div>
    </div>`;
