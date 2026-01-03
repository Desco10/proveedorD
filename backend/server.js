

require("dotenv").config({ path: __dirname + "/.env" });


const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar conexión MySQL
require("./config/db");

// Rutas
const clientesRoutes = require("./routes/clientes");
app.use("/api/clientes", clientesRoutes);

app.use("/api/carritos", require("./routes/carritos"));




// Paths del proyecto
const FRONTEND_PATH = path.join(__dirname, "..", "frontend");
const DATA_PATH = path.join(__dirname, "data");

// Servir JSON desde backend/data
app.use("/data", express.static(DATA_PATH));

// Servir frontend
app.use(express.static(FRONTEND_PATH));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// Catch-all para SPA
app.get("*", (req, res) => {
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
