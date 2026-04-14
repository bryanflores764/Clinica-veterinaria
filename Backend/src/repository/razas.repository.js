// ============================================================
//  CAPA: Repository
// ============================================================

const connection = require('../database/connection');
const RazasQueries = require('../models/razas.models');

const createRaza = async (especieId, nombre) => {
  const [result] = await connection.execute(RazasQueries.CREATE, [especieId, nombre]);

  return {
    Id: result.insertId,
    Id_Especie: especieId,
    Nombre_Raza: nombre
  };
};

const findAllRazas = async () => {
  const [rows] = await connection.execute(RazasQueries.FIND_ALL);
  return rows;
};

const findRazaById = async (id) => {
  const [rows] = await connection.execute(RazasQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const findRazaByNombre = async (nombre) => {
  const [rows] = await connection.execute(
    `SELECT * FROM razas WHERE Nombre_Raza = ? LIMIT 1`,
    [nombre]
  );
  return rows[0] || null;
};

const updateRaza = async (id, especieId, nombre) => {
  const [result] = await connection.execute(RazasQueries.UPDATE, [
    especieId,
    nombre,
    id
  ]);
  return result.affectedRows;
};

const deleteRaza = async (id) => {
  const [result] = await connection.execute(RazasQueries.DELETE, [id]);
  return result.affectedRows;
};

module.exports = {
  createRaza,
  findAllRazas,
  findRazaById,
  findRazaByNombre,
  updateRaza,
  deleteRaza
};