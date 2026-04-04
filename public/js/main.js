import { setLibros, setAutores } from './store.js';
import { renderizarHero } from './hero.js';
import { renderizarCarrusel } from './carrusel.js';
import { renderizarAutores } from './autores.js';
import { iniciarCategorias } from './categorias.js';
import { actualizarContador, agregarAlCarrito } from './carrito.js';
import { abrirModal } from './modal.js';

window.abrirModal = abrirModal;
window.agregarAlCarrito = agregarAlCarrito;

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    fetch('/data/libros.json').then(r => r.json()),
    fetch('/data/autores.json').then(r => r.json())
  ])
  .then(([libros, autores]) => {
    setLibros(libros);
    setAutores(autores);
    renderizarHero(libros);
    renderizarCarrusel(libros);
    renderizarAutores(autores);
    iniciarCategorias();
    actualizarContador();
  })
  .catch(err => console.error('Error cargando datos:', err));
});