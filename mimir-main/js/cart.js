/* ==============================
   MimirPetShop · CART (mini cart)
   ============================== */

(() => {
  const BASE_STORAGE_KEY = "mimir_cart";
  const SESSION_KEY = "mimir_session";

  // Obtener clave de carrito específica del usuario
  const getCartKey = () => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return BASE_STORAGE_KEY;
      const user = JSON.parse(session);
      return `${BASE_STORAGE_KEY}_${user.userId || 'guest'}`;
    } catch {
      return BASE_STORAGE_KEY;
    }
  };

  // UI refs
  const cartCountEl = document.getElementById("cartCount");
  const cartLinkEl  = document.getElementById("cartLink");
  const miniCartEl  = document.getElementById("miniCart");
  const closeMiniEl = document.getElementById("closeMiniCart");
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const payBtnEl    = document.getElementById("payBtn");

  let cart = [];
  let isBinding = false;

  // Utils
  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2);
  const save = () => localStorage.setItem(getCartKey(), JSON.stringify(cart));
  const load = () => {
    try {
      const raw = localStorage.getItem(getCartKey());
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch { cart = []; }
  };
  const countItems = () => cart.reduce((acc, it) => acc + it.qty, 0);
  const calcTotal  = () => cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  // Verificar login
  const isLoggedIn = () => {
    const session = localStorage.getItem("mimir_session");
    return !!session;
  };

  const openMini   = () => miniCartEl?.classList.add("show");
  const closeMini  = () => miniCartEl?.classList.remove("show");
  const toggleMini = () => miniCartEl?.classList.toggle("show");

  // Render
  const updateBadge = () => {
    const totalQty = countItems();
    // Si no hay sesión iniciada, no mostrar el número del badge
    if (!isLoggedIn()) {
      if (cartCountEl) cartCountEl.textContent = "";
      return;
    }
    if (cartCountEl) cartCountEl.textContent = String(totalQty);
  };

  const renderCart = () => {
    if (!cartItemsEl || !cartTotalEl) return;
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      miniCartEl?.querySelector(".empty")?.classList.remove("hidden");
      cartTotalEl.textContent = "0.00";
      return;
    }
    miniCartEl?.querySelector(".empty")?.classList.add("hidden");

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <div class="row-left">
          <img class="thumb" src="${item.img || ""}" alt="${item.name}" />
          <div class="meta">
            <p class="name">${item.name}</p>
            <p class="sku">SKU: ${item.sku}</p>
          </div>
        </div>

        <div class="row-right">
          <div class="qty">
            <button class="qty-btn dec" aria-label="Disminuir cantidad">−</button>
            <input class="qty-input" type="number" min="1" step="1" value="${item.qty}" />
            <span class="unit-badge">${item.unit || ""}</span>
            <button class="qty-btn inc" aria-label="Aumentar cantidad">+</button>
          </div>
          <div class="price">$${fmt(item.price * item.qty)}</div>
          <button class="remove" title="Eliminar">✕</button>
        </div>
      `;

      const decBtn = li.querySelector(".dec");
      const incBtn = li.querySelector(".inc");
      const qtyInp = li.querySelector(".qty-input");
      const rmBtn  = li.querySelector(".remove");

      decBtn.addEventListener("click", () => updateQty(item.sku, item.qty - 1));
      incBtn.addEventListener("click", () => updateQty(item.sku, item.qty + 1));
      qtyInp.addEventListener("change", (e) => {
        const val = Math.max(1, parseInt(e.target.value || "1", 10));
        updateQty(item.sku, val);
      });
      rmBtn.addEventListener("click", () => removeItem(item.sku));

      cartItemsEl.appendChild(li);
    });

    cartTotalEl.textContent = fmt(calcTotal());
  };

  // Ops
  const addItem = (payload) => {
    // Validar login
    if (!isLoggedIn()) {
      alert("Por favor inicia sesión para agregar productos al carrito.");
      window.location.href = "../login/login.html";
      return;
    }

    const { sku, name, price, img, qty = 1, unit = "" } = payload || {};
    if (!sku || !name || isNaN(price)) return;
    if (qty < 1) {
      console.warn("Cantidad debe ser mayor a 0.");
      return;
    }

    const found = cart.find((it) => it.sku === sku && it.unit === unit);
    if (found) {
      found.qty += qty;
    } else {
      cart.push({ sku, name, price: Number(price), qty: Number(qty), img: img || "", unit });
    }
    save();
    updateBadge();
    renderCart();
    openMini();
  };

  const updateQty = (sku, qty) => {
    const it = cart.find((x) => x.sku === sku);
    if (!it) return;
    it.qty = Math.max(1, qty|0);
    save(); updateBadge(); renderCart();
  };

  const removeItem = (sku) => {
    cart = cart.filter((x) => x.sku !== sku);
    save(); updateBadge(); renderCart();
    if (cart.length === 0) miniCartEl?.querySelector(".empty")?.classList.remove("hidden");
  };

  // Captura de clicks "Agregar"
  const getCardPayload = (btn) => {
    const card = btn.closest(".card");
    if (!card) return null;

    const sku   = card.getAttribute("data-sku") || "";
    const name  = card.getAttribute("data-name") || card.querySelector("h3")?.textContent?.trim() || "";
    const price = parseFloat(card.getAttribute("data-price") || "0");
    const unit  = (card.getAttribute("data-unit") || "").trim();
    const img   = card.querySelector("img")?.getAttribute("src") || "";

    const qtyInp = card.querySelector(".qty-input");
    const qtyVal = Math.max(0, parseInt(qtyInp?.value || "0", 10));

    if (qtyVal < 1) return null;
    return { sku, name, price, img, qty: qtyVal, unit };
  };

  const bindAddToCart = () => {
    if (isBinding) return;
    isBinding = true;

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      if (btn.dataset.cartBound === "true") return;
      btn.dataset.cartBound = "true";
      
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const payload = getCardPayload(btn);
        if (!payload) {
          alert("Por favor selecciona una cantidad mayor a 0.");
          return;
        }
        addItem(payload);
      });
    });

    // Botones +/- de cada tarjeta
    document.querySelectorAll(".card .qty-select").forEach((wrap) => {
      const minus = wrap.querySelector(".qty-btn.minus");
      const plus  = wrap.querySelector(".qty-btn.plus");
      const inp   = wrap.querySelector(".qty-input");
      
      if (minus && !minus.dataset.bound) {
        minus.dataset.bound = "true";
        minus.addEventListener("click", (e) => {
          e.preventDefault();
          const v = Math.max(0, parseInt(inp.value || "0", 10) - 1);
          inp.value = String(v);
        });
      }
      
      if (plus && !plus.dataset.bound) {
        plus.dataset.bound = "true";
        plus.addEventListener("click", (e) => {
          e.preventDefault();
          const v = parseInt(inp.value || "0", 10) + 1;
          inp.value = String(v);
        });
      }
    });

    isBinding = false;
  };

  // Global
  const bindGlobal = () => {
    cartLinkEl?.addEventListener("click", (e) => { 
      e.preventDefault(); 
      if (!isLoggedIn()) {
        alert("Por favor inicia sesión para ver tu carrito.");
        window.location.href = "../login/login.html";
        return;
      }
      toggleMini(); 
    });
    closeMiniEl?.addEventListener("click", closeMini);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMini(); });

    payBtnEl?.addEventListener("click", (e) => {
      e.preventDefault();
      if (cart.length === 0) return openMini();
      if (typeof window.openPaymentModal === "function") window.openPaymentModal();
    });
  };

  // Init
  const init = () => {
    load(); updateBadge(); renderCart();
    bindAddToCart(); bindGlobal();

    const observer = new MutationObserver((mutations) => {
      let shouldRebind = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && (node.classList?.contains('card') || node.querySelector?.('.card'))) {
            shouldRebind = true;
            break;
          }
        }
        if (shouldRebind) break;
      }
      if (shouldRebind) bindAddToCart();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  document.addEventListener("DOMContentLoaded", init);
})();