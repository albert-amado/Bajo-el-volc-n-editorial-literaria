import { abrirModal } from './modal.js';
import { agregarAlCarrito } from './carrito.js';

export function renderizarCarrusel(libros) {
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
              <div class="bev-book-cover-v2">
                <img src="${libro.imagen}" alt="${libro.titulo}"/>
                ${libro.etiqueta ? `<span class="bev-etiqueta bev-etiqueta-${libro.etiqueta}">${{
                  'nuevo': 'Nuevo',
                  'destacado': 'Destacado',
                  'preventa': 'En preventa',
                  'descuento': 'Oferta'
                }[libro.etiqueta] || libro.etiqueta}</span>` : ''}
              </div>
              <div class="bev-book-info-v2">
                <div>
                  <span class="bev-book-genre">${libro.genero}</span>
                  <h5 class="bev-book-title">${libro.titulo}</h5>
                  <p class="bev-book-author">${libro.autor}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <span class="bev-book-price">$${libro.precio.toLocaleString('es-CO')}</span>
                  <div class="d-flex gap-2">
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