/*=========================================================
    OG-META.JS
    Genera meta tags Open Graph / Twitter Card dinámicos
    para /:proveedorSlug/:productoSlug, leyendo los JSON
    de /data. No genera HTML por producto: todo es al vuelo.
=========================================================*/

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "data");
const SITE_URL = "https://descoapp.com";

// =====================
// Mismo algoritmo de slug que el frontend (Compartir.js)
// =====================
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

// =====================
// Escapar HTML (evita romper las meta tags)
// =====================
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// =====================
// Leer JSON de forma segura
// =====================
function leerJSON(rutaAbsoluta) {
  try {
    const raw = fs.readFileSync(rutaAbsoluta, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

// =====================
// Buscar proveedor por slug
// =====================
function buscarProveedor(slug) {
  const proveedores = leerJSON(path.join(DATA_PATH, "proveedores.json")) || [];
  return proveedores.find(p => p.slug === slug && p.urlActiva === true) || null;
}

// =====================
// Buscar producto por slug dentro de un proveedor
// =====================
function buscarProducto(proveedorId, productoSlug) {
  const archivo = path.join(DATA_PATH, `productos_proveedor_${proveedorId}.json`);
  const productos = leerJSON(archivo) || [];

  return productos.find(p => {
    const slug = p.slug || crearSlug(p.nombre);
    return slug === productoSlug;
  }) || null;
}

// =====================
// Detectar bots / crawlers de redes sociales
// =====================
const BOT_REGEX = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|Slackbot|Discordbot|LinkedInBot|Googlebot|Pinterest|SkypeUriPreview|vkShare|redditbot|Applebot|W3C_Validator/i;

function esBot(userAgent = "") {
  return BOT_REGEX.test(userAgent);
}

// =====================
// Construir el HTML con las meta tags
// =====================
function construirHtml({ proveedor, producto, urlActual }) {
  const titulo = escapeHtml(producto.nombre);
  const descripcion = escapeHtml(producto.descripcion || producto.nombre);
  const precio = escapeHtml(producto.precio || "");

  const imagenRel = producto.imagen.startsWith("/")
    ? producto.imagen
    : `/${producto.imagen}`;
  const imagenUrl = producto.imagen.startsWith("http")
    ? producto.imagen
    : `${SITE_URL}${imagenRel}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo} | ${escapeHtml(proveedor.nombre)}</title>

<meta property="og:type" content="product">
<meta property="og:site_name" content="Descoapp">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${descripcion}${precio ? " - " + precio : ""}">
<meta property="og:image" content="${imagenUrl}">
<meta property="og:image:secure_url" content="${imagenUrl}">
<meta property="og:url" content="${urlActual}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titulo}">
<meta name="twitter:description" content="${descripcion}">
<meta name="twitter:image" content="${imagenUrl}">

<meta http-equiv="refresh" content="0; url=${urlActual}">
</head>
<body>
  <p>Redirigiendo a <a href="${urlActual}">${titulo}</a>...</p>
</body>
</html>`;
}

// =====================
// Middleware exportado
// =====================
function ogMetaMiddleware(req, res, next) {
  // Solo nos interesan rutas tipo /proveedorSlug/productoSlug
  const partes = req.path.replace(/^\/+|\/+$/g, "").split("/");

  if (partes.length !== 2) return next();
  if (partes[0] === "api" || partes[0] === "data") return next();

  const [proveedorSlug, productoSlug] = partes;

  const proveedor = buscarProveedor(proveedorSlug);
  if (!proveedor) return next();

  const producto = buscarProducto(proveedor.id, productoSlug);
  if (!producto) return next();

  // Si NO es un bot/crawler, dejamos pasar la petición normal (tu SPA sigue igual)
  const userAgent = req.headers["user-agent"] || "";
  if (!esBot(userAgent)) return next();

  // Si es un bot, respondemos con HTML enriquecido con OG tags
  const urlActual = `${SITE_URL}${req.originalUrl}`;
  const html = construirHtml({ proveedor, producto, urlActual });

  res.set("Cache-Control", "public, max-age=3600");
  return res.status(200).send(html);
}

module.exports = ogMetaMiddleware;