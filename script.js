// script.js
// Simulador de Pedidos Delivery - Carga y render del menú

// Array en memoria con los platos traídos del JSON
let platos = [];

// Array en memoria con los ítems agregados al pedido
let carrito = [];

// Referencias a elementos del DOM que se usan en este archivo
const menuContainer = document.getElementById('menu-container');
const botonesFiltro = document.querySelectorAll('.boton-filtro');
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

// Trae los platos desde data/menu.json y los guarda en memoria
async function cargarMenu() {
  try {
    const respuesta = await fetch('data/menu.json');

    if (!respuesta.ok) {
      throw new Error('No se pudo obtener el menú');
    }

    platos = await respuesta.json();
    renderizarMenu(platos);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Ups... algo salió mal',
      text: 'No pudimos cargar el menú. Probá recargar la página.'
    });
  }
}

// Da formato de precio en pesos a un número (ej: 3500 -> $3.500)
function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

// Renderiza una lista de platos como tarjetas dentro de #menu-container
function renderizarMenu(listaPlatos) {
  menuContainer.innerHTML = listaPlatos
    .map((plato) => `
      <article class="tarjeta-plato">
        <img class="tarjeta-plato-imagen" src="${plato.imagen}" alt="${plato.nombre}">
        <div class="tarjeta-plato-info">
          <span class="tarjeta-plato-categoria">${plato.categoria}</span>
          <h3 class="tarjeta-plato-nombre">${plato.nombre}</h3>
          <p class="tarjeta-plato-descripcion">${plato.descripcion}</p>
          <div class="tarjeta-plato-footer">
            <span class="tarjeta-plato-precio">${formatearPrecio(plato.precio)}</span>
            <button type="button" class="boton-agregar" data-id="${plato.id}">
              Agregar al pedido
            </button>
          </div>
        </div>
      </article>
    `)
    .join('');
}

// Filtra el array de platos por categoría y vuelve a renderizar
function filtrarPorCategoria(categoria) {
  if (categoria === 'todos') {
    renderizarMenu(platos);
    return;
  }

  const platosFiltrados = platos.filter((plato) => plato.categoria === categoria);
  renderizarMenu(platosFiltrados);
}

// Activa el listener de click en cada botón de filtro
function configurarFiltros() {
  botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', () => {
      botonesFiltro.forEach((b) => b.classList.remove('activo'));
      boton.classList.add('activo');
      filtrarPorCategoria(boton.dataset.categoria);
    });
  });
}

// Busca el plato por id y lo agrega al carrito (o suma cantidad si ya estaba)
function agregarAlCarrito(idPlato) {
  const plato = platos.find((p) => p.id === idPlato);
  if (!plato) return;

  const itemExistente = carrito.find((item) => item.id === idPlato);

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ ...plato, cantidad: 1 });
  }

  renderizarCarrito();
}

// Suma o resta unidades a un ítem del carrito; si llega a 0, lo elimina
function cambiarCantidad(idPlato, delta) {
  const item = carrito.find((item) => item.id === idPlato);
  if (!item) return;

  item.cantidad += delta;

  if (item.cantidad <= 0) {
    eliminarDelCarrito(idPlato);
    return;
  }

  renderizarCarrito();
}

// Saca por completo un ítem del carrito usando filter
function eliminarDelCarrito(idPlato) {
  carrito = carrito.filter((item) => item.id !== idPlato);
  renderizarCarrito();
}

// Suma precio x cantidad de todos los ítems del carrito
function calcularTotal() {
  return carrito.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);
}

// Renderiza los ítems del carrito (o el mensaje de "vacío") y el total
function renderizarCarrito() {
  const hayItems = carrito.length > 0;
  carritoMensajeVacio.hidden = hayItems;

  carritoLista.innerHTML = carrito
    .map((item) => `
      <li class="item-carrito">
        <span class="item-carrito-nombre">${item.nombre}</span>
        <div class="item-carrito-cantidad">
          <button type="button" class="boton-restar" data-accion="restar" data-id="${item.id}">-</button>
          <span class="cantidad-numero">${item.cantidad}</span>
          <button type="button" class="boton-sumar" data-accion="sumar" data-id="${item.id}">+</button>
        </div>
        <span class="item-carrito-subtotal">${formatearPrecio(item.precio * item.cantidad)}</span>
        <button type="button" class="boton-eliminar" data-accion="eliminar" data-id="${item.id}">✕</button>
      </li>
    `)
    .join('');

  carritoTotalMonto.textContent = formatearPrecio(calcularTotal());
}

// Delegación de eventos: un solo listener para "Agregar al pedido" en el menú
function configurarMenu() {
  menuContainer.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.boton-agregar');
    if (!boton) return;

    agregarAlCarrito(Number(boton.dataset.id));
  });
}

// Delegación de eventos: un solo listener para +/- y eliminar en el carrito
function configurarCarrito() {
  carritoContainer.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const idPlato = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === 'sumar') cambiarCantidad(idPlato, 1);
    if (accion === 'restar') cambiarCantidad(idPlato, -1);
    if (accion === 'eliminar') eliminarDelCarrito(idPlato);
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

  const cantidadItems = carrito.reduce((acumulado, item) => acumulado + item.cantidad, 0);

  Swal.fire({
    icon: 'question',
    title: 'Confirmar pedido',
    html: `Vas a pedir <strong>${cantidadItems}</strong> ítem(s) por un total de <strong>${formatearPrecio(calcularTotal())}</strong>.`,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      finalizarPedido();
    }
  });
}

// Vacía el carrito, oculta menú y carrito, y muestra el tracking
function finalizarPedido() {
  carrito = [];
  renderizarCarrito();
  formDatosCliente.reset();

  filtrosCategoria.hidden = true;
  contenidoPrincipal.hidden = true;
  trackingContainer.hidden = false;
  botonNuevoPedido.hidden = true;

  iniciarTracking();
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
function avanzarTracking(indice) {
  if (indice >= pasosTracking.length) return;

  pasosTracking[indice].classList.add('activo');

  const esUltimoPaso = indice === pasosTracking.length - 1;

  if (esUltimoPaso) {
    setTimeout(mostrarPedidoEntregado, 2000);
    return;
  }

  setTimeout(() => avanzarTracking(indice + 1), 2500);
}

// Arranca la simulación de estados del pedido desde el primer paso
function iniciarTracking() {
  reiniciarPasosTracking();
  avanzarTracking(0);
}

// Muestra el SweetAlert final de éxito y habilita "Hacer otro pedido"
function mostrarPedidoEntregado() {
  const numeroPedido = generarNumeroPedido();

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

// Punto de entrada: se ejecuta cuando el HTML terminó de cargar
document.addEventListener('DOMContentLoaded', () => {
  cargarMenu();
  configurarFiltros();
  configurarMenu();
  configurarCarrito();
  configurarCheckout();
  configurarTracking();
  renderizarCarrito();
});
