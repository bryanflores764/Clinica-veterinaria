// ============================================================
//  CAPA: Repository
//  Archivo: usuarios.repository.js
// ============================================================

const connection = require('../database/connection');
const UsuariosQueries = require('../models/usuarios.model');

const createUsuario = async (nombre, correo, contrasena, rolId) => {
  const [result] = await connection.execute(UsuariosQueries.CREATE, [nombre, correo, contrasena, rolId]);
  return { id: result.insertId, Nombre_Usuario: nombre, Correo: correo, RolId: rolId };
};

const findAllUsuarios = async () => {
  const [rows] = await connection.execute(UsuariosQueries.FIND_ALL);
  return rows;
};

const findUsuarioById = async (id) => {
  const [rows] = await connection.execute(UsuariosQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const findUsuarioByCorreo = async (correo) => {
  const [rows] = await connection.execute(UsuariosQueries.FIND_BY_CORREO, [correo]);
  return rows[0] || null;
};

const updateUsuario = async (id, nombre, correo, rolId, contrasena) => {
  const [result] = await connection.execute(UsuariosQueries.UPDATE, [nombre, correo, rolId, contrasena, id]);
  return result.affectedRows;
};

const toggleActivo = async (id) => {
  const [result] = await connection.execute(UsuariosQueries.TOGGLE_ACTIVO, [id]);
  return result.affectedRows;
};

const deleteUsuario = async (id) => {
  const [result] = await connection.execute(UsuariosQueries.DELETE, [id]);
  return result.affectedRows;
};

const findUsuarioByNombre = async (nombre) => {
  const [rows] = await connection.execute(UsuariosQueries.FIND_BY_NOMBRE, [nombre]);
  return rows[0] || null;
};

// Y agrégalo al module.exports
module.exports = {
  createUsuario,
  findAllUsuarios,
  findUsuarioById,
  findUsuarioByCorreo,
  findUsuarioByNombre, // ← nueva
  updateUsuario,
  toggleActivo,
  deleteUsuario,
};

