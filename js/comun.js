// comun.js
// Funciones compartidas entre las páginas "index.html" (Todo) y "restaurantes.html":
// carrito de compras, checkout, historial y seguimiento del pedido.

// Array en memoria con los ítems agregados al pedido.
// Si ya había un carrito guardado en localStorage (por ejemplo, de antes de
// refrescar la página), lo recuperamos; si no existe, arranca vacío.
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Referencias a elementos del DOM del carrito y el checkout
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

// Referencias al formulario de datos de entrega
const formDatosCliente = document.getElementById('form-datos-cliente');
const inputNombre = document.getElementById('input-nombre');
const inputDireccion = document.getElementById('input-direccion');
const inputTelefono = document.getElementById('input-telefono');
const selectMetodoPago = document.getElementById('select-metodo-pago');

// Da formato de precio en pesos a un número (ej: 3500 -> $3.500)
function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

// Renderiza una lista de platos como tarjetas dentro del contenedor indicado.
// "mostrarBoton" (true por defecto) permite ocultar "Agregar al pedido" en
// páginas donde el plato todavía no está conectado a un restaurante (ej: "Todo").
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

// Busca el ítem por plato + restaurante y lo agrega al carrito (o suma cantidad si ya estaba)
function agregarAlCarrito(plato, nombreRestaurante) {
  const itemExistente = carrito.find(
    (item) => item.id === plato.id && item.restaurante === nombreRestaurante
  );

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ ...plato, cantidad: 1, restaurante: nombreRestaurante });
  }

  renderizarCarrito();
}

// Suma o resta unidades a un ítem del carrito; si llega a 0, lo elimina
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

// Saca por completo un ítem del carrito usando filter
function eliminarDelCarrito(idPlato, nombreRestaurante) {
  carrito = carrito.filter(
    (item) => !(item.id === idPlato && item.restaurante === nombreRestaurante)
  );
  renderizarCarrito();
}

// Suma precio x cantidad de todos los ítems del carrito
function calcularTotal() {
  return carrito.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);
}

// Guarda el carrito actual en localStorage para no perderlo si se refresca la página
function guardarCarritoEnStorage() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Renderiza los ítems del carrito (o el mensaje de "vacío") y el total
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

// Delegación de eventos: un solo listener para +/- y eliminar en el carrito
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

// Lee los valores actuales del formulario de datos de entrega
function obtenerDatosCliente() {
  return {
    nombre: inputNombre.value.trim(),
    direccion: inputDireccion.value.trim(),
    telefono: inputTelefono.value.trim(),
    metodoPago: selectMetodoPago.value
  };
}

// Devuelve la lista de nombres de campos que quedaron sin completar
function obtenerCamposFaltantes(datosCliente) {
  const faltantes = [];

  if (!datosCliente.nombre) faltantes.push('nombre completo');
  if (!datosCliente.direccion) faltantes.push('dirección');
  if (!datosCliente.telefono) faltantes.push('teléfono');
  if (!datosCliente.metodoPago) faltantes.push('método de pago');

  return faltantes;
}

// Agrega un pedido ya confirmado al historial guardado en localStorage
function guardarPedidoEnHistorial(pedido) {
  const historialGuardado = localStorage.getItem('historialPedidos');
  const historial = historialGuardado ? JSON.parse(historialGuardado) : [];

  historial.unshift(pedido);
  localStorage.setItem('historialPedidos', JSON.stringify(historial));
}

// Valida el carrito y el formulario; si está todo bien, pide confirmación
function confirmarPedido() {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agregá al menos un plato antes de confirmar el pedido.'
    });
    return;
  }

  const datosCliente = obtenerDatosCliente();
  const camposFaltantes = obtenerCamposFaltantes(datosCliente);

  if (camposFaltantes.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Faltan datos',
      text: `Completá los siguientes campos: ${camposFaltantes.join(', ')}.`
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
    cancelButtonText: 'Cancelar'
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      finalizarPedido();
    }
  });
}

// Guarda el pedido en el historial, vacía el carrito y muestra el tracking
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

  filtrosCategoria.hidden = true;
  contenidoPrincipal.hidden = true;
  trackingContainer.hidden = false;
  botonNuevoPedido.hidden = true;

  iniciarTracking(numeroPedido);
}

// Genera un número de pedido aleatorio de 4 dígitos (ej: 4821)
function generarNumeroPedido() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Quita la clase "activo" de los 4 pasos del tracking
function reiniciarPasosTracking() {
  pasosTracking.forEach((paso) => paso.classList.remove('activo'));
}

// Activa el paso indicado y, con setTimeout, encadena el siguiente paso
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

// Arranca la simulación de estados del pedido desde el primer paso
function iniciarTracking(numeroPedido) {
  reiniciarPasosTracking();
  avanzarTracking(0, numeroPedido);
}

// Muestra el SweetAlert final de éxito y habilita "Hacer otro pedido"
function mostrarPedidoEntregado(numeroPedido) {
  Swal.fire({
    icon: 'success',
    title: '¡Pedido entregado!',
    text: `Gracias por tu compra. Tu número de pedido es #${numeroPedido}.`
  }).then(() => {
    botonNuevoPedido.hidden = false;
  });
}

// Vuelve a mostrar el menú y el carrito, y oculta el tracking
function reiniciarPedido() {
  trackingContainer.hidden = true;
  reiniciarPasosTracking();
  filtrosCategoria.hidden = false;
  contenidoPrincipal.hidden = false;
  carritoContainer.hidden = false;
}

// Activa el listener del botón "Confirmar pedido" y evita el submit del form
function configurarCheckout() {
  botonConfirmarPedido.addEventListener('click', confirmarPedido);
  formDatosCliente.addEventListener('submit', (evento) => evento.preventDefault());
}

// Activa el listener del botón "Hacer otro pedido"
function configurarTracking() {
  botonNuevoPedido.addEventListener('click', reiniciarPedido);
}
