import { todosLosLibros } from './store.js';
import { renderizarCarrusel } from './carrusel.js';

export function iniciarCategorias() {
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