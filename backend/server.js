require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const app = express();



const ogMetaMiddleware = require("./og-meta"); // archivo que contiene la lógica para generar las meta tags OG
const ogProveedor = require("./og-proveedores");

// CONFIGURACIÓN PRODUCCIÓN
// =====================
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.set("etag", "strong");

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
// COMPRESIÓN HTTP
// =====================
app.use(compression({
  level: 6,
  threshold: 1024
}));

// =====================
// META TAGS OG (compartir productos)
// =====================
app.use(ogMetaMiddleware); // middleware para generar meta tags OG dinámicas para productos compartidos

// META TAGS OG (proveedores)
// =====================
app.use(ogProveedor);
// DB
// =====================
require("./config/db");

// =====================
// RUTAS API
// =====================

// CLIENTES
app.use("/api/clientes", require("./routes/clientes"));

// CARRITOS
app.use("/api/carritos", require("./routes/carritos"));

// ADMIN
app.use("/api/admin", require("./routes/admin.routes"));



const { crearRemision, verRemision } = require("./routes/remisiones");

app.post("/api/remisiones", crearRemision);
app.get("/remision/:numero", verRemision);


// =====================
// PATHS
// =====================
const FRONTEND_PATH = path.join(__dirname, "..", "frontend");
const DATA_PATH = path.join(__dirname, "data");

const fs = require("fs");

console.log("FRONTEND_PATH:", FRONTEND_PATH);
console.log(
  "EXISTE INDEX:",
  fs.existsSync(path.join(FRONTEND_PATH, "index.html"))
);




// =====================
// DATA ESTÁTICA (JSON)
// =====================
app.use("/data", express.static(DATA_PATH, {
  etag: true,
  lastModified: true,
  maxAge: "1h"
}));

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



// =====================
// SPA ENTRY POINT
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

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
// MANEJO GLOBAL DE ERRORES
// =====================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);

  res.status(500).json({
    ok: false,
    message: "Error interno del servidor"
  });
});

// =====================
// SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Frontend: ${FRONTEND_PATH}`);
  console.log(`📊 Data: ${DATA_PATH}`);
});