// historial.js - pedidos guardados en localStorage
const historialContainer = document.getElementById('historial-container');
const historialMensajeVacio = document.getElementById('historial-mensaje-vacio');
const botonVaciarHistorial = document.getElementById('btn-vaciar-historial');

function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

function obtenerHistorial() {
  const historialGuardado = localStorage.getItem('historialPedidos');
  return historialGuardado ? JSON.parse(historialGuardado) : [];
}


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

function vaciarHistorial() {
  Swal.fire({
    icon: 'warning',
    title: '¿Vaciar historial?',
    text: 'Se van a borrar todos los pedidos guardados.',
    showCancelButton: true,
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal-popup-app',
      title: 'swal-titulo-app',
      htmlContainer: 'swal-texto-app',
      confirmButton: 'swal-confirmar-app',
      cancelButton: 'swal-cancelar-app',
      icon: 'swal-icono-app'
    },
    buttonsStyling: false
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      localStorage.removeItem('historialPedidos');
      renderizarHistorial();
    }
  });
}

function configurarHistorial() {
  botonVaciarHistorial.addEventListener('click', vaciarHistorial);
}


renderizarHistorial();
configurarHistorial();
