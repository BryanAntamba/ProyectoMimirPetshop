/* =======================================================
   admin-access.js · MimirPetShop
   - Long-press sobre el logo para acceso admin (con barra)
   - Soporte mouse y touch
   - Integra sesión localStorage ("mimir_session")
   - Navbar: cambia "Iniciar Sesión" por "Cerrar sesión"
   - Redirecciones robustas con new URL()
   ======================================================= */

let pressTimer = null;
let pressProgress = 0;
let isPointerDown = false;
let progressBar = null;

(function () {
  const ADMIN_LOGIN_REL = "admin/login.html";   // login de admin
  const USERS_LOGIN_REL = "login/login.html";   // login de cliente (por si lo necesitas)
  const ACCESS_KEY = "mimir2023";               // clave oculta demo
  const HOLD_MS = 3000;                         // 3s para activar
  const TICK_MS = 100;                          // progreso en ticks
  const SESSION_KEY = "mimir_session";
  const FLASH_KEY = "mimir_flash";

  // ---------- Helpers de sesión ----------
  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }
  function setFlash(message, type = "success") {
    localStorage.setItem(FLASH_KEY, JSON.stringify({ message, type, ts: Date.now() }));
  }

  // Resuelve rutas relativas de forma segura
  function href(rel) {
    return new URL(rel, window.location.href).toString();
  }

  // ---------- Navbar: “Iniciar Sesión” <-> “Cerrar sesión” ----------
  function updateNavbarSessionUI() {
    const session = getSession();
    // busca un link que apunte a login o un .nav-btn
    const loginLink =
      document.querySelector('a.nav-btn') ||
      document.querySelector('a[href$="login.html"].nav-link') ||
      document.querySelector('a[href$="login.html"]');

    if (!loginLink) return;

    if (session) {
      loginLink.textContent = "Cerrar sesión";
      loginLink.href = "#";
      loginLink.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          clearSession();
          setFlash("Sesión cerrada correctamente.", "success");
          // tras cerrar sesión vamos al inicio
          window.location.href = href("../index.html");
        },
        { once: true }
      );
    } else {
      loginLink.textContent = "Iniciar Sesión";
      loginLink.href = href(USERS_LOGIN_REL);
    }
  }

  // ---------- Lógica de long-press en el logo ----------
  function setupLogoSecret() {
    const logo = document.getElementById("logoImage");
    if (!logo) return;

    // Barra de progreso
    progressBar = document.createElement("div");
    Object.assign(progressBar.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      height: "3px",
      backgroundColor: "#007bff",
      width: "0",
      transition: "width 0.08s linear",
      display: "none",
    });
    const parent = logo.parentElement;
    if (parent) parent.style.position = "relative";
    parent?.appendChild(progressBar);

    const startHold = (ev) => {
      ev.preventDefault();
      if (isPointerDown) return;
      isPointerDown = true;
      pressProgress = 0;
      progressBar.style.display = "block";
      progressBar.style.width = "0%";

      pressTimer = setInterval(() => {
        pressProgress += TICK_MS;
        const pct = Math.min(100, Math.round((pressProgress / HOLD_MS) * 100));
        progressBar.style.width = pct + "%";
        if (pressProgress >= HOLD_MS) {
          // alcanzó el long-press
          stopHold();
          handleAdminAccess();
        }
      }, TICK_MS);
    };

    const stopHold = () => {
      isPointerDown = false;
      if (pressTimer) clearInterval(pressTimer);
      pressTimer = null;
      pressProgress = 0;
      if (progressBar) {
        progressBar.style.display = "none";
        progressBar.style.width = "0%";
      }
    };

    // mouse
    logo.addEventListener("mousedown", startHold);
    logo.addEventListener("mouseup", stopHold);
    logo.addEventListener("mouseleave", stopHold);
    logo.addEventListener("dragstart", (e) => e.preventDefault());

    // touch
    logo.addEventListener("touchstart", startHold, { passive: false });
    logo.addEventListener("touchend", stopHold);
    logo.addEventListener("touchcancel", stopHold);
    logo.addEventListener("touchmove", (e) => {
      // si el dedo se mueve mucho, cancelamos (opcional)
      // podrías medir delta si quieres ser más estricto
    });
  }

  // ---------- Acceso admin ----------
  function handleAdminAccess() {
    const session = getSession();
    // Si ya es admin, entra directo
    if (session?.role === "admin") {
      window.location.href = href(ADMIN_LOGIN_REL); // o directamente al panel si lo tienes
      return;
    }

    // Si no, pide clave oculta y redirige al login de admin
    const accessKey = prompt("Ingrese la clave de acceso:");
    if (accessKey === null) return; // cancelado
    if (accessKey === ACCESS_KEY) {
      window.location.href = href(ADMIN_LOGIN_REL);
    } else {
      alert("Clave incorrecta");
    }
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    updateNavbarSessionUI();
    setupLogoSecret();
  });
})();
