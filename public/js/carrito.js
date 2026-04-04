export function agregarAlCarrito(id, titulo, precio) {
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

export function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('bev_carrito') || '[]');
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = total;
}

export function mostrarToast(msg) {
  const t = document.getElementById('bevToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}