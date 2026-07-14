// todo.js - página principal con todos los platos
let platos = [];

const menuContainer = document.getElementById('menu-container');
const botonesFiltro = document.querySelectorAll('.boton-filtro');

async function cargarDatos() {
  try {
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
      text: 'No pudimos cargar el menú. Probá recargar la página.',
      ...estilosSwal
    });
  }
}

function filtrarPorCategoria(categoria) {
  if (categoria === 'todos') {
    renderizarMenu(platos, menuContainer, false);
    return;
  }

  const platosFiltrados = platos.filter((plato) => plato.categoria === categoria);
  renderizarMenu(platosFiltrados, menuContainer, false);
}

function configurarFiltros() {
  botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', () => {
      botonesFiltro.forEach((b) => b.classList.remove('activo'));
      boton.classList.add('activo');
      filtrarPorCategoria(boton.dataset.categoria);
    });
  });
}

// navega a restaurantes filtrando por el plato elegido
function irARestaurantesConPlato(idPlato) {
  window.location.href = `/paginas/restaurantes.html?plato=${idPlato}`;
}

function configurarMenu() {
  menuContainer.addEventListener('click', (evento) => {
    const tarjeta = evento.target.closest('.tarjeta-plato');
    if (!tarjeta) return;

    irARestaurantesConPlato(Number(tarjeta.dataset.id));
  });
}

cargarDatos();
configurarFiltros();
configurarMenu();
configurarCarrito();
configurarCheckout();
configurarTracking();
renderizarCarrito();
