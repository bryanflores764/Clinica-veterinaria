// ============================================================
//  CAPA: Service
//  Archivo: usuarios.service.js
// ============================================================

const bcrypt = require('bcryptjs');
const usuariosRepository = require('../repository/usuarios.repository');

const createUsuario = async (nombre, correo, contrasena, rolId) => {
  if (!nombre || !correo || !contrasena || !rolId) {
    throw { status: 400, message: 'Todos los campos son obligatorios' };
  }

  const existing = await usuariosRepository.findUsuarioByCorreo(correo);
  if (existing) {
    throw { status: 409, message: `El correo "${correo}" ya está registrado` };
  }

  const hash = await bcrypt.hash(contrasena, 10);
  return await usuariosRepository.createUsuario(nombre, correo, hash, rolId);
};

const getAllUsuarios = async () => {
  const usuarios = await usuariosRepository.findAllUsuarios();
  if (!usuarios.length) {
    throw { status: 404, message: 'No hay usuarios registrados' };
  }
  return usuarios;
};

const updateUsuario = async (id, nombre, correo, rolId, contrasena) => {
  if (!nombre || !correo || !rolId) {
    throw { status: 400, message: 'Nombre, correo y rol son obligatorios' };
  }

  const usuario = await usuariosRepository.findUsuarioById(id);
  if (!usuario) {
    throw { status: 404, message: `No existe un usuario con id ${id}` };
  }

  const duplicate = await usuariosRepository.findUsuarioByCorreo(correo);
  if (duplicate && duplicate.id !== parseInt(id)) {
    throw { status: 409, message: `El correo "${correo}" ya está en uso` };
  }

  // Si viene contraseña la encripta, si no usa la actual
  let contrasenaFinal = usuario.Contrasena;
  if (contrasena && contrasena.trim() !== '') {
    contrasenaFinal = await bcrypt.hash(contrasena, 10);
  }

  await usuariosRepository.updateUsuario(id, nombre, correo, rolId, contrasenaFinal);
  return { id, Nombre_Usuario: nombre, Correo: correo, RolId: rolId };
};

const toggleActivo = async (id) => {
  const usuario = await usuariosRepository.findUsuarioById(id);
  if (!usuario) {
    throw { status: 404, message: `No existe un usuario con id ${id}` };
  }

  await usuariosRepository.toggleActivo(id);
  const updated = await usuariosRepository.findUsuarioById(id);
  return updated;
};

const deleteUsuario = async (id) => {
  const usuario = await usuariosRepository.findUsuarioById(id);
  if (!usuario) {
    throw { status: 404, message: `No existe un usuario con id ${id}` };
  }

  await usuariosRepository.deleteUsuario(id);
  return { id, mensaje: `Usuario "${usuario.Nombre_Usuario}" eliminado exitosamente` };
};

const getVeterinarios = async () => {
  const vets = await usuariosRepository.findVeterinarios();

  if (!vets.length) {
    throw { status: 404, message: 'No hay veterinarios registrados' };
  }

  return vets;
};
module.exports = { createUsuario, getAllUsuarios, updateUsuario, toggleActivo, deleteUsuario,getVeterinarios };