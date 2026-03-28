// ================================================
// catalogo.js
// Lee libros.json y renderiza las tarjetas con filtros
// ================================================

let libros = []; // aquí se guardan todos los libros cargados del JSON

// Al cargar la página, trae el JSON y arranca
document.addEventListener('DOMContentLoaded', () => {
  fetch('../data/libros.json')
    .then(response => response.json())
    .then(data => {
      libros = data;
      renderizarLibros(libros);
      crearFiltros(libros);
    })
    .catch(error => console.error('Error cargando libros.json:', error));
});


// Renderiza las tarjetas en el grid
function renderizarLibros(lista) {
  const grid = document.getElementById('gridLibros');

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="bev-body-text">No hay libros en esta categoría.</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map(libro => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card bev-book-card h-100 border-0">

        <div class="bev-book-cover-wrap">
          <img src="${libro.imagen}" class="card-img-top" alt="${libro.titulo}"
            onerror="this.src='../assets/img/ui/placeholder.png'"/>
          ${libro.nuevo ? '<span class="bev-badge-nuevo">Nuevo</span>' : ''}
        </div>

        <div class="card-body d-flex flex-column">
          <span class="bev-book-genre">${libro.genero}</span>
          <h5 class="bev-book-title">${libro.titulo}</h5>
          <p class="bev-book-author">${libro.autor}</p>
          <p class="bev-book-desc">${libro.descripcion}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center pt-2 bev-card-footer">
            <span class="bev-book-price">$${libro.precio.toLocaleString('es-CO')}</span>
            <button class="btn bev-btn-add-cart" onclick="agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})">
              <i class="bi bi-bag-plus"></i> Agregar
            </button>
          </div>
        </div>

      </div>
    </div>
  `).join('');
}


// Genera los botones de filtro según los géneros que existan en el JSON
function crearFiltros(lista) {
  const generos = ['Todos', ...new Set(lista.map(l => l.genero))];
  const contenedor = document.getElementById('filtrosGenero');

  contenedor.innerHTML = generos.map(genero => `
    <button
      class="btn bev-btn-filtro ${genero === 'Todos' ? 'activo' : ''}"
      data-genero="${genero}">
      ${genero}
    </button>
  `).join('');

  // Evento de clic en cada botón de filtro
  contenedor.querySelectorAll('.bev-btn-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      // Marcar el botón activo
      contenedor.querySelectorAll('.bev-btn-filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      // Filtrar y rerenderizar
      const generoSeleccionado = btn.dataset.genero;
      const filtrados = generoSeleccionado === 'Todos'
        ? libros
        : libros.filter(l => l.genero === generoSeleccionado);

      renderizarLibros(filtrados);
    });
  });
}


// Agrega un libro al carrito (usa localStorage)
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


// Actualiza el número en el badge del navbar
function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('bev_carrito') || '[]');
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = total;
}


// Muestra el toast de confirmación
function mostrarToast(msg) {
  const t = document.getElementById('bevToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}