require("dotenv").config({
  path: __dirname + "/.env",
  quiet: true
});

const express = require("express");
const cors = require("cors");

const app = express();

const helmet = require('helmet');
app.use(helmet());


const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Demasiadas solicitudes. Intenta más tarde."
  }
});

app.use(limiter);
// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// DB
// =====================
require("./config/db");

// =====================
// RUTAS API
// =====================
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/carritos", require("./routes/carritos"));
app.use("/api/admin", require("./routes/admin.routes"));

// =====================
// TEST ROUTE
// =====================
app.get("/api", (req, res) => {
  res.json({ ok: true, message: "API funcionando correctamente" });
});

// =====================
// SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});