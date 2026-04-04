import { todosLosLibros, todosLosAutores } from './store.js';
import { agregarAlCarrito } from './carrito.js';

export function abrirModal(id) {
  const libro = todosLosLibros.find(l => l.id === id);
  if (!libro) return;

  document.getElementById('modalPortada').src = libro.imagen;
  document.getElementById('modalPortada').alt = libro.titulo;
  document.getElementById('modalTitulo').textContent = libro.titulo;
  document.getElementById('modalAutorNombre').textContent = libro.autor;
  document.getElementById('modalAutorNombreDetalle').textContent = libro.autor;
  document.getElementById('modalGenero').textContent = libro.genero;
  document.getElementById('modalDesc').textContent = libro.descripcion || 'Descripción no disponible.';
  document.getElementById('modalPrecio').textContent = `$${libro.precio.toLocaleString('es-CO')}`;

  // Etiquetas
  const etiquetaEl = document.getElementById('modalEtiqueta');
  if (libro.etiqueta) {
    const textos = { 'nuevo': 'Nuevo', 'destacado': 'Destacado', 'preventa': 'En preventa', 'descuento': 'Oferta' };
    etiquetaEl.textContent = textos[libro.etiqueta.toLowerCase()] || libro.etiqueta;
    etiquetaEl.className = `bev-etiqueta bev-etiqueta-${libro.etiqueta.toLowerCase()}`;
    etiquetaEl.classList.remove('d-none');
  } else {
    etiquetaEl.classList.add('d-none');
  }

  // Botón carrito
  document.getElementById('modalBtnCarrito').onclick = () => {
    agregarAlCarrito(libro.id, libro.titulo, libro.precio);
  };

  // Datos del autor
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

  new bootstrap.Modal(document.getElementById('modalLibro')).show();
}