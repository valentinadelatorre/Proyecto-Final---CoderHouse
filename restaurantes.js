// restaurantes.js
// Página "Restaurantes": muestra la lista de restaurantes y, al elegir uno,
// su menú filtrado por las categorías que ese restaurante ofrece.
// Si se llega desde "Todo" habiendo elegido un plato (URL "?plato=ID"),
// se muestran solo los restaurantes que tienen ese plato.

// Array en memoria con los restaurantes traídos del JSON
let restaurantes = [];

// Array en memoria con los platos traídos del JSON
let platos = [];

// Restaurante actualmente seleccionado (o null si estamos en el listado)
let restauranteActual = null;

// Plato elegido en "Todo" antes de llegar acá (o null si se entró directamente)
let platoSeleccionado = null;

// Referencias a elementos del DOM que se usan en este archivo
const seccionRestaurantes = document.getElementById('seccion-restaurantes');
const restaurantesGrid = document.getElementById('restaurantes-grid');
const seccionDetalle = document.getElementById('seccion-restaurante-detalle');
const nombreRestauranteDetalle = document.getElementById('restaurante-detalle-nombre');
const botonVolverRestaurantes = document.getElementById('btn-volver-restaurantes');
const filtrosCategoriaRestaurante = document.getElementById('filtros-categoria-restaurante');
const menuContainerRestaurante = document.getElementById('menu-container');

// Trae los restaurantes y los platos desde data/*.json y los guarda en memoria
async function cargarDatos() {
  try {
    // "cache: no-store" evita que el navegador use una copia vieja guardada
    // de los JSON (por ejemplo, después de agregar restaurantes o imágenes)
    const respuestaRestaurantes = await fetch('data/restaurantes.json', { cache: 'no-store' });
    const respuestaMenu = await fetch('data/menu.json', { cache: 'no-store' });

    if (!respuestaRestaurantes.ok || !respuestaMenu.ok) {
      throw new Error('No se pudieron obtener los datos');
    }

    restaurantes = await respuestaRestaurantes.json();
    platos = await respuestaMenu.json();
    aplicarFiltroPorPlatoDeURL();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Ups... algo salió mal',
      text: 'No pudimos cargar los restaurantes. Probá recargar la página.'
    });
  }
}

// Si la URL trae "?plato=ID" (se viene de "Todo"), filtra los restaurantes
// que tienen ese plato; si no, muestra el listado completo
function aplicarFiltroPorPlatoDeURL() {
  const idPlato = Number(new URLSearchParams(window.location.search).get('plato'));
  const plato = platos.find((p) => p.id === idPlato);

  if (!plato) {
    renderizarRestaurantes(restaurantes);
    return;
  }

  platoSeleccionado = plato;
  renderizarRestaurantes(obtenerRestaurantesConPlato(plato));
}

// Devuelve los restaurantes que tienen la categoría del plato indicado
function obtenerRestaurantesConPlato(plato) {
  return restaurantes.filter((restaurante) => restaurante.categorias.includes(plato.categoria));
}

// Renderiza la grilla de tarjetas de restaurantes a partir de la lista indicada
function renderizarRestaurantes(listaRestaurantes) {
  restaurantesGrid.innerHTML = listaRestaurantes
    .map((restaurante) => `
      <article class="restaurante-card" data-id="${restaurante.id}">
        <img class="restaurante-card-imagen" src="${restaurante.imagen}" alt="${restaurante.nombre}">
        <div class="restaurante-card-info">
          <h3 class="restaurante-card-nombre">${restaurante.nombre}</h3>
          <p class="restaurante-card-descripcion">${restaurante.descripcion}</p>
          <div class="restaurante-card-categorias">
            ${restaurante.categorias.map((categoria) => `<span class="restaurante-card-tag">${categoria}</span>`).join('')}
          </div>
        </div>
      </article>
    `)
    .join('');
}

// Devuelve solo los platos cuya categoría está entre las del restaurante
function obtenerPlatosDelRestaurante(restaurante) {
  return platos.filter((plato) => restaurante.categorias.includes(plato.categoria));
}

