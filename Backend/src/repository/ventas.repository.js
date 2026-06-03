// ============================================================
//  CAPA: Repository
//  Archivo: ventas.repository.js
// ============================================================

const connection   = require('../database/connection');
const VentasQueries = require('../models/ventas.models');

// ── VENTAS ────────────────────────────────────────────────────

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
    idVenta, idProducto, cantidad, precioUnitario,
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
  return result.affectedRows;
};

const actualizarStock = async (idProducto, nuevoStock) => {
  const [result] = await connection.execute(VentasQueries.ACTUALIZAR_STOCK, [nuevoStock, idProducto]);
  return result.affectedRows;
};

// ── MOVIMIENTOS ───────────────────────────────────────────────

const registrarMovimientoStock = async (idProducto, idVenta, idUsuario, tipo, cantidad, stockAntes, stockDespues) => {
  const [result] = await connection.execute(VentasQueries.REGISTRAR_MOVIMIENTO, [
    idProducto, idVenta, idUsuario, tipo, cantidad, stockAntes, stockDespues,
  ]);
  return result.insertId;
};

// ── TOTAL ─────────────────────────────────────────────────────

const calcularTotal = async (idVenta) => {
  const [rows] = await connection.execute(VentasQueries.CALCULAR_TOTAL, [idVenta]);
  return rows[0]?.Total ?? 0;
};

// ── ESTADOS ───────────────────────────────────────────────────

/**
 * Confirma la venta y guarda de una sola vez: total, método de pago,
 * monto recibido y cambio.
 */
const confirmarVentaConPago = async (idVenta, total, metodoPago, montoRecibido, cambio) => {
  const [result] = await connection.execute(VentasQueries.CONFIRMAR_VENTA_CON_PAGO, [
    total, metodoPago, montoRecibido, cambio, idVenta,
  ]);
  return result.affectedRows;
};

const anularVentaConDatos = async (idVenta, idUsuario) => {
  const [result] = await connection.execute(VentasQueries.ANULAR_VENTA, [idUsuario, idVenta]);
  return result.affectedRows;
};

// ── FACTURACIÓN ───────────────────────────────────────────────

const getFacturaByVenta = async (idVenta) => {
  const [rows] = await connection.execute(VentasQueries.GET_FACTURA_BY_VENTA, [idVenta]);
  return rows[0] || null;
};

const createFactura = async (data) => {
  const {
    idVenta, idCliente, idTipoDocumento,
    numeroControl, codigoGeneracion,
    rutaComprobante, identificadorComprobante,
    estadoEnvio, correoDestino,
  } = data;

  const [result] = await connection.execute(VentasQueries.CREATE_FACTURA, [
    idVenta, idCliente, idTipoDocumento,
    numeroControl, codigoGeneracion,
    rutaComprobante || null, identificadorComprobante || null,
    estadoEnvio, correoDestino || null,
  ]);
  return { id: result.insertId };
};

const updateFacturaEnvio = async (idVenta, estadoEnvio, fechaEnvio, mensajeError) => {
  const [result] = await connection.execute(VentasQueries.UPDATE_FACTURA_ENVIO, [
    estadoEnvio, fechaEnvio, mensajeError || null, idVenta,
  ]);
  return result.affectedRows;
};

const updateVentaFactura = async (idVenta, data) => {
  const [result] = await connection.execute(VentasQueries.UPDATE_VENTA_FACTURA, [
    data.requiere_factura, data.correo_factura, idVenta,
  ]);
  return result.affectedRows;
};

const findClienteFacturacionByPropietario = async (idPropietario) => {
  const [rows] = await connection.execute(
    'SELECT * FROM clientesfacturacion WHERE Id_Propietario = ? LIMIT 1',
    [idPropietario]
  );
  return rows[0] || null;
};

const findClienteFacturacionById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT * FROM clientesfacturacion WHERE Id = ?',
    [id]
  );
  return rows[0] || null;
};

const findPropietarioById = async (id) => {
  const [rows] = await connection.execute(
    'SELECT Id, Nombre, Correo, Telefono FROM propietarios WHERE Id = ?',
    [id]
  );
  return rows[0] || null;
};

const getUltimoCodigoFactura = async () => {
  const [rows] = await connection.execute(
    "SELECT NumeroControl FROM facturaelectronica WHERE NumeroControl LIKE 'VC%' ORDER BY Id DESC LIMIT 1"
  );
  return rows[0] || null;
};

// ── EXPORTAR ──────────────────────────────────────────────────

module.exports = {
  createVenta,
  findAllVentas,
  findVentaById,
  findDetalleByVenta,
  createDetalle,
  getStockProducto,
  descontarStock,
  actualizarStock,
  registrarMovimientoStock,
  calcularTotal,
  confirmarVentaConPago,
  anularVentaConDatos,
  getFacturaByVenta,
  createFactura,
  updateFacturaEnvio,
  updateVentaFactura,
  findClienteFacturacionByPropietario,
  findClienteFacturacionById,
  findPropietarioById,
  getUltimoCodigoFactura
};