const pool = require("../config/db");

// ===============================
// LISTAR CARRITOS (YA FUNCIONA)
// ===============================
const listarCarritosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id,
        cl.nombre,
        cl.apellido,
        cl.telefono,
        c.estado,
        c.estado_admin,
        c.total,
        c.created_at
      FROM carritos c
      JOIN clientes cl ON cl.id = c.cliente_id
      ORDER BY c.created_at DESC
    `);

    res.json({
      ok: true,
      carritos: rows
    });

  } catch (error) {
    console.error("listarCarritosAdmin:", error);
    res.status(500).json({
      ok: false,
      message: "Error al listar carritos"
    });
  }
};

// ===============================
// DETALLE CARRITO (ADMIN) ✔ REAL
// ===============================
// ===============================
// DETALLE CARRITO (ADMIN) ✔ REAL
// ===============================
const detalleCarritoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Items reales del carrito (SIN JOIN)
    const [items] = await pool.query(`
      SELECT
        nombre_producto,
        precio,
        cantidad,
        subtotal
      FROM carrito_items
      WHERE carrito_id = ?
    `, [id]);

    // 🔹 Total real del carrito
    const [totalResult] = await pool.query(`
      SELECT total
      FROM carritos
      WHERE id = ?
    `, [id]);

    res.json({
      ok: true,
      carrito_id: id,
      total: totalResult[0]?.total || 0,
      items
    });

  } catch (error) {
    console.error("detalleCarritoAdmin:", error);
    res.status(500).json({
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
