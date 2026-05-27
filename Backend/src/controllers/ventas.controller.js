// ============================================================
//  CAPA: Controller
//  Archivo: ventas.controller.js
// ============================================================

const ventasService = require('../services/ventas.service');

// ── CREAR VENTA ──────────────────────────────────────────────
const createVenta = async (req, res) => {
  try {
    console.log("📝 [Controller] Creando venta");
    const { idPropietario } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    const venta = await ventasService.createVenta(idPropietario, idUsuario, ip);
    return res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: venta,
    });
  } catch (err) {
    console.error("❌ [Controller] Error al crear venta:", err);
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ── AGREGAR DETALLE ──────────────────────────────────────────
const addDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { idProducto, cantidad } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    console.log(`📝 [Controller] Agregando detalle a venta ${id}, producto ${idProducto}, cantidad ${cantidad}`);
    const detalle = await ventasService.addDetalle(id, idProducto, cantidad, idUsuario, ip);
    return res.status(201).json({
      success: true,
      message: 'Producto agregado al detalle exitosamente',
      data: detalle,
    });
  } catch (err) {
    console.error("❌ [Controller] Error al agregar detalle:", err);
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ── CALCULAR TOTAL ───────────────────────────────────────────
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
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ── OBTENER TODAS LAS VENTAS ─────────────────────────────────
const getAllVentas = async (req, res) => {
  try {
    const ventas = await ventasService.getAllVentas();
    return res.status(200).json({
      success: true,
      message: 'Ventas obtenidas exitosamente',
      data: ventas,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ── OBTENER VENTA POR ID ─────────────────────────────────────
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
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ── CONFIRMAR VENTA ──────────────────────────────────────────
const confirmarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    const ip = req.ip || req.connection?.remoteAddress;
    
    const result = await ventasService.confirmarVenta(id, idUsuario, ip);
    
    return res.status(200).json({
      success: true,
      message: result.mensaje,
      data: result,
    });
  } catch (err) {
    console.error("❌ [Controller] Error al confirmar venta:", err);
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ── ANULAR VENTA ─────────────────────────────────────────────
const anularVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    const ip = req.ip || req.connection?.remoteAddress;
    
    const result = await ventasService.anularVenta(id, idUsuario, ip);
    
    return res.status(200).json({
      success: true,
      message: result.mensaje,
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Error interno del servidor' 
    });
  }
};

// ============================================================
//  FACTURACIÓN
// ============================================================

// POST /api/ventas/:id/factura/generar
const generarFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { idPropietario, correoEnvio, requiereFactura } = req.body;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    const ip = req.ip || req.connection?.remoteAddress;
    
    if (!idPropietario) {
      return res.status(400).json({
        success: false,
        message: 'El ID del propietario es obligatorio'
      });
    }
    
    if (requiereFactura === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe indicar si la venta requiere factura (requiereFactura: true/false)'
      });
    }
    
    const result = await ventasService.generarFactura(id, {
      idPropietario,
      correoEnvio,
      requiereFactura
    }, idUsuario, ip);
    
    res.status(201).json({
      success: true,
      message: 'Factura generada exitosamente',
      data: result
    });
    
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// POST /api/ventas/:id/factura/enviar
const enviarFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    const ip = req.ip || req.connection?.remoteAddress;
    
    const result = await ventasService.enviarFactura(id, idUsuario, ip);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// GET /api/ventas/:id/factura
const getFacturaByVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ventasService.getFacturaByVenta(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Esta venta no tiene factura asociada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// ============================================================
//  EXPORTAR
// ============================================================

module.exports = {
  createVenta,
  addDetalle,
  getTotalVenta,
  getAllVentas,
  getVentaById,
  confirmarVenta,
  anularVenta,
  generarFactura,
  enviarFactura,
  getFacturaByVenta
};