// main.js - Versión con validaciones integradas (DescoApp)

// ============================================
// FUNCIONES DE VALIDACIÓN (NUEVAS)
// ============================================

// Validar cédula colombiana
function validarCedula(cedula) {
  const limpia = String(cedula).replace(/\D/g, '');
  
  if (!limpia) {
    return { valido: false, error: 'La cédula es obligatoria' };
  }
  
  if (limpia.length < 6 || limpia.length > 10) {
    return { valido: false, error: 'La cédula debe tener entre 6 y 10 dígitos' };
  }
  
  if (!/^\d+$/.test(limpia)) {
    return { valido: false, error: 'La cédula solo debe contener números' };
  }
  
  return { valido: true, valor: limpia };
}

// Validar teléfono colombiano
function validarTelefono(telefono) {
  const limpio = String(telefono).replace(/\D/g, '');
  
  if (!limpio) {
    return { valido: true, valor: '' }; // opcional
  }
  
  if (limpio.length !== 10) {
    return { valido: false, error: 'El teléfono debe tener exactamente 10 dígitos' };
  }
  
  if (!limpio.startsWith('3')) {
    return { valido: false, error: 'El teléfono celular debe comenzar con 3' };
  }
  
  return { valido: true, valor: limpio };
}

// Validar nombre
function validarNombre(nombre) {
  const limpio = String(nombre).trim();
  
  if (!limpio) {
    return { valido: false, error: 'El nombre es obligatorio' };
  }
  
  if (limpio.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(limpio)) {
    return { valido: false, error: 'El nombre solo puede contener letras' };
  }
  
  return { valido: true, valor: limpio };
}

// Validar dirección
function validarDireccion(direccion) {
  const limpia = String(direccion).trim();
  
  if (!limpia) {
    return { valido: true, valor: '' }; // opcional
  }
  
  if (limpia.length < 10) {
    return { valido: false, error: 'La dirección debe tener al menos 10 caracteres' };
  }
  
  return { valido: true, valor: limpia };
}

// Mostrar error en formulario
function mostrarErrorForm(mensaje, idError = 'loginErrorMsg') {
  const errorEl = document.getElementById(idError);
  if (errorEl) {
    // Limpiar timeouts previos ESPECÍFICOS de este error
    const timeoutKey = `errorTimeout_${idError}`;
    if (window[timeoutKey]) {
      clearTimeout(window[timeoutKey]);
      window[timeoutKey] = null;
    }
    
    // ✅ BLOQUEAR limpieza automática por 5 segundos (aumentado)
    const blockKey = `errorBlocked_${idError}`;
    window[blockKey] = true;
    
    // FORZAR DISPLAY CON INLINE STYLES
    errorEl.style.display = 'flex';
    errorEl.style.backgroundColor = '#fafaf916';
    errorEl.style.color = 'white';
    errorEl.style.padding = '6px 12px';
    errorEl.style.borderRadius = '6px';
    errorEl.style.marginTop = '10px';
    errorEl.style.fontSize = '12px';
    errorEl.style.alignItems = 'center';
    errorEl.style.justifyContent = 'space-between';
    errorEl.style.gap = '8px';
    errorEl.style.opacity = '1';
    errorEl.style.visibility = 'visible';
    errorEl.style.animation = 'fadeIn 0.4s ease';
    
    // Agregar icono y botón de cerrar
    errorEl.innerHTML = `
      <span style="flex: 1;">⚠️ ${mensaje}</span>
      <button onclick="ocultarErrorForm('${idError}')" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 20px; padding: 4px 8px; margin: 0; line-height: 1; font-weight: bold;">&times;</button>
    `;
    
    console.log(`✅ Error mostrado [${idError}]: "${mensaje}" - Durará 60 segundos`);
    
    // Desbloquear limpieza automática después de 5 segundos (aumentado)
    setTimeout(() => {
      window[blockKey] = false;
      console.log(`🔓 Limpieza automática activada para [${idError}]`);
    }, 5000);
    
    // Auto-ocultar después de 1 minuto (60000 ms = 60 segundos)
    window[timeoutKey] = setTimeout(() => {
      console.log(`⏰ 60 segundos cumplidos - Ocultando [${idError}]`);
      ocultarErrorForm(idError);
    }, 60000);
    
  } else {
    console.error(`❌ No se encontró el elemento: ${idError}`);
    alert(mensaje);
  }
}

// Ocultar error
function ocultarErrorForm(idError = 'loginErrorMsg') {
  const errorEl = document.getElementById(idError);
  if (errorEl && errorEl.style.display === 'flex') {
    console.log(`🔴 Ocultando error: [${idError}]`);
    
    // Cancelar timeout específico de este error
    const timeoutKey = `errorTimeout_${idError}`;
    if (window[timeoutKey]) {
      clearTimeout(window[timeoutKey]);
      window[timeoutKey] = null;
    }
    
    // Ocultar con animación
    errorEl.style.animation = 'fadeOut 0.4s ease';
    
    setTimeout(() => {
      errorEl.style.display = 'none';
      errorEl.innerHTML = '';
      errorEl.style.opacity = '0';
    }, 400);
  }
}



// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const WHATSAPP_EMPRESA = "573245961645";
const contenedorProveedores = document.getElementById("listaProveedores");
const contenedorProductos = document.getElementById("productos");
const contenedorCarrusel = document.getElementById("carrusel");
const modalAuth = document.getElementById("authModal");
const formRegistro = document.getElementById("formRegistro");
const formLogin = document.getElementById("formLogin");
const mensajeBienvenida = document.getElementById("mensajeBienvenida");
const paginacion = document.querySelector(".paginacion");
const btnCerrarSesion = document.getElementById("btnCerrarSesion"); // ÚNICA DECLARACIÓN

const modalProducto = document.getElementById("modalProducto");
const modalProductoImg = document.getElementById("modalProductoImg");
const modalProductoDesc = document.getElementById("modalProductoDesc");
const cerrarModalProducto = document.getElementById("cerrarModalProducto");


let ofertasGlobal = [];

if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", cerrarSesion);
}

// Session config
const LOGIN_EXPIRATION_HOURS = 24;

function isLoginVigente() {
  const cliente = localStorage.getItem("cliente");
  const loginTime = localStorage.getItem("loginTime");
  if (!cliente || !loginTime) return false;
  const diff = (Date.now() - Number(loginTime)) / (1000 * 60 * 60);
  return diff < LOGIN_EXPIRATION_HOURS;
}

// Ejecuta callback si el usuario está logueado. Si no, muestra mensaje y abre login
function requireLogin(callback) {
  const cliente = isLoginVigente()
    ? JSON.parse(localStorage.getItem("cliente"))
    : null;

  // ✅ Usuario logueado → ejecuta acción
  if (cliente) {
    usuarioActual = cliente;
    try {
      return callback();
    } catch (err) {
      console.error("requireLogin callback error:", err);
    }
    return;
  }

  // ❌ Usuario NO logueado → guardar acción
  window.afterLogin = callback;

  // ✅ Limpiar errores y formularios
  ocultarErrorForm('loginErrorMsg');
  ocultarErrorForm('registroErrorMsg');
  if (formLogin) formLogin.reset();
  if (formRegistro) formRegistro.reset();

  // ✅ MOSTRAR MENSAJE PERSUASIVO ANTES DEL LOGIN
  if (typeof mostrarRegistroModal === "function") {
    mostrarRegistroModal(() => {
      // Al aceptar → abrir modal real de login/registro
      if (modalAuth) modalAuth.style.display = "flex";
    });
  } else {
    // Fallback seguro
    if (modalAuth) modalAuth.style.display = "flex";
  }
}


// Variables globales
let productos = [];
let paginaActual = 1;
const productosPorPagina = 20;
let usuarioActual = null;
let proveedorActual = null;

// Mostrar modal si no hay usuario válido
function mostrarModalSiNoHayUsuario() {
  const usuario = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;

  console.log("usuarioActual:", usuario);
  console.log("storage cliente:", localStorage.getItem("cliente"));

  if (!usuario) {
    console.log("❗ No hay usuario o sesión expirada → abrir modal");
    if (modalAuth) modalAuth.style.display = "flex";
  } else {
    usuarioActual = usuario;
    actualizarMensajeBienvenida();
  }
}

// UTIL: PAUSAR / RESTAURAR VIDEOS

function aggressivePauseAllMedia({ resetTime = true, mute = true } = {}) {
  document.querySelectorAll("video, audio").forEach((m) => {
    try {
      if (m.src) {
        m.dataset._origSrc = m.src;
        m.removeAttribute("src");
      }
      m.pause();
      if (resetTime) m.currentTime = 0;
      if (mute) m.muted = true;
      m.load();
    } catch (err) {
      console.warn("aggressivePauseAllMedia error:", err);
    }
  });

  window.dispatchEvent(new Event("app:videos-paused"));
}

async function restoreAllMedia({ unmute = false, tryPlay = true } = {}) {
  document.querySelectorAll("video, audio").forEach(async (m) => {
    try {
      if (m.dataset && m.dataset._origSrc) {
        m.src = m.dataset._origSrc;
        delete m.dataset._origSrc;
      }
      m.load();
      if (unmute) m.muted = false;
      if (tryPlay) {
        try {
          await m.play();
        } catch (e) {}
      }
    } catch (err) {
      console.warn("restoreAllMedia error:", err);
    }
  });

  window.dispatchEvent(new Event("app:videos-resume"));
}

// BASE LOCAL DE CLIENTES

function guardarClienteBase(usuario) {
  let base = JSON.parse(localStorage.getItem("baseClientes")) || [];
  const existe = base.some(c => c.cedula === usuario.cedula);

  if (!existe) {
    base.push(usuario);
    localStorage.setItem("baseClientes", JSON.stringify(base));
    console.log("🟢 Cliente guardado:", usuario);
  }
}

function verBaseClientes() {
  return JSON.parse(localStorage.getItem("baseClientes")) || [];
}

// CARGAR PROVEEDORES

