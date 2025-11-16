/* ==============================
   MimirPetShop · PAYMENT (modal)
   ============================== */

(() => {
  const $ = (sel) => document.querySelector(sel);
  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2);

  const modalOverlay = $("#modalPago");
  const modalTotal = $("#modalTotal");
  const btnClose = $("#btnCloseModal");
  const btnCancel = $("#btnCancelarPago");
  const btnConfirm = $("#btnConfirmarPago");
  const pagoError = $("#pagoError");

  const modalExito = $("#modalExito");

  let currentTotal = 0;

  function getUserSession() {
    try {
      const session = localStorage.getItem("mimir_session");
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  function openPaymentModal() {
    const raw = localStorage.getItem(getCartKey());
    const cart = raw ? JSON.parse(raw) : [];
    const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
    currentTotal = total;

    if (modalTotal) modalTotal.textContent = fmt(total);

    // Actualizar nombre del titular con el usuario logueado
    const user = getUserSession();
    const nombreTitular = $(".nombre-titular");
    if (nombreTitular && user) {
      nombreTitular.textContent = `${user.nombre} ${user.apellido}`;
    }

    modalOverlay?.classList.remove("hidden");
    modalOverlay?.setAttribute("aria-hidden", "false");
    pagoError?.classList.add("hidden");
  }

  function closePaymentModal() {
    modalOverlay?.classList.add("hidden");
    modalOverlay?.setAttribute("aria-hidden", "true");
    pagoError?.classList.add("hidden");
  }

  function getCartKey() {
    try {
      const session = localStorage.getItem("mimir_session");
      if (!session) return "mimir_cart";
      const user = JSON.parse(session);
      return `mimir_cart_${user.userId || 'guest'}`;
    } catch {
      return "mimir_cart";
    }
  }

  function clearCart() {
    localStorage.setItem(getCartKey(), JSON.stringify([]));
    if (typeof window.updateCartUI === "function") window.updateCartUI();
  }

  function showSuccess() {
    closePaymentModal();
    modalExito?.classList.remove("hidden");
    setTimeout(() => {
      modalExito?.classList.add("hidden");
      clearCart();
      location.reload();
    }, 3000);
  }

  function handleConfirmPayment() {
    if (currentTotal <= 0) {
      if (pagoError) {
        pagoError.textContent = "El monto debe ser mayor a $0.";
        pagoError.classList.remove("hidden");
      }
      return;
    }

    // Simulación: pago exitoso directo (el usuario ya realizó el depósito)
    setTimeout(() => {
      showSuccess();
    }, 800);
  }

  // Events
  btnClose?.addEventListener("click", closePaymentModal);
  btnCancel?.addEventListener("click", closePaymentModal);
  btnConfirm?.addEventListener("click", handleConfirmPayment);

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closePaymentModal();
  });

  window.openPaymentModal = openPaymentModal;
})();
