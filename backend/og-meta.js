/*=========================================================
    CACHE INTELIGENTE
=========================================================*/

const cache = {
    proveedores: null,
    proveedoresMTime: 0,
    productos: {}
};

function obtenerMTime(ruta) {

    try {
        return fs.statSync(ruta).mtimeMs;
    } catch (err) {
        return 0;
    }

}

function cargarProveedores() {

    const mtime = obtenerMTime(PROVIDERS_FILE);

    if (
        !cache.proveedores ||
        cache.proveedoresMTime !== mtime
    ) {

        cache.proveedores = leerJSON(PROVIDERS_FILE);
        cache.proveedoresMTime = mtime;

    }

    return cache.proveedores;

}

function cargarProductos(proveedorId) {

    const archivo = path.join(
        DATA_DIR,
        `productos_proveedor_${proveedorId}.json`
    );

    const mtime = obtenerMTime(archivo);

    if (
        !cache.productos[proveedorId] ||
        cache.productos[proveedorId].mtime !== mtime
    ) {

        cache.productos[proveedorId] = {
            mtime,
            datos: leerJSON(archivo)
        };

    }

    return cache.productos[proveedorId].datos;

} 



/*=========================================================
    GENERADOR HTML OPEN GRAPH
=========================================================*/

function construirHTML(proveedor, producto, urlActual) {

    const titulo = escapeHtml(producto.nombre);

    const descripcion = escapeHtml(
        producto.descripcion ||
        proveedor.descripcion ||
        producto.nombre
    );

    const precio = escapeHtml(producto.precio || "");

    const imagen = imagenAbsoluta(producto.imagen, proveedor);

    const proveedorNombre = escapeHtml(proveedor.nombre);

    return `<!DOCTYPE html>
<html lang="es">
<head>

<meta charset="UTF-8">

<title>${titulo} | ${proveedorNombre}</title>

<meta name="viewport" content="width=device-width, initial-scale=1">

<meta name="description"
content="${descripcion}">

<link rel="canonical"
href="${urlActual}">

<meta name="theme-color"
content="${proveedor.color || "#1976d2"}">

<meta property="og:type"
content="product">

<meta property="og:site_name"
content="DescoApp">

<meta property="og:title"
content="${titulo}">

<meta property="og:description"
content="${descripcion}${precio ? " - " + precio : ""}">

<meta property="og:url"
content="${urlActual}">

<meta property="og:image"
content="${imagen}">

<meta property="og:image:secure_url"
content="${imagen}">

<meta property="og:image:type"
content="image/jpeg">

<meta property="og:image:width"
content="1200">

<meta property="og:image:height"
content="630">

<meta property="og:image:alt"
content="${titulo}">

<meta property="product:price:amount"
content="${precio.replace(/[^0-9]/g,"")}">

<meta property="product:price:currency"
content="COP">

<meta name="twitter:card"
content="summary_large_image">

<meta name="twitter:title"
content="${titulo}">

<meta name="twitter:description"
content="${descripcion}">

<meta name="twitter:image"
content="${imagen}">

<meta http-equiv="refresh"
content="0;url=${urlActual}">

<style>

html,
body{

margin:0;
padding:0;
font-family:Arial,Helvetica,sans-serif;
background:#ffffff;
color:#333;
height:100%;

}

body{

display:flex;
align-items:center;
justify-content:center;

}

main{

text-align:center;
padding:40px;

}

img{

max-width:260px;
margin-bottom:20px;

}

h1{

font-size:26px;
margin-bottom:10px;

}

p{

font-size:16px;
line-height:1.6;

}

a{

color:#1976d2;
text-decoration:none;

}

</style>

</head>

<body>

<main>

<img src="${imagen}" alt="${titulo}">

<h1>${titulo}</h1>

<p>${descripcion}</p>

${
precio
?
`<p><strong>${precio}</strong></p>`
:
""
}

<p>

Redirigiendo a
<strong>DescoApp</strong>...

</p>

<p>

<a href="${urlActual}">
Abrir producto
</a>

</p>

</main>

</body>

</html>`;

}

/*=========================================================
    MIDDLEWARE
=========================================================*/

function ogMetaMiddleware(req,res,next){

    const partes = req.path
        .replace(/^\/+|\/+$/g,"")
        .split("/");

    if(partes.length!==2){
        return next();
    }

    if(
        partes[0]==="api" ||
        partes[0]==="data" ||
        partes[0]==="img" ||
        partes[0]==="css" ||
        partes[0]==="js" ||
        partes[0]==="favicon.ico"
    ){
        return next();
    }

    const proveedorSlug = partes[0];
    const productoSlug = partes[1];

    const proveedor = buscarProveedor(proveedorSlug);

    if(!proveedor){
        return next();
    }

    const producto =
        buscarProducto(
            proveedor.id,
            productoSlug
        );

    if(!producto){
        return next();
    }

    const userAgent =
        req.headers["user-agent"] || "";

    if(!esBot(userAgent)){
        return next();
    }

    const urlActual =
        SITE_URL + req.originalUrl;

    const html =
        construirHTML(
            proveedor,
            producto,
            urlActual
        );

    res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "public,max-age=3600"
    );

    return res.status(200).send(html);

}

/*=========================================================
    MANEJO DE ERRORES
=========================================================*/

function ogMeta(req, res, next) {

    try {
        return ogMetaMiddleware(req, res, next);
    } catch (err) {

        console.error("========================================");
        console.error("ERROR EN OG-META");
        console.error(err);
        console.error("========================================");

        return next();
    }

}

/*=========================================================
    LIMPIEZA AUTOMÁTICA DE CACHE
=========================================================*/


/*=========================================================
    EXPORTACIÓN
=========================================================*/

module.exports = ogMeta;