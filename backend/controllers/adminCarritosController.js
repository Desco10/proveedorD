const pool = require("../config/db");

const listarCarritosAdmin = async (req, res) => {
  try {

    const { filtro, desde, hasta } = req.query;

    let filtroFechaSQL = "";
    const params = [];

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
      filtroFechaSQL = "AND DATE(c.created_at) BETWEEN ? AND ?";
      params.push(desde, hasta);
    }

    await pool.query(`
      UPDATE carritos
      SET fue_abandonado = 1
      WHERE estado = 'activo'
        AND fue_abandonado = 0
        AND last_activity IS NOT NULL
        AND last_activity < NOW() - INTERVAL 3 MINUTE
    `);

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

        (
          SELECT COUNT(*)
          FROM carritos h
          WHERE h.carrito_origen_id = c.id
        ) AS recuperaciones,

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
    `, params);

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

module.exports = { listarCarritosAdmin };