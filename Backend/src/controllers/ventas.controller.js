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
    const venta = await ventasService.createVenta(idPropietario);
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
    console.log(`📝 [Controller] Agregando detalle a venta ${id}, producto ${idProducto}, cantidad ${cantidad}`);
    const detalle = await ventasService.addDetalle(id, idProducto, cantidad);
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

// ── CONFIRMAR VENTA (con usuario del token) ──────────────────
const confirmarVenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("📝 [Controller] Confirmar venta:", id);
    console.log("📝 [Controller] req.usuario:", req.usuario);
    
    // ✅ Obtener ID del usuario desde el token
    const idUsuario = req.usuario?.id || req.usuario?.Id || req.usuario?.usuarioId;
    
    console.log("📝 [Controller] ID Usuario obtenido:", idUsuario);
    
    if (!idUsuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const result = await ventasService.confirmarVenta(id, idUsuario);
    console.log("✅ [Controller] Venta confirmada:", result);
    
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

// ── ANULAR VENTA (con usuario del token) ─────────────────────
const anularVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.usuario?.id || req.usuario?.Id;
    
    if (!idUsuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    // ✅ No leer nada del body, solo el ID de la URL
    const result = await ventasService.anularVenta(id, idUsuario);
    
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

module.exports = {
  createVenta,
  addDetalle,
  getTotalVenta,
  getAllVentas,
  getVentaById,
  confirmarVenta,
  anularVenta,
};