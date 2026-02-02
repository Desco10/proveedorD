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


async function cargarProveedoresEnCache() {
  try {
    const res = await fetch("/data/proveedores.json");
    const proveedores = await res.json();
    localStorage.setItem("proveedores_cache", JSON.stringify(proveedores));
  } catch (e) {
    console.warn("No se pudieron cargar proveedores");
  }
}

cargarProveedoresEnCache();



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

const sonidoAgregarCarrito = new Audio("/sounds/add-cart.mp3");
sonidoAgregarCarrito.volume = 0.35;
/*sonido compras*/

// ==========================
// SONIDO AL AGREGAR AL CARRITO
// ==========================
let sonidoCarrito;

function reproducirSonidoCarrito() {
  if (!sonidoCarrito) {
    sonidoCarrito = new Audio('public/sounds/bell1-445873.mp3');
    sonidoCarrito.volume = 0.3;
  }

  sonidoCarrito.currentTime = 0;
  sonidoCarrito.play().catch(() => {});
}

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

// ================================
// 🛒 COMPRAR PRODUCTO (FINAL)
// ================================

function comprarProducto(idProducto) {
  requireLogin(() => {
    try {
      const productoBase = productos.find(p => p.id === idProducto);
      if (!productoBase) {
        console.error("Producto no encontrado:", idProducto);
        return;
      }

      const producto = normalizarProductoParaCompra(productoBase);

      decidirCompra(producto);

      console.log("🛒 Acción de compra ejecutada:", producto.nombre);

    } catch (error) {
      console.error("Error al comprar producto:", error);
    }
  });
}



 



// COMPRAR DESDE CARRUSEL
function comprarProductoCarrusel(idProducto) {
  requireLogin(() => {
    try {
      const productoBase = ofertasGlobal.find(p => p.id === idProducto);
      if (!productoBase) {
        console.error("Producto no encontrado en ofertas:", idProducto);
        return;
      }

      const producto = normalizarProductoParaCompra(productoBase);

      decidirCompra(producto);

      console.log("🛒 Acción de compra desde carrusel:", producto.nombre);

    } catch (error) {
      console.error("Error al comprar desde carrusel:", error);
    }
  });
}




function normalizarProductoParaCompra(producto) {
  let proveedorNombre = producto.proveedorNombre || "Proveedor";
  let proveedorId = producto.proveedorId || null;

  // Resolver proveedor desde JSON si solo viene el ID
  if (!producto.proveedorNombre && producto.proveedorId) {
    try {
      const proveedores = JSON.parse(localStorage.getItem("proveedores_cache")) || [];
      const prov = proveedores.find(p => Number(p.id) === Number(producto.proveedorId));
      if (prov) {
        proveedorNombre = prov.nombre;
      }
    } catch (e) {
      console.warn("No se pudo resolver proveedor:", e);
    }
  }

  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    descripcion: producto.descripcion || "",
    imagen: producto.imagen,
    proveedorId,
    proveedorNombre,
    whatsapp: producto.whatsapp || null
  };
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


// ENVIAR WHATSAPP (CATÁLOGO) - VERSIÓN ENTERPRISE AJUSTADA

// ENVIAR WHATSAPP (CATÁLOGO) - VERSIÓN FINAL SIN PRESENTACION

