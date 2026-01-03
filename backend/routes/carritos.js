const express = require("express");
const router = express.Router();
const carritosController = require("../controllers/carritosController");

router.post("/obtener-o-crear", carritosController.obtenerOCrearCarrito);
router.post("/agregar-item", carritosController.agregarItem);
router.post("/enviar", carritosController.enviarCarrito);
router.get("/admin/listar", carritosController.listarCarritosAdmin);

module.exports = router;
