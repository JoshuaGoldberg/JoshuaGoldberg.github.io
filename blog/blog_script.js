const container = document.getElementById("blog-posts");

const posts = [
  {
    title: "Goblin Sighting Club",
    date: "10/15/2026",
    preview:
      "Thank you for visiting our page! Please contact us directly for club information and a promotional pamphlet.",
    link: "/goblins",
  },
  {
    title: "My Review of Austin, Texas",
    date: "10/13/2026",
    preview:
      "7/10. Good food, bad heat, missing a few key quality of life updates.",
    link: "/blog/blog-posts/texas/",
  },
  {
    title: "Group Theory: CRM",
    date: "1/27/2026",
    preview:
      "You met me at a very chinese time in my academic life. A proof of the Chinese Remainder Theorem from my group theory class.",
    link: "/blog/blog-posts/group_week_1/",
  },
  {
    title: "Blogs Are Cool",
    date: "1/02/2026",
    preview:
      "A brief history of this websites creation, and perhaps a critique of my own procrastination.",
    link: "/blog/blog-posts/web_blog/",
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
