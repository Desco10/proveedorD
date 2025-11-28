const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTA ABSOLUTA DEL FRONTEND
const FRONTEND_PATH = path.join(__dirname, "..", "frontend");

// RUTA ABSOLUTA DE LOS JSON
const DATA_PATH = path.join(__dirname, "data");

// ⚠️ IMPORTANTE: Servir los JSON ANTES del frontend
app.use("/data", express.static(DATA_PATH));

// Servir archivos estáticos del frontend (CSS, JS, imágenes, videos)
app.use(express.static(FRONTEND_PATH));

// Ruta principal - DEBE IR AL FINAL
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Ruta catch-all para SPA - sirve index.html para cualquier ruta no encontrada
// PERO solo si no es una petición a /data
app.get("*", (req, res) => {
  // Si la ruta comienza con /data, devolver 404 en lugar de index.html
  if (req.path.startsWith("/data")) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Frontend: ${FRONTEND_PATH}`);
  console.log(`📊 Data: ${DATA_PATH}`);
});