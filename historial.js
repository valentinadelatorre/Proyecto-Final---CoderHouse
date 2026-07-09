// historial.js
// Página "Historial de Pedidos": muestra los pedidos guardados en localStorage
// por comun.js cada vez que se confirma un pedido en "Todo" o "Restaurantes".

// Referencias a elementos del DOM que se usan en este archivo
const historialContainer = document.getElementById('historial-container');
const historialMensajeVacio = document.getElementById('historial-mensaje-vacio');
const botonVaciarHistorial = document.getElementById('btn-vaciar-historial');

// Da formato de precio en pesos a un número (ej: 3500 -> $3.500)
function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

// Lee el historial de pedidos guardado en localStorage (o un array vacío si no hay)
function obtenerHistorial() {
  const historialGuardado = localStorage.getItem('historialPedidos');
  return historialGuardado ? JSON.parse(historialGuardado) : [];
}

// Renderiza las tarjetas de pedidos pasados (o el mensaje de "vacío")
function renderizarHistorial() {
  const historial = obtenerHistorial();
  const hayPedidos = historial.length > 0;

  historialMensajeVacio.hidden = hayPedidos;
  botonVaciarHistorial.hidden = !hayPedidos;

  historialContainer.innerHTML = historial
    .map((pedido) => `
      <article class="pedido-card">
        <div class="pedido-card-header">
          <span class="pedido-card-numero">Pedido #${pedido.numero}</span>
          <span class="pedido-card-fecha">${pedido.fecha}</span>
        </div>
        <ul class="pedido-card-items">
          ${pedido.items
            .map((item) => `
              <li class="pedido-card-item">
                <span>${item.cantidad}x ${item.nombre}</span>
                <span class="pedido-card-item-restaurante">${item.restaurante}</span>
                <span>${formatearPrecio(item.precio * item.cantidad)}</span>
              </li>
            `)
            .join('')}
        </ul>
        <div class="pedido-card-footer">
          <span>Total</span>
          <span class="pedido-card-total">${formatearPrecio(pedido.total)}</span>
        </div>
      </article>
    `)
    .join('');
}

// Pide confirmación y, si se acepta, borra todo el historial guardado
function vaciarHistorial() {
  Swal.fire({
    icon: 'warning',
    title: '¿Vaciar historial?',
    text: 'Se van a borrar todos los pedidos guardados.',
    showCancelButton: true,
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      localStorage.removeItem('historialPedidos');
      renderizarHistorial();
    }
  });
}

// Activa el listener del botón "Vaciar historial"
function configurarHistorial() {
  botonVaciarHistorial.addEventListener('click', vaciarHistorial);
}

// Punto de entrada: se ejecuta cuando el HTML terminó de cargar
document.addEventListener('DOMContentLoaded', () => {
  renderizarHistorial();
  configurarHistorial();
});
