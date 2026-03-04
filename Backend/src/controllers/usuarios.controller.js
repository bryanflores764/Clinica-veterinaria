// ============================================================
//  CAPA: Controller
//  Archivo: usuarios.controller.js
// ============================================================

const usuariosService = require('../services/usuarios.service');

const createUsuario = async (req, res) => {
  try {
    const { nombre_usuario, correo, contrasena, rolId } = req.body;
    const usuario = await usuariosService.createUsuario(nombre_usuario, correo, contrasena, rolId);
    return res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: usuario });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await usuariosService.getAllUsuarios();
    return res.status(200).json({ success: true, message: 'Usuarios obtenidos exitosamente', data: usuarios });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, correo, rolId } = req.body;
    const updated = await usuariosService.updateUsuario(id, nombre_usuario, correo, rolId);
    return res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente', data: updated });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

const toggleActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await usuariosService.toggleActivo(id);
    return res.status(200).json({ success: true, message: `Usuario ${updated.activo ? 'activado' : 'desactivado'} exitosamente`, data: updated });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

module.exports = { createUsuario, getAllUsuarios, updateUsuario, toggleActivo };