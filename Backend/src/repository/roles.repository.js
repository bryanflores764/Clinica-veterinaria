// ============================================================
//  CAPA: Repository
//  Archivo: roles.repository.js
//
//  Responsabilidad:
//    • Ejecuta los queries definidos en el model.
//    • Recibe y devuelve datos crudos de la BD.
// ============================================================

const connection = require('../database/connection');
const RolesQueries = require('../models/roles.model');

const createRole = async (nombre_rol) => {
  const [result] = await connection.execute(RolesQueries.CREATE, [nombre_rol]);
  return { id: result.insertId, Nombre_Rol: nombre_rol };
};

const findAllRoles = async () => {
  const [rows] = await connection.execute(RolesQueries.FIND_ALL);
  return rows;
};

const findRoleById = async (id) => {
  const [rows] = await connection.execute(RolesQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const findRoleByName = async (nombre_rol) => {
  const [rows] = await connection.execute(RolesQueries.FIND_BY_NAME, [nombre_rol]);
  return rows[0] || null;
};

const updateRole = async (id, nombre_rol) => {
  const [result] = await connection.execute(RolesQueries.UPDATE, [nombre_rol, id]);
  return result.affectedRows;
};

module.exports = {
  createRole,
  findAllRoles,
  findRoleById,
  findRoleByName,
  updateRole,
};