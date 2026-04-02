let todosLosLibros = [];
let todosLosAutores = [];   // ← AÑADIDO (necesario para la bio del autor en el modal)

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    // Agregamos / al inicio para que la ruta sea absoluta desde la raíz de public
    fetch('/data/libros.json').then(r => r.json()),
    fetch('/data/autores.json').then(r => r.json())
  ])
  .then(([libros, autores]) => {
    todosLosLibros = libros;
    todosLosAutores = autores;   // ← AÑADIDO
    renderizarHero(libros);
    renderizarCarrusel(libros);
    renderizarAutores(autores);
    iniciarCategorias();
    actualizarContador();
  })
  .catch(err => console.error('Error cargando datos:', err));
});

function renderizarHero(libros) {
  const inner = document.getElementById('heroCarouselInner');
  const indicators = document.getElementById('heroIndicators');
  if (!inner) return;

  const slides = libros.slice(0, 9);

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
      style="background-image: url('${libro.imagen_hero || libro.imagen}');">
      <div class="bev-slide-overlay"></div>
      <div class="container h-100">
        <div class="row h-100 align-items-center">
          <div class="col-lg-6 bev-slide-content">
            ${libro.etiqueta === 'nuevo' ? '<span class="bev-hero-badge bev-etiqueta-nuevo">Nuevo</span>' : ''}
            ${libro.etiqueta === 'preventa' ? '<span class="bev-hero-badge bev-etiqueta-preventa">Próximo lanzamiento</span>' : ''}
            <span class="bev-eyebrow">${libro.genero}</span>
            <h1 class="bev-slide-title">${libro.titulo}</h1>
            <p class="bev-slide-author">${libro.autor}</p>
            <p class="bev-slide-desc">${libro.descripcion.substring(0, 120)}...</p>
            <div class="d-flex gap-3 flex-wrap mt-4">
              <a href="/catalogo" class="btn bev-btn-gold">Ver libro</a>
              <a href="/catalogo" class="btn bev-btn-outline-light">Ver catálogo</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}


