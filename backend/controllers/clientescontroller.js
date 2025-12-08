const db = require("../config/db");

exports.registrarCliente = async (req, res) => {
  try {
    const { nombre, apellido, cedula, telefono, direccion, genero } = req.body;

    if (!nombre || !cedula) {
      return res.json({ ok: false, msg: "Nombre y cédula obligatorios" });
    }

    // Verificar duplicados
    const [exist] = await db.query(
      "SELECT id FROM clientes WHERE cedula = ?",
      [cedula]
    );

    if (exist.length > 0) {
      return res.json({
        ok: false,
        msg: "La cédula ya está registrada"
      });
    }

    // INSERT correcto
    const [result] = await db.query(
      `INSERT INTO clientes 
        (nombre, apellido, cedula, telefono, direccion, genero, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        nombre,
        apellido || "",
        cedula,
        telefono || "",
        direccion || "",
        genero || ""
      ]
    );

    const [rows] = await db.query(
      "SELECT * FROM clientes WHERE id = ?",
      [result.insertId]
    );

    return res.json({
      ok: true,
      cliente: rows[0]
    });

  } catch (error) {
    console.error("❌ Error registro:", error);
    return res.json({ ok: false, msg: "Error interno" });
  }
};


exports.validarCedula = async (req, res) => {
  try {
    const { cedula } = req.body;

    if (!cedula) {
      return res.status(400).json({ error: "La cédula es obligatoria" });
    }

    const [rows] = await db.query(
      "SELECT * FROM clientes WHERE cedula = ?",
      [cedula]
    );

    if (rows.length === 0) {
      return res.json({
        ok: false,
        message: "Cliente no encontrado"
      });
    }

    return res.json({
      ok: true,
      cliente: rows[0]
    });

  } catch (error) {
    console.error("Error validando cédula:", error);
    return res.status(500).json({ error: "Error validando cédula" });
  }
};