// Genera los botones de filtro ("Todos" + una por cada categoría del restaurante)
function renderizarFiltrosRestaurante(restaurante) {
  const botonesCategorias = restaurante.categorias
    .map((categoria) => `<button type="button" class="boton-filtro" data-categoria="${categoria}">${categoria}</button>`)
    .join('');

  filtrosCategoriaRestaurante.innerHTML = `
    <button type="button" class="boton-filtro activo" data-categoria="todos">Todos</button>
    ${botonesCategorias}
  `;
}

// Marca como activo el botón de filtro de la categoría indicada
function activarBotonFiltro(categoria) {
  filtrosCategoriaRestaurante.querySelectorAll('.boton-filtro').forEach((boton) => {
    boton.classList.toggle('activo', boton.dataset.categoria === categoria);
  });
}

// Muestra el menú (filtros + platos) del restaurante elegido
function seleccionarRestaurante(idRestaurante) {
  const restaurante = restaurantes.find((r) => r.id === idRestaurante);
  if (!restaurante) return;

  restauranteActual = restaurante;

  nombreRestauranteDetalle.textContent = restaurante.nombre;
  renderizarFiltrosRestaurante(restaurante);

  const platosDelRestaurante = obtenerPlatosDelRestaurante(restaurante);

  // Si se llegó desde un plato puntual y este restaurante lo tiene, arrancamos
  // mostrando ya esa categoría filtrada en vez de "Todos"
  if (platoSeleccionado && restaurante.categorias.includes(platoSeleccionado.categoria)) {
    activarBotonFiltro(platoSeleccionado.categoria);
    const platosFiltrados = platosDelRestaurante.filter(
      (plato) => plato.categoria === platoSeleccionado.categoria
    );
    renderizarMenu(platosFiltrados, menuContainerRestaurante);
  } else {
    renderizarMenu(platosDelRestaurante, menuContainerRestaurante);
  }

  seccionRestaurantes.hidden = true;
  seccionDetalle.hidden = false;
}

// Vuelve a mostrar el listado de restaurantes (respetando el filtro por plato, si había)
function volverARestaurantes() {
  restauranteActual = null;
  seccionDetalle.hidden = true;
  seccionRestaurantes.hidden = false;

  const listaAMostrar = platoSeleccionado ? obtenerRestaurantesConPlato(platoSeleccionado) : restaurantes;
  renderizarRestaurantes(listaAMostrar);
}

// Delegación de eventos: click en cualquier tarjeta de restaurante
function configurarGridRestaurantes() {
  restaurantesGrid.addEventListener('click', (evento) => {
    const tarjeta = evento.target.closest('.restaurante-card');
    if (!tarjeta) return;

    seleccionarRestaurante(Number(tarjeta.dataset.id));
  });
}

// Delegación de eventos: click en los filtros de categoría del restaurante actual
function configurarFiltrosRestaurante() {
  filtrosCategoriaRestaurante.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.boton-filtro');
    if (!boton || !restauranteActual) return;

    activarBotonFiltro(boton.dataset.categoria);

    const categoria = boton.dataset.categoria;
    const platosDelRestaurante = obtenerPlatosDelRestaurante(restauranteActual);

    if (categoria === 'todos') {
      renderizarMenu(platosDelRestaurante, menuContainerRestaurante);
      return;
    }

    const platosFiltrados = platosDelRestaurante.filter((plato) => plato.categoria === categoria);
    renderizarMenu(platosFiltrados, menuContainerRestaurante);
  });
}

// Delegación de eventos: "Agregar al pedido" ya sabe en qué restaurante estamos
function configurarMenuRestaurante() {
  menuContainerRestaurante.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.boton-agregar');
    if (!boton || !restauranteActual) return;

    const plato = platos.find((p) => p.id === Number(boton.dataset.id));
    if (!plato) return;

    agregarAlCarrito(plato, restauranteActual.nombre);
  });
}

// Activa el listener del botón "Volver a restaurantes"
function configurarBotonVolver() {
  botonVolverRestaurantes.addEventListener('click', volverARestaurantes);
}

// Punto de entrada: se ejecuta cuando el HTML terminó de cargar
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  configurarGridRestaurantes();
  configurarFiltrosRestaurante();
  configurarMenuRestaurante();
  configurarBotonVolver();
  configurarCarrito();
  configurarCheckout();
  configurarTracking();
  renderizarCarrito();
});
