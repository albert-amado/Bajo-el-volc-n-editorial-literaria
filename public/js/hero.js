export function renderizarHero(libros) {
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