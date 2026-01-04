const express = require('express');
const router = express.Router();

const { dashboardResumen } = require('../controllers/adminDashboardController');
const { listarCarritos } = require('../controllers/adminCarritosController');

// Dashboard resumen
router.get('/dashboard/resumen', dashboardResumen);

// Listado de carritos (ADMIN)
router.get('/carritos', listarCarritos);

module.exports = router;
