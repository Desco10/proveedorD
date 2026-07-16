require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression"); //AGREGE ESTO

const app = express();
const fs = require("fs");
const fsp = fs.promises;

// =====================
// CONFIGURACIÓN PRODUCCIÓN
// =====================
app.disable("x-powered-by");//AGREGE ESTO
app.set("trust proxy", 1); //ESTO
app.set("etag", "strong"); //ESTO


// =====================
// MIDDLEWARES GLOBALES
// =====================
app.use(cors({
  origin: [
    "https://descoapp.com",
    "https://www.descoapp.com"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// COMPRESIÓN HTTP  AGREGE ESTO 
// =====================
app.use(compression({
  level: 6,
  threshold: 1024
}));

//HASTA AQUI 


// =====================
// DB
// =====================
require("./config/db");

// =====================
// RUTAS API
// =====================

// CLIENTES
app.use("/api/clientes", require("./routes/clientes"));

// CARRITOS (UNA SOLA FUENTE DE VERDAD)
app.use("/api/carritos", require("./routes/carritos"));

// ADMIN
app.use("/api/admin", require("./routes/admin.routes"));

// =====================
// PATHS
// =====================
const FRONTEND_PATH = path.join(__dirname, "..", "frontend");
const DATA_PATH = path.join(__dirname, "data");



console.log("FRONTEND_PATH:", FRONTEND_PATH);
console.log(
  "EXISTE INDEX:",
  fs.existsSync(path.join(FRONTEND_PATH, "index.html"))
);
//HASTA AQUI 54

// =====================
// DATA ESTÁTICA (JSON)
// =====================
app.use("/data", express.static(DATA_PATH, {
  etag: true,
  lastModified: true,
  maxAge: "1h"
}));
// ESTO ARRIBA





// =====================
// SPA ENTRY POINT
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// =====================
// META OG PRODUCTOS
// =====================

app.get("/:proveedorSlug/:productoSlug", async (req, res) => {

  try {

    const { proveedorSlug, productoSlug } = req.params;

    // leer proveedores
    const proveedores = JSON.parse(
      await fsp.readFile(
        path.join(DATA_PATH, "proveedores.json"),
        "utf8"
      )
    );

    const proveedor = proveedores.find(
      p => p.slug === proveedorSlug
    );

    if (!proveedor) {
      return res.sendFile(
        path.join(FRONTEND_PATH, "index.html")
      );
    }

    // leer productos del proveedor
    const productos = JSON.parse(
      await fsp.readFile(
        path.join(
          DATA_PATH,
          `productos_proveedor_${proveedor.id}.json`
        ),
        "utf8"
      )
    );

    const producto = productos.find(p => {

      const slug =
        p.slug ||
        p.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      return slug === productoSlug;

    });

    if (!producto) {
      return res.sendFile(
        path.join(FRONTEND_PATH, "index.html")
      );
    }

    // hasta aquí llega el paso 2

   console.log("✅ META OG:", proveedorSlug, productoSlug);

res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <title>Prueba Meta OG</title>
</head>
<body>

<h1>META OG FUNCIONANDO</h1>

<p>Proveedor: ${proveedorSlug}</p>

<p>Producto: ${productoSlug}</p>

</body>
</html>
`);

  } catch (err) {

    console.error(err);

    res.sendFile(
      path.join(FRONTEND_PATH, "index.html")
    );

  }

});



  // =====================
// FRONTEND
// =====================
app.use(express.static(FRONTEND_PATH, {
  etag: true,
  lastModified: true,
  maxAge: "7d",
  index: false,
  redirect: false,
  fallthrough: true
}));
 // ARRIBA  ESTO 


// =====================
// CATCH-ALL (SOLO FRONTEND)
// =====================
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      ok: false,
      message: "Ruta API no encontrada"
    });
  }

  if (req.path.startsWith("/data")) {
    return res.status(404).json({
      ok: false,
      message: "Archivo no encontrado"
    });
  }

  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// =====================
// SERVER
// =====================



// =====================
// MANEJO GLOBAL DE ERRORES
// =====================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  res.status(500).json({
    ok: false,
    message: "Error interno del servidor"
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Frontend: ${FRONTEND_PATH}`);
  console.log(`📊 Data: ${DATA_PATH}`);
});
