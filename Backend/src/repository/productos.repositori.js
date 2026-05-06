// ============================================================
//  CAPA: Repository
//  Archivo: productos.repository.js
// ============================================================

const connection       = require('../database/connection');
const ProductosQueries = require('../models/productos.models');

// ── PRODUCTOS ─────────────────────────────────────────────────

const createProducto = async (idCategoria, nombre, descripcion, precio, stock) => {
  const [result] = await connection.execute(ProductosQueries.CREATE, [
    idCategoria, nombre, descripcion, precio, stock,
  ]);
  return { id: result.insertId, Nombre_Producto: nombre, Estado: 'activo' };
};

const findAllActivos = async () => {
  const [rows] = await connection.execute(ProductosQueries.FIND_ALL_ACTIVOS);
  return rows;
};

const findAll = async () => {
  const [rows] = await connection.execute(ProductosQueries.FIND_ALL);
  return rows;
};

const findById = async (id) => {
  const [rows] = await connection.execute(ProductosQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const updateProducto = async (id, idCategoria, nombre, descripcion, precio) => {
  const [result] = await connection.execute(ProductosQueries.UPDATE, [
    idCategoria, nombre, descripcion, precio, id,
  ]);
  return result.affectedRows;
};

const desactivarProducto = async (id) => {
  const [result] = await connection.execute(ProductosQueries.DESACTIVAR, [id]);
  return result.affectedRows;
};

const activarProducto = async (id) => {
  const [result] = await connection.execute(ProductosQueries.ACTIVAR, [id]);
  return result.affectedRows;
};

// ── STOCK ─────────────────────────────────────────────────────

const updateStock = async (id, cantidad) => {
  // cantidad puede ser negativa (salida) o positiva (entrada)
  const [result] = await connection.execute(ProductosQueries.UPDATE_STOCK, [cantidad, id]);
  return result.affectedRows;
};

// ── MOVIMIENTOS ───────────────────────────────────────────────

const createMovimiento = async (idProducto, idVenta, idUsuario, tipo, cantidad, stockAntes, stockDespues) => {
  const [result] = await connection.execute(ProductosQueries.CREATE_MOVIMIENTO, [
    idProducto, idVenta, idUsuario, tipo, cantidad, stockAntes, stockDespues,
  ]);
  return { id: result.insertId };
};

const findMovimientosByProducto = async (idProducto) => {
  const [rows] = await connection.execute(ProductosQueries.FIND_MOVIMIENTOS_BY_PRODUCTO, [idProducto]);
  return rows;
};

module.exports = {
  createProducto,
  findAllActivos,
  findAll,
  findById,
  updateProducto,
  desactivarProducto,
  activarProducto,
  updateStock,
  createMovimiento,
  findMovimientosByProducto,
};


