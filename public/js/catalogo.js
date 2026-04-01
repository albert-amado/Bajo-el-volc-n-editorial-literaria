/* ================================================
   catalogo.js
   Grid de libros + filtros + modal de detalle
   ================================================ */

let todosLosLibros = [];
let todosLosAutores = [];

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    fetch('/data/libros.json').then(r => r.json()),
    fetch('/data/autores.json').then(r => r.json())
  ])
  .then(([libros, autores]) => {
    todosLosLibros = libros;
    todosLosAutores = autores;
    renderizarGrid(libros);
    iniciarFiltros();
    actualizarContador();
  })
  .catch(err => console.error('Error cargando datos:', err));
});

/* ── GRID ── */
function renderizarGrid(libros) {
  const grid = document.getElementById('catalogoGrid');
  const sinResultados = document.getElementById('sinResultados');
  if (!grid) return;

  if (libros.length === 0) {
    grid.innerHTML = '';
    sinResultados.classList.remove('d-none');
    return;
  }

  sinResultados.classList.add('d-none');

  grid.innerHTML = libros.map(libro => `
    <div class="col-12 col-sm-6 col-lg-4 bev-catalogo-item" data-id="${libro.id}">
      <div class="bev-book-card-v2 h-100" style="cursor:pointer;" onclick="abrirModal(${libro.id})">

        <!-- Portada -->
        <div class="bev-book-cover-v2">
          <img src="${libro.imagen}" alt="${libro.titulo}" />
          ${libro.etiqueta ? `
            <span class="bev-etiqueta bev-etiqueta-${libro.etiqueta.toLowerCase()}">
              ${{ 'nuevo': 'Nuevo', 'destacado': 'Destacado', 'preventa': 'En preventa', 'descuento': 'Oferta' }[libro.etiqueta.toLowerCase()] || libro.etiqueta}
            </span>` : ''}
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
            <button
              class="btn bev-btn-add-cart"
              onclick="event.stopPropagation(); agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})"
            >
              <i class="bi bi-bag-plus"></i> Agregar
            </button>
          </div>
        </div>

      </div>
    </div>
  `).join('');
}

/* ── FILTROS ── */
function iniciarFiltros() {
  const btns = document.querySelectorAll('.bev-filtro-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      const filtro = btn.dataset.filtro;
      let filtrados;

      if (filtro === 'todos') {
        filtrados = todosLosLibros;
      } else if (['nuevo', 'destacado', 'preventa', 'descuento'].includes(filtro)) {
        filtrados = todosLosLibros.filter(l => l.etiqueta?.toLowerCase() === filtro);
      } else {
        filtrados = todosLosLibros.filter(l =>
          l.genero.toLowerCase() === filtro.toLowerCase()
        );
      }

      renderizarGrid(filtrados);
    });
  });
}

/* ── MODAL ── */
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
    etiquetaEl.style.cssText = 'position:static; font-size:0.7rem; padding:3px 10px;';
    etiquetaEl.classList.remove('d-none');
  } else {
    etiquetaEl.classList.add('d-none');
  }

  // Botón carrito
  document.getElementById('modalBtnCarrito').onclick = () => {
    agregarAlCarrito(libro.id, libro.titulo, libro.precio);
  };

  // ── AUTOR ──
  // ENLAZA AQUÍ: busca el autor en autores.json por nombre
  // Si tu autores.json tiene un campo "nombre" que coincide con libro.autor, esto funciona automáticamente.
  // Si el campo se llama diferente (ej: "nombreCompleto"), cámbialo abajo.
  const autor = todosLosAutores.find(a =>
    a.nombre?.toLowerCase() === libro.autor?.toLowerCase()
  );

  const fotoEl = document.getElementById('modalAutorFoto');
  const fallbackEl = document.getElementById('modalAutorFallback');
  const inicialesEl = document.getElementById('modalAutorIniciales');
  const bioEl = document.getElementById('modalAutorBio');

  if (autor) {
    // ENLAZA AQUÍ: campo foto — cambia "autor.foto" si tu JSON usa otro nombre de campo
    fotoEl.src = autor.foto || '';
    fotoEl.alt = autor.nombre;
    fotoEl.style.display = 'block';
    fallbackEl.style.display = 'none';

    // ENLAZA AQUÍ: campo bio — cambia "autor.bio" si tu JSON usa otro nombre de campo
    bioEl.textContent = autor.bio || '';
  } else {
    // Sin autor en JSON: muestra iniciales como fallback
    fotoEl.style.display = 'none';
    fallbackEl.style.display = 'flex';
    inicialesEl.textContent = libro.autor.split(' ').map(n => n[0]).slice(0, 2).join('');
    bioEl.textContent = '';
  }

  // Abrir modal Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('modalLibro'));
  modal.show();
}

/* ── CARRITO ── */
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