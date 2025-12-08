const express = require("express");
const router = express.Router();
const db = require("../config/db");

const controller = require("../controllers/clientescontroller");

// Registrar cliente
router.post("/registrar", controller.registrarCliente);

// Autologin / validar cédula
router.post("/autologin", controller.validarCedula);





router.post("/registro", async (req, res) => {
  try {
    const { nombre, direccion, telefono, cedula, genero } = req.body;

    if (!nombre || !cedula) {
      return res.json({ ok: false, msg: "Nombre y cédula son obligatorios" });
    }

    // Verificar si existe ya
    const [exist] = await db.query(
      "SELECT id FROM clientes WHERE cedula = ?",
      [cedula]
    );

    if (exist.length > 0) {
      return res.json({ ok: false, msg: "El cliente ya existe" });
    }

    const fecha = new Date();

    // Insertar
    const [result] = await db.query(
      `INSERT INTO clientes 
        (nombre, direccion, telefono, cedula, genero, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        direccion || "",
        telefono || "",
        cedula,
        genero || "",
        fecha
      ]
    );

    // Leer el cliente insertado
    const [rows] = await db.query(
      "SELECT * FROM clientes WHERE id = ?",
      [result.insertId]
    );

    return res.json({
      ok: true,
      cliente: rows[0]
    });

  } catch (error) {
    console.error("Error registro:", error);
    return res.json({ ok: false, msg: "Error interno" });
  }
});




module.exports = router;




