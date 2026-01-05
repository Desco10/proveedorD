const pool = require("../config/db");

// ===============================
// LISTAR CARRITOS (YA FUNCIONA)
// ===============================
const listarCarritosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, cliente_id, estado, total, created_at
      FROM carritos
      ORDER BY created_at DESC
    `);

    res.json({ ok: true, carritos: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error listando carritos" });
  }
};


// ===============================

// ===============================
// DETALLE CARRITO (ADMIN)
// ===============================
const detalleCarritoAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const [items] = await pool.query(
      `
      SELECT 
        id,
        producto_id,
        nombre_producto,
        cantidad,
        subtotal
      FROM carrito_items
      WHERE carrito_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    return res.json({
      ok: true,
      carrito_id: id,
      items
    });

  } catch (error) {
    console.error("Error detalle carrito:", error);
    return res.status(500).json({
      ok: false,
      message: "Error detalle carrito"
    });
  }
};

// ===============================
// ACTUALIZAR ESTADO CARRITO (ADMIN)
// ===============================
const actualizarEstadoCarrito = async (req, res) => {

  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = [
    "abierto",
    "en_proceso",
    "cerrado",
    "cancelado"
  ];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      ok: false,
      message: "Estado admin no válido"
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE carritos SET estado_admin = ? WHERE id = ?`,
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Carrito no encontrado"
      });
    }

    res.json({
      ok: true,
      message: "Estado administrativo actualizado",
      carrito_id: id,
      estado_admin: estado
    });

  } catch (error) {
    console.error("actualizarEstadoCarrito:", error);
    res.status(500).json({
      ok: false,
      message: "Error al actualizar estado administrativo"
    });
  }
};



module.exports = {
  listarCarritosAdmin,
  detalleCarritoAdmin,
  actualizarEstadoCarrito
};


