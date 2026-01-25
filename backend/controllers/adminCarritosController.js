const pool = require("../config/db");

// ==================================================
// LISTAR CARRITOS (ADMIN) — FUENTE ÚNICA DE VERDAD
// ==================================================
const listarCarritosAdmin = async (req, res) => {
  try {

    // ===============================
    // 1️⃣ Leer filtros de fecha
    // ===============================
    const { filtro, desde, hasta } = req.query;

    let filtroFechaSQL = "";

    if (filtro === "hoy") {
      filtroFechaSQL = "AND DATE(c.created_at) = CURDATE()";
    }

    if (filtro === "ayer") {
      filtroFechaSQL = "AND DATE(c.created_at) = CURDATE() - INTERVAL 1 DAY";
    }

    if (filtro === "mes") {
      filtroFechaSQL = "AND MONTH(c.created_at) = MONTH(CURDATE()) AND YEAR(c.created_at) = YEAR(CURDATE())";
    }

    if (desde && hasta) {
      filtroFechaSQL = `AND DATE(c.created_at) BETWEEN '${desde}' AND '${hasta}'`;
    }

    // ===============================
    // 2️⃣ Marcar carritos abandonados (NO se toca)
    // ===============================
    await pool.query(`
      UPDATE carritos
      SET fue_abandonado = 1
      WHERE estado = 'activo'
        AND fue_abandonado = 0
        AND last_activity IS NOT NULL
        AND last_activity < NOW() - INTERVAL 3 MINUTE
    `);

    // ===============================
    // 3️⃣ Query principal (con filtro)
    // ===============================
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.carrito_origen_id, 
        c.cliente_id,
        c.estado,
        c.total,
        c.canal_envio,
        c.created_at,
        c.updated_at,
        c.last_activity,
        c.fue_abandonado,

        -- Cuántas veces fue recuperado este carrito
        (
          SELECT COUNT(*)
          FROM carritos h
          WHERE h.carrito_origen_id = c.id
        ) AS recuperaciones,

        -- Estado administrativo real
        CASE
          WHEN c.estado = 'enviado' AND c.carrito_origen_id IS NOT NULL THEN 'recuperado'
          WHEN c.estado = 'enviado' THEN 'enviado'
          WHEN c.estado = 'activo' AND c.fue_abandonado = 1
               AND NOT EXISTS (
                 SELECT 1 FROM carritos h WHERE h.carrito_origen_id = c.id
               )
            THEN 'abandonado'
          WHEN c.estado = 'activo' THEN 'abierto'
          ELSE 'cerrado'
        END AS estado_admin,

        cl.nombre,
        cl.apellido,
        cl.telefono,
        cl.direccion

      FROM carritos c
      JOIN clientes cl ON cl.id = c.cliente_id
      WHERE 1=1
      ${filtroFechaSQL}
      ORDER BY IFNULL(c.last_activity, c.created_at) DESC
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


// ==================================================
// DETALLE CARRITO (ADMIN) — REAL, SIN INVENTOS
// ==================================================
const detalleCarritoAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener carrito exacto
    const [carritos] = await pool.query(
      `
      SELECT
        c.*,
        CASE
          WHEN c.estado = 'enviado' THEN 'enviado'
          WHEN c.estado = 'activo' AND c.fue_abandonado = 1 THEN 'abandonado'
          WHEN c.estado = 'activo' THEN 'abierto'
          ELSE 'cerrado'
        END AS estado_admin
      FROM carritos c
      WHERE c.id = ?
      `,
      [id]
    );

    if (carritos.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Carrito no encontrado"
      });
    }

    const carrito = carritos[0];

    // 2. Obtener items reales asociados a ESE carrito
    const [items] = await pool.query(
      `
      SELECT
        id,
        producto_id,
        nombre_producto,
        cantidad,
        precio,
        subtotal
      FROM carrito_items
      WHERE carrito_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    // 3. Respuesta única y consistente
    res.json({
      ok: true,
      carrito,
      items,
      total: carrito.total
    });

  } catch (error) {
    console.error("detalleCarritoAdmin:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener el detalle del carrito"
    });
  }
};

// ==================================================
// ACTUALIZAR ESTADO ADMINISTRATIVO (OPCIONAL)
// SOLO PARA USO INTERNO DEL DASHBOARD
// ==================================================
const actualizarEstadoCarrito = async (req, res) => {
  const { id } = req.params;
  const { estado_admin } = req.body;

  const estadosValidos = [
    "abierto",
    "en_proceso",
    "cerrado",
    "cancelado"
  ];

  if (!estadosValidos.includes(estado_admin)) {
    return res.status(400).json({
      ok: false,
      message: "Estado administrativo no válido"
    });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE carritos
      SET estado_admin = ?
      WHERE id = ?
      `,
      [estado_admin, id]
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
      estado_admin
    });

  } catch (error) {
    console.error("actualizarEstadoCarrito:", error);
    res.status(500).json({
      ok: false,
      message: "Error al actualizar estado administrativo"
    });
  }
};




// ==================================================
module.exports = {
  listarCarritosAdmin,
  detalleCarritoAdmin,
  actualizarEstadoCarrito
  
};