async function cargarProveedores() {
  try {
    const res = await fetch("/data/proveedores.json");
    const proveedores = await res.json();

    if (!contenedorProveedores) {
      console.error("contenedorProveedores no encontrado en el DOM.");
      return;
    }

    contenedorProveedores.innerHTML = proveedores.map(p => `
  <div class="card-proveedor"
       onclick="requireLogin(() => abrirProveedor('${p.id}', '${p.nombre}'))">
    
    <div class="logo-wrapper">
      <img src="${p.logo}" alt="${p.nombre}">
    </div>

    <h3>${p.nombre}</h3>
  </div>
`).join('');

    proveedorActual = null;
    ocultarPaginacion();

    restoreAllMedia({ unmute: false, tryPlay: true });

  } catch (error) {
    if (contenedorProveedores) contenedorProveedores.innerHTML = "<p>Error al cargar los proveedores.</p>";
    console.error("Error al cargar proveedores:", error);
  }
}

// ABRIR CATÁLOGO DE PROVEEDOR

async function abrirProveedor(id, nombre) {
  try {
    aggressivePauseAllMedia({ resetTime: true, mute: true });

    const res = await fetch(`/data/productos_proveedor_${id}.json`);
    productos = await res.json();

    paginaActual = 1;
    proveedorActual = { id, nombre };

    let proveedorData = null;
    try {
      const provRes = await fetch("/data/proveedores.json");
      const provs = await provRes.json();
      proveedorData = provs.find(p => String(p.id) === String(id)) || null;
    } catch (err) {
      console.warn("No se pudo cargar datos adicionales del proveedor:", err);
    }

    const tituloEl = document.getElementById("tituloCatalogo");
    if (tituloEl) {
      const logoHtml = proveedorData && proveedorData.logo ? `<img src="${proveedorData.logo}" alt="${nombre}" class="catalogo-logo" />` : "";
      const bannerHtml = proveedorData && proveedorData.banner ? `<div class="catalogo-banner"><img src="${proveedorData.banner}" alt="Banner ${nombre}" /></div>` : "";
      const detallesHtml = proveedorData && proveedorData.detalles ? `<div class="catalogo-detalles">${proveedorData.detalles}</div>` : "";

      tituloEl.innerHTML = `
  <div class="header-catalogo">
    <button class="btn-volver" onclick="volverAProveedores()">⬅ Volver a proveedores</button>
    ${logoHtml}

    <div>
      <h2>Catálogo de ${nombre}</h2>

      <div class="buscador-catalogo">
        <div class="search-glow">
          <i class="fas fa-search"></i>
          <input 
            id="buscarCatalogo"
            type="text"
            placeholder="Buscar en el catálogo de ${nombre}..."
            autocomplete="off"
          />
        </div>
      </div>
    </div>
  </div>

  ${bannerHtml}
  ${detallesHtml}
`;


// 🎨 Color dinámico para detalles del proveedor (opcional)
if (proveedorData && proveedorData.colorDetalles) {
  const detallesEl = tituloEl.querySelector(".catalogo-detalles");
  if (detallesEl) {
    detallesEl.style.color = proveedorData.colorDetalles;
  }
}


      const inputBuscar = document.getElementById("buscarCatalogo");
      if (inputBuscar) {
        inputBuscar.addEventListener("input", (e) => {
          filtrarCatalogo(e.target.value);
        });
      }
    }

    const seccionVideos = document.querySelector(".video-stories") || document.querySelector(".videos");
    const seccionOfertas = document.querySelector(".ofertas");
    const seccionProveedores = document.querySelector(".proveedores") || contenedorProveedores;
    const seccionCatalogo = document.querySelector(".catalogo");

    if (seccionVideos) seccionVideos.style.display = "none";
    if (seccionOfertas) seccionOfertas.style.display = "none";
    if (seccionProveedores) seccionProveedores.style.display = "none";
    if (seccionCatalogo) seccionCatalogo.style.display = "block";

    mostrarProductos();
    mostrarPaginacion();

    setTimeout(() => {
      document.querySelector(".catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);

  } catch (error) {
    contenedorProductos.innerHTML = "<p>Error al cargar productos del proveedor.</p>";
    console.error("Error cargando productos:", error);
  }
}
window.abrirProveedor = abrirProveedor;

// VOLVER A PROVEEDORES

function volverAProveedores() {
  contenedorProductos.innerHTML = "";
  const tituloEl = document.getElementById("tituloCatalogo");
  if (tituloEl) tituloEl.innerHTML = "🏪 Revisa Aqui tu proveedor";
  proveedorActual = null;
  productos = [];

  const seccionVideos = document.querySelector(".video-stories") || document.querySelector(".videos");
  const seccionOfertas = document.querySelector(".ofertas");
  const seccionProveedores = document.querySelector(".proveedores") || contenedorProveedores;
  const seccionCatalogo = document.querySelector(".catalogo");

  if (seccionCatalogo) seccionCatalogo.style.display = "none";
  if (seccionVideos) seccionVideos.style.display = "";
  if (seccionOfertas) seccionOfertas.style.display = "";
  if (seccionProveedores) seccionProveedores.style.display = "";

  cargarProveedores();
  ocultarPaginacion();

  setTimeout(() => {
    restoreAllMedia({ unmute: false, tryPlay: true });
  }, 300);

  setTimeout(() => {
    document.querySelector(".proveedores")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

// FILTRAR CATALOGO

function filtrarCatalogo(texto) {
  const q = (texto || "").toLowerCase().trim();

  if (!q) {
    paginaActual = 1;
    mostrarProductos();
    mostrarPaginacion();
    return;
  }

  const filtrados = productos.filter(p => {
    const data = `${p.nombre} ${p.descripcion} ${p.codigo}`.toLowerCase();
    return data.includes(q);
  });

  paginaActual = 1;

  if (filtrados.length === 0) {
    document.getElementById("productos").innerHTML = `
      <div class="mensaje-no-resultados">
        <p>Lo sentimos, por ahora no tenemos ese producto disponible.</p>
        <p>Intenta con otro producto o mira nuestro catálogo completo.</p>
      </div>
    `;
    ocultarPaginacion();
    return;
  }

  const inicio = 0;
  const fin = productosPorPagina;
  const paginaFiltrada = filtrados.slice(inicio, fin);

  const cont = document.getElementById("productos");
  cont.innerHTML = "";

  paginaFiltrada.forEach(prod => {
    const card = document.createElement("div");
    card.className = "card";

   card.innerHTML = `
  <div class="img-wrapper">
    <img 
      src="${prod.imagen}" 
      alt="${prod.nombre}"
      onclick="abrirModalProducto('${prod.imagen}', '${prod.descripcion}')"
    />
  </div>

  <h3 class="producto-nombre">${prod.nombre}</h3>

  <p class="producto-precio">${prod.precio}</p>

  <div class="card-actions">
    <button class="btn-wsp" onclick="comprarProducto(${prod.id})">
      <i class="fab fa-whatsapp"></i> COMPRAR
    </button>
  </div>
`;



    cont.appendChild(card);
  });

  if (filtrados.length > productosPorPagina) {
    mostrarPaginacion();
  } else {
    ocultarPaginacion();
  }
}

// MOSTRAR PRODUCTOS

function mostrarProductos(animar = true) {
  if (!productos.length) {
    contenedorProductos.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  if (animar) contenedor.classList.add("efecto-pagina");

  setTimeout(() => {
    contenedor.innerHTML = "";
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    productosPagina.forEach(prod => {
      const card = document.createElement("div");
      card.className = "card animar-entrada";

      card.innerHTML = `
  <div class="img-wrapper">
    <img 
      src="${prod.imagen}" 
      alt="${prod.nombre}"
      onclick="abrirModalProducto('${prod.imagen}', '${prod.descripcion}')"
    />
  </div>

  <h3 class="producto-nombre">${prod.nombre}</h3>

  <p class="producto-precio">${prod.precio}</p>

  <div class="card-actions">
    <button class="btn-wsp" onclick="comprarProducto(${prod.id})">
      <i class="fab fa-whatsapp"></i> COMPRAR
    </button>
  </div>
`;


      contenedor.appendChild(card);
    });

    const paginaActualEl = document.getElementById("paginaActual");
    if (paginaActualEl) paginaActualEl.textContent = `Página ${paginaActual}`;

    if (animar) setTimeout(() => contenedor.classList.remove("efecto-pagina"), 700);

  }, animar ? 200 : 0);
}

// PAGINACION

function siguientePagina() {
  if (!proveedorActual) return;
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);
  if (paginaActual < totalPaginas) {
    paginaActual++;
    mostrarProductos();
     document.querySelector(".catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function anteriorPagina() {
  if (!proveedorActual) return;
  if (paginaActual > 1) {
    paginaActual--;
    mostrarProductos();
     document.querySelector(".catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function mostrarPaginacion() {
  if (paginacion) paginacion.style.display = "flex";
}
function ocultarPaginacion() {
  if (paginacion) paginacion.style.display = "none";
}

// COMPRAR PRODUCTO

function comprarProducto(idProducto) {
  requireLogin(() => {
    try {
      const producto = productos.find(p => p.id === idProducto);
      if (!producto) {
        console.error("Producto no encontrado:", idProducto);
        return;
      }

      enviarWhatsApp(producto);

    } catch (error) {
      console.error("Error al comprar producto:", error);
    }
  });
}

// COMPRAR DESDE CARRUSEL
function comprarProductoCarrusel(idProducto) {
  requireLogin(() => {

    const producto = ofertasGlobal.find(p => p.id === idProducto);
    if (!producto) {
      console.error("Producto no encontrado en ofertas:", idProducto);
      return;
    }

    enviarWhatsApp(producto);
    agregarProductoAlCarrito(producto)
    

  });
}

// login exitoso

function cerrarModalAuth() {
  try {
    if (modalAuth) {
      modalAuth.style.display = "none";
      
      // ✅ LIMPIAR ERRORES AL CERRAR
      ocultarErrorForm('loginErrorMsg');
      ocultarErrorForm('registroErrorMsg');
      
      // ✅ LIMPIAR FORMULARIOS
      if (formLogin) formLogin.reset();
      if (formRegistro) formRegistro.reset();
    }
  } catch (e) {}
}

function onLoginExitoso(cliente) {
  localStorage.setItem("cliente", JSON.stringify(cliente));
  localStorage.setItem("loginTime", Date.now());
  usuarioActual = cliente;

  cerrarModalAuth();
  actualizarMensajeBienvenida();
  mostrarCerrarSesion();

  try {
    if (typeof window.afterLogin === "function") {
      const fn = window.afterLogin;
      window.afterLogin = null;
      try { fn(); } catch (err) { console.error("Error ejecutando afterLogin:", err); }
    } else {
      const productoPendiente = sessionStorage.getItem("productoPendiente");
      if (productoPendiente) {
        try {
          const parsed = JSON.parse(productoPendiente);
          if (parsed && parsed.nombre) {
            enviarWhatsApp(parsed);
          } else {
            enviarWhatsAppCarrusel(Number(productoPendiente));
          }
        } catch (e) {
          enviarWhatsAppCarrusel(Number(productoPendiente));
        }
        sessionStorage.removeItem("productoPendiente");
      }
    }
  } catch (err) {
    console.error("Error al ejecutar acción pendiente:", err);
  }
}

function mostrarCerrarSesion() {
  const btn = document.getElementById("btnCerrarSesion");
  if (btn) {
    btn.style.display = "inline-flex";
    btn.style.visibility = "visible";
    btn.style.opacity = "1";
    console.log("Botón mostrado");

    // Agregar evento para redirigir al hacer clic
    btn.addEventListener("click", () => {
      // Opcional: limpiar sesión/localStorage si la tienes
      localStorage.removeItem("usuario"); // ejemplo
      sessionStorage.clear();              // ejemplo
      // Redirigir a la página principal
      window.location.href = "index.html";
    });
  }
}

function ocultarCerrarSesion() {
  const btn = document.getElementById("btnCerrarSesion");
  if (btn) {
    btn.style.display = "none";
    btn.style.visibility = "hidden";
    btn.style.opacity = "0";
    console.log("Botón ocultado");
  }
}


// ENVIAR WHATSAPP (CATÁLOGO) - VERSIÓN PROFESIONAL FINAL

async function enviarWhatsApp(producto, cliente = null, proveedor = null) {
  try {

    if (!cliente) {
      cliente = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;
    }

    const nombreCliente = cliente?.nombre 
      ? `*${cliente.nombre.toUpperCase()}*`
      : "*CLIENTE*";

    if (!proveedor && producto.proveedorId) {
      try {
        const resProv = await fetch("/data/proveedores.json");
        const provs = await resProv.json();
        proveedor = provs.find(p => Number(p.id) === Number(producto.proveedorId)) || null;
      } catch (err) {
        console.warn("No se pudo leer proveedores.json:", err);
      }
    }

    const nombreProveedor = proveedor?.nombre
      ? `*${proveedor.nombre.toUpperCase()}*`
      : producto.proveedorNombre
        ? `*${producto.proveedorNombre.toUpperCase()}*`
        : "*PROVEEDOR*";

    const logoProveedor = proveedor?.logo || producto.proveedorLogo || "";

    const makeAbsolute = (path) => {
      if (!path) return "";
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      return `${window.location.origin}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const logoProveedorUrl = makeAbsolute(logoProveedor);
    const urlProducto = `${window.location.origin}/producto.html?id=${encodeURIComponent(producto.id)}`;

    const nombreProducto = `🔥 *${producto.nombre.toUpperCase()}*`;
    const precio = `*PRECIO:* *${producto.precio?.toUpperCase ? producto.precio.toUpperCase() : producto.precio}*`;
    const descripcion = producto.descripcion ? producto.descripcion : "";

    // ===============================
    // 🧠 CONTROL DE CONVERSACIÓN
    // ===============================
    const conversacionIniciada = sessionStorage.getItem("wa_iniciado");

    let mensaje = "";

    if (!conversacionIniciada) {
      // 🟢 PRIMER MENSAJE DE LA SESIÓN
      sessionStorage.setItem("wa_iniciado", "1");

      mensaje = 
`Hola, soy ${nombreCliente} y quiero comprar este producto:

${nombreProducto}
${descripcion}
${precio}

*PROVEEDOR:* ${nombreProveedor}
${logoProveedorUrl ? `Logo: ${logoProveedorUrl}` : ""}

🔗 Ver producto:
${urlProducto}
`;
    } else {
      // 🔵 MENSAJES SIGUIENTES
      mensaje =
`Y también quiero comprar este producto:

${nombreProducto}
${descripcion}
${precio}

🔗 Ver producto:
${urlProducto}
`;
    }

    const numero = proveedor?.whatsapp || producto.whatsapp || WHATSAPP_EMPRESA;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

  } catch (error) {
    console.error("Error al enviar WhatsApp:", error);
  }
}

// LOGIN Y REGISTRO detectar genero
function detectarGenero(nombre) {
  if (!nombre) return "bienvenido";

  const limpio = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (limpio.endsWith("a")) {
    return "bienvenida";
  }

  if (limpio.endsWith("o")) {
    return "bienvenido";
  }

  return "bienvenido";
}

function actualizarMensajeBienvenida() {
  if (!mensajeBienvenida) return;
  if (!usuarioActual) {
    usuarioActual = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;
  }
  if (!usuarioActual) {
    mensajeBienvenida.innerHTML = "";
    return;
  }

  const nombre = (usuarioActual.nombre || "").toUpperCase();
  const genero = usuarioActual.genero
  ? (usuarioActual.genero === "F" ? "Bienvenida" : "Bienvenido")
  : detectarGenero(usuarioActual.nombre);


  mensajeBienvenida.innerHTML = `
    ¡${genero}, <b>${nombre}</b>!
  `;
}

// CERRAR SESIÓN
// CERRAR SESIÓN
function cerrarSesion() {
  try {
    // 🔐 Limpieza de sesión
    localStorage.removeItem("cliente");
    localStorage.removeItem("loginTime");

    // 🧹 Limpieza de estados temporales
    sessionStorage.removeItem("productoPendiente");
    sessionStorage.removeItem("wa_iniciado"); // ⬅️ MUY IMPORTANTE

    usuarioActual = null;

    // 🔄 UI
    actualizarMensajeBienvenida();
    ocultarCerrarSesion();

    console.log("✅ Sesión cerrada correctamente (estado limpio)");
  } catch (err) {
    console.error("Error en cerrarSesion:", err);
  }
}


// ============================================
// REGISTRO CON VALIDACIONES (MEJORADO)
// ============================================

if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    ocultarErrorForm('registroErrorMsg');

    const datos = {
      nombre: document.getElementById("nombre").value.trim(),
      apellido: document.getElementById("apellido").value.trim(),
      cedula: document.getElementById("cedula").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      direccion: document.getElementById("direccion").value.trim(),
      genero: document.getElementById("genero").value
    };

    // ✅ VALIDACIONES COMPLETAS
    
    const validNombre = validarNombre(datos.nombre);
    if (!validNombre.valido) {
      mostrarErrorForm(validNombre.error, 'registroErrorMsg');
      document.getElementById("nombre")?.focus();
      return;
    }
    datos.nombre = validNombre.valor;

    if (datos.apellido) {
      const validApellido = validarNombre(datos.apellido);
      if (!validApellido.valido) {
        mostrarErrorForm('El apellido ' + validApellido.error.toLowerCase(), 'registroErrorMsg');
        document.getElementById("apellido")?.focus();
        return;
      }
      datos.apellido = validApellido.valor;
    }

    const validCedula = validarCedula(datos.cedula);
    if (!validCedula.valido) {
      mostrarErrorForm(validCedula.error, 'registroErrorMsg');
      document.getElementById("cedula")?.focus();
      return;
    }
    datos.cedula = validCedula.valor;

    const validTelefono = validarTelefono(datos.telefono);
    if (!validTelefono.valido) {
      mostrarErrorForm(validTelefono.error, 'registroErrorMsg');
      document.getElementById("telefono")?.focus();
      return;
    }
    datos.telefono = validTelefono.valor;

    const validDireccion = validarDireccion(datos.direccion);
    if (!validDireccion.valido) {
      mostrarErrorForm(validDireccion.error, 'registroErrorMsg');
      document.getElementById("direccion")?.focus();
      return;
    }
    datos.direccion = validDireccion.valor;

    if (!datos.genero || !['M', 'F'].includes(datos.genero)) {
      mostrarErrorForm('Debes seleccionar un género válido (Masculino o Femenino)', 'registroErrorMsg');
      document.getElementById("genero")?.focus();
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/clientes/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.nombre,
          apellido: datos.apellido,
          cedula: datos.cedula,
          telefono: datos.telefono,
          direccion: datos.direccion,
          genero: datos.genero
        })
      });

      const data = await res.json();

      if (!data.ok) {
        mostrarErrorForm(data.mensaje || "No se pudo registrar el cliente.", 'registroErrorMsg');
        return;
      }

      const cliente = {
        id: data.id,
        nombre: datos.nombre,
        cedula: datos.cedula,
        telefono: datos.telefono,
        direccion: datos.direccion,
        genero: datos.genero
      };

      onLoginExitoso(cliente);
      alert("✅ Registro exitoso");
      
    } catch (err) {
      console.error("Error en registro:", err);
      mostrarErrorForm("Error de conexión con el servidor. Intenta nuevamente.", 'registroErrorMsg');
    }
  });
}

// ============================================
// LOGIN CON VALIDACIONES (MEJORADO)
// ============================================

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    ocultarErrorForm('loginErrorMsg');

    const cedulaEl = document.getElementById("cedulaLogin");
    const cedulaLogin = cedulaEl ? cedulaEl.value.trim() : "";

    // ✅ VALIDACIÓN DE CÉDULA
    const validacion = validarCedula(cedulaLogin);
    
    if (!validacion.valido) {
      mostrarErrorForm(validacion.error, 'loginErrorMsg');
      cedulaEl?.focus();
      return;
    }

    const cedulaLimpia = validacion.valor;

    try {
      const resultado = await loginBackend(cedulaLimpia);

      if (resultado.ok) {
        onLoginExitoso(resultado.cliente);
      } else {
        mostrarErrorForm("Cédula no encontrada. Por favor verifica o regístrate.", 'loginErrorMsg');
        cedulaEl?.focus();
      }
    } catch (err) {
      console.error("Error en login:", err);
      mostrarErrorForm("Error de conexión con el servidor. Intenta nuevamente.", 'loginErrorMsg');
    }
  });
}

// funcion LOGINbackend

async function loginBackend(cedula) {
  try {
    const res = await fetch("http://localhost:3000/api/clientes/autologin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula })
    });

    const data = await res.json();

    return data;

  } catch (error) {
    console.error("❌ Error login backend:", error);
    return { ok: false };
  }
}

// ABRIR MODAL DE AUTENTICACIÓN

function abrirModalAuth(producto) {
  if (modalAuth) {
    // ✅ LIMPIAR ERRORES ANTES DE ABRIR
    ocultarErrorForm('loginErrorMsg');
    ocultarErrorForm('registroErrorMsg');
    
    // ✅ LIMPIAR FORMULARIOS
    if (formLogin) formLogin.reset();
    if (formRegistro) formRegistro.reset();
    
    modalAuth.style.display = "flex";
    try {
      modalAuth.dataset.producto = JSON.stringify(producto);
    } catch (e) {
      modalAuth.dataset.producto = String(producto || "");
    }
  }
}

// CARRUSEL DE OFERTAS - SCROLL INFINITO REAL

async function cargarOfertas() {
  try {
    const res = await fetch(`/data/ofertas.json?cache=${Date.now()}`);
    const ofertas = await res.json();

    ofertasGlobal = ofertas;

    console.log("OFERTAS LEÍDAS:", ofertas);

    if (!Array.isArray(ofertas) || ofertas.length === 0) {
      console.warn("ofertas.json está vacío o no existe");
      return;
    }

    if (!contenedorCarrusel) {
      console.warn("Contenedor carrusel no encontrado");
      return;
    }

    const html = ofertas.map(p => `
     <div class="item" onclick="comprarProductoCarrusel(${p.id})">
        <div class="cinta">${p.badge || "Oferta"}</div>

        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">

        <div class="info-oferta">
          <h4>${p.nombre}</h4>
          <p>${p.precio}</p>
          <p>${p.descripcion || ""}</p>
        </div>
      </div>
    `).join("");

    contenedorCarrusel.innerHTML = html + html;

    let pos = 0;
    const velocidad = 0.6;

    function loop() {
      pos += velocidad;

      const mitad = contenedorCarrusel.scrollWidth / 2;
      if (pos >= mitad) pos = 0;

      contenedorCarrusel.scrollLeft = pos;
      requestAnimationFrame(loop);
    }

    loop();

  } catch (e) {
    console.error("Error cargando ofertas:", e);
  }
}

function enviarWhatsAppCarrusel(idProducto) {
  const cliente = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;

  fetch("/data/ofertas.json")
    .then(res => res.json())
    .then(async (ofertas) => {
      const producto = ofertas.find(p => p.id === idProducto);
      if (!producto) return;

      let nombreProveedor = producto.proveedorNombre || "";
      let logoProveedor = producto.proveedorLogo || "";
      if ((!nombreProveedor || !logoProveedor) && producto.proveedorId) {
        try {
          const provRes = await fetch("/data/proveedores.json");
          const provs = await provRes.json();
          const prov = provs.find(p => Number(p.id) === Number(producto.proveedorId));
          if (prov) {
            nombreProveedor = nombreProveedor || prov.nombre;
            logoProveedor = logoProveedor || prov.logo;
          }
        } catch (err) {
          console.warn("No se pudo obtener proveedor para oferta:", err);
        }
      }

      const makeAbsolute = (path) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        return `${window.location.origin}/${path}`.replace(/([^:]\/)\/+/g, "$1");
      };

      const imagenUrl = makeAbsolute(producto.imagen || "");
      const logoUrl = makeAbsolute(logoProveedor || "");

      let mensajeTexto = `Hola Soy ${cliente?.nombre || ""}, quiero comprar este producto:\n\n`;
      mensajeTexto += `*${producto.nombre}*\n`;
      if (producto.descripcion) mensajeTexto += `${producto.descripcion}\n`;
      mensajeTexto += `Precio: ${producto.precio}\n\n`;
      mensajeTexto += `Proveedor: ${nombreProveedor || "No disponible"}\n`;
      if (logoUrl) mensajeTexto += `Logo: ${logoUrl}\n`;
      if (imagenUrl) mensajeTexto += `Imagen: ${imagenUrl}\n`;
      mensajeTexto += `\nVer producto: ${window.location.origin}?producto=${encodeURIComponent(producto.nombre)}`;

      const numero = WHATSAPP_EMPRESA;
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensajeTexto)}`;
      window.open(url, "_blank");
    })
    .catch(err => console.error("Error enviarWhatsAppCarrusel:", err));
}

// INICIALIZACIÓN AL CARGAR LA PÁGINA
window.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Iniciando aplicación...");

  const local = JSON.parse(localStorage.getItem("cliente"));

  if (!local) {
    console.log("❗ No hay usuario → abrir modal");
    if (modalAuth) modalAuth.style.display = "flex";
  } else {
    console.log("✅ Usuario encontrado en localStorage:", local);
    usuarioActual = local;
    actualizarMensajeBienvenida();
    mostrarCerrarSesion();
  }

  autologinBackend();

  if (contenedorProveedores) {
    console.log("🟢 Cargando proveedores...");
    cargarProveedores();
  }

  if (contenedorCarrusel) {
    console.log("🟢 Cargando ofertas...");
    cargarOfertas();
  }

  const seccionCatalogo = document.querySelector(".catalogo");
  if (seccionCatalogo) {
    seccionCatalogo.style.display = "none";
  }

  console.log("✅ Aplicación inicializada correctamente");
});

// Autologin backend
async function autologinBackend() {
  const local = JSON.parse(localStorage.getItem("cliente"));

  if (!local || !local.cedula) {
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/clientes/autologin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula: local.cedula })
    });

    const data = await res.json();

    if (data.ok) {
      usuarioActual = data.cliente;
      localStorage.setItem("cliente", JSON.stringify(usuarioActual));
      actualizarMensajeBienvenida();
      console.log("✅ Autologin backend correcto");
    }

  } catch (error) {
    console.error("❌ Error autologin backend:", error);
  }
}

// ============================================
// EVENT LISTENERS ADICIONALES
// ============================================

// Cerrar modal con la X
document.addEventListener('DOMContentLoaded', () => {
  const btnCerrarModal = document.getElementById('cerrarModal');
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModalAuth);
  }
  
  // Cerrar modal al hacer click fuera
  if (modalAuth) {
    modalAuth.addEventListener('click', (e) => {
      if (e.target === modalAuth) {
        cerrarModalAuth();
      }
    });
  }
  
  // ✅ LIMPIAR ERRORES EN TIEMPO REAL AL ESCRIBIR
  
  // Login - limpiar SOLO el error de login al escribir en cédula
  const cedulaLoginInput = document.getElementById('cedulaLogin');
  if (cedulaLoginInput) {
    cedulaLoginInput.addEventListener('input', () => {
      // Solo limpiar si han pasado 5 segundos desde que se mostró
      if (!window.errorBlocked_loginErrorMsg) {
        console.log('🧹 Usuario escribiendo en LOGIN - limpiando error de login');
        ocultarErrorForm('loginErrorMsg');
      } else {
        console.log('⏸️ Error de login bloqueado - esperando 5 segundos');
      }
    });
  }
  
  // Registro - limpiar SOLO el error de registro al escribir
  const camposRegistro = ['nombre', 'apellido', 'cedula', 'telefono', 'direccion', 'genero'];
  camposRegistro.forEach(campo => {
    const input = document.getElementById(campo);
    if (input) {
      input.addEventListener('input', () => {
        if (!window.errorBlocked_registroErrorMsg) {
          console.log('🧹 Usuario escribiendo en REGISTRO - limpiando error de registro');
          ocultarErrorForm('registroErrorMsg');
        } else {
          console.log('⏸️ Error de registro bloqueado - esperando 5 segundos');
        }
      });
      input.addEventListener('change', () => {
        if (!window.errorBlocked_registroErrorMsg) {
          ocultarErrorForm('registroErrorMsg');
        }
      });
    }
  });
});



// ============================
// MENSAJE DE TEMPORADA
/// ============================
// MENSAJE DE TEMPORADA
// ============================

// Activa o desactiva el mensaje
const mensajeTemporadaActivo = true;  // true = mostrar, false = ocultar

// Texto de temporada actual
const textoDeTemporada = "¡Feliz Navidad y próspero Año Nuevo 2026!";

// Si está activo, lo mostramos
if (mensajeTemporadaActivo) {
    const textoEl = document.getElementById("textoTemporada");
    const contenedor = document.getElementById("mensajeTemporada");

    if (textoEl && contenedor) {
        textoEl.textContent = textoDeTemporada;
        contenedor.classList.add("active");  // Activar efecto CSS
    }
}






// ============================
// MODAL DETALLE PRODUCTO
// ============================


function abrirModalProducto(imagen, descripcion) {
  modalProductoImg.src = imagen;
  modalProductoDesc.textContent = descripcion || "Descripción no disponible";
  modalProducto.classList.add("active");
}

cerrarModalProducto.addEventListener("click", () => {
  modalProducto.classList.remove("active");
});

modalProducto.addEventListener("click", (e) => {
  if (e.target === modalProducto) {
    modalProducto.classList.remove("active");
  }
});



/* funcion mensaje resgistro   ( revisado */
function mostrarRegistroModal(callbackLogin) {
  const modal = document.getElementById("registroModal");
  if (!modal) return; // ← evita errores silenciosos

  const closeBtn = document.getElementById("closeRegistroModal");
  const btnLogin = document.getElementById("btnIrLogin");

  modal.style.display = "block";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  btnLogin.onclick = () => {
    modal.style.display = "none";
    if (callbackLogin) callbackLogin();
  };

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}




function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}


function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();

  const existente = carrito.find(p => p.id === producto.id);
  if (!existente) {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      proveedor: producto.proveedorNombre,
      logo: producto.proveedorLogo,
      url: `/producto.html?id=${producto.id}`
    });
  }

  guardarCarrito(carrito);
  renderizarCarrito();
  abrirCarrito();
}



function renderizarCarrito() {
  const contenedor = document.getElementById("carritoItems");
  if (!contenedor) return;

  const carrito = obtenerCarrito();
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  carrito.forEach(p => {
    contenedor.innerHTML += `
      <div class="carrito-item">
        <strong>${p.nombre}</strong>
        <span>${p.precio}</span>
        <button onclick="eliminarDelCarrito(${p.id})">🗑</button>
      </div>
    `;
  });
}



function eliminarDelCarrito(id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito(carrito);
  renderizarCarrito();
}



function abrirCarrito() {
  document.getElementById("carritoPanel").classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carritoPanel").classList.remove("activo");
}




function finalizarCompra() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  carrito.forEach((producto, index) => {
    setTimeout(() => {
      enviarWhatsApp(producto);
    }, index * 800);
  });
}
