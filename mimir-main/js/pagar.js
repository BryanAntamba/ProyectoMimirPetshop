document.addEventListener("DOMContentLoaded", () => {
  const elementos = document.querySelectorAll(".animar-arriba");

  const mostrarElemento = (entradas, observador) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  };

  const observador = new IntersectionObserver(mostrarElemento, {
    threshold: 0.3
  });

  elementos.forEach((el) => observador.observe(el));
});
