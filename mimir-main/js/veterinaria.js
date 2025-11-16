// Esperar a que el contenido se cargue
document.addEventListener("DOMContentLoaded", () => {
  const elementos = document.querySelectorAll(".animate-left, .animate-right, .animate-down, .animate-up");

  const mostrarElemento = (entrada) => {
    entrada.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
      }
    });
  };

  // Crear un observador para detectar cuando los elementos aparecen en pantalla
  const observador = new IntersectionObserver(mostrarElemento, {
    threshold: 0.2 // activa cuando el 20% del elemento es visible
  });

  elementos.forEach((el) => observador.observe(el));
});

// Animación al hacer scroll (para todas las secciones "Cómo llegar")
document.addEventListener("scroll", () => {
  const secciones = document.querySelectorAll(".como-llegar-section");

  secciones.forEach((seccion) => {
    const mapa = seccion.querySelector(".mapa-container");
    const rect = seccion.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100) {
      seccion.classList.add("visible");
      if (mapa) mapa.classList.add("visible");
    }
  });
});
