const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: 'Token requerido'
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // guardamos info del admin
    next();

  } catch (error) {
    return res.status(403).json({
      ok: false,
      message: 'Token no válido o expirado'
    });
  }
};

module.exports = verifyToken;