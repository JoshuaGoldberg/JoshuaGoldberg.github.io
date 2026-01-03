const container = document.getElementById("index-body");

const params = new URLSearchParams(window.location.search);

if (params.get("from") === "link") {
  container.innerHTML += `
      <div class="centered">  
          <h1>Déjà vu...</h1>
      </div>
    `;
}
