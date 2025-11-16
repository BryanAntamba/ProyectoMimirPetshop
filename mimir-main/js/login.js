/* ======================================================
   Login MimirPetShop (demo sin backend)
   - Usuarios: localStorage "mimir_users"
   - Contraseña por SHA-256
   - Sesión: "mimir_session" { userId, nombre, apellido, correo, email, role, loggedAt }
   - Mensajes flash: "mimir_flash"
   ====================================================== */
(() => {
  const USERS_KEY   = "mimir_users";
  const SESSION_KEY = "mimir_session";
  const FLASH_KEY   = "mimir_flash";

  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  // Utils
  const toHex = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let hex = "";
    for (const b of bytes) hex += b.toString(16).padStart(2, "0");
    return hex;
  };
  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return toHex(hash);
  }
  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch { return []; }
  }
  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }
  function setFlash(message, type = "success") {
    localStorage.setItem(FLASH_KEY, JSON.stringify({ message, type, ts: Date.now() }));
  }
  function consumeFlash() {
    const raw = localStorage.getItem(FLASH_KEY);
    if (!raw) return null;
    localStorage.removeItem(FLASH_KEY);
    try { return JSON.parse(raw); } catch { return null; }
  }
  function showFlashBox(msg, type = "success") {
    const box = document.createElement("div");
    box.className = `flash ${type}`;
    box.textContent = msg;
    const container = document.querySelector(".login-container") || document.body;
    container.prepend(box);
    setTimeout(() => box.remove(), 4000);
  }
  function showErrorInline(msg) {
    let box = document.querySelector(".form-error");
    if (!box) {
      box = document.createElement("div");
      box.className = "form-error";
      const form = byId("loginForm");
      form?.prepend(box);
    }
    box.textContent = msg;
  }

  // Navbar: login/cerrar sesión
  function updateNavbarSessionUI() {
    const session = getSession();
    const candidates = [
      'a.nav-btn',
      'a[href$="login.html"].nav-link',
      'a[href$="login.html"]',
      '.mobile-btn'
    ];
    const loginLink = document.querySelector(candidates.join(", "));
    if (!loginLink) return;

    if (session) {
      loginLink.textContent = "Cerrar sesión";
      loginLink.href = "#";
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearSession();
        setFlash("Sesión cerrada correctamente.", "success");
        window.location.href = "../index.html";
      }, { once: true });
    } else {
      loginLink.textContent = "Iniciar Sesión";
      loginLink.href = "./login.html";
    }
  }

  // Submit
  async function onSubmit(e) {
    e.preventDefault();
    const email = byId("email")?.value?.trim().toLowerCase() || "";
    const password = byId("password")?.value || "";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(email)) return showErrorInline("Ingresa un correo válido.");
    if (!password || password.length < 6) return showErrorInline("La contraseña debe tener al menos 6 caracteres.");

    const users = loadUsers();
    const user = users.find(u => u.correo === email);
    if (!user) return showErrorInline("Correo o contraseña incorrectos.");

    const passHash = await sha256(password);
    if (user.passHash !== passHash) return showErrorInline("Correo o contraseña incorrectos.");

    const session = {
      userId:   user.id,
      nombre:   user.nombre,
      apellido: user.apellido,
      correo:   user.correo,
      email:    user.correo,     // espejo para compatibilidad
      role:     user.role || "cliente",
      loggedAt: new Date().toISOString()
    };
    setSession(session);

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next) {
      window.location.href = next;
    } else {
      setFlash(`¡Bienvenido, ${user.nombre}!`, "success");
      window.location.href = "../veterinaria/productos.html";
    }
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    const flash = consumeFlash();
    if (flash?.message) showFlashBox(flash.message, flash.type || "success");
    const form = byId("loginForm");
    form?.setAttribute("novalidate", "true");
    form?.addEventListener("submit", onSubmit);
    updateNavbarSessionUI();
  });
})();
