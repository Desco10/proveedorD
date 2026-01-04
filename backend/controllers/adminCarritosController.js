const pool = require('../config/db');

// Listar todos los carritos (ADMIN)
const listarCarritos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.cliente_id,
        c.estado,
        c.total,
        c.created_at
      FROM carritos c
      ORDER BY c.created_at DESC
    `);

    res.json({
      ok: true,
      carritos: rows
    });

  } catch (error) {
    console.error('Error listarCarritos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al listar carritos'
    });
  }
};

module.exports = {
  listarCarritos
};
