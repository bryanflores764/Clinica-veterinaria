const connection = require('../database/connection');
const Queries = require('../models/tipoConsulta.models');

const create = async (tipo) => {
  const [result] = await connection.execute(Queries.CREATE, [tipo]);
  return { id: result.insertId, Tipo_Consulta: tipo };
};

const findAll = async () => {
  const [rows] = await connection.execute(Queries.FIND_ALL);
  return rows;
};

const findById = async (id) => {
  const [rows] = await connection.execute(Queries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const update = async (id, tipo) => {
  const [result] = await connection.execute(Queries.UPDATE, [tipo, id]);
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await connection.execute(Queries.DELETE, [id]);
  return result.affectedRows;
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove
};