// ------------------------------------------------
// CARRUSEL DE TARJETAS (MODIFICADO - solo lo necesario)
// ------------------------------------------------
function renderizarCarrusel(libros) {
  const inner = document.getElementById('librosCarouselInner');
  if (!inner) return;

  if (libros.length === 0) {
    inner.innerHTML = `
      <div class="carousel-item active">
        <div class="text-center py-5">
          <p style="color: var(--bev-ash);">No hay libros en esta categoría.</p>
        </div>
      </div>`;
    return;
  }

  const grupos = [];
  for (let i = 0; i < libros.length; i += 3) {
    grupos.push(libros.slice(i, i + 3));
  }

  inner.innerHTML = grupos.map((grupo, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <div class="row g-4">
        ${grupo.map(libro => `
          <div class="col-12 col-sm-6 col-md-4 col-lg-4"> 
            <div class="bev-book-card-v2 h-100" style="cursor:pointer;" onclick="abrirModal(${libro.id})">

              <!-- Portada -->
              <div class="bev-book-cover-v2">
                <img src="${libro.imagen}" alt="${libro.titulo}"/>
                ${libro.etiqueta ? `<span class="bev-etiqueta bev-etiqueta-${libro.etiqueta}">${{
                  'nuevo': 'Nuevo',
                  'destacado': 'Destacado',
                  'preventa': 'En preventa',
                  'descuento': 'Oferta'
                }[libro.etiqueta] || libro.etiqueta}</span>` : ''}
              </div>

              <!-- Info -->
              <div class="bev-book-info-v2">
                <div>
                  <span class="bev-book-genre">${libro.genero}</span>
                  <h5 class="bev-book-title">${libro.titulo}</h5>
                  <p class="bev-book-author">${libro.autor}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <span class="bev-book-price">$${libro.precio.toLocaleString('es-CO')}</span>
                  <div class="d-flex gap-2">
                    <!-- NUEVO: Botón "Más información" -->
                    <button class="btn btn-sm bev-btn-outline"
                      onclick="event.stopPropagation(); abrirModal(${libro.id})">
                      <i class="bi bi-plus-circle"></i> Conoce mas
                    </button>
                    <button class="btn bev-btn-add-cart"
                      onclick="event.stopPropagation(); agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})">
                      <i class="bi bi-bag-plus"></i> Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/* ── MODAL DETALLE DEL LIBRO (NUEVA FUNCIÓN) ── */
function abrirModal(id) {
  const libro = todosLosLibros.find(l => l.id === id);
  if (!libro) return;

  // Datos del libro
  document.getElementById('modalPortada').src = libro.imagen;
  document.getElementById('modalPortada').alt = libro.titulo;
  document.getElementById('modalTitulo').textContent = libro.titulo;
  document.getElementById('modalAutorNombre').textContent = libro.autor;
  document.getElementById('modalAutorNombreDetalle').textContent = libro.autor;
  document.getElementById('modalGenero').textContent = libro.genero;
  document.getElementById('modalDesc').textContent = libro.descripcion || 'Descripción no disponible.';
  document.getElementById('modalPrecio').textContent = `$${libro.precio.toLocaleString('es-CO')}`;

  // Etiqueta
  const etiquetaEl = document.getElementById('modalEtiqueta');
  if (libro.etiqueta) {
    const textos = { 'nuevo': 'Nuevo', 'destacado': 'Destacado', 'preventa': 'En preventa', 'descuento': 'Oferta' };
    etiquetaEl.textContent = textos[libro.etiqueta.toLowerCase()] || libro.etiqueta;
    etiquetaEl.className = `bev-etiqueta bev-etiqueta-${libro.etiqueta.toLowerCase()}`;
    etiquetaEl.classList.remove('d-none');
  } else {
    etiquetaEl.classList.add('d-none');
  }

  // Botón carrito dentro del modal
  document.getElementById('modalBtnCarrito').onclick = () => {
    agregarAlCarrito(libro.id, libro.titulo, libro.precio);
  };

  // ── Datos del autor (foto + biografía) ──
  const autor = todosLosAutores.find(a =>
    a.nombre?.toLowerCase() === libro.autor?.toLowerCase()
  );

  const fotoEl = document.getElementById('modalAutorFoto');
  const fallbackEl = document.getElementById('modalAutorFallback');
  const inicialesEl = document.getElementById('modalAutorIniciales');
  const bioEl = document.getElementById('modalAutorBio');

  if (autor) {
    fotoEl.src = autor.foto || '';
    fotoEl.style.display = 'block';
    fallbackEl.style.display = 'none';
    bioEl.textContent = autor.bio || '';
  } else {
    fotoEl.style.display = 'none';
    fallbackEl.style.display = 'flex';
    inicialesEl.textContent = libro.autor.split(' ').map(n => n[0]).slice(0, 2).join('');
    bioEl.textContent = '';
  }

  // Abrir modal Bootstrap
  new bootstrap.Modal(document.getElementById('modalLibro')).show();
}


// ------------------------------------------------
// CATEGORÍAS (sin cambios)
// ------------------------------------------------
function iniciarCategorias() {
  const items = document.querySelectorAll('.bev-categoria-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('activo'));
      item.classList.add('activo');

      const cat = item.dataset.categoria;
      let filtrados;

      if (cat === 'todos') {
        filtrados = todosLosLibros;
      } else if (['nuevo', 'destacado', 'preventa', 'descuento'].includes(cat)) {
        filtrados = todosLosLibros.filter(l => l.etiqueta === cat);
      } else {
        filtrados = todosLosLibros.filter(l =>
          l.genero.toLowerCase() === cat.toLowerCase()
        );
      }

      renderizarCarrusel(filtrados);
    });
  });
}


// ------------------------------------------------
// AUTORES (sin cambios)
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
// CARRITO (sin cambios)
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