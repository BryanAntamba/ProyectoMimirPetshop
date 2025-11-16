document.getElementById('finalizarCompraBtn').addEventListener('click', () => {
  const mensaje = document.getElementById('mensaje-exito');

  // Mostrar el cuadro en el centro
  mensaje.style.display = 'flex';

  // Esperar 2 segundos antes de redirigir al inicio
  setTimeout(() => {
    mensaje.style.display = 'none';
    // Redirige al inicio (ruta corregida)
    window.location.href = '../SesionIniciada.html';
  }, 2000);
});
