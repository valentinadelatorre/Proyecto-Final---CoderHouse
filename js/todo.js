// todo.js
// Página "Todo": muestra todas las comidas de todos los restaurantes.
// Estos platos no están conectados a un restaurante puntual, por eso las
// tarjetas no tienen botón "Agregar al pedido": al hacer click en una tarjeta,
// se va a "restaurantes.html" mostrando solo los restaurantes que la tienen.

// Array en memoria con los platos traídos del JSON
let platos = [];

// Referencias a elementos del DOM que se usan en este archivo
const menuContainer = document.getElementById('menu-container');
const botonesFiltro = document.querySelectorAll('.boton-filtro');

// Trae los platos desde data/menu.json y los guarda en memoria
async function cargarDatos() {
  try {
    // "cache: no-store" evita que el navegador use una copia vieja guardada
    // del JSON (por ejemplo, después de agregar o corregir imágenes de platos)
    const respuestaMenu = await fetch('/data/menu.json', { cache: 'no-store' });

    if (!respuestaMenu.ok) {
      throw new Error('No se pudieron obtener los datos');
    }

    platos = await respuestaMenu.json();
    renderizarMenu(platos, menuContainer, false);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Ups... algo salió mal',
      text: 'No pudimos cargar el menú. Probá recargar la página.'
    });
  }
}

// Filtra el array de platos por categoría y vuelve a renderizar
function filtrarPorCategoria(categoria) {
  if (categoria === 'todos') {
    renderizarMenu(platos, menuContainer, false);
    return;
  }

  const platosFiltrados = platos.filter((plato) => plato.categoria === categoria);
  renderizarMenu(platosFiltrados, menuContainer, false);
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

// Lleva a "restaurantes.html" mostrando solo los restaurantes que tienen este plato
function irARestaurantesConPlato(idPlato) {
  window.location.href = `/paginas/restaurantes.html?plato=${idPlato}`;
}

// Delegación de eventos: un click en cualquier parte de la tarjeta navega a restaurantes.html
function configurarMenu() {
  menuContainer.addEventListener('click', (evento) => {
    const tarjeta = evento.target.closest('.tarjeta-plato');
    if (!tarjeta) return;

    irARestaurantesConPlato(Number(tarjeta.dataset.id));
  });
}

// Punto de entrada: el script está al final del body, así que el HTML ya
// está completamente cargado en el momento en que se ejecuta este código
cargarDatos();
configurarFiltros();
configurarMenu();
configurarCarrito();
configurarCheckout();
configurarTracking();
renderizarCarrito();
