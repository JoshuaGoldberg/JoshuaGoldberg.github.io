const container = document.getElementById("blog-posts");

const posts = [
  {
    title: "Blogs Are Cool",
    date: "12/20/2025",
    preview:
      "A brief history of this websites creation, and perhaps a critique of my own procrastination.",
    link: "/blog/blog-posts/web_blog.html",
  },
];

posts.forEach((post) => {
  container.innerHTML += `
      <div class="works-panel">  
          <div class="works-header">
            <a href=${post.link}>
                <span class="works-title">${post.title}</span>
            </a>
            <span class="works-date">${post.date}</span>
          </div>
          <hr style="width:100%; border: 1px solid black; margin-top: 3px">
          <p> ${post.preview} </p>
      </div>
    `;
});
