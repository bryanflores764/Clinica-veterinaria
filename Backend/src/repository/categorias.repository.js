const connection = require('../database/connection');
const CategoriasQueries = require('../models/categorias.models');

const createCategoria = async (nombre) => {
  const [result] = await connection.execute(CategoriasQueries.CREATE, [nombre]);
  return { id: result.insertId, Nombre_Categoria: nombre };
};

const findAll = async () => {
  const [rows] = await connection.execute(CategoriasQueries.FIND_ALL);
  return rows;
};

const findById = async (id) => {
  const [rows] = await connection.execute(CategoriasQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const updateCategoria = async (id, nombre) => {
  const [result] = await connection.execute(CategoriasQueries.UPDATE, [nombre, id]);
  return result.affectedRows;
};

const deleteCategoria = async (id) => {
  const [result] = await connection.execute(CategoriasQueries.DELETE, [id]);
  return result.affectedRows;
};

module.exports = {
  createCategoria,
  findAll,
  findById,
  updateCategoria,
  deleteCategoria
};