const express = require("express");
const router = express.Router();
const carritosController = require("../controllers/carritosController");

// CLIENTE
router.post("/obtener-o-crear", carritosController.obtenerOCrearCarrito);
router.post("/agregar-item", carritosController.agregarItem);
router.post("/enviar", carritosController.enviarCarrito);

module.exports = router;