async function enviarWhatsApp(producto, cliente = null, proveedor = null) {
  try {

    // ===============================
    // 👤 CLIENTE
    // ===============================
    if (!cliente) {
      cliente = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;
    }

    const nombreCliente = cliente?.nombre 
      ? `*${cliente.nombre.toUpperCase()}*`
      : "*CLIENTE*";

    // ===============================
    // 🏪 PROVEEDOR
    // ===============================
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

    // ===============================
    // 🌐 URLS ABSOLUTAS
    // ===============================
    const makeAbsolute = (path) => {
      if (!path) return "";
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      return `${window.location.origin}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const logoProveedorUrl = makeAbsolute(logoProveedor);
    const urlProducto = `${window.location.origin}/producto.html?id=${encodeURIComponent(producto.id)}`;

    // ===============================
    // 📦 PRODUCTO
    // ===============================
    const nombreProducto = `🔥 *${producto.nombre.toUpperCase()}*`;
    const descripcion = producto.descripcion || "";

    // 🔑 AQUÍ QUEDA CLARO PRECIO + CANTIDAD
    const precioTexto = producto.precio || "";
    const precio = `*PRECIO:* *${precioTexto.toUpperCase()}*`;

    // ===============================
    // 🧠 CONTROL DE CONVERSACIÓN
    // ===============================
    const conversacionIniciada = sessionStorage.getItem("wa_iniciado");
    let mensaje = "";

    if (!conversacionIniciada) {
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
      mensaje =
`Y también quiero comprar este producto:

${nombreProducto}
${descripcion}
${precio}

🔗 Ver producto:
${urlProducto}
`;
    }

    // ===============================
    // 📲 ENVÍO WHATSAPP
    // ===============================
    const numero = proveedor?.whatsapp || producto.whatsapp || WHATSAPP_EMPRESA;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    // ===============================
    // 🛒 REGISTRO EN CARRITO LÓGICO
    // ===============================
    if (typeof agregarProductoAlCarrito === "function") {
      agregarProductoAlCarrito({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio, // ← con "(SOBRE X10)"
        proveedorId: producto.proveedorId,
        imagen: producto.imagen || "",
      });
    }

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
     mensajeTexto += `🔥 *${producto.nombre.toUpperCase()}*\n`;

      if (producto.descripcion) mensajeTexto += `${producto.descripcion}\n`;
      const precioFormateado = producto.precio?.toUpperCase?.() || producto.precio;

      mensajeTexto += `*PRECIO:* ${precioFormateado}\n\n`;

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
const textoDeTemporada = "¡2026 - la GLORIA Postrera de esta casa sera Mayor que la Primera  - Hageo 2-9 !";

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



/*carritocompras*/


// ================================
// 🛒 CARRITO – MODELO CENTRAL (FINAL)
// ================================

const CARRITO_KEY = "desco_carrito";
const DECISION_COMPRA_KEY = "desco_decision_compra";

/**
 * Obtiene el carrito desde localStorage
 */
function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || {
      items: [],
      updatedAt: Date.now()
    };
  } catch {
    return { items: [], updatedAt: Date.now() };
  }
}

/**
 * Guarda el carrito y actualiza timestamp
 */
function guardarCarrito(carrito) {
  carrito.updatedAt = Date.now();
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

/**
 * Limpia carrito + reinicia conversación WhatsApp
 */
function limpiarCarrito() {
  localStorage.removeItem(CARRITO_KEY);
  sessionStorage.removeItem("wa_iniciado"); // 🔑 control de conversación
}

/**
 * Agrega producto al carrito (intención)*/
/* =====================================================
   🛒 AGREGA PRODUCTO AL CARRITO (LOCAL + BACKEND)
   No rompe nada | Flujo profesional
===================================================== */
async function agregarProductoAlCarrito(producto) {
  try {
    // ============================
    // 1️⃣ CARRITO LOCAL (FRONTEND)
    // ============================
    const carrito = obtenerCarrito();
    const proveedorNombre = obtenerNombreProveedor(producto.proveedorId);

    const existente = carrito.items.find(
      p => p.id === producto.id && p.proveedorId === producto.proveedorId
    );

    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        proveedorId: producto.proveedorId,
        proveedorNombre,
        cantidad: 1
      });
    }

    guardarCarrito(carrito);
    reproducirSonidoCarrito();
    renderCarrito();

    // ============================
    // 2️⃣ CARRITO REAL (BACKEND)
    // ============================
    let carritoId = localStorage.getItem("carrito_backend_id");

    // SOLO crear carrito si NO existe ninguno
    if (!carritoId) {
      const res = await fetch("/api/carritos/obtener-o-crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: localStorage.getItem("cliente_id") || 1,
          canal_envio: "web"
        })
      });

      const data = await res.json();
      carritoId = data.carrito.id;
      localStorage.setItem("carrito_backend_id", carritoId);
    }

    // ============================
    // 3️⃣ INSERTAR PRODUCTO REAL
    // ============================
    await fetch("/api/carritos/agregar-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carrito_id: carritoId,
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        proveedor_id: producto.proveedorId
      })
    });

    // ============================
    // 4️⃣ MARCAR ACTIVIDAD (NO reactiva abandonados)
    // ============================
    await fetch("/api/carritos/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrito_id: carritoId })
    });

  } catch (error) {
    console.error("Error agregando producto al carrito:", error);
  }
}





/**
 * Finaliza la compra y envía resumen por WhatsApp
 */
async function finalizarCompra() {
  const carrito = obtenerCarrito();

  if (!carrito.items.length) {
    alert("Tu carrito está vacío.");
    return;
  }

  const proveedores = agruparPorProveedor(carrito.items);
  let mensaje = `🧾 *RESUMEN FINAL DE COMPRA*\n\n`;
  let totalGeneral = 0;

  proveedores.forEach(prov => {
    mensaje += `🏪 *${prov.proveedorNombre}*\n`;

    prov.productos.forEach(p => {
  const presentacion = p.precio?.includes("(")
    ? p.precio.split("(")[1].replace(")", "")
    : "";

  const nombreConPres = presentacion
    ? `${p.nombre} (${presentacion})`
    : p.nombre;

  mensaje += `- ${nombreConPres} x${p.cantidad} → ${formatearPrecio(p.subtotalProducto)}\n`;
});


    mensaje += `Subtotal: ${formatearPrecio(prov.subtotal)}\n\n`;
    totalGeneral += prov.subtotal;
  });

  mensaje += `🧮 *TOTAL GENERAL: ${formatearPrecio(totalGeneral)}*\n\n`;
  mensaje += `✅ Quedo atento para confirmar disponibilidad y envío.`;

  // 📤 Abrir WhatsApp
  window.open(
    `https://wa.me/${WHATSAPP_EMPRESA}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );

  // 🔗 MARCAR CARRITO COMO ENVIADO EN BACKEND (si existe)
  const carritoId = localStorage.getItem("carrito_backend_id");
  if (carritoId) {
    fetch("/api/carrito/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrito_id: carritoId })
    }).catch(() => {});
  }

  // 🔄 SYNC REAL DEL CARRITO PARA DASHBOARD
  try {
    const carritoBackendId = localStorage.getItem("carrito_backend_id");

await fetch("/api/carritos/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    cliente_id: localStorage.getItem("cliente_id") || 1,
    items: proveedores.flatMap(p => p.productos),
    canal_envio: "whatsapp",
    carrito_origen_id: carritoBackendId ? Number(carritoBackendId) : null
  })
});

  } catch (e) {
    console.warn("No se pudo sincronizar el carrito con el backend");
  }

  // ♻️ RESET TOTAL DEL CICLO
  limpiarCarrito();
  localStorage.removeItem("carrito_backend_id");
  renderCarrito();

  // cerrar panel visualmente
  const panel = document.getElementById("carritoPanel");
  if (panel) panel.classList.add("oculto");
}





