/* Chatbot front-end (no-backend demo)
   - By default uses a small demo responder so you can present locally.
   - If you want to use a real LLM API directly from browser, see comments below (not secure).
   - Recommended: use a serverless proxy for production/demo with real keys.
*/

document.addEventListener('DOMContentLoaded', function(){
  // Inject markup
  const container = document.createElement('div');
  container.id = 'chatbot';
  container.innerHTML = `
    <div class="chat-button" id="chatToggle" title="Abrir chat">💬</div>
    <div class="chat-panel" id="chatPanel" style="display:none;">
      <div class="chat-header">
        <div class="title">Mimir Chat</div>
        <button class="close" id="chatClose">✕</button>
      </div>
      <div class="chat-body" id="chatBody">
        <div class="chat-message bot"><div class="chat-bubble">Hola 👋, soy el asistente de Mimir. ¿En qué puedo ayudarte hoy?</div></div>
      </div>
      <div class="chat-input">
        <input id="chatInput" placeholder="Escribe tu pregunta..." />
        <button id="chatSend">Enviar</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const sendBtn = document.getElementById('chatSend');
  const input = document.getElementById('chatInput');
  const body = document.getElementById('chatBody');

  function openPanel(){ panel.style.display = 'flex'; toggle.style.display = 'none'; input.focus(); scrollBottom(); }
  function closePanel(){ panel.style.display = 'none'; toggle.style.display = 'flex'; }

  toggle.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  sendBtn.addEventListener('click', onSend);
  input.addEventListener('keydown', function(e){ if(e.key === 'Enter') onSend(); });

  function addMessage(text, who='bot'){
    const msg = document.createElement('div');
    msg.className = 'chat-message ' + (who === 'me' ? 'me' : 'bot');
    msg.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
    body.appendChild(msg);
    scrollBottom();
  }

  function scrollBottom(){ body.scrollTop = body.scrollHeight; }

  function onSend(){
    const text = input.value.trim();
    if(!text) return;
    addMessage(text, 'me');
    input.value = '';
    // First try: demo responder for offline use
    demoResponder(text).then(resp => addMessage(resp, 'bot'))
      .catch(err => addMessage('Lo siento, se produjo un error. Intenta de nuevo.', 'bot'));
  }

  // Simple local demo responder (good for presentations without API)
  async function demoResponder(msg){
    const m = msg.toLowerCase();
    const has = (...keys) => keys.some(k => m.includes(k));

    // SALUDOS
    if(has('hola','holi','buenas','buenos','hey','ayuda')) return '¡Hola! 👋 Soy el asistente de Mimir PetShop. Puedo ayudarte con: convenios veterinarios, adopción de mascotas, catálogo de productos y proceso de compra. ¿Qué te interesa saber?';
    
    // HORARIOS Y GENERAL
    if(has('horario','hora','abierto','cierra','abren')) return 'Nuestro horario es Lunes a Viernes de 9:00 a 18:00. Para urgencias de mascotas fuera de horario, consulta los contactos del convenio veterinario en la sección de Convenios.';
    if(has('ubicacion','donde','direccion','local','tienda')) return 'Nos ubicamos en Av. de la República E5-46, Quito 170515. Puedes visitarnos para retiro de compras o consultas presenciales.';
    
    // === CONVENIO VETERINARIO (muchas variaciones) ===
    if(has('veterinario','veterinaria','veterina','hospital','clinica','médico','salud','consulta','atencion','mascotas','urgencia','enfermo','enfermedad','síntoma')){
      return '🏥 Convenio Veterinario - Hospital Veterinario Argos:\n• Servicio: Atención médica y consultas veterinarias 24/7\n• Teléfono: (02) 222-4365 / 0999722351\n• Correo: vetargos@yahoo.com\n• Para agendar: Indica nombre y tipo de mascota, síntomas\n• Ubicación: Ver en la sección "Convenios" de nuestra web\nNuestro equipo cuida de tu mascota en todo momento.';
    }

    if(has('atencion 24','24 horas','urgencia','emergencia','noche','domingo','fin de semana')) return 'El Hospital Veterinario Argos ofrece atención 24/7. Contacta por teléfono al (02) 222-4365 / 0999722351 urgentemente si tu mascota está mal.';
    
    if(has('costo','precio','cuanto cuesta','tarifa','arancel','valor')) return 'Los costos varían según servicio. Contacta al hospital en vetargos@yahoo.com o (02) 222-4365 para tarifas específicas.';
    
    // === ADOPCIÓN (muchas variaciones) ===
    if(has('adopcion','adoptación','adoptar','rescate','mascota gratis','perrito','gatito','animalito','abandonado','cuidado','amar','familia','hogar responsable','protección animal')){
      return '🐾 Adopción Responsable - Fundación "Camino a Casa":\n• Misión: Encontrar hogar amoroso para mascotas rescatadas\n• Correo: info@fundacioncaminoacasa.com\n• Proceso: 1) Contacta mostrando interés 2) Describe tu hogar 3) Visita y conoce la mascota 4) Acogida responsable\n• Importancia: Esterilización y educación para prevenir abandono\nCada mascota merece un hogar lleno de amor.';
    }

    if(has('como adoptar','que necesito','requisitos','proceso','esterilizacion','esterilización','vacuna','salud')) return 'Para adoptar: 1) Escribe a info@fundacioncaminoacasa.com mostrando tu interés 2) Cuéntales sobre tu hogar y familia 3) Ellos hacen seguimiento 4) Conoces la mascota 5) Acogida responsable. La fundación enfatiza esterilización y cuidado amoroso.';
    
    // === PRODUCTOS (muchas variaciones) ===
    if(has('producto','productos','catalogo','catálogo','oferta','que venden','que tienen','comida','alimento','comida perro','comida gato','perro','gato','ave','conejo','hamster','hámster')){
      return '🛒 Productos Mimir:\nCategorías por mascota:\n• PERROS: Wellness, Buen Can, Pro Can (cachorros, adultos, razas pequeñas/grandes)\n• GATOS: Michu, Cat Chow, Nutra Pro (comida premium)\n• AVES: Bebederos antigoteo, mezclas de semillas\n• HÁMSTERS: Mezclas premium de alimentos\n• CONEJOS: Heno Timothy, accesorios especializados\nCada producto muestra: nombre, precio/kg, imagen, cantidad mínima. ¡Escoge lo mejor para tu mascota!';
    }

    if(has('wellness','buen can','pro can','michu','cat chow','nutra pro','marca','marcas')) return 'Trabajamos con marcas premium: Wellness para perros cachorros y adultos, Buen Can para razas, Pro Can para medianas/grandes, Michu y Cat Chow para gatos, Nutra Pro delicioso para gatos. ¡Todas disponibles en la sección Productos!';
    
    if(has('precio','cuanto cuesta','cuál es el precio','costo producto','valor','caro','barato','promoción')) return 'Los precios varían según producto y marca. Puedes ver el precio exacto en cada tarjeta (por kg o unidad). Ofrecemos opciones para todos los presupuestos. Ve a la sección "Productos" para consultar.';

    if(has('accesorio','accesorios','juguete','juguetes','bebedero','comedero')) return 'Además de alimento premium, ofrecemos accesorios como bebederos, comederos, enriquecimiento. Todo lo que tu mascota necesita está en una sola tienda.';

    // === CARRITO Y PROCESO DE COMPRA ===
    if(has('carrito','agregar','añadir','cantidad','como compro','como agrego','como compro','selector cantidad')){
      return '🛒 Carrito paso a paso:\n1) Ve a "Productos"\n2) Selecciona tu mascota (perro, gato, etc.)\n3) Elige producto\n4) Con +/− selecciona CANTIDAD\n5) Pulsa "AGREGAR" → suma al carrito\n6) Repite con más productos\n7) Haz clic en carrito (esquina o navbar)\n8) Revisa total y pulsa "PAGAR"\n¡Muy fácil y rápido!';
    }
    
    if(has('mini carrito','iconito','esquina','floante','navbar','ver carrito')) return 'El mini carrito está en esquina inferior derecha (icono de bolsa) y en el navbar. Haz clic para ver productos añadidos, total y opción de pagar.';

    // === PAGO Y TRANSFERENCIA (muchas variaciones) ===
    if(has('pago','pagar','transferencia','banco','dinero','cómo pago','método pago','cómo compro','cómo se paga','cómo realizo pago','forma de pago')){
      return '💳 Cómo Pagar:\n1) Haz clic en "PAGAR" desde carrito\n2) Elige opción bancaria:\n   • BANCO PICHINCHA → aparece número/CTA\n   • BANCO GUAYAQUIL → aparece número/CTA\n3) Realiza transferencia desde tu banco (monto exacto)\n4) Captura comprobante (foto o PDF)\n5) Envía a: mimirpetshop@gmail.com\n6) Indicar: nombre, celular, monto, direccion de su domicilio para la entrega,\n7) Confirmamos en 10 a 15 minutos\n8) Recibirás correo de pago aceptado + entrega\nSeguro, rápido y confiable.';
    }

    if(has('banco pichincha','pichincha','numero pichincha','cta pichincha','transferencia pichincha')) return '🏦 Banco Pichincha:\nEn "Pagar" verás la CTA Pichincha. Transfiere el monto exacto. Luego envía screenshot/PDF a mimirpetshop@gmail.com con tu nombre. ¡Confirmaremos en 10 a 15 minutos!';
    
    if(has('banco guayaquil','guayaquil','numero guayaquil','cta guayaquil','transferencia guayaquil')) return '🏦 Banco Guayaquil:\nEn "Pagar" verás la CTA Guayaquil. Transfiere el monto exacto. Después envía comprobante a mimirpetshop@gmail.com con tu nombre. ¡Lo verificamos rápido!';

    if(has('comprobante','foto comprobante','pdf','donde envio','transferencia realizada','captura','screenshot')) return '📸 Envío de Comprobante:\n1) Captura de pantalla clara de la transferencia\n2) O descarga PDF del banco\n3) Envía a: mimirpetshop@gmail.com\n4) En correo escribe: tu nombre + celular + monto + y direccion de tu domicilio para la entra del producto.\n5) Nosotros confirmamos en 10 a 15 minutos.\nSin comprobante no podemos procesar tu compra.';

    if(has('confirmacion','confirmación','cuanto tarda','tiempo espera','cuando','recibo correo')) return '⏱️ Confirmación:\nAl recibir tu comprobante:\n• Verificamos en 10 a 15 minutos\n• Enviamos correo confirmando pago ✓\n• Luego procesamos pedido\n• Te indicamos opción entrega (envío o retiro)\n• Coordinaremos fecha y detalles\nTodo por correo, rápido y transparente.';

    if(has('envio domicilio','envío domicilio','envio a mi casa','entregan','cuanto cuesta envio','costo envio','cuanto demora','tiempo envio','donde envian')) return '📦 Envío a Domicilio:\nOfrecemos envío nacional. Costo y tiempo varían según tu ubicación (ciudad, barrio, altura, etc.). Al finalizar compra verás opciones y costos específicos. Escolares, nacional. Entregas confiables.';

    if(has('retiro tienda','retiro en local','retiro en tienda','en persona','local','Quito')) return '🏪 Retiro en Tienda:\nDirección: Av. de la República E5-46, Quito 170515\nHorario: Lunes-Viernes 9:00-18:00\nUna vez confirmado pago, coordinaremos retiro por correo. ¡Rápido, gratis y seguro!';

    // === CONTACTO GENERAL ===
    if(has('contacto','telefono','teléfono','correo','email','como contacto','comunicarse','escribir')) {
      return '📞 Contactos Mimir PetShop:\n🔗 GENERAL & COMPRAS: mimirpetshop@gmail.com\n🏥 VETERINARIO: vetargos@yahoo.com\n  Tel: (02) 222-4365 / 0999722351\n🐾 ADOPCIÓN: info@fundacioncaminoacasa.com\n📍 Ubicación: Av. de la República E5-46, Quito 170515\n⏰ Lunes-Viernes 9:00-18:00\n¡Siempre aquí para ti!';
    }

    // === ENVÍO Y LOGÍSTICA ===
    if(has('envio','envía','envío','retiro','entrega','llegada','demora','tiempo entrega')) return 'Ofrecemos envío nacional y retiro en tienda. Costos y tiempos dependen de tu ubicación. Al comprar verás opciones exactas. ¡Flexible para ti!';

    // === LOGIN / INICIAR SESIÓN (muchas variaciones) ===
    if(has('login','iniciar sesion','iniciar sesión','ingresar','entrar','acceso','cuenta','ya tengo cuenta','tengo cuenta')){
      return '🔐 Cómo Iniciar Sesión:\nSi ya tienes cuenta registrada:\n\n1️⃣ Haz clic en "Iniciar Sesión" (arriba derecha en navbar)\n2️⃣ Ingresa tu CORREO ELECTRÓNICO\n3️⃣ Ingresa tu CONTRASEÑA\n4️⃣ Pulsa "Iniciar sesión"\n5️⃣ ¡Listo! Accedes a tu perfil y carrito\n\n📌 Si olvidaste tu contraseña:\nContacta a mimirpetshop@gmail.com\n\n❌ ¿Aún no tienes cuenta?\nHaz clic en "Registrarse" para crear una nueva.';
    }

    if(has('olvide contraseña','olvide mi contraseña','olvidé contraseña','olvidé mi contraseña','reset contraseña','resetear contraseña','recuperar contraseña','contraseña perdida')) return '🔑 Recuperar Contraseña:\nSi olvidaste tu contraseña:\n1) Intenta recordarla (mayúsculas, números, caracteres especiales)\n2) Si no logras, contacta a mimirpetshop@gmail.com\n3) Incluye tu nombre y correo registrado\n4) Te ayudaremos a recuperar acceso en 24 horas\n\n💡 Recomendación: Usa contraseñas seguras con 6+ caracteres.';

    if(has('como entro','como me logueo','cual es mi contraseña','verificar contraseña','validar datos','datos login')) return '🔓 Verificación de Credenciales:\nAl iniciar sesión necesitas:\n• CORREO: El email con el que te registraste\n• CONTRASEÑA: La contraseña segura que creaste (mínimo 6 caracteres)\n\nSi los datos son incorrectos, verás mensaje de error. Revisa mayúsculas/minúsculas. ¡Intenta de nuevo!';

    // === REGISTRO / CREAR CUENTA (muchas variaciones) ===
    if(has('registro','registrarse','crear cuenta','nueva cuenta','sign up','inscripcion','inscribirse','registrarme','registrate','registracion')){
      return '📝 Cómo Registrarse (Crear Cuenta):\n\n📋 Campos OBLIGATORIOS:\n1️⃣ NOMBRE: Tu nombre completo\n2️⃣ APELLIDO: Tu apellido completo\n3️⃣ FECHA DE NACIMIENTO: Selecciona tu fecha (calendario)\n4️⃣ CORREO ELECTRÓNICO: Email válido (ej: usuario@gmail.com)\n5️⃣ TELÉFONO: 10 dígitos (ej: 0999999999)\n6️⃣ CONTRASEÑA: Mínimo 6 caracteres (combina letras y números)\n\n✅ PASOS:\n1) Ingresa todos los datos correctamente\n2) Pulsa "Registrarse"\n3) ¡Cuenta creada! Recibirás confirmación\n4) Ahora inicia sesión con tu correo y contraseña\n5) ¡Listo para comprar!\n\n⚠️ Revisa que tu teléfono sea correcto (10 dígitos).';
    }

    if(has('que datos necesito','cual es el teléfono','cual es el telefono','cual es mi numero','validar teléfono','validar telefono','formato teléfono','formato telefono')) return '📱 Datos de Teléfono:\nEn el registro, ingresa 10 dígitos numéricos:\nEJ: 0999999999\n\nEs importante para:\n✓ Confirmación de compra\n✓ Seguimiento de entrega\n✓ Contacto directo si hay dudas\n\nVerifica que sea un número activo. ¡Lo necesitamos!';

    if(has('contraseña segura','contraseña fuerte','password seguro','password fuerte','requisitos contraseña','requisitos password','como creo contraseña')) return '🔒 Contraseña Segura:\nRequisitos mínimos:\n• Mínimo 6 caracteres\n• Combina LETRAS y NÚMEROS\n\n✅ Ejemplos seguros:\n- Mimirpet123\n- Mascota2024\n- Quito99Perro\n\n❌ Evita:\n- Fechas de nacimiento (123456)\n- Nombre y número (Juan1234)\n- Secuencias obvias (111111)\n\n💡 Consejo: Usa algo que recuerdes pero que otros no adivinen fácilmente.';

    if(has('error registro','error al registrar','no puedo registrar','falla registro','problema registro','no me deja registrar','registro no funciona')) return '⚠️ Problemas al Registrar:\n\nVerifica que:\n✓ Todos los campos estén completos (ninguno vacío)\n✓ El email NO esté ya registrado (usa otro si tienes múltiples)\n✓ El teléfono sea exactamente 10 dígitos\n✓ La contraseña tenga MÍNIMO 6 caracteres\n✓ Los datos en correo y teléfono sean válidos\n\nSi persiste error:\n📧 Envía captura de pantalla a mimirpetshop@gmail.com\nIncluye qué campo falla y qué datos usaste.\n\n🤝 Te ayudaremos en 2-4 horas.';

    if(has('cambiar contraseña','cambiar password','modificar contraseña','actualizar contraseña')) return '🔄 Cambiar Contraseña:\n1) Inicia sesión con tu contraseña actual\n2) Ve a tu perfil/configuración\n3) Busca opción "Cambiar Contraseña"\n4) Ingresa contraseña ACTUAL\n5) Ingresa NUEVA contraseña (6+ caracteres)\n6) Confirma nueva contraseña\n7) Guarda cambios\n\nSi no encuentras opción, contacta: mimirpetshop@gmail.com';

    if(has('perfil','mi cuenta','mis datos','editar perfil','ver perfil','configuracion','configuración','cuenta activa')) return '👤 Tu Perfil:\nUna vez registrado e inicias sesión:\n✓ Accedes a tu perfil personal\n✓ Ves tus datos: nombre, email, teléfono\n✓ Historial de compras realizadas\n✓ Opción para cambiar contraseña\n✓ Carrito persistente (guardado siempre)\n✓ Direcciones de entrega guardadas\n\n📌 En próximas versiones: Wishlist, notificaciones, descuentos especiales.';

    // === COMPRA COMPLETA (combo login + registro + pago) ===
    if(has('quiero comprar','como compro','proceso compra','flujo compra','paso a paso compra','comprar productos')){
      return '🛍️ Flujo Completo de Compra:\n\n📌 PASO 1 - CUENTA (elige una opción):\n   • ¿YA TIENES CUENTA? → Inicia sesión\n   • ¿SIN CUENTA? → Regístrate primero\n\n🛒 PASO 2 - PRODUCTOS:\n   • Ve a "Productos" en navbar\n   • Selecciona mascota (perro, gato, etc.)\n   • Elige producto deseado\n   • Con +/− define CANTIDAD\n   • Pulsa "AGREGAR" → va al carrito\n\n🏪 PASO 3 - CARRITO:\n   • Revisa productos y cantidades\n   • Confirma total de precio\n   • Pulsa "PAGAR"\n\n💳 PASO 4 - PAGO:\n   • Elige banco (Pichincha o Guayaquil)\n   • Realiza transferencia exacta\n   • Captura comprobante\n   • Envía a mimirpetshop@gmail.com\n\n✅ PASO 5 - CONFIRMACIÓN:\n   • Verificamos en 10-15 min\n   • Recibes email de pago aceptado\n   • Coordinaremos entrega/retiro\n\n🎉 ¡Listo!';
    }

    // === FALLBACK ===
    return 'Pregunta interesante. Puedo ayudarte con:\n\n✅ CUENTA & ACCESO:\n   • Iniciar sesión\n   • Registrarse / crear cuenta\n   • Cambiar contraseña\n   • Recuperar acceso\n\n✅ PRODUCTOS & CARRITO:\n   • Catálogo de productos\n   • Cómo agregar al carrito\n   • Ver mini carrito\n\n✅ PAGO & ENTREGA:\n   • Cómo pagar (bancos, pasos)\n   • Enviar comprobante\n   • Confirmación de compra\n   • Envío o retiro\n\n✅ AYUDA ESPECIAL:\n   • Convenios veterinarios\n   • Adopción de mascotas\n   • Contactos\n\n💬 Intenta:\n"¿Cómo me registro?"\n"¿Cómo inicia sesión?"\n"Quiero comprar un producto"\n"¿Cómo pago?"';
  }

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // OPTIONAL: example function to call an external API (UNSECURE to call directly from browser)
  // If you have an API key and want to demo an LLM, you can uncomment and adapt the code below.
  // Warning: embedding secret keys in client-side code is NOT secure. Use a serverless proxy for real keys.
  /*
  async function callExternalAPI(userMessage){
    const OPENAI_API_KEY = 'YOUR_API_KEY_HERE'; // DO NOT commit this key
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{role:'user', content: userMessage}],
        max_tokens: 300
      })
    });
    const data = await resp.json();
    // extract text depending on API shape
    return (data?.choices?.[0]?.message?.content) || JSON.stringify(data);
  }
  */

});
