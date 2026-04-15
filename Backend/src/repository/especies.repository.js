const connection = require('../database/connection');
const EspeciesQueries = require('../models/especies.models');

const createEspecie = async (nombre) => {
  const [result] = await connection.execute(EspeciesQueries.CREATE, [nombre]);
  return { Id: result.insertId, Nombre_Especie: nombre };
};

const findAllEspecies = async () => {
  const [rows] = await connection.execute(EspeciesQueries.FIND_ALL);
  return rows;
};

const findEspecieById = async (id) => {
  const [rows] = await connection.execute(EspeciesQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const findEspecieByNombre = async (nombre) => {
  const [rows] = await connection.execute(
    `SELECT * FROM especies WHERE Nombre_Especie = ? LIMIT 1`,
    [nombre]
  );
  return rows[0] || null;
};

const updateEspecie = async (id, nombre) => {
  const [result] = await connection.execute(EspeciesQueries.UPDATE, [nombre, id]);
  return result.affectedRows;
};

const deleteEspecie = async (id) => {
  const [result] = await connection.execute(EspeciesQueries.DELETE, [id]);
  return result.affectedRows;
};

module.exports = {
  createEspecie,
  findAllEspecies,
  findEspecieById,
  findEspecieByNombre,
  updateEspecie,
  deleteEspecie
};