/**
 * Detecta carrito pendiente (recuperación)
 */
function restaurarCarritoSiExiste() {
  const carrito = obtenerCarrito();
  if (carrito.items.length > 0) {
    console.log("🟡 Carrito pendiente detectado:", carrito.items);
  }
}


// ================================
// ================================
// 🛒 UI CARRITO – RENDER PROFESIONAL
// ================================

function toggleCarrito() {
  const panel = document.getElementById("carritoPanel");

  panel.classList.toggle("oculto");

  // Si se acaba de abrir, habilitamos el drag
  if (!panel.classList.contains("oculto")) {
    setTimeout(() => {
      habilitarDragCarrito();
    }, 50);
  }
}


document.addEventListener("click", function (e) {
  const panel = document.getElementById("carritoPanel");
  const icono = document.getElementById("carritoIcono");

  // Si el carrito está cerrado, no hacemos nada
  if (!panel || panel.classList.contains("oculto")) return;

  // Si el click fue dentro del carrito o en el ícono, no cerrar
  if (panel.contains(e.target) || icono.contains(e.target)) return;

  // Si hizo click fuera → cerrar carrito
  panel.classList.add("oculto");

  // Opcional: resetear posición si estaba movido
  panel.style.transform = "";
});

function eliminarProductoDelCarrito(idProducto, proveedorId) {
  const carrito = obtenerCarrito();

  carrito.items = carrito.items.filter(
    p => !(p.id === idProducto && p.proveedorId === proveedorId)
  );

  guardarCarrito(carrito);
  renderCarrito();
}


function cambiarCantidad(idProducto, proveedorId, cambio) {
  const carrito = obtenerCarrito();

  const item = carrito.items.find(
    p => p.id === idProducto && p.proveedorId === proveedorId
  );

  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    carrito.items = carrito.items.filter(
      p => !(p.id === idProducto && p.proveedorId === proveedorId)
    );
  }

  guardarCarrito(carrito);
  renderCarrito();
}


function renderCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById("carritoItems");
  const badge = document.getElementById("carritoBadge");

  if (!contenedor || !badge) return;

  contenedor.innerHTML = "";

  badge.textContent = calcularCantidadTotal(carrito.items);

  if (!carrito.items.length) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  const proveedores = agruparPorProveedor(carrito.items);
  let totalGeneral = 0;

  proveedores.forEach(prov => {
    totalGeneral += prov.subtotal;

    const bloqueProveedor = document.createElement("div");
    bloqueProveedor.className = "bloque-proveedor";

    bloqueProveedor.innerHTML = `
      <h4 class="proveedor-titulo">${prov.proveedorNombre}</h4>
    `;

    prov.productos.forEach(p => {
      const item = document.createElement("div");
      item.className = "carrito-item";

      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <div class="carrito-info">
          <strong>${p.nombre}</strong><br>
          <small>
            ${formatearPrecio(p.precioUnitario)} × ${p.cantidad} =
            <strong>${formatearPrecio(p.subtotalProducto)}</strong>
          </small>

          <div class="carrito-cantidad">
            <button onclick="cambiarCantidad(${p.id}, ${p.proveedorId}, -1)">−</button>
            <span>${p.cantidad}</span>
            <button onclick="cambiarCantidad(${p.id}, ${p.proveedorId}, 1)">+</button>
          </div>
        </div>

        <button class="btn-eliminar"
          onclick="eliminarProductoDelCarrito(${p.id}, ${p.proveedorId})">✖</button>
      `;

      bloqueProveedor.appendChild(item);
    });

    const subtotalDiv = document.createElement("div");
    subtotalDiv.className = "subtotal-proveedor";
    subtotalDiv.innerHTML = `
      Subtotal ${prov.proveedorNombre}:
      <strong>${formatearPrecio(prov.subtotal)}</strong>
    `;

    bloqueProveedor.appendChild(subtotalDiv);
    contenedor.appendChild(bloqueProveedor);
  });

  const totalDiv = document.createElement("div");
  totalDiv.className = "carrito-total-general";
  totalDiv.innerHTML = `
    <hr>
    <h3>Total general: ${formatearPrecio(totalGeneral)}</h3>
  `;
  contenedor.appendChild(totalDiv);
}




// Hook automático


document.addEventListener("DOMContentLoaded", renderCarrito);



async function cargarProveedoresEnCache() {
  try {
    const res = await fetch("/data/proveedores.json");
    const proveedores = await res.json();
    localStorage.setItem("proveedores_cache", JSON.stringify(proveedores));
  } catch (e) {
    console.warn("No se pudieron cargar proveedores");
  }
}

cargarProveedoresEnCache();


function obtenerNombreProveedor(proveedorId) {
  const proveedores = JSON.parse(localStorage.getItem("proveedores_cache")) || [];
  const proveedor = proveedores.find(p => Number(p.id) === Number(proveedorId));
  return proveedor ? proveedor.nombre : "Proveedor";
}



function agruparPorProveedor(items) {
  const proveedores = {};

  items.forEach(p => {
    if (!proveedores[p.proveedorId]) {
      proveedores[p.proveedorId] = {
        proveedorId: p.proveedorId,
        proveedorNombre: p.proveedorNombre,
        productos: [],
        subtotal: 0
      };
    }

    const precioUnitario = extraerPrecioNumero(p.precio);
    const subtotalProducto = precioUnitario * p.cantidad;

    proveedores[p.proveedorId].productos.push({
      ...p,
      precioUnitario,
      subtotalProducto
    });

    proveedores[p.proveedorId].subtotal += subtotalProducto;
  });

  return Object.values(proveedores);
}




function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

function extraerPrecioNumero(precioTexto) {
  if (!precioTexto) return 0;

  return Number(
    precioTexto
      .split("(")[0]        // "$13.200 "
      .replace(/[^0-9]/g, "") // "13200"
  );
}

function calcularTotalGeneral(proveedores) {
  return proveedores.reduce((total, prov) => {
    return total + prov.subtotal;
  }, 0);
}

function calcularCantidadTotal(items) {
  return items.reduce((total, p) => total + p.cantidad, 0);
}

//*redireccion compra decicion*/

function decidirCompra(producto) {
  const decisionGuardada = sessionStorage.getItem(DECISION_COMPRA_KEY);

  // ✅ Si ya decidió antes, ejecuta sin preguntar
  if (decisionGuardada === "whatsapp") {
    enviarWhatsApp(producto);
    return;
  }

  if (decisionGuardada === "carrito") {
    agregarProductoAlCarrito(producto);
    return;
  }

  // 🟡 No hay decisión → mostrar modal
  const overlay = document.createElement("div");
  overlay.className = "compra-overlay";

  const modal = document.createElement("div");
  modal.className = "compra-modal";

  modal.innerHTML = `
    <h3>¿Cómo deseas comprar?</h3>
    <p>${producto.nombre}</p>

    <div class="compra-botones">
      <button class="btn-compra-wsp">
        Comprar por WhatsApp
      </button>

      <button class="btn-compra-carrito">
        Agregar al carrito
      </button>
    </div>

    <button class="btn-compra-cancelar">Cancelar</button>
    <p class="compra-micro">
  Puedes cambiar esto cuando quieras
</p>

  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // WhatsApp
  modal.querySelector(".btn-compra-wsp").onclick = () => {
    sessionStorage.setItem(DECISION_COMPRA_KEY, "whatsapp");
    enviarWhatsApp(producto);
    cerrar();
  };

  // Carrito
  modal.querySelector(".btn-compra-carrito").onclick = () => {
    sessionStorage.setItem(DECISION_COMPRA_KEY, "carrito");
    agregarProductoAlCarrito(producto);
    cerrar();
  };

  modal.querySelector(".btn-compra-cancelar").onclick = cerrar;

  overlay.onclick = e => {
    if (e.target === overlay) cerrar();
  };

  function cerrar() {
    overlay.remove();
  }
}



function limpiarCarrito() {
  localStorage.removeItem(CARRITO_KEY);
  sessionStorage.removeItem("wa_iniciado");
  sessionStorage.removeItem(DECISION_COMPRA_KEY); // 🔑 RESET DECISIÓN
}



function habilitarDragCarrito() {
  const carrito = document.getElementById("carritoPanel");
  const icono = document.getElementById("carritoIcono");

  if (!carrito || !icono) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  carrito.addEventListener("mousedown", iniciarDrag);

  function iniciarDrag(e) {
    // Evitar conflicto con botones
    if (e.target.tagName === "BUTTON") return;

    isDragging = true;
    carrito.classList.add("dragging");

    offsetX = e.clientX - carrito.offsetLeft;
    offsetY = e.clientY - carrito.offsetTop;

    document.addEventListener("mousemove", moverCarrito);
    document.addEventListener("mouseup", soltarCarrito);
  }

  function moverCarrito(e) {
    if (!isDragging) return;

    carrito.style.left = `${e.clientX - offsetX}px`;
    carrito.style.top  = `${e.clientY - offsetY}px`;
    carrito.style.right = "auto";
  }

  function soltarCarrito() {
    if (!isDragging) return;

    isDragging = false;
    carrito.classList.remove("dragging");

    document.removeEventListener("mousemove", moverCarrito);
    document.removeEventListener("mouseup", soltarCarrito);

    verificarCierrePorIcono();
  }

  function verificarCierrePorIcono() {
    const c = carrito.getBoundingClientRect();
    const i = icono.getBoundingClientRect();

    const distancia = Math.hypot(
      c.left + c.width / 2 - (i.left + i.width / 2),
      c.top + c.height / 2 - (i.top + i.height / 2)
    );

    if (distancia < 90) {
      cerrarCarritoConSnap();
    }
  }

  function cerrarCarritoConSnap() {
    carrito.classList.add("oculto");

    // restaurar posición
    carrito.style.left = "";
    carrito.style.top = "";
    carrito.style.right = "20px";
  }
}

async function obtenerOCrearCarritoBackend() {
  let carritoId = localStorage.getItem("carrito_backend_id");
  if (carritoId) return carritoId;

  let clienteId = localStorage.getItem("cliente_id");

// fallback seguro (cliente invitado)
if (!clienteId) {
  clienteId = "1"; // cliente genérico invitado (EXISTE en DB)
  localStorage.setItem("cliente_id", clienteId);
}

  try {
    const res = await fetch("/api/carritos/obtener", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id: clienteId })
    });

    const data = await res.json();

    if (data.ok && data.carrito?.id) {
      localStorage.setItem("carrito_backend_id", data.carrito.id);
      return data.carrito.id;
    }
  } catch (e) {
    console.warn("Backend carrito no disponible");
  }

  return null;
}
