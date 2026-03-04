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

  // Buscar usuario por correo
  const usuario = await usuariosRepository.findUsuarioByCorreo(correo);
  if (!usuario) {
    throw { status: 401, message: 'Credenciales incorrectas' };
  }

  // Verificar que el usuario esté activo
  if (!usuario.activo) {
    throw { status: 403, message: 'Usuario desactivado, contacta al administrador' };
  }

  // Comparar contraseña
  const passwordValida = await bcrypt.compare(contrasena, usuario.Contrasena);
  if (!passwordValida) {
    throw { status: 401, message: 'Credenciales incorrectas' };
  }

  // Generar token JWT
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
  // En REST el logout lo maneja el frontend eliminando el token
  return { message: 'Sesión cerrada exitosamente' };
};

module.exports = { login, logout };