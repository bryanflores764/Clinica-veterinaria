// ============================================================
//  CONTROLLER: ventas.controller.js
// ============================================================

const ventasService = require('../services/ventas.service');

// ── VENTAS CRUD ──────────────────────────────────────────────
const createVenta = async (req, res) => {
  try {
    const { idPropietario } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    const venta = await ventasService.createVenta(idPropietario, idUsuario, ip);
    return res.status(201).json({ success: true, message: 'Venta creada exitosamente', data: venta });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getAllVentas = async (req, res) => {
  try {
    const ventas = await ventasService.getAllVentas();
    return res.status(200).json({ success: true, message: 'Ventas obtenidas exitosamente', data: ventas });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await ventasService.getVentaById(id);
    return res.status(200).json({ success: true, message: 'Venta obtenida exitosamente', data: venta });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getTotalVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ventasService.getTotalVenta(id);
    return res.status(200).json({ success: true, message: 'Total calculado exitosamente', data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const confirmarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    const { metodoPago, montoRecibido } = req.body;

    const result = await ventasService.confirmarVenta(id, idUsuario, ip, { metodoPago, montoRecibido });
    return res.status(200).json({ success: true, message: result.mensaje, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const anularVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    const result = await ventasService.anularVenta(id, idUsuario, ip);
    return res.status(200).json({ success: true, message: result.mensaje, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// ── PRODUCTOS EN VENTAS ───────────────────────────────────────
const addDetalleProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { idProducto, cantidad } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;

    const detalle = await ventasService.addDetalleProducto(id, idProducto, cantidad, idUsuario, ip);
    return res.status(201).json({ success: true, message: 'Producto agregado exitosamente', data: detalle });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// ── SERVICIOS EN VENTAS ───────────────────────────────────────
const getAllServicios = async (req, res) => {
  try {
    const servicios = await ventasService.getAllServicios();
    return res.status(200).json({ success: true, message: 'Servicios obtenidos exitosamente', data: servicios });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const addDetalleServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { idServicio, cantidad } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;

    const detalle = await ventasService.addDetalleServicio(id, idServicio, cantidad, idUsuario, ip);
    return res.status(201).json({ success: true, message: 'Servicio agregado exitosamente', data: detalle });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// ── FACTURACIÓN ───────────────────────────────────────────────
const generarFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { correoEnvio, requiereFactura } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;

    const result = await ventasService.generarFactura(id, { correoEnvio, requiereFactura }, idUsuario, ip);
    res.status(201).json({ success: true, message: 'Factura generada exitosamente', data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const enviarFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id || 1;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    const result = await ventasService.enviarFactura(id, idUsuario, ip);
    res.status(200).json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getFacturaByVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ventasService.getFacturaByVenta(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Esta venta no tiene factura asociada' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// ── ALIAS PARA COMPATIBILIDAD ─────────────────────────────────
const addDetalle = addDetalleProducto;

// ── EXPORTAR ──────────────────────────────────────────────────
module.exports = {
  createVenta,
  getAllVentas,
  getVentaById,
  getTotalVenta,
  confirmarVenta,
  anularVenta,
  addDetalleProducto,
  addDetalle,
  getAllServicios,
  addDetalleServicio,
  generarFactura,
  enviarFactura,
  getFacturaByVenta,
};