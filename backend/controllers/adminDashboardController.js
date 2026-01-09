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





const metricasDashboard = async (req, res) => {
  try {

    const [carritos] = await pool.query(`
      SELECT estado_admin, created_at
      FROM carritos
    `);

    const ahora = new Date();

    let total = carritos.length;
    let enviados = 0;
    let abandonados = 0;
    let pendientes = 0;

    carritos.forEach(carrito => {
      const creado = new Date(carrito.created_at);
      const horas = (ahora - creado) / (1000 * 60 * 60);

      if (carrito.estado_admin === 'enviado' || carrito.estado_admin === 'cerrado') {
  enviados++;
  return;
}

if (carrito.estado_admin === 'abierto') {
  if (horas < 8) {
    pendientes++;
  } else if (horas >= 12) {
    abandonados++;
  }
}

    });

    res.json({
      ok: true,
      metricas: {
        total,
        enviados,
        abandonados,
        pendientes
      }
    });

  } catch (error) {
    console.error("metricasDashboard:", error);
    res.status(500).json({
      ok: false,
      message: "Error al cargar métricas"
    });
  }
};


module.exports = {
  dashboardResumen,
  metricasDashboard
};



