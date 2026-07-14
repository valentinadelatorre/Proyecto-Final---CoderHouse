// restaurantes.js - listado y detalle con menú filtrado
let restaurantes = [];
let platos = [];
let restauranteActual = null;
let platoSeleccionado = null;

const seccionRestaurantes = document.getElementById('seccion-restaurantes');
const restaurantesGrid = document.getElementById('restaurantes-grid');
const seccionDetalle = document.getElementById('seccion-restaurante-detalle');
const nombreRestauranteDetalle = document.getElementById('restaurante-detalle-nombre');
const botonVolverRestaurantes = document.getElementById('btn-volver-restaurantes');
const filtrosCategoriaRestaurante = document.getElementById('filtros-categoria-restaurante');
const menuContainerRestaurante = document.getElementById('menu-container');

async function cargarDatos() {
  try {
    const respuestaRestaurantes = await fetch('/data/restaurantes.json', { cache: 'no-store' });
    const respuestaMenu = await fetch('/data/menu.json', { cache: 'no-store' });

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
      text: 'No pudimos cargar los restaurantes. Probá recargar la página.',
      ...estilosSwal
    });
  }
}

// filtra por plato si vino en la url
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

function obtenerRestaurantesConPlato(plato) {
  return restaurantes.filter((restaurante) => restaurante.categorias.includes(plato.categoria));
}

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

function obtenerPlatosDelRestaurante(restaurante) {
  return platos.filter((plato) => restaurante.categorias.includes(plato.categoria));
}

// arma los filtros de categoría de un restaurante
function renderizarFiltrosRestaurante(restaurante) {
  const botonesCategorias = restaurante.categorias
    .map((categoria) => `<button type="button" class="boton-filtro" data-categoria="${categoria}">${categoria}</button>`)
    .join('');

  filtrosCategoriaRestaurante.innerHTML = `
    <button type="button" class="boton-filtro activo" data-categoria="todos">Todos</button>
    ${botonesCategorias}
  `;
}

function activarBotonFiltro(categoria) {
  filtrosCategoriaRestaurante.querySelectorAll('.boton-filtro').forEach((boton) => {
    boton.classList.toggle('activo', boton.dataset.categoria === categoria);
  });
}

function seleccionarRestaurante(idRestaurante) {
  const restaurante = restaurantes.find((r) => r.id === idRestaurante);
  if (!restaurante) return;

  restauranteActual = restaurante;

  nombreRestauranteDetalle.textContent = restaurante.nombre;
  renderizarFiltrosRestaurante(restaurante);

  const platosDelRestaurante = obtenerPlatosDelRestaurante(restaurante);

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

function volverARestaurantes() {
  restauranteActual = null;
  seccionDetalle.hidden = true;
  seccionRestaurantes.hidden = false;

  const listaAMostrar = platoSeleccionado ? obtenerRestaurantesConPlato(platoSeleccionado) : restaurantes;
  renderizarRestaurantes(listaAMostrar);
}

function configurarGridRestaurantes() {
  restaurantesGrid.addEventListener('click', (evento) => {
    const tarjeta = evento.target.closest('.restaurante-card');
    if (!tarjeta) return;

    seleccionarRestaurante(Number(tarjeta.dataset.id));
  });
}

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

function configurarMenuRestaurante() {
  menuContainerRestaurante.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.boton-agregar');
    if (!boton || !restauranteActual) return;

    const plato = platos.find((p) => p.id === Number(boton.dataset.id));
    if (!plato) return;

    agregarAlCarrito(plato, restauranteActual.nombre);
  });
}

function configurarBotonVolver() {
  botonVolverRestaurantes.addEventListener('click', volverARestaurantes);
}

cargarDatos();
configurarGridRestaurantes();
configurarFiltrosRestaurante();
configurarMenuRestaurante();
configurarBotonVolver();
configurarCarrito();
configurarCheckout();
configurarTracking();
renderizarCarrito();
