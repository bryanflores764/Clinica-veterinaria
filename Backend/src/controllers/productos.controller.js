// ============================================================
//  CAPA: Controller
//  Archivo: productos.controller.js
// ============================================================

const productosService = require('../services/productos.service');

// #209 — POST /api/productos
const createProducto = async (req, res) => {
  try {
    const { idCategoria, nombre_producto, descripcion, precio, stock } = req.body;
    const producto = await productosService.createProducto(idCategoria, nombre_producto, descripcion, precio, stock);
    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #223 — GET /api/productos
const getAllProductos = async (req, res) => {
  try {
    const productos = await productosService.getAllProductos();
    return res.status(200).json({
      success: true,
      message: 'Productos obtenidos exitosamente',
      data: productos,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #236 — PUT /api/productos/:id
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { idCategoria, nombre_producto, descripcion, precio } = req.body;
    const updated = await productosService.updateProducto(id, idCategoria, nombre_producto, descripcion, precio);
    return res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updated,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// #250 — POST /api/productos/:id/stock
const ajustarStock = async (req, res) => {
  try {


    const { id } = req.params;
    const { tipo, cantidad, idUsuario } = req.body;

    const result = await productosService.ajustarStock(
      id,
      tipo,
      cantidad,
      idUsuario
    );

    return res.status(200).json({
      success: true,
      message: `Stock actualizado correctamente`,
      data: result,
    });

  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  }
};
// #265 — PATCH /api/productos/:id/desactivar
const desactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productosService.desactivarProducto(id);
    return res.status(200).json({
      success: true,
      message: result.mensaje,
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};

// GET /api/productos/:id/movimientos
const getMovimientos = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productosService.getMovimientos(id);
    return res.status(200).json({
      success: true,
      message: 'Movimientos obtenidos exitosamente',
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor' });
  }
};




module.exports = {
  createProducto,
  getAllProductos,
  updateProducto,
  ajustarStock,
  desactivarProducto,
  getMovimientos,
};