/*
=========================================================
 DescoApp
 Open Graph Middleware v2.0
 Archivo: backend/og-meta.js
=========================================================
*/
console.log("=================================");
console.log("OG META EJECUTÁNDOSE");
console.log("=================================");
const fs = require("fs");
const path = require("path");

/* ======================================================
   CONFIGURACIÓN
====================================================== */

const SITE_URL = "https://descoapp.com";

const DATA_PATH = path.join(__dirname, "data");

const PROVEEDORES_FILE =
    path.join(DATA_PATH, "proveedores.json");

/* ======================================================
   CACHE SIMPLE
====================================================== */

const cache = {

    proveedores: null,

    productos: {}

};

/* ======================================================
   UTILIDADES
====================================================== */

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

        return JSON.parse(
            fs.readFileSync(ruta, "utf8")
        );

    } catch (err) {

        console.error("Error leyendo:", ruta);

        return [];

    }

}

/* ======================================================
   CARGA DE DATOS
====================================================== */

function obtenerProveedores() {

    if (!cache.proveedores) {

        cache.proveedores =
            leerJSON(PROVEEDORES_FILE);

    }

    return cache.proveedores;

}

function obtenerProductos(proveedorId) {

    if (!cache.productos[proveedorId]) {

        const archivo = path.join(

            DATA_PATH,

            `productos_proveedor_${proveedorId}.json`

        );

        cache.productos[proveedorId] =
            leerJSON(archivo);

    }

    return cache.productos[proveedorId];

}

/* ======================================================
   BUSCAR PROVEEDOR
====================================================== */

function buscarProveedor(slugProveedor) {

    const proveedores =
        obtenerProveedores();

    return proveedores.find(p => {

        const slug =
            p.slug ||
            crearSlug(p.nombre);

        return (

            slug === slugProveedor &&

            p.urlActiva === true

        );

    }) || null;

}

/* ======================================================
   BUSCAR PRODUCTO
====================================================== */

function buscarProducto(

    proveedorId,

    slugProducto

) {

    const productos =
        obtenerProductos(proveedorId);

    return productos.find(prod => {

        const slug =

            prod.slug ||

            crearSlug(prod.nombre);

        return slug === slugProducto;

    }) || null;

}

/* ======================================================
   DETECTAR BOTS
====================================================== */

const BOT_REGEX =
/facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|SkypeUriPreview|redditbot|Googlebot|Applebot|bingbot|YandexBot/i;

function esBot(userAgent = "") {

    return BOT_REGEX.test(userAgent);

}

/* ======================================================
   IMAGEN ABSOLUTA
====================================================== */

function obtenerImagen(producto, proveedor) {

    let imagen =

        producto.imagen ||

        proveedor.logo ||

        "/img/logo.png";

    if (imagen.startsWith("http")) {

        return imagen;

    }

    if (!imagen.startsWith("/")) {

        imagen = "/" + imagen;

    }

    return SITE_URL + imagen;

}

/* ======================================================
   GENERAR HTML OPEN GRAPH
====================================================== */

function construirHTML(proveedor, producto, urlActual) {

    const titulo =
        escapeHtml(producto.nombre);

    const descripcion =
        escapeHtml(
            producto.descripcion ||
            proveedor.descripcion ||
            producto.nombre
        );

    const precio =
        escapeHtml(producto.precio || "");

    const imagen =
        obtenerImagen(producto, proveedor);

    return `<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<title>${titulo}</title>

<meta name="viewport"
content="width=device-width,initial-scale=1">

<meta name="description"
content="${descripcion}">

<link rel="canonical"
href="${urlActual}">

<meta property="og:type"
content="product">

<meta property="og:site_name"
content="DescoApp">

<meta property="og:title"
content="${titulo}">

<meta property="og:description"
content="${descripcion}${precio ? " • " + precio : ""}">

<meta property="og:url"
content="${urlActual}">

<meta property="og:image"
content="${imagen}">

<meta property="og:image:secure_url"
content="${imagen}">

<meta property="og:image:width"
content="1200">

<meta property="og:image:height"
content="630">

<meta property="og:image:alt"
content="${titulo}">

<meta property="product:price:currency"
content="COP">

<meta property="product:price:amount"
content="${(producto.precio || "").replace(/[^0-9]/g,"")}">

<meta name="twitter:card"
content="summary_large_image">

<meta name="twitter:title"
content="${titulo}">

<meta name="twitter:description"
content="${descripcion}">

<meta name="twitter:image"
content="${imagen}">

<script>

location.replace("${urlActual}");

</script>

</head>

<body>

</body>

</html>`;

}

/* ======================================================
   MIDDLEWARE
====================================================== */

function ogMeta(req, res, next) {
 console.log("");
console.log("================================");
console.log("ENTRÓ AL MIDDLEWARE OG");
console.log(req.method, req.originalUrl);
console.log(req.headers["user-agent"]);
console.log("================================");
console.log("");

    const partes =
        req.path
        .replace(/^\/+|\/+$/g,"")
        .split("/");

    if (partes.length !== 2) {

        return next();

    }

    const reservadas = [

        "api",

        "data",

        "img",

        "css",

        "js",

        "fonts",

        "videos",

        "favicon.ico"

    ];

    if (reservadas.includes(partes[0])) {

        return next();

    }

    const proveedor =
        buscarProveedor(partes[0]);

    if (!proveedor) {

        return next();

    }

    const producto =
        buscarProducto(
            proveedor.id,
            partes[1]
        );

    if (!producto) {

        return next();

    }

    const ua =
        req.headers["user-agent"] || "";

    if (!esBot(ua)) {

        return next();

    }

    console.log("");

    console.log("========== BOT ==========");

    console.log("Proveedor :", proveedor.nombre);

    console.log("Producto  :", producto.nombre);

    console.log("Bot UA    :", ua);

    console.log("=========================");

    const urlActual =
        SITE_URL + req.originalUrl;

    res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "public,max-age=3600"
    );

    return res.send(

        construirHTML(

            proveedor,

            producto,

            urlActual

        )

    );

}

/* ======================================================
   EXPORTAR
====================================================== */

module.exports = ogMeta;