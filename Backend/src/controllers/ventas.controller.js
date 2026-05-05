// ============================================================
//  CAPA: Controller
//  Archivo: ventas.controller.js
// ============================================================

const ventasService = require('../services/ventas.service');

// #278 — POST /api/ventas
const createVenta = async (req, res) => {
  try {
    const { idPropietario } = req.body;
    const venta = await ventasService.createVenta(idPropietario);
    return res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: venta,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #292 — POST /api/ventas/:id/detalle
const addDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { idProducto, cantidad } = req.body;
    const detalle = await ventasService.addDetalle(id, idProducto, cantidad);
    return res.status(201).json({
      success: true,
      message: 'Producto agregado al detalle exitosamente',
      data: detalle,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #307 — GET /api/ventas/:id/total
const getTotalVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ventasService.getTotalVenta(id);
    return res.status(200).json({
      success: true,
      message: 'Total calculado exitosamente',
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #320 — GET /api/ventas
const getAllVentas = async (req, res) => {
  try {
    const ventas = await ventasService.getAllVentas();
    return res.status(200).json({
      success: true,
      message: 'Ventas obtenidas exitosamente',
      data: ventas,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #321 — GET /api/ventas/:id
const getVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await ventasService.getVentaById(id);
    return res.status(200).json({
      success: true,
      message: 'Venta obtenida exitosamente',
      data: venta,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #333 — PATCH /api/ventas/:id/anular
const anularVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ventasService.anularVenta(id);
    return res.status(200).json({
      success: true,
      message: result.mensaje,
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #346 — PATCH /api/ventas/:id/confirmar
const confirmarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ventasService.confirmarVenta(id);
    return res.status(200).json({
      success: true,
      message: result.mensaje,
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

module.exports = {
  createVenta,
  addDetalle,
  getTotalVenta,
  getAllVentas,
  getVentaById,
  anularVenta,
  confirmarVenta,
};