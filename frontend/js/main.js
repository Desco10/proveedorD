
// main.js - Versión corregida y unificada (DescoApp)

// CONFIGURACIÓN GLOBAL

const contenedorProveedores = document.getElementById("listaProveedores");
const contenedorProductos = document.getElementById("productos");
const contenedorCarrusel = document.getElementById("carrusel");
const modalAuth = document.getElementById("authModal");
const formRegistro = document.getElementById("formRegistro");
const formLogin = document.getElementById("formLogin");
const mensajeBienvenida = document.getElementById("mensajeBienvenida");
const paginacion = document.querySelector(".paginacion");
const btnCerrar = document.getElementById("btnCerrarSesion");



let ofertasGlobal = [];

if (btnCerrar) {
  btnCerrar.addEventListener("click", cerrarSesion);
}

// Sesssion config
const LOGIN_EXPIRATION_HOURS = 24;

function isLoginVigente() {
  const cliente = localStorage.getItem("cliente");
  const loginTime = localStorage.getItem("loginTime");
  if (!cliente || !loginTime) return false;
  const diff = (Date.now() - Number(loginTime)) / (1000 * 60 * 60);
  return diff < LOGIN_EXPIRATION_HOURS;
}

// Ejecuta callback si el usuario está logueado. Si no, abre modal y guarda la acción.
function requireLogin(callback) {
  const cliente = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;
  if (cliente) {
    // actualizar usuarioActual por si acaso
    usuarioActual = cliente;
    try { return callback(); } catch (err) { console.error("requireLogin callback error:", err); }
    return;
  }

  // Guardar callback para ejecutarlo después del login
  window.afterLogin = callback;

  // abrir modal
  if (modalAuth) modalAuth.style.display = "flex";
}

// Variables globales
let productos = [];
let paginaActual = 1;
const productosPorPagina = 12;
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
      <div class="card-proveedor" onclick="abrirProveedor('${p.id}', '${p.nombre}')">
        <img src="${p.logo}" alt="${p.nombre}">
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
            <h2>Catálogo de Distribuidora ${nombre}</h2>
            <div class="buscador-catalogo"><input id="buscarCatalogo" placeholder="Buscar en el catálogo de ${nombre}..." /></div>
          </div>
        </div>
        ${bannerHtml}
         ${detallesHtml}
      `;

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
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>${prod.precio}</p>

      <button class="btn-wsp" onclick="comprarProducto(${prod.id})">
        <i class="fab fa-whatsapp"></i> COMPRAR
      </button>
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
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <h3>${prod.nombre}</h3>
        <p>${prod.precio}</p>

        <button class="btn-wsp" onclick="comprarProducto(${prod.id})">
          <i class="fab fa-whatsapp"></i> COMPRAR
         </button>

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

      enviarWhatsApp(producto); // <--- SOLO envío el producto

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

    enviarWhatsApp(producto); // usa la misma función normal
  });
}





// login exitoso

function cerrarModalAuth() {
  try {
    if (modalAuth) modalAuth.style.display = "none";
  } catch (e) {}
}

function onLoginExitoso(cliente) {
  // Guardar usuario y marca de tiempo
  localStorage.setItem("cliente", JSON.stringify(cliente));
  localStorage.setItem("loginTime", Date.now());
  usuarioActual = cliente;

  // Cerrar modal
  cerrarModalAuth();

  // UI bienvenida
  actualizarMensajeBienvenida();

  // Mostrar botón cerrar sesión
  mostrarCerrarSesion();

  // Ejecutar acción pendiente
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

// --- Botón cerrar sesión ---
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

function mostrarCerrarSesion() {
  const btn = document.getElementById("btnCerrarSesion");
  if (btn) {
    btn.style.display = "inline-flex"; // compacto y consistente
    btn.style.visibility = "visible";
    btn.style.opacity = "1";
    console.log("Botón mostrado");
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



// ---------------------------
// ENVIAR WHATSAPP (CATÁLOGO) - VERSIÓN PROFESIONAL FINAL
// ---------------------------
async function enviarWhatsApp(producto, cliente = null, proveedor = null) {
  try {

    // 1. Obtener datos del cliente si no llegan
    if (!cliente) {
      cliente = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;
    }

    // Nombre del cliente en MAYÚSCULAS y NEGRILLA
    const nombreCliente = cliente?.nombre 
      ? `*${cliente.nombre.toUpperCase()}*`
      : "*CLIENTE*";

    // 2. Buscar proveedor si no llega
    if (!proveedor && producto.proveedorId) {
      try {
        const resProv = await fetch("/data/proveedores.json");
        const provs = await resProv.json();
        proveedor = provs.find(p => Number(p.id) === Number(producto.proveedorId)) || null;
      } catch (err) {
        console.warn("No se pudo leer proveedores.json:", err);
      }
    }

    // Nombre proveedor en negrilla + mayúsculas
    const nombreProveedor = proveedor?.nombre
      ? `*${proveedor.nombre.toUpperCase()}*`
      : producto.proveedorNombre
        ? `*${producto.proveedorNombre.toUpperCase()}*`
        : "*PROVEEDOR*";

    // Logos
    const logoProveedor = proveedor?.logo || producto.proveedorLogo || "";
    const makeAbsolute = (path) => {
      if (!path) return "";
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      return `${window.location.origin}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    };
    const logoProveedorUrl = makeAbsolute(logoProveedor);

    // Link profesional del producto
    const urlProducto = `${window.location.origin}/producto.html?id=${encodeURIComponent(producto.id)}`;

    // 3. ESTILOS WHATSAPP
    const nombreProducto = `🔥 *${producto.nombre.toUpperCase()}*`;
    const precio = `*PRECIO:* *${producto.precio.toUpperCase ? producto.precio.toUpperCase() : producto.precio}*`;

    const descripcion = producto.descripcion
      ? producto.descripcion
      : "";

    // 4. MENSAJE PROFESIONAL
    let mensaje = 
`Hola, soy ${nombreCliente} y quiero comprar este producto:

${nombreProducto}
${descripcion}
${precio}

*PROVEEDOR:* ${nombreProveedor}
${logoProveedorUrl ? `Logo: ${logoProveedorUrl}` : ""}

🔗 Ver producto:
${urlProducto}
`;

    // 5. Número destino
    const numero = proveedor?.whatsapp || producto.whatsapp || "573143416441";

    // 6. Enviar
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

  } catch (error) {
    console.error("Error al enviar WhatsApp:", error);
  }
}


// ============================
// LOGIN Y REGISTRO detectar genero
function detectarGenero(nombre) {
  if (!nombre) return "bienvenido";

  // Normalizar el nombre (quitar acentos y espacios)
  const limpio = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // quita acentos
    .trim()
    .toLowerCase();

  // Si termina en "a" → femenina
  if (limpio.endsWith("a")) {
    return "bienvenida";
  }

  // Si termina en "o" → masculino
  if (limpio.endsWith("o")) {
    return "bienvenido";
  }

  // Cualquier otro caso → neutro (masculino por defecto)
  return "bienvenido";
}

function actualizarMensajeBienvenida() {
  if (!mensajeBienvenida) return;
  if (!usuarioActual) {
    // intentar recuperar del storage
    usuarioActual = isLoginVigente() ? JSON.parse(localStorage.getItem("cliente")) : null;
  }
  if (!usuarioActual) {
    mensajeBienvenida.innerHTML = "";
    return;
  }

  const nombre = (usuarioActual.nombre || "").toUpperCase();
  const genero = usuarioActual.genero === "F" ? "Bienvenida" : "Bienvenido";

  mensajeBienvenida.innerHTML = `
    ¡${genero}, <b>${nombre}</b>!
  `;
}

// CERRAR SESIÓN (reemplaza la versión anterior)
function cerrarSesion() {
  try {
    // Borrar todas las claves relacionadas con sesión que hemos usado
    localStorage.removeItem("cliente");
    localStorage.removeItem("usuario");
    localStorage.removeItem("loginTime");
    // Opcional: limpiar producto pendiente
    sessionStorage.removeItem("productoPendiente");

    // Limpiar variable en memoria
    usuarioActual = null;

    // Ocultar UI de sesión
    actualizarMensajeBienvenida(); // dejar mensaje en blanco si usa usuarioActual
    ocultarCerrarSesion();

    console.log("✅ Sesión cerrada: localStorage limpiado");

    // Si quieres forzar recarga para estado "limpio" descomenta la siguiente línea:
    // location.reload();
  } catch (err) {
    console.error("Error en cerrarSesion:", err);
  }
}



// REGISTRO

if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById("nombre").value.trim(),
      apellido: document.getElementById("apellido").value.trim(),
      cedula: document.getElementById("cedula").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      direccion: document.getElementById("direccion").value.trim(),
      genero: document.getElementById("genero").value
    };

    // Validaciones simples
    if (!datos.nombre || !datos.cedula || !datos.genero) {
      alert("Nombre, cédula y género son obligatorios.");
      return;
    }

    try {
      // ✅ Enviar al backend (sin romper tu API actual)
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
        alert("No se pudo registrar el cliente.");
        return;
      }

      // ✅ Usuario local (igual a tu estructura)
      const cliente = {
        id: data.id,
        nombre: datos.nombre,
        cedula: datos.cedula,
        telefono: datos.telefono,
        direccion: datos.direccion,
        genero: datos.genero
      };

      // Llamar al handler central de login exitoso (esto también ejecutará la acción pendiente)
      onLoginExitoso(cliente);

      alert("Registro exitoso");
    } catch (err) {
      console.error("Error en registro:", err);
      alert("Error al registrar cliente.");
    }
  });
}

// LOGIN

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cedulaLogin = document.getElementById("cedulaLogin").value.trim();

    if (!cedulaLogin) {
      alert("Debes ingresar una cédula.");
      return;
    }

    const resultado = await loginBackend(cedulaLogin);

    if (resultado.ok) {
      // Usar handler central
      onLoginExitoso(resultado.cliente);
    } else {
      alert("Cédula no encontrada.");
    }
  });
}


// funcion  LOGINbackebd

async function loginBackend(cedula) {
  try {
    const res = await fetch("http://localhost:3000/api/clientes/autologin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula })
    });

    const data = await res.json();

    return data; // { ok:true, cliente:{...} }

  } catch (error) {
    console.error("❌ Error login backend:", error);
    return { ok: false };
  }
}




// ABRIR MODAL DE AUTENTICACIÓN

function abrirModalAuth(producto) {
  if (modalAuth) {
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

    ofertasGlobal = ofertas; // <--- GUARDAMOS EL ARRAY EN GLOBAL

    console.log("OFERTAS LEÍDAS:", ofertas);

    if (!Array.isArray(ofertas) || ofertas.length === 0) {
      console.warn("ofertas.json está vacío o no existe");
      return;
    }

    if (!contenedorCarrusel) {
      console.warn("Contenedor carrusel no encontrado");
      return;
    }

    // Render completo
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

    // Doble listado para scroll infinito
    contenedorCarrusel.innerHTML = html + html;

    // Scroll continuo
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

      // buscar proveedor por proveedorId si existe
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

      const numero = "573143416441";
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensajeTexto)}`;
      window.open(url, "_blank");
    })
    .catch(err => console.error("Error enviarWhatsAppCarrusel:", err));
}





// INICIALIZACIÓN AL CARGAR LA PÁGINA
window.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Iniciando aplicación...");

  // 1. Revisar usuario local
  const local = JSON.parse(localStorage.getItem("cliente"));

  if (!local) {
    console.log("❗ No hay usuario → abrir modal");
    if (modalAuth) modalAuth.style.display = "flex";
  } else {
    console.log("✅ Usuario encontrado en localStorage:", local);
    usuarioActual = local;

    // Mostrar bienvenida
    actualizarMensajeBienvenida();
  }

  // 2. Validar en backend (autologin)
  autologinBackend();

  // 3. Cargar proveedores
  if (contenedorProveedores) {
    console.log("🟢 Cargando proveedores...");
    cargarProveedores();
  }

  // 4. Cargar ofertas
  if (contenedorCarrusel) {
    console.log("🟢 Cargando ofertas...");
    cargarOfertas();
  }

  // 5. Ocultar catálogo al inicio
  const seccionCatalogo = document.querySelector(".catalogo");
  if (seccionCatalogo) {
    seccionCatalogo.style.display = "none";
  }

  console.log("✅ Aplicación inicializada correctamente");
});


// --------------------------------------
// Autologin backend
// --------------------------------------
async function autologinBackend() {
  const local = JSON.parse(localStorage.getItem("cliente"));

  if (!local || !local.cedula) {
    return; // no hay usuario guardado
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



// Inicialización segura: ejecutar después de que DOM esté listo
document.addEventListener("DOMContentLoaded", () => {

  // Re-obtener el botón (por si fue definido antes de cargar el script)
  const btn = document.getElementById("btnCerrarSesion");

  // Si existe, conectar el evento de cerrar sesión
  if (btn) {
    // quitar listeners previos por seguridad
    try { btn.replaceWith(btn.cloneNode(true)); } catch(e){ /* fallBack */ }
    // volver a obtener
    const btnFresh = document.getElementById("btnCerrarSesion");
    if (btnFresh) btnFresh.addEventListener("click", cerrarSesion);
  }

  // Verificar estado de sesión al cargar y mostrar/ocultar botón
  verificarLoginAlCargar(); // función que veremos abajo (si no existe, pega la versión siguiente)
});

function verificarLoginAlCargar() {
  // Usa tu lógica de vencimiento si la tienes (isLoginVigente)
  const vigente = (typeof isLoginVigente === "function") ? isLoginVigente() : !!localStorage.getItem("cliente") || !!localStorage.getItem("usuario");

  if (vigente) {
    // sincronizar usuarioActual desde storage si es necesario
    const stored = localStorage.getItem("cliente") || localStorage.getItem("usuario");
    if (stored) {
      try { usuarioActual = JSON.parse(stored); } catch(e){ usuarioActual = null; }
    }
    actualizarMensajeBienvenida();
    mostrarCerrarSesion();
  } else {
    usuarioActual = null;
    actualizarMensajeBienvenida();
    ocultarCerrarSesion();
  }
}
