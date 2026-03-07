// ============================================================
//  CAPA: Service
//  Archivo: auth.service.js
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repository/usuarios.repository');

const login = async (correo, contrasena) => {
  if (!correo || !contrasena) {
    throw { status: 400, message: 'Correo y contraseña son obligatorios' };
  }

  const usuario = await usuariosRepository.findUsuarioByCorreo(correo);
  if (!usuario) {
    throw { status: 401, message: 'Credenciales incorrectas' };
  }

  if (!usuario.activo) {
    throw { status: 403, message: 'Usuario desactivado, contacta al administrador' };
  }

  const passwordValida = await bcrypt.compare(contrasena, usuario.Contrasena);
  if (!passwordValida) {
    throw { status: 401, message: 'Credenciales incorrectas' };
  }

  const token = jwt.sign(
    { id: usuario.id, RolId: usuario.RolId },
    process.env.JWT_SECRET || 'secreto_temporal',
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      Nombre_Usuario: usuario.Nombre_Usuario,
      Correo: usuario.Correo,
      RolId: usuario.RolId,
    },
  };
};

const logout = () => {
  return { message: 'Sesión cerrada exitosamente' };
};

module.exports = { login, logout };