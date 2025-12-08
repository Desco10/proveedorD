const db = require("../config/db");

// Registrar cliente
exports.registrarCliente = (req, res) => {
  const { nombre, cedula, telefono } = req.body;

  if (!nombre || !cedula) {
    return res.status(400).json({ error: "Nombre y cédula son obligatorios" });
  }

  const sql = `
      INSERT INTO clientes (nombre, cedula, telefono)
      VALUES (?, ?, ?)
  `;

  db.query(sql, [nombre, cedula, telefono], (err, result) => {
    if (err) {
      console.error("Error registrando cliente:", err);
      return res.status(500).json({ error: "Error registrando cliente" });
    }

    res.json({ ok: true, message: "Cliente registrado correctamente", id: result.insertId });
  });
};

// Validar cédula
exports.validarCedula = (req, res) => {
  const { cedula } = req.body;

  if (!cedula) {
    return res.status(400).json({ error: "La cédula es obligatoria" });
  }

  const sql = `SELECT * FROM clientes WHERE cedula = ?`;

  db.query(sql, [cedula], (err, results) => {
    if (err) {
      console.error("Error validando cédula:", err);
      return res.status(500).json({ error: "Error validando cédula" });
    }

    if (results.length === 0) {
      return res.json({ ok: false, message: "Cliente no encontrado" });
    }

    res.json({ ok: true, cliente: results[0] });
  });
};
