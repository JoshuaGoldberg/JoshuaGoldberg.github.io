const body = document.querySelector(".front-page-body");

body.innerHTML += `<div class="page-box thin">
      <div class="nav-bar">
        <button onclick="location.href = '/index.html'">
          <img src="/assets/favicon.png" alt="home" /> Home
        </button>
        <span></span>
        <button onclick="location.href = '/resume/resume.html'">
          <img src="/assets/blue.png" alt="resume" /> Resume
        </button>
        <span></span>
        <button onclick="location.href = '/project/projects.html'">
          <img src="/assets/red.png" alt="projects" /> Projects
        </button>
        <span></span>
        <button onclick="location.href = '/blog/blog.html'">
          <img src="/assets/purple.png" alt="blog" />Blog
        </button>
      </div>
    </div>`;
