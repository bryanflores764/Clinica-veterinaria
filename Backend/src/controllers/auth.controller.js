// ============================================================
//  CAPA: Controller
//  Archivo: auth.controller.js
// ============================================================

const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const result = await authService.login(correo, contrasena);
    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor',
    });
  }
};

const logout = (req, res) => {
  try {
    const result = authService.logout();
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

module.exports = { login, logout };