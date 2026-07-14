// comun.js - carrito, checkout y tracking
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const carritoContainer = document.getElementById('carrito-container');
const carritoLista = document.getElementById('carrito-lista');
const carritoMensajeVacio = document.getElementById('carrito-mensaje-vacio');
const carritoTotalMonto = document.getElementById('carrito-total-monto');
const botonConfirmarPedido = document.getElementById('btn-confirmar-pedido');
const trackingContainer = document.getElementById('tracking-container');
const pasosTracking = document.querySelectorAll('.tracking-paso');
const botonNuevoPedido = document.getElementById('btn-nuevo-pedido');
const filtrosCategoria = document.querySelector('.filtros-categoria');
const contenidoPrincipal = document.querySelector('.contenido-principal');

const formDatosCliente = document.getElementById('form-datos-cliente');
const inputNombre = document.getElementById('input-nombre');
const inputDireccion = document.getElementById('input-direccion');
const inputTelefono = document.getElementById('input-telefono');
const selectMetodoPago = document.getElementById('select-metodo-pago');

const camposTarjeta = document.getElementById('campos-tarjeta');
const inputNumeroTarjeta = document.getElementById('input-numero-tarjeta');
const inputVencimientoTarjeta = document.getElementById('input-vencimiento-tarjeta');
const inputCvvTarjeta = document.getElementById('input-cvv-tarjeta');
const inputsSoloNumeros = [inputNumeroTarjeta, inputVencimientoTarjeta, inputCvvTarjeta];

function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

// estilos custom para sweetalert
const estilosSwal = {
  customClass: {
    popup: 'swal-popup-app',
    title: 'swal-titulo-app',
    htmlContainer: 'swal-texto-app',
    confirmButton: 'swal-confirmar-app',
    cancelButton: 'swal-cancelar-app',
    icon: 'swal-icono-app'
  },
  buttonsStyling: false
};

// toast arriba a la derecha
function mostrarToast(mensaje, esError = false) {
  Toastify({
    text: mensaje,
    duration: 2500,
    gravity: 'top',
    position: 'right',
    className: `toastify-app ${esError ? 'toast-error' : ''}`,
    stopOnFocus: true
  }).showToast();
}

// dibuja las tarjetas de platos
function renderizarMenu(listaPlatos, contenedor, mostrarBoton = true) {
  contenedor.innerHTML = listaPlatos
    .map((plato) => `
      <article class="tarjeta-plato" data-id="${plato.id}">
        <img class="tarjeta-plato-imagen" src="${plato.imagen}" alt="${plato.nombre}">
        <div class="tarjeta-plato-info">
          <span class="tarjeta-plato-categoria">${plato.categoria}</span>
          <h3 class="tarjeta-plato-nombre">${plato.nombre}</h3>
          <p class="tarjeta-plato-descripcion">${plato.descripcion}</p>
          <div class="tarjeta-plato-footer">
            <span class="tarjeta-plato-precio">${formatearPrecio(plato.precio)}</span>
            ${mostrarBoton ? `
              <button type="button" class="boton-agregar" data-id="${plato.id}">
                Agregar al pedido
              </button>
            ` : ''}
          </div>
        </div>
      </article>
    `)
    .join('');
}

// suma al carrito, o incrementa cantidad si ya está
function agregarAlCarrito(plato, nombreRestaurante) {
  const itemExistente = carrito.find(
    (item) => item.id === plato.id && item.restaurante === nombreRestaurante
  );

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ ...plato, cantidad: 1, restaurante: nombreRestaurante });
  }

  mostrarToast(`Se agregó "${plato.nombre}" al carrito`);
  renderizarCarrito();
}

// suma o resta cantidad, elimina si llega a 0
function cambiarCantidad(idPlato, nombreRestaurante, delta) {
  const item = carrito.find(
    (item) => item.id === idPlato && item.restaurante === nombreRestaurante
  );
  if (!item) return;

  item.cantidad += delta;

  if (item.cantidad <= 0) {
    eliminarDelCarrito(idPlato, nombreRestaurante);
    return;
  }

  renderizarCarrito();
}

function eliminarDelCarrito(idPlato, nombreRestaurante) {
  carrito = carrito.filter(
    (item) => !(item.id === idPlato && item.restaurante === nombreRestaurante)
  );
  renderizarCarrito();
}

function calcularTotal() {
  return carrito.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);
}

function guardarCarritoEnStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function renderizarCarrito() {
  guardarCarritoEnStorage();

  const hayItems = carrito.length > 0;
  carritoMensajeVacio.hidden = hayItems;

  carritoLista.innerHTML = carrito
    .map((item) => `
      <li class="item-carrito">
        <div class="item-carrito-nombre">
          ${item.nombre}
          <span class="item-carrito-restaurante">${item.restaurante}</span>
        </div>
        <div class="item-carrito-cantidad">
          <button type="button" class="boton-restar" data-accion="restar" data-id="${item.id}" data-restaurante="${item.restaurante}">-</button>
          <span class="cantidad-numero">${item.cantidad}</span>
          <button type="button" class="boton-sumar" data-accion="sumar" data-id="${item.id}" data-restaurante="${item.restaurante}">+</button>
        </div>
        <span class="item-carrito-subtotal">${formatearPrecio(item.precio * item.cantidad)}</span>
        <button type="button" class="boton-eliminar" data-accion="eliminar" data-id="${item.id}" data-restaurante="${item.restaurante}">✕</button>
      </li>
    `)
    .join('');

  carritoTotalMonto.textContent = formatearPrecio(calcularTotal());
}

function configurarCarrito() {
  carritoContainer.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const idPlato = Number(boton.dataset.id);
    const nombreRestaurante = boton.dataset.restaurante;
    const accion = boton.dataset.accion;

    if (accion === 'sumar') cambiarCantidad(idPlato, nombreRestaurante, 1);
    if (accion === 'restar') cambiarCantidad(idPlato, nombreRestaurante, -1);
    if (accion === 'eliminar') eliminarDelCarrito(idPlato, nombreRestaurante);
  });
}

function obtenerDatosCliente() {
  return {
    nombre: inputNombre.value.trim(),
    direccion: inputDireccion.value.trim(),
    telefono: inputTelefono.value.trim(),
    metodoPago: selectMetodoPago.value,
    numeroTarjeta: inputNumeroTarjeta.value.trim(),
    vencimientoTarjeta: inputVencimientoTarjeta.value.trim(),
    cvvTarjeta: inputCvvTarjeta.value.trim()
  };
}

// valida qué campos del form faltan completar
function obtenerCamposFaltantes(datosCliente) {
  const faltantes = [];

  if (!datosCliente.nombre) faltantes.push('nombre completo');
  if (!datosCliente.direccion) faltantes.push('dirección');
  if (!datosCliente.telefono) faltantes.push('teléfono');
  if (!datosCliente.metodoPago) faltantes.push('método de pago');

  if (datosCliente.metodoPago === 'Tarjeta') {
    if (!datosCliente.numeroTarjeta) faltantes.push('número de tarjeta');
    if (!datosCliente.vencimientoTarjeta) faltantes.push('vencimiento de la tarjeta');
    if (!datosCliente.cvvTarjeta) faltantes.push('CVV de la tarjeta');
  }

  return faltantes;
}

// muestra u oculta los campos de tarjeta según el método de pago
function actualizarCamposTarjeta() {
  const esPagoConTarjeta = selectMetodoPago.value === 'Tarjeta';
  camposTarjeta.hidden = !esPagoConTarjeta;

  if (!esPagoConTarjeta) {
    inputNumeroTarjeta.value = '';
    inputVencimientoTarjeta.value = '';
    inputCvvTarjeta.value = '';
  }
}

// solo números en los campos de tarjeta
function permitirSoloNumeros(evento) {
  evento.target.value = evento.target.value.replace(/\D/g, '');
}

function guardarPedidoEnHistorial(pedido) {
  const historialGuardado = localStorage.getItem('historialPedidos');
  const historial = historialGuardado ? JSON.parse(historialGuardado) : [];

  historial.unshift(pedido);
  localStorage.setItem('historialPedidos', JSON.stringify(historial));
}

// valida carrito y form, y pide confirmación antes de finalizar
function confirmarPedido() {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agregá al menos un plato antes de confirmar el pedido.',
      ...estilosSwal
    });
    return;
  }

  const datosCliente = obtenerDatosCliente();
  const camposFaltantes = obtenerCamposFaltantes(datosCliente);

  if (camposFaltantes.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Faltan datos',
      text: `Completá los siguientes campos: ${camposFaltantes.join(', ')}.`,
      ...estilosSwal
    });
    return;
  }

  const detalleItems = carrito
    .map((item) => `${item.cantidad}x ${item.nombre} (${item.restaurante})`)
    .join('<br>');

  Swal.fire({
    icon: 'question',
    title: 'Confirmar pedido',
    html: `${detalleItems}<br><br>Total: <strong>${formatearPrecio(calcularTotal())}</strong>`,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...estilosSwal
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      finalizarPedido();
    }
  });
}

// guarda en historial, vacía carrito y arranca el tracking
function finalizarPedido() {
  const numeroPedido = generarNumeroPedido();

  guardarPedidoEnHistorial({
    numero: numeroPedido,
    fecha: new Date().toLocaleString('es-AR'),
    items: carrito.map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      restaurante: item.restaurante
    })),
    total: calcularTotal()
  });

  carrito = [];
  renderizarCarrito();
  formDatosCliente.reset();
  actualizarCamposTarjeta();

  filtrosCategoria.hidden = true;
  contenidoPrincipal.hidden = true;
  trackingContainer.hidden = false;
  botonNuevoPedido.hidden = true;

  iniciarTracking(numeroPedido);
}

function generarNumeroPedido() {
  return Math.floor(1000 + Math.random() * 9000);
}

function reiniciarPasosTracking() {
  pasosTracking.forEach((paso) => paso.classList.remove('activo'));
}

// avanza el tracking paso a paso, simulando el progreso del pedido
function avanzarTracking(indice, numeroPedido) {
  if (indice >= pasosTracking.length) return;

  pasosTracking[indice].classList.add('activo');

  const esUltimoPaso = indice === pasosTracking.length - 1;

  if (esUltimoPaso) {
    setTimeout(() => mostrarPedidoEntregado(numeroPedido), 2000);
    return;
  }

  setTimeout(() => avanzarTracking(indice + 1, numeroPedido), 2500);
}

function iniciarTracking(numeroPedido) {
  reiniciarPasosTracking();
  avanzarTracking(0, numeroPedido);
}

function mostrarPedidoEntregado(numeroPedido) {
  Swal.fire({
    icon: 'success',
    title: '¡Pedido entregado!',
    text: `Gracias por tu compra. Tu número de pedido es #${numeroPedido}.`,
    ...estilosSwal
  }).then(() => {
    botonNuevoPedido.hidden = false;
  });
}

function reiniciarPedido() {
  trackingContainer.hidden = true;
  reiniciarPasosTracking();
  filtrosCategoria.hidden = false;
  contenidoPrincipal.hidden = false;
  carritoContainer.hidden = false;
}

function configurarCheckout() {
  botonConfirmarPedido.addEventListener('click', confirmarPedido);
  formDatosCliente.addEventListener('submit', (evento) => evento.preventDefault());

  selectMetodoPago.addEventListener('change', actualizarCamposTarjeta);
  inputsSoloNumeros.forEach((input) => input.addEventListener('input', permitirSoloNumeros));
}

function configurarTracking() {
  botonNuevoPedido.addEventListener('click', reiniciarPedido);
}
