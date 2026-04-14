// ============================================================
//  CAPA: Repository
//  Archivo: propietarios.repository.js
// ============================================================

const connection = require('../database/connection');
const PropietariosQueries = require('../models/propetario.model');

const createPropietario = async (nombre, telefono, correo, direccion) => {
  const [result] = await connection.execute(PropietariosQueries.CREATE, [
    nombre,
    telefono,
    correo,
    direccion
  ]);

  return {
    id: result.insertId,
    Nombre: nombre,
    Telefono: telefono,
    Correo: correo,
    Direccion: direccion,
    Estado: 'activo'
  };
};

const findAllPropietarios = async () => {
  const [rows] = await connection.execute(PropietariosQueries.FIND_ALL);
  return rows;
};

const findPropietarioById = async (id) => {
  const [rows] = await connection.execute(PropietariosQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const findPropietarioByCorreo = async (correo) => {
  const [rows] = await connection.execute(
    `SELECT * FROM propietarios WHERE Correo = ? LIMIT 1`,
    [correo]
  );
  return rows[0] || null;
};

const updatePropietario = async (id, nombre, telefono, correo, direccion) => {
  const [result] = await connection.execute(PropietariosQueries.UPDATE, [
    nombre,
    telefono,
    correo,
    direccion,
    id
  ]);
  return result.affectedRows;
};

const deletePropietario = async (id) => {
  const [result] = await connection.execute(PropietariosQueries.DELETE_BY_ID, [id]);
  return result.affectedRows;
};

// 🔥 Toggle Estado
const toggleEstado = async (id) => {
  const [result] = await connection.execute(`
    UPDATE propietarios
    SET Estado = CASE 
      WHEN Estado = 'activo' THEN 'inactivo'
      ELSE 'activo'
    END
    WHERE id = ?
  `, [id]);

  return result.affectedRows;
};

module.exports = {
  createPropietario,
  findAllPropietarios,
  findPropietarioById,
  findPropietarioByCorreo,
  updatePropietario,
  deletePropietario,
  toggleEstado
};