const db = require("../config/db");

// Registrar cliente
exports.registrarCliente = (req, res) => {
  const { nombre, direccion, celular, cedula, metodo, ip, userAgent } = req.body;

  if (!nombre || !cedula) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

  const sql = `
    INSERT INTO clientes (fecha, nombre, direccion, celular, cedula, metodo, ip, userAgent)
    VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nombre, direccion, celular, cedula, metodo, ip, userAgent],
    (err, result) => {
      if (err) {
        console.error("Error guardando cliente:", err);
        return res.status(500).json({ error: "Error registrando cliente" });
      }
      res.json({ ok: true, message: "Cliente registrado", id: result.insertId });
    }
  );
};

// Validar cedula (autologin)
exports.validarCedula = (req, res) => {
  const { cedula } = req.body;

  if (!cedula) {
    return res.status(400).json({ error: "Cédula requerida" });
  }

  const sql = "SELECT * FROM clientes WHERE cedula = ? ORDER BY id DESC LIMIT 1";

  db.query(sql, [cedula], (err, results) => {
    if (err) {
      console.error("Error consultando cliente:", err);
      return res.status(500).json({ error: "Error consultando cliente" });
    }

    if (results.length === 0) {
      return res.json({ ok: false, message: "No existe el cliente" });
    }

    res.json({ ok: true, cliente: results[0] });
  });
};
