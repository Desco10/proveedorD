require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

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

// =====================
// DATA ESTÁTICA (JSON)
// =====================
app.use("/data", express.static(DATA_PATH));

// =====================
// FRONTEND
// =====================
app.use(express.static(FRONTEND_PATH));

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

console.log("🔥 SERVER VERSION 2026-06-03");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Frontend: ${FRONTEND_PATH}`);
  console.log(`📊 Data: ${DATA_PATH}`);
});
