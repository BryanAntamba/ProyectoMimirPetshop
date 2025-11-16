/* ==========================================
   Registro de usuarios (demo sin backend)
   - Almacena usuarios en localStorage: "mimir_users"
   - Evita emails duplicados
   - Hashea la contraseña con SHA-256 (demo)
   - Tras registrar, redirige a login con aviso
   ========================================== */
(() => {
  const FORM_ID = "registerForm";
  const STORAGE_KEY = "mimir_users";
  const FLASH_KEY   = "mimir_flash";
  const MIN_AGE     = 13;
  const MIN_PASS    = 6;

  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

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
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch { return []; }
  }
  function saveUsers(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function setFlash(message, type = "success") {
    localStorage.setItem(FLASH_KEY, JSON.stringify({ message, type, ts: Date.now() }));
  }
  function getAgeFrom(dateStr) {
    const today = new Date();
    const d = new Date(dateStr);
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }
  function clearErrors() {
    ["nombre","apellido","fecha","correo","telefono","contrasena"].forEach((id) => {
      const err = byId(`error-${id}`);
      if (err) err.textContent = "";
    });
  }
  function showError(id, msg) {
    const el = byId(`error-${id}`);
    if (el) el.textContent = msg;
  }
  function validateFields({ nombre, apellido, fecha, correo, telefono, contrasena }) {
    let ok = true;
    clearErrors();
    if (!nombre || nombre.trim().length < 2) { showError("nombre", "Ingresa tu nombre (mín. 2 caracteres)."); ok = false; }
    if (!apellido || apellido.trim().length < 2) { showError("apellido", "Ingresa tu apellido (mín. 2 caracteres)."); ok = false; }
    if (!fecha) { showError("fecha", "Selecciona tu fecha de nacimiento."); ok = false; }
    else {
      const age = getAgeFrom(fecha);
      if (isNaN(age) || age < MIN_AGE) { showError("fecha", `Debes tener al menos ${MIN_AGE} años.`); ok = false; }
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!correo || !emailRe.test(correo)) { showError("correo", "Ingresa un correo válido."); ok = false; }
    const telRe = /^[0-9]{10}$/;
    if (!telefono || !telRe.test(telefono)) { showError("telefono", "Ingresa un teléfono de 10 dígitos (solo números)."); ok = false; }
    if (!contrasena || contrasena.length < MIN_PASS) { showError("contrasena", `La contraseña debe tener al menos ${MIN_PASS} caracteres.`); ok = false; }
    return ok;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      nombre: byId("nombre")?.value?.trim() || "",
      apellido: byId("apellido")?.value?.trim() || "",
      fecha: byId("fecha")?.value || "",
      correo: byId("correo")?.value?.trim().toLowerCase() || "",
      telefono: byId("telefono")?.value?.trim() || "",
      contrasena: byId("contrasena")?.value || "",
    };
    if (!validateFields(payload)) return;

    const users = loadUsers();
    const exists = users.some(u => u.correo === payload.correo);
    if (exists) { showError("correo", "Este correo ya está registrado."); return; }

    const passHash = await sha256(payload.contrasena);
    const user = {
      id: crypto.randomUUID(),
      nombre: payload.nombre,
      apellido: payload.apellido,
      fecha: payload.fecha,
      correo: payload.correo,
      telefono: payload.telefono,
      passHash,
      createdAt: new Date().toISOString(),
      role: "cliente"
    };
    users.push(user);
    saveUsers(users);

    byId("registerForm").reset();
    setFlash("Registro exitoso. Ahora puedes iniciar sesión.");
    window.location.href = "../login/login.html";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = byId(FORM_ID);
    if (!form) return;
    form.setAttribute("novalidate", "true");
    form.addEventListener("submit", onSubmit);
  });
})();
