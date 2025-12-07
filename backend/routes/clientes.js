const express = require("express");
const router = express.Router();

const controller = require("../controllers/clientescontroller");

// Registrar cliente
router.post("/registrar", controller.registrarCliente);

// Autologin / validar cédula
router.post("/autologin", controller.validarCedula);

module.exports = router;
