const verifyAdmin = (req, res, next) => {
  const usuario = req.usuario;

  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: "No autorizado: debes iniciar sesión",
    });
  }

  if (usuario.RolId !== 1) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado: se requiere rol de administrador",
    });
  }

  next();
};

module.exports = { verifyAdmin };