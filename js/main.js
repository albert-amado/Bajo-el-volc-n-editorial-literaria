// ================================================
// main.js
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  // Carga libros y autores en paralelo
  Promise.all([
    fetch('data/libros.json').then(r => r.json()),
    fetch('data/autores.json').then(r => r.json())
  ])
  .then(([libros, autores]) => {
    renderizarHero(libros);
    renderizarCarrusel(libros);
    renderizarAutores(autores);
    actualizarContador();
  })
  .catch(err => console.error('Error cargando datos:', err));
});


// ------------------------------------------------
// HERO
// ------------------------------------------------
function renderizarHero(libros) {
  const inner      = document.getElementById('heroCarouselInner');
  const indicators = document.getElementById('heroIndicators');
  if (!inner) return;

  const slides = libros.slice(0, 6);

  if (indicators) {
    indicators.innerHTML = slides.map((_, i) => `
      <button type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide-to="${i}"
        ${i === 0 ? 'class="active" aria-current="true"' : ''}
        aria-label="Slide ${i + 1}">
      </button>
    `).join('');
  }

  inner.innerHTML = slides.map((libro, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''} bev-slide"
      style="background-image: url('${libro.imagen}');">
      <div class="bev-slide-overlay"></div>
      <div class="container h-100">
        <div class="row h-100 align-items-center">
          <div class="col-lg-6 bev-slide-content">
            <span class="bev-eyebrow">${libro.nuevo ? 'Novedad 2024' : libro.genero}</span>
            <h1 class="bev-slide-title">${libro.titulo}</h1>
            <p class="bev-slide-author">${libro.autor}</p>
            <p class="bev-slide-desc">${libro.descripcion.substring(0, 120)}...</p>
            <div class="d-flex gap-3 flex-wrap mt-4">
              <a href="pages/catalogo.html" class="btn bev-btn-gold">Ver libro</a>
              <a href="pages/catalogo.html" class="btn bev-btn-outline-light">Ver catálogo</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}


// ------------------------------------------------
// CARRUSEL DE TARJETAS
// ------------------------------------------------
function renderizarCarrusel(libros) {
  const inner = document.getElementById('librosCarouselInner');
  if (!inner) return;

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
                <img src="${libro.imagen}" class="card-img-top" alt="${libro.titulo}"/>
                ${libro.nuevo ? '<span class="bev-badge-nuevo">Nuevo</span>' : ''}
              </div>
              <div class="card-body d-flex flex-column">
                <span class="bev-book-genre">${libro.genero}</span>
                <h5 class="bev-book-title">${libro.titulo}</h5>
                <p class="bev-book-author">${libro.autor}</p>
                <p class="bev-book-desc">${libro.descripcion.substring(0, 100)}...</p>
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


// ------------------------------------------------
// AUTORES
// ------------------------------------------------
function renderizarAutores(autores) {
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


// ------------------------------------------------
// CARRITO
// ------------------------------------------------
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