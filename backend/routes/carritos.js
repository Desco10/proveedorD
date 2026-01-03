const express = require("express");
const router = express.Router();
const carritosController = require("../controllers/carritosController");

// CLIENTE
router.post("/obtener-o-crear", carritosController.obtenerOCrearCarrito);
router.post("/agregar-item", carritosController.agregarItem);
router.post("/enviar", carritosController.enviarCarrito);

// ADMIN
router.get("/admin/listar", carritosController.listarCarritosAdmin);
router.get("/admin/:id/detalle", carritosController.listarDetalleCarritoAdmin);

module.exports = router;
