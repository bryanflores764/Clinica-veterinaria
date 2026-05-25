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

// ✅ Verifica si es administrador (RolId = 1)
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.usuario.RolId !== 1) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
  });
};

// ✅ NUEVO: Verifica si es veterinario (RolId = 2)
const verifyVeterinario = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.usuario.RolId !== 2) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de veterinario' });
    }
    next();
  });
};

// ✅ NUEVO: Verifica si es recepcionista (RolId = 3)
const verifyRecepcionista = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.usuario.RolId !== 3) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de recepcionista' });
    }
    next();
  });
};

module.exports = { 
  verifyToken, 
  verifyAdmin,
  verifyVeterinario,    // ✅ NUEVO
  verifyRecepcionista    // ✅ NUEVO
};