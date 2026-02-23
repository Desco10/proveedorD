const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  const { usuario, password } = req.body;

  // Validación básica
  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      message: 'Usuario y contraseña requeridos'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, usuario, password FROM admins WHERE usuario = ? LIMIT 1',
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    const admin = rows[0];

    // Comparación segura con bcrypt
    const passwordValido = await bcrypt.compare(password, admin.password);

    if (!passwordValido) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que exista JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no definido en .env');
      return res.status(500).json({
        ok: false,
        message: 'Error configuración servidor'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: admin.id, usuario: admin.usuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );

    return res.status(200).json({
      ok: true,
      token,
      admin: {
        id: admin.id,
        usuario: admin.usuario
      }
    });

  } catch (error) {
    console.error('loginAdmin error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno servidor'
    });
  }
};

module.exports = { loginAdmin };