// ============================================================
//  CAPA: Service
//  Archivo: ventas.service.js
// ============================================================

const ventasRepository = require('../repository/ventas.repository');

// ── #278-#281  Crear venta (cabecera) ─────────────────────────
const createVenta = async (idPropietario) => {
  if (!idPropietario) {
    throw { status: 400, message: 'El Id del propietario es obligatorio' };
  }

  const venta = await ventasRepository.createVenta(idPropietario);
  return venta; // devuelve el Id generado (#281)
};

// ── #292-#296  Agregar producto al detalle ────────────────────
const addDetalle = async (idVenta, idProducto, cantidad) => {
  if (!idVenta || !idProducto || !cantidad) {
    throw { status: 400, message: 'Id de venta, Id de producto y cantidad son obligatorios' };
  }

  if (cantidad <= 0) {
    throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
  }

  // Validar venta
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  // Obtener producto
  const producto = await ventasRepository.getStockProducto(idProducto);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${idProducto}` };
  }

  // 🔥 🔥 🔥 AQUI VA LA VALIDACIÓN QUE QUIERES 🔥 🔥 🔥
  if (producto.Estado === 'inactivo') {
    throw {
      status: 409,
      message: `El producto "${producto.Nombre_Producto}" está inactivo y no puede venderse`
    };
  }

  // Validar stock
  if (producto.Stock < cantidad) {
    throw {
      status: 409,
      message: `Stock insuficiente para "${producto.Nombre_Producto}". Disponible: ${producto.Stock}`,
    };
  }

  // Crear detalle
  const detalle = await ventasRepository.createDetalle(
    idVenta,
    idProducto,
    cantidad,
    producto.Precio
  );

  return detalle;
};

// ── #307-#310  Calcular y retornar total ──────────────────────
const getTotalVenta = async (idVenta) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  // #308 — Suma de subtotales calculada en BD
  const total = await ventasRepository.calcularTotal(idVenta); // #307 calculado en servidor
  return { idVenta, total }; // #310 retorna total actualizado
};

// ── #320-#323  Obtener ventas ─────────────────────────────────
const getAllVentas = async () => {
  const ventas = await ventasRepository.findAllVentas();
  if (!ventas.length) {
    throw { status: 404, message: 'No hay ventas registradas' };
  }
  return ventas;
};

const getVentaById = async (id) => {
  // #321-#322 — Venta con su detalle completo
  const venta = await ventasRepository.findVentaById(id);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${id}` };
  }

  const detalle = await ventasRepository.findDetalleByVenta(id);
  return { ...venta, detalle };
};

// ── #333-#337  Anular venta ───────────────────────────────────
// Nota: se agrega columna Estado en ventas: 'activa' | 'anulada'
const anularVenta = async (id) => {
  // #334 — Validar que la venta exista
  const venta = await ventasRepository.findVentaById(id);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${id}` };
  }

  // #336 — Evitar modificar ventas ya anuladas
  if (venta.Estado === 'anulada') {
    throw { status: 409, message: `La venta con id ${id} ya está anulada` };
  }

  // #335 — Cambiar estado a anulada
  await ventasRepository.anularVenta(id);
  return { id, mensaje: `Venta #${id} anulada exitosamente` }; // #337
};

// ── #346-#350  Confirmar venta y descontar stock ──────────────
const confirmarVenta = async (id) => {
  // Validar que la venta exista
  const venta = await ventasRepository.findVentaById(id);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${id}` };
  }

  if (venta.Estado === 'anulada') {
    throw { status: 409, message: `No se puede confirmar una venta anulada` };
  }

  if (venta.Estado === 'confirmada') {
    throw { status: 409, message: `La venta con id ${id} ya fue confirmada` };
  }

  // #347 — Obtener todos los productos del detalle
  const detalle = await ventasRepository.findDetalleByVenta(id);
  if (!detalle.length) {
    throw { status: 400, message: 'No se puede confirmar una venta sin productos' };
  }

  // #347 — Validar stock de TODOS los productos antes de descontar (#349 evita inconsistencias)
  for (const item of detalle) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    if (!producto || producto.Stock < item.Cantidad) {
      throw {
        status: 409,
        message: `Stock insuficiente para "${item.Nombre_Producto}". Disponible: ${producto?.Stock ?? 0}, requerido: ${item.Cantidad}`,
      };
    }
  }

  // #348 — Descontar cantidad vendida de cada producto
  for (const item of detalle) {
    const affected = await ventasRepository.descontarStock(item.Id_Producto, item.Cantidad); // #350 movimiento de salida
    if (affected === 0) {
      throw { status: 409, message: `Error al descontar stock del producto id ${item.Id_Producto}` };
    }
  }

  // Marcar venta como confirmada
  await ventasRepository.confirmarVenta(id);

  const total = await ventasRepository.calcularTotal(id);
  return { id, estado: 'confirmada', total, mensaje: `Venta #${id} confirmada exitosamente` };
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