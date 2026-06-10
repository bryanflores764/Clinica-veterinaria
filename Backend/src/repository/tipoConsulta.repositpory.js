const connection = require('../database/connection');
const Queries = require('../models/tipoConsulta.models');

const create = async (tipo, descripcion, precio) => {
  const [result] = await connection.execute(Queries.CREATE, [tipo, descripcion, precio]);
  return { id: result.insertId, Tipo_Consulta: tipo, Descripcion: descripcion, Precio: precio };
};

const findAll = async () => {
  const [rows] = await connection.execute(Queries.FIND_ALL);
  return rows;
};

const findById = async (id) => {
  const [rows] = await connection.execute(Queries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const findByName = async (tipo) => {
  const [rows] = await connection.execute(Queries.FIND_BY_NAME, [tipo]);
  return rows[0] || null;
};

const update = async (id, tipo, descripcion, precio) => {
  const [result] = await connection.execute(Queries.UPDATE, [tipo, descripcion, precio, id]);
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await connection.execute(Queries.DELETE, [id]);
  return result.affectedRows;
};

module.exports = { create, findAll, findById, findByName, update, remove };