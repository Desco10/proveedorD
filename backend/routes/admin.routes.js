const express = require("express");
const router = express.Router();

// ===============================
// CONTROLLERS
// ===============================
const { loginAdmin } = require("../controllers/adminAuthController");



const verifyToken = require('../middlewares/authMiddleware');
const { obtenerDashboard } = require('../controllers/adminController');

// Ruta protegida
router.get('/dashboard', verifyToken, obtenerDashboard);


const authMiddleware = require('../middlewares/authMiddleware');

router.get('/dashboard', authMiddleware, dashboardResumen);
router.get('/carritos', authMiddleware, listarCarritosAdmin);



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
