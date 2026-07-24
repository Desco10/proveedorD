/*
=========================================================
 DescoApp - Open Graph Middleware
 Archivo: backend/og-meta.js
 Versión: Producción (corregida)
=========================================================
*/

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://descoapp.com";
const DATA_DIR = path.join(__dirname, "data");
const PROVIDERS_FILE = path.join(DATA_DIR, "proveedores.json");
const LOG_FILE = path.join(__dirname, "og-meta-debug.log");

const CACHE_TIME = 60000; // 60 segundos


let cache = {
  proveedores: null,
  productos: {},
  loadedAt: 0
};

/* =========================================================
   LOG DE DIAGNÓSTICO (visible desde cPanel File Manager)
========================================================= */
function log(...partes) {
  const linea = `[${new Date().toISOString()}] ${partes.join(" ")}\n`;
  try {
    fs.appendFileSync(LOG_FILE, linea);
  } catch (e) {
    // nunca debe romper la petición por un fallo de log
  }
}

/* =========================================================
   UTILIDADES
========================================================= */
function crearSlug(texto = "") {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function leerJSON(ruta) {
  try {
    if (!fs.existsSync(ruta)) {
      log("ERROR: archivo no existe ->", ruta);
      return [];
    }
    const contenido = fs.readFileSync(ruta, "utf8");
    if (!contenido.trim()) return [];
    return JSON.parse(contenido);
  } catch (err) {
    log("ERROR leyendo", ruta, "->", err.message);
    return [];
  }
}

/* =========================================================
   CACHE
========================================================= */
function cacheExpirada() {
  return (Date.now() - cache.loadedAt) > CACHE_TIME;
}

function cargarProveedores() {
  if (!cache.proveedores || cacheExpirada()) {
    cache.proveedores = leerJSON(PROVIDERS_FILE);
    cache.loadedAt = Date.now();
  }
  return cache.proveedores;
}

function cargarProductos(proveedorId) {
  if (cache.productos[proveedorId] && !cacheExpirada()) {
    return cache.productos[proveedorId];
  }
  const archivo = path.join(DATA_DIR, `productos_proveedor_${proveedorId}.json`);
  cache.productos[proveedorId] = leerJSON(archivo);
  return cache.productos[proveedorId];
}

/* =========================================================
   BÚSQUEDAS
========================================================= */
function buscarProveedor(slug) {
  const proveedores = cargarProveedores();
  for (const proveedor of proveedores) {
    const proveedorSlug = proveedor.slug || crearSlug(proveedor.nombre);
    if (proveedorSlug === slug && proveedor.urlActiva === true) {
      return proveedor;
    }
  }
  return null;
}

function buscarProducto(proveedorId, productoSlug) {
  const productos = cargarProductos(proveedorId);
  for (const producto of productos) {
    const slug = producto.slug || crearSlug(producto.nombre);
    if (slug === productoSlug) return producto;
  }
  return null;
}

/* =========================================================
   DETECCIÓN DE BOTS
========================================================= */
const BOT_REGEX = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|SkypeUriPreview|redditbot|Googlebot|Applebot|bingbot|YandexBot/i;

function esBot(userAgent = "") {
  return BOT_REGEX.test(userAgent);
}

/* =========================================================
   IMAGEN ABSOLUTA
========================================================= */
function imagenAbsoluta(imagen, proveedor) {
  if (!imagen || imagen === "") {
    if (proveedor.logo) {
      return proveedor.logo.startsWith("http") ? proveedor.logo : SITE_URL + proveedor.logo;
    }
    return SITE_URL + "/img/logo.png";
  }
  if (imagen.startsWith("http")) return imagen;
  if (imagen.startsWith("/")) return SITE_URL + imagen;
  return SITE_URL + "/" + imagen;
}

/* =========================================================
   GENERADOR HTML OPEN GRAPH — PRODUCTO
========================================================= */
function construirHTML(proveedor, producto, urlActual) {
  const titulo = escapeHtml(producto.nombre);
  const descripcion = escapeHtml(producto.descripcion || proveedor.descripcion || producto.nombre);
  const precio = escapeHtml(producto.precio || "");
  const imagen = imagenAbsoluta(producto.imagen, proveedor);
  const proveedorNombre = escapeHtml(proveedor.nombre);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo} | ${proveedorNombre}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${descripcion}">
<link rel="canonical" href="${urlActual}">
<meta name="theme-color" content="${proveedor.color || "#1976d2"}">

<meta property="og:type" content="product">
<meta property="og:site_name" content="DescoApp">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${descripcion}${precio ? " - " + precio : ""}">
<meta property="og:url" content="${urlActual}">
<meta property="og:image" content="${imagen}">
<meta property="og:image:secure_url" content="${imagen}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${titulo}">

<meta property="product:price:amount" content="${precio.replace(/[^0-9]/g, "")}">
<meta property="product:price:currency" content="COP">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titulo}">
<meta name="twitter:description" content="${descripcion}">
<meta name="twitter:image" content="${imagen}">

<meta http-equiv="refresh" content="0;url=${urlActual}">

<style>
html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#333;height:100%}
body{display:flex;align-items:center;justify-content:center}
main{text-align:center;padding:40px}
img{max-width:260px;margin-bottom:20px}
h1{font-size:26px;margin-bottom:10px}
p{font-size:16px;line-height:1.6}
a{color:#1976d2;text-decoration:none}
</style>
</head>
<body>
<main>
<img src="${imagen}" alt="${titulo}">
<h1>${titulo}</h1>
<p>${descripcion}</p>
${precio ? `<p><strong>${precio}</strong></p>` : ""}
<p>Redirigiendo a <strong>DescoApp</strong>...</p>
<p><a href="${urlActual}">Abrir producto</a></p>
</main>
</body>
</html>`;
}

/* =========================================================
   GENERADOR HTML OPEN GRAPH — PROVEEDOR (catálogo completo)
========================================================= */
function construirHTMLProveedor(proveedor, urlActual) {
  const titulo = escapeHtml(proveedor.nombre);
  const descripcion = escapeHtml(proveedor.descripcion || `Catálogo de ${proveedor.nombre} en DescoApp`);
  const imagen = imagenAbsoluta(proveedor.banner || proveedor.logo, proveedor);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo} | DescoApp</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${descripcion}">
<link rel="canonical" href="${urlActual}">
<meta name="theme-color" content="${proveedor.color || "#1976d2"}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="DescoApp">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${descripcion}">
<meta property="og:url" content="${urlActual}">
<meta property="og:image" content="${imagen}">
<meta property="og:image:secure_url" content="${imagen}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${titulo}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titulo}">
<meta name="twitter:description" content="${descripcion}">
<meta name="twitter:image" content="${imagen}">

<meta http-equiv="refresh" content="0;url=${urlActual}">

<style>
html,body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#333;height:100%}
body{display:flex;align-items:center;justify-content:center}
main{text-align:center;padding:40px}
img{max-width:260px;margin-bottom:20px}
h1{font-size:26px;margin-bottom:10px}
p{font-size:16px;line-height:1.6}
a{color:#1976d2;text-decoration:none}
</style>
</head>
<body>
<main>
<img src="${imagen}" alt="${titulo}">
<h1>${titulo}</h1>
<p>${descripcion}</p>
<p>Redirigiendo a <strong>DescoApp</strong>...</p>
<p><a href="${urlActual}">Ver catálogo</a></p>
</main>
</body>
</html>`;
}

/* =========================================================
   MIDDLEWARE PRINCIPAL
========================================================= */
function ogMetaMiddleware(req, res, next) {
  const partes = req.path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  log("---- petición:", req.path, "| UA:", req.headers["user-agent"] || "(sin UA)");

  if (partes.length === 0 || partes.length > 2) {
    return next();
  }

  const RESERVADAS = ["api", "data", "img", "css", "js", "favicon.ico", "share", "remision", "robots.txt", "sitemap.xml"];
  if (RESERVADAS.includes(partes[0])) {
    return next();
  }

  const userAgent = req.headers["user-agent"] || "";

  // =====================
  // CASO 1: /:proveedorSlug  → página del catálogo del proveedor
  // =====================
  if (partes.length === 1) {
    const proveedorSlug = partes[0];
    const proveedor = buscarProveedor(proveedorSlug);

    if (!proveedor) {
      log("❌ (proveedor-solo) proveedor no encontrado:", proveedorSlug);
      return next();
    }

    if (!esBot(userAgent)) {
      log("ok: (proveedor-solo) encontrado pero no es bot, sirviendo SPA normal");
      return next();
    }

    const urlActual = SITE_URL + req.originalUrl;
    const html = construirHTMLProveedor(proveedor, urlActual);

    log("✅ sirviendo HTML de OG para proveedor:", proveedor.nombre);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public,max-age=3600");
    return res.status(200).send(html);
  }

  // =====================
  // CASO 2: /:proveedorSlug/:productoSlug  → página del producto
  // =====================
  const proveedorSlug = partes[0];
  const productoSlug = partes[1];

  const proveedor = buscarProveedor(proveedorSlug);
  if (!proveedor) {
    log("❌ proveedor no encontrado:", proveedorSlug);
    return next();
  }

  const producto = buscarProducto(proveedor.id, productoSlug);
  if (!producto) {
    log("❌ producto no encontrado:", productoSlug, "en proveedor", proveedor.id);
    return next();
  }

  if (!esBot(userAgent)) {
    log("ok: encontrado pero no es bot, sirviendo SPA normal");
    return next();
  }

  const urlActual = SITE_URL + req.originalUrl;
  const html = construirHTML(proveedor, producto, urlActual);

  log("✅ sirviendo HTML de OG para:", producto.nombre);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public,max-age=3600");
  return res.status(200).send(html);
}

/* =========================================================
   WRAPPER CON MANEJO DE ERRORES
========================================================= */
function ogMeta(req, res, next) {
  try {
    return ogMetaMiddleware(req, res, next);
  } catch (err) {
    log("💥 ERROR EN OG-META:", err.message);
    return next();
  }
}

module.exports = ogMeta;