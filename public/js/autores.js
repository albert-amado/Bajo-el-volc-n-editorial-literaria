export function renderizarAutores(autores) {
  const grid = document.getElementById('autoresGrid');
  if (!grid) return;

  grid.innerHTML = autores.map(autor => `
    <div class="col-6 col-md-4 col-lg-2 text-center">
      <div class="bev-author-avatar-wrap mx-auto">
        <img src="${autor.foto}" alt="${autor.nombre}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
        <div class="bev-avatar-fallback" style="display:none">
          ${autor.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>
      </div>
      <p class="bev-author-name mt-3">${autor.nombre}</p>
      <p class="bev-author-country">${autor.nacionalidad}</p>
      <p class="bev-author-bio">${autor.bio}</p>
    </div>
  `).join('');
}