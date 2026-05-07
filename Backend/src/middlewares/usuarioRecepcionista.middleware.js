const jwt = require('jsonwebtoken');

// ✅ Verifica el token y pone el usuario en req.usuario
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'No autorizado: token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
    req.usuario = decoded; // { id, RolId, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

// ✅ Ahora usa verifyToken internamente
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.usuario.RolId !== 1) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin };