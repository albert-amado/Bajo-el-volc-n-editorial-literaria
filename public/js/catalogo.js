let todosLosLibros = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Usar ruta absoluta para el JSON
    fetch('/data/libros.json') 
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar libros.json');
            return response.json();
        })
        .then(libros => {
            todosLosLibros = libros;
            
            // 2. Solo ejecutar si los elementos existen en el DOM
            if (document.getElementById('listaLibros')) {
                crearFiltros(libros);
                renderizarLista(libros);
            }
            
            // Función global del carrito (si existe en layout)
            if (typeof actualizarContador === 'function') {
                actualizarContador();
            }
        })
        .catch(err => console.error('Error en el catálogo:', err));
});

function crearFiltros(libros) {
    const contenedor = document.getElementById('filtrosGenero');
    if (!contenedor) return;

    const generos = ['Todos', ...new Set(libros.map(l => l.genero))];

    contenedor.innerHTML = generos.map(g => `
        <button class="bev-filtro-btn ${g === 'Todos' ? 'activo' : ''}" data-genero="${g}">
            ${g}
        </button>
    `).join('');

    contenedor.querySelectorAll('.bev-filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            contenedor.querySelectorAll('.bev-filtro-btn').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');

            const filtrados = btn.dataset.genero === 'Todos'
                ? todosLosLibros
                : todosLosLibros.filter(l => l.genero === btn.dataset.genero);

            renderizarLista(filtrados);
        });
    });
}

function renderizarLista(libros) {
    const contenedor = document.getElementById('listaLibros');
    if (!contenedor) return;

    contenedor.innerHTML = libros.map(libro => `
        <div class="bev-libro-fila" onclick="abrirModal(${libro.id})">
            <div class="bev-libro-fila-img">
                <img src="${libro.imagen}" alt="${libro.titulo}" loading="lazy" />
            </div>
            <div class="bev-libro-fila-info">
                <span class="bev-book-genre">${libro.genero}</span>
                <h3 class="bev-libro-fila-titulo">${libro.titulo}</h3>
                <p class="bev-libro-fila-autor">${libro.autor}</p>
                <p class="bev-libro-fila-desc">${libro.descripcion}</p>
            </div>
            <div class="bev-libro-fila-accion">
                <span class="bev-book-price">$${libro.precio.toLocaleString('es-CO')}</span>
                <button class="btn bev-btn-gold mt-2 w-100" onclick="event.stopPropagation(); abrirModal(${libro.id})">
                    Ver detalles
                </button>
                <button class="btn bev-btn-add-cart mt-2 w-100" onclick="event.stopPropagation(); agregarAlCarrito(${libro.id}, '${libro.titulo}', ${libro.precio})">
                    <i class="bi bi-bag-plus"></i> Agregar
                </button>
            </div>
        </div>
    `).join('');
}

// Función global para el modal
window.abrirModal = function(id) {
    const libro = todosLosLibros.find(l => l.id === id);
    if (!libro) return;

    document.getElementById('modalImagen').src = libro.imagen;
    document.getElementById('modalTitulo').textContent = libro.titulo;
    document.getElementById('modalAutor').textContent = libro.autor;
    document.getElementById('modalDesc').textContent = libro.descripcion;
    document.getElementById('modalPrecio').textContent = `$${libro.precio.toLocaleString('es-CO')}`;

    const btn = document.getElementById('modalBtnCarrito');
    btn.onclick = () => agregarAlCarrito(libro.id, libro.titulo, libro.precio);

    const modal = new bootstrap.Modal(document.getElementById('modalLibro'));
    modal.show();
};