// ================================================
// main.js — carga libros destacados en el carrusel
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/libros.json')
    .then(r => r.json())
    .then(libros => {
      const destacados = libros.filter(l => l.destacado === true);
      renderizarCarrusel(destacados);
      actualizarContador();
    })
    .catch(err => console.error('Error cargando libros.json:', err));
});


function renderizarCarrusel(libros) {
  const inner = document.getElementById('librosCarouselInner');
  if (!inner) return;

  // Dividir el array en grupos de 3
  const grupos = [];
  for (let i = 0; i < libros.length; i += 3) {
    grupos.push(libros.slice(i, i + 3));
  }

  inner.innerHTML = grupos.map((grupo, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <div class="row g-4">
        ${grupo.map(libro => `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card bev-book-card h-100 border-0">
              <div class="bev-book-cover-wrap">
                <img src="${libro.imagen}" class="card-img-top" alt="${libro.titulo}"
                  onerror="this.src='assets/img/ui/placeholder.png'"/>
                ${libro.nuevo ? '<span class="bev-badge-nuevo">Nuevo</span>' : ''}
              </div>
              <div class="card-body d-flex flex-column">
                <span class="bev-book-genre">${libro.genero}</span>
                <h5 class="bev-book-title">${libro.titulo}</h5>
                <p class="bev-book-author">${libro.autor}</p>
                <p class="bev-book-desc">${libro.descripcion}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center pt-2 bev-card-footer">
                  <span class="bev-book-price">$${libro.precio.toLocaleString('es-CO')}</span>
                  <button class="btn bev-btn-add-cart"
                    onclick="agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})">
                    <i class="bi bi-bag-plus"></i> Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}


function agregarAlCarrito(id, titulo, precio) {
  let carrito = JSON.parse(localStorage.getItem('bev_carrito') || '[]');
  const existe = carrito.find(i => i.id === id);
  if (existe) {
    existe.cantidad += 1;
  } else {
    carrito.push({ id, titulo, precio, cantidad: 1 });
  }
  localStorage.setItem('bev_carrito', JSON.stringify(carrito));
  actualizarContador();
  mostrarToast(`"${titulo}" agregado al carrito`);
}


function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('bev_carrito') || '[]');
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = total;
}


function mostrarToast(msg) {
  const t = document.getElementById('bevToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}