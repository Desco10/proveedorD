/*
=========================================================
 DescoApp - Open Graph Proveedores
 Archivo: backend/og-proveedores.js
=========================================================
*/

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://descoapp.com";

const DATA_DIR = path.join(__dirname, "data");
const PROVEEDORES = path.join(DATA_DIR, "proveedores.json");

const BOT_REGEX =
/facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|SkypeUriPreview|redditbot|Googlebot|bingbot|Applebot/i;

function esBot(ua = "") {
    return BOT_REGEX.test(ua);
}

function escapeHtml(texto = "") {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function leerProveedores() {

    if (!fs.existsSync(PROVEEDORES))
        return [];

    try {

        return JSON.parse(
            fs.readFileSync(PROVEEDORES, "utf8")
        );

    } catch {

        return [];
    }

}

module.exports = function(req, res, next){

    //----------------------------------------------------
    // SOLO RUTAS DE UN NIVEL
    // ejemplo:
    //
    // /descotiendas
    // /autentica
    // /supersalud
    //
    //----------------------------------------------------

    const ruta = req.path
        .replace(/^\/+/,"")
        .replace(/\/+$/,"");

    if(!ruta)
        return next();

    //----------------------------------------------------
    // SI TIENE MÁS DE UN /
    //----------------------------------------------------

    if(ruta.includes("/"))
        return next();

    //----------------------------------------------------
    // RUTAS RESERVADAS
    //----------------------------------------------------

    const reservadas = [

        "api",
        "css",
        "js",
        "img",
        "data",
        "favicon.ico"

    ];

    if(reservadas.includes(ruta))
        return next();

    //----------------------------------------------------
    // SOLO BOTS
    //----------------------------------------------------

    if(!esBot(req.headers["user-agent"] || ""))
        return next();

    //----------------------------------------------------
    // BUSCAR PROVEEDOR
    //----------------------------------------------------

    const proveedores = leerProveedores();

    const proveedor = proveedores.find(p =>

        p.urlActiva === true &&
        p.slug === ruta

    );

    if(!proveedor)
        return next();

    //----------------------------------------------------
    // DATOS
    //----------------------------------------------------

    const titulo =
        escapeHtml(proveedor.nombre);

    const descripcion =
        escapeHtml(proveedor.descripcion || "");

    const imagen = proveedor.banner
        ? SITE_URL + proveedor.banner
        : SITE_URL + proveedor.logo;

    const url = SITE_URL + "/" + proveedor.slug;

    //----------------------------------------------------
    // HTML
    //----------------------------------------------------

    res.setHeader("Content-Type","text/html; charset=utf-8");

    res.send(`<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="utf-8">

<title>${titulo}</title>

<meta property="og:type" content="website">

<meta property="og:site_name" content="DescoApp">

<meta property="og:title"
content="${titulo}">

<meta property="og:description"
content="${descripcion}">

<meta property="og:image"
content="${imagen}">

<meta property="og:url"
content="${url}">

<meta name="twitter:card"
content="summary_large_image">

<meta http-equiv="refresh"
content="0;url=${url}">

</head>

<body>

Redireccionando...

</body>

</html>`);

};