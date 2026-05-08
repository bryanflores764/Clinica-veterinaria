// ============================================================
//  CAPA: Service
//  Archivo: productos.service.js
// ============================================================

const productosRepository = require('../repository/productos.repositori');

// ── #209-#212  Crear producto ─────────────────────────────────
const createProducto = async (idCategoria, nombre, descripcion, precio, stock) => {
  // #211 — Validar campos vacíos
  if (!idCategoria || !nombre || !precio) {
    throw { status: 400, message: 'Categoría, nombre y precio son obligatorios' };
  }

  // #212 — Validar precio y stock
  if (precio <= 0) {
    throw { status: 400, message: 'El precio debe ser mayor a 0' };
  }

  if (stock !== undefined && stock < 0) {
    throw { status: 400, message: 'El stock no puede ser negativo' };
  }

  const producto = await productosRepository.createProducto(
    idCategoria, nombre, descripcion || null, precio, stock || 0
  );

  return producto;
};

// ── #223-#225  Obtener productos activos ──────────────────────
const getAllProductos = async () => {
  const productos = await productosRepository.findAll();
  return productos;
};

// ── #236-#240  Actualizar producto ────────────────────────────
const updateProducto = async (id, idCategoria, nombre, descripcion, precio) => {
  // #238 — Validar datos recibidos
  if (!idCategoria || !nombre || !precio) {
    throw { status: 400, message: 'Categoría, nombre y precio son obligatorios' };
  }

  if (precio <= 0) {
    throw { status: 400, message: 'El precio debe ser mayor a 0' };
  }

  // #237 — Buscar producto por ID
  const producto = await productosRepository.findById(id);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${id}` };
  }

  // #241-#242 — Actualizar manteniendo el mismo ID
  await productosRepository.updateProducto(id, idCategoria, nombre, descripcion || null, precio);
  return { id, Nombre_Producto: nombre, Descripcion: descripcion, Precio: precio };
};

// ── #250-#254  Ajuste de stock ────────────────────────────────
const ajustarStock = async (id, tipo, cantidad, idUsuario) => {
  // #251 — Validar tipo y cantidad
  if (!tipo || !cantidad || !idUsuario) {
    throw { status: 400, message: 'Tipo, cantidad y usuario son obligatorios' };
  }

  if (!['entrada', 'salida'].includes(tipo)) {
    throw { status: 400, message: 'El tipo debe ser "entrada" o "salida"' };
  }

  if (cantidad <= 0) {
    throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
  }

  // #252 — Consultar stock actual
  const producto = await productosRepository.findById(id);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${id}` };
  }

  // #268 — Bloquear productos inactivos
  if (producto.Estado === 'inactivo') {
    throw { status: 409, message: `El producto "${producto.Nombre_Producto}" está inactivo` };
  }

  // #253 — Validar disponibilidad si es salida
  if (tipo === 'salida' && producto.Stock < cantidad) {
    throw {
      status: 409,
      message: `Stock insuficiente para "${producto.Nombre_Producto}". Disponible: ${producto.Stock}`,
    };
  }

  const stockAntes   = producto.Stock;
  const movimiento   = tipo === 'entrada' ? cantidad : -cantidad;
  const stockDespues = stockAntes + movimiento;

  // #254 — Actualizar stock
  await productosRepository.updateStock(id, movimiento);

  // #257 — Registrar movimiento (sin venta asociada = ajuste manual)
  await productosRepository.createMovimiento(id, null, idUsuario, tipo, cantidad, stockAntes, stockDespues);

  return {
    id,
    Nombre_Producto: producto.Nombre_Producto,
    Stock_Antes:   stockAntes,
    Stock_Despues: stockDespues,
    Tipo: tipo,
    Cantidad: cantidad,
  };
};

// ── #265-#268  Desactivar producto (soft delete) ──────────────
const desactivarProducto = async (id) => {
  const producto = await productosRepository.findById(id);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${id}` };
  }
  if (producto.Estado === 'inactivo') {
    throw { status: 409, message: `El producto "${producto.Nombre_Producto}" ya está inactivo` };
  }
  await productosRepository.desactivarProducto(id);
  return { id, mensaje: `Producto "${producto.Nombre_Producto}" desactivado exitosamente` };
};

// ── Activar producto ──────────────────────────────────────────
const activarProducto = async (id) => {
  const producto = await productosRepository.findById(id);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${id}` };
  }
  if (producto.Estado === 'activo') {
    throw { status: 409, message: `El producto "${producto.Nombre_Producto}" ya está activo` };
  }
  await productosRepository.activarProducto(id);
  return { id, mensaje: `Producto "${producto.Nombre_Producto}" activado exitosamente` };
};

// ── Historial de movimientos ──────────────────────────────────
const getMovimientos = async (id) => {
  const producto = await productosRepository.findById(id);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${id}` };
  }

  const movimientos = await productosRepository.findMovimientosByProducto(id);
  return { producto: producto.Nombre_Producto, movimientos };
};

module.exports = {
  createProducto,
  getAllProductos,
  updateProducto,
  ajustarStock,
  desactivarProducto,
  activarProducto,
  getMovimientos,
};