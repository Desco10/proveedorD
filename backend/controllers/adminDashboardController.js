const pool = require('../config/db');

const dashboardResumen = async (req, res) => {
  try {
    const [[carritosHoy]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM carritos
      WHERE DATE(created_at) = CURDATE()
    `);

    const [[totalVendido]] = await pool.query(`
      SELECT IFNULL(SUM(total),0) AS total
      FROM carritos
      WHERE estado = 'enviado'
    `);

    const [[carritosActivos]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM carritos
      WHERE estado = 'activo'
    `);

    const [[carritosAbandonados]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM carritos
      WHERE estado = 'abandonado'
    `);

    res.json({
      ok: true,
      carritos_hoy: carritosHoy.total,
      total_vendido: totalVendido.total,
      carritos_activos: carritosActivos.total,
      carritos_abandonados: carritosAbandonados.total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error dashboard' });
  }
};

module.exports = {
  dashboardResumen
};
