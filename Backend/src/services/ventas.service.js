// ============================================================
//  CAPA: Service
//  Archivo: ventas.service.js
// ============================================================

const ventasRepository = require('../repository/ventas.repository');
const auditoriaService = require('./auditoria.service');

// ── Función auxiliar para obtener IP (si no viene, usar valor por defecto)
const getIp = (reqIp) => reqIp || '0.0.0.0';

// ── Crear venta ──────────────────────────────────────────────
const createVenta = async (idPropietario, idUsuario, ip) => {
  console.log("🚀 [Service] Creando venta para propietario:", idPropietario);
  console.log("👤 Usuario ID:", idUsuario);
  
  if (!idPropietario) {
    throw { status: 400, message: 'El Id del propietario es obligatorio' };
  }
  
  const venta = await ventasRepository.createVenta(idPropietario);
  
  // ✅ Registrar en auditoría
  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'CREATE',
      descripcion: `Creó venta #${venta.id} para propietario ID ${idPropietario}`,
      ip: getIp(ip),
      referencia_id: venta.id
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }
  
  return venta;
};

// ── Agregar producto al detalle ──────────────────────────────
const addDetalle = async (idVenta, idProducto, cantidad, idUsuario, ip) => {
  console.log(`📝 [Service] Agregando producto ${idProducto} a venta ${idVenta}, cantidad: ${cantidad}`);
  
  if (!idVenta || !idProducto || !cantidad) {
    throw { status: 400, message: 'Id de venta, Id de producto y cantidad son obligatorios' };
  }

  if (cantidad <= 0) {
    throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
  }

  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  const producto = await ventasRepository.getStockProducto(idProducto);
  if (!producto) {
    throw { status: 404, message: `No existe un producto con id ${idProducto}` };
  }

  if (producto.Estado === 'inactivo') {
    throw {
      status: 409,
      message: `El producto "${producto.Nombre_Producto}" está inactivo y no puede venderse`
    };
  }

  if (producto.Stock < cantidad) {
    throw {
      status: 409,
      message: `Stock insuficiente para "${producto.Nombre_Producto}". Disponible: ${producto.Stock}`,
    };
  }

  const detalle = await ventasRepository.createDetalle(
    idVenta,
    idProducto,
    cantidad,
    producto.Precio
  );
  
  // ✅ Registrar en auditoría (opcional, para trazabilidad de productos agregados)
  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'ADD_DETALLE',
      descripcion: `Agregó producto "${producto.Nombre_Producto}" x${cantidad} a venta #${idVenta}`,
      ip: getIp(ip),
      referencia_id: idVenta
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }

  return detalle;
};

// ── Calcular total ───────────────────────────────────────────
const getTotalVenta = async (idVenta) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }
  const total = await ventasRepository.calcularTotal(idVenta);
  return { idVenta, total };
};

// ── Obtener todas las ventas ─────────────────────────────────
const getAllVentas = async () => {
  const ventas = await ventasRepository.findAllVentas();
  return ventas;
};

// ── Obtener venta por ID ─────────────────────────────────────
const getVentaById = async (id) => {
  const venta = await ventasRepository.findVentaById(id);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${id}` };
  }
  const detalle = await ventasRepository.findDetalleByVenta(id);
  return { ...venta, detalle };
};

// ── Confirmar venta (descuenta stock) ────────────────────────
const confirmarVenta = async (idVenta, idUsuario, ip) => {
  console.log("=== [Service] CONFIRMANDO VENTA ===");
  console.log("idVenta:", idVenta);
  console.log("idUsuario:", idUsuario);
  
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  console.log("Estado actual de la venta:", venta.Estado);

  if (venta.Estado === 'anulada') {
    throw { status: 409, message: `No se puede confirmar una venta anulada` };
  }

  if (venta.Estado === 'confirmada') {
    throw { status: 409, message: `La venta con id ${idVenta} ya fue confirmada` };
  }

  const detalle = await ventasRepository.findDetalleByVenta(idVenta);
  console.log("Productos en detalle:", detalle.length);
  
  if (!detalle.length) {
    throw { status: 400, message: 'No se puede confirmar una venta sin productos' };
  }

  // Validar stock
  for (const item of detalle) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    console.log(`Validando stock para ${producto?.Nombre_Producto}: stock=${producto?.Stock}, requerido=${item.Cantidad}`);
    if (!producto || producto.Stock < item.Cantidad) {
      throw {
        status: 409,
        message: `Stock insuficiente para "${item.Nombre_Producto}". Disponible: ${producto?.Stock ?? 0}`,
      };
    }
  }

  // Descontar stock y registrar movimiento
  for (const item of detalle) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    const stockAntes = producto.Stock;
    const stockDespues = stockAntes - item.Cantidad;
    
    console.log(`Descontando stock: ${producto.Nombre_Producto} ${stockAntes} → ${stockDespues}`);
    
    await ventasRepository.descontarStock(item.Id_Producto, item.Cantidad);
    
    await ventasRepository.registrarMovimientoStock(
      item.Id_Producto, idVenta, idUsuario, 'salida',
      item.Cantidad, stockAntes, stockDespues
    );
  }

  // ✅ CALCULAR TOTAL
  const total = await ventasRepository.calcularTotal(idVenta);
  console.log("💰 Total calculado:", total);
  
  // ✅ ACTUALIZAR VENTA
  await ventasRepository.confirmarVentaConTotal(idVenta, total);
  console.log("✅ Venta confirmada en BD");
  
  // ✅ Registrar en auditoría
  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'CONFIRMAR',
      descripcion: `Confirmó venta #${idVenta} por $${total}`,
      ip: getIp(ip),
      referencia_id: idVenta
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }
  
  return { 
    id: idVenta, 
    estado: 'confirmada', 
    total, 
    mensaje: `Venta #${idVenta} confirmada exitosamente` 
  };
};

// ── Anular venta (devuelve stock) ────────────────────────────
const anularVenta = async (idVenta, idUsuario, ip) => {
  console.log("=== [Service] ANULANDO VENTA ===");
  console.log("idVenta:", idVenta);
  console.log("idUsuario:", idUsuario);
  
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  console.log("Estado actual de la venta:", venta.Estado);

  if (venta.Estado === 'anulada') {
    throw { status: 409, message: `La venta con id ${idVenta} ya está anulada` };
  }

  let mensajeStock = '';
  
  // Si estaba confirmada, devolver el stock
  if (venta.Estado === 'confirmada') {
    console.log("🔄 Venta confirmada, devolviendo stock...");
    const detalle = await ventasRepository.findDetalleByVenta(idVenta);
    
    for (const item of detalle) {
      const producto = await ventasRepository.getStockProducto(item.Id_Producto);
      const stockAntes = producto.Stock;
      const stockDespues = stockAntes + item.Cantidad;
      
      console.log(`Devolviendo stock: ${producto.Nombre_Producto} ${stockAntes} → ${stockDespues}`);
      
      await ventasRepository.actualizarStock(item.Id_Producto, stockDespues);
      
      await ventasRepository.registrarMovimientoStock(
        item.Id_Producto, idVenta, idUsuario, 'entrada',
        item.Cantidad, stockAntes, stockDespues
      );
    }
    mensajeStock = 'Stock devuelto al inventario.';
  }

  await ventasRepository.anularVentaConDatos(idVenta, idUsuario);
  
  // ✅ Registrar en auditoría
  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'ANULAR',
      descripcion: `Anuló venta #${idVenta}. ${mensajeStock}`,
      ip: getIp(ip),
      referencia_id: idVenta
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }
  
  return { 
    id: idVenta, 
    estado: 'anulada', 
    mensaje: `Venta #${idVenta} anulada exitosamente. ${mensajeStock}` 
  };
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