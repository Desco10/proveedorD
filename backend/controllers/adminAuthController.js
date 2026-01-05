const pool = require('../config/db');

const loginAdmin = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id, usuario, password FROM admins WHERE usuario = ?',
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: 'Admin no existe' });
    }

    const admin = rows[0];

    // CLAVE PLANA (temporal, como acordamos)
    if (admin.password !== password) {
      return res.status(401).json({ ok: false, message: 'Clave incorrecta' });
    }

    res.json({
      ok: true,
      admin: {
        id: admin.id,
        usuario: admin.usuario
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error login admin' });
  }
};

module.exports = { loginAdmin };
