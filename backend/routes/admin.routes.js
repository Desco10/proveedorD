const express = require("express");
const router = express.Router();

// ===============================
// CONTROLLERS
// ===============================
const { loginAdmin } = require("../controllers/adminAuthController");

const {
  dashboardResumen,
  metricasDashboard
} = require("../controllers/adminDashboardController");

const {
  listarCarritosAdmin,
  detalleCarritoAdmin,
  actualizarEstadoCarrito
} = require("../controllers/adminCarritosController");

// ===============================
// AUTH
// ===============================
router.post("/login", loginAdmin);

// ===============================
// DASHBOARD
// ===============================
router.get("/dashboard/resumen", dashboardResumen);
router.get("/dashboard/metricas", metricasDashboard);

// ===============================
// CARRITOS (ADMIN)
// ===============================
router.get("/carritos", listarCarritosAdmin);
router.get("/carritos/:id/detalle", detalleCarritoAdmin);
router.put("/carritos/:id/estado", actualizarEstadoCarrito);

// ===============================
module.exports = router;
