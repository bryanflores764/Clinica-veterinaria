const connection = require('../database/connection');
const Queries = require('../models/estadocita.models');

const create = async (estado) => {
  const [result] = await connection.execute(Queries.CREATE, [estado]);
  return { id: result.insertId, Estado: estado };
};

const findAll = async () => {
  const [rows] = await connection.execute(Queries.FIND_ALL);
  return rows;
};

const findById = async (id) => {
  const [rows] = await connection.execute(Queries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const update = async (id, estado) => {
  const [result] = await connection.execute(Queries.UPDATE, [estado, id]);
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