// ============================================================
//  CAPA: Repository
//  Archivo: ventas.repository.js
// ============================================================

const connection    = require('../database/connection');
const VentasQueries = require('../models/ventas.models');

// ── VENTAS ───────────────────────────────────────────────────

const createVenta = async (idPropietario) => {
  const [result] = await connection.execute(VentasQueries.CREATE_VENTA, [idPropietario]);
  return { id: result.insertId, Id_Propietario: idPropietario };
};

const findAllVentas = async () => {
  const [rows] = await connection.execute(VentasQueries.FIND_ALL_VENTAS);
  return rows;
};

const findVentaById = async (id) => {
  const [rows] = await connection.execute(VentasQueries.FIND_VENTA_BY_ID, [id]);
  return rows[0] || null;
};

const findDetalleByVenta = async (idVenta) => {
  const [rows] = await connection.execute(VentasQueries.FIND_DETALLE_BY_VENTA, [idVenta]);
  return rows;
};

// ── DETALLE ───────────────────────────────────────────────────

const createDetalle = async (idVenta, idProducto, cantidad, precioUnitario) => {
  const [result] = await connection.execute(VentasQueries.CREATE_DETALLE, [
    idVenta,
    idProducto,
    cantidad,
    precioUnitario,
  ]);
  return { id: result.insertId, Id_Venta: idVenta, Id_Producto: idProducto, Cantidad: cantidad, Precio_Unitario: precioUnitario };
};

// ── STOCK ─────────────────────────────────────────────────────

const getStockProducto = async (idProducto) => {
  const [rows] = await connection.execute(VentasQueries.GET_STOCK_PRODUCTO, [idProducto]);
  return rows[0] || null;
};

const descontarStock = async (idProducto, cantidad) => {
  const [result] = await connection.execute(VentasQueries.DESCONTAR_STOCK, [cantidad, idProducto, cantidad]);
  return result.affectedRows; // 0 = stock insuficiente, 1 = ok
};

// ── TOTAL ─────────────────────────────────────────────────────

const calcularTotal = async (idVenta) => {
  const [rows] = await connection.execute(VentasQueries.CALCULAR_TOTAL, [idVenta]);
  return rows[0]?.Total ?? 0;
};


const anularVenta = async (id) => {
  const [result] = await connection.execute(VentasQueries.ANULAR_VENTA, [id]);
  return result.affectedRows;
};
 
const confirmarVenta = async (id) => {
  const [result] = await connection.execute(VentasQueries.CONFIRMAR_VENTA, [id]);
  return result.affectedRows;
};

module.exports = {
  createVenta,
  findAllVentas,
  findVentaById,
  findDetalleByVenta,
  createDetalle,
  getStockProducto,
  descontarStock,
  calcularTotal,
  anularVenta,
  confirmarVenta
};