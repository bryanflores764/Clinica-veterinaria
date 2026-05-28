// ============================================================
//  CAPA: Service
//  Archivo: ventas.service.js
// ============================================================

const ventasRepository = require('../repository/ventas.repository');
const auditoriaService = require('./auditoria.service');
const emailSender = require('../utils/emailSender');

// ── Función auxiliar para obtener IP
const getIp = (reqIp) => reqIp || '0.0.0.0';

// ── Crear venta ──────────────────────────────────────────────
const createVenta = async (idPropietario, idUsuario, ip) => {
  console.log("🚀 [Service] Creando venta para propietario:", idPropietario);
  
  if (!idPropietario) {
    throw { status: 400, message: 'El Id del propietario es obligatorio' };
  }
  
  const venta = await ventasRepository.createVenta(idPropietario);
  
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

// ── Confirmar venta ──────────────────────────────────────────
const confirmarVenta = async (idVenta, idUsuario, ip) => {
  console.log("=== [Service] CONFIRMANDO VENTA ===");
  
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  if (venta.Estado === 'anulada') {
    throw { status: 409, message: `No se puede confirmar una venta anulada` };
  }

  if (venta.Estado === 'confirmada') {
    throw { status: 409, message: `La venta con id ${idVenta} ya fue confirmada` };
  }

  const detalle = await ventasRepository.findDetalleByVenta(idVenta);
  
  if (!detalle.length) {
    throw { status: 400, message: 'No se puede confirmar una venta sin productos' };
  }

  for (const item of detalle) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    if (!producto || producto.Stock < item.Cantidad) {
      throw {
        status: 409,
        message: `Stock insuficiente para "${item.Nombre_Producto}". Disponible: ${producto?.Stock ?? 0}`,
      };
    }
  }

  for (const item of detalle) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    const stockAntes = producto.Stock;
    const stockDespues = stockAntes - item.Cantidad;
    
    await ventasRepository.descontarStock(item.Id_Producto, item.Cantidad);
    
    await ventasRepository.registrarMovimientoStock(
      item.Id_Producto, idVenta, idUsuario, 'salida',
      item.Cantidad, stockAntes, stockDespues
    );
  }

  const total = await ventasRepository.calcularTotal(idVenta);
  
  await ventasRepository.confirmarVentaConTotal(idVenta, total);
  
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

// ── Anular venta ────────────────────────────────────────────
const anularVenta = async (idVenta, idUsuario, ip) => {
  console.log("=== [Service] ANULANDO VENTA ===");
  
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  if (venta.Estado === 'anulada') {
    throw { status: 409, message: `La venta con id ${idVenta} ya está anulada` };
  }

  let mensajeStock = '';
  
  if (venta.Estado === 'confirmada') {
    const detalle = await ventasRepository.findDetalleByVenta(idVenta);
    
    for (const item of detalle) {
      const producto = await ventasRepository.getStockProducto(item.Id_Producto);
      const stockAntes = producto.Stock;
      const stockDespues = stockAntes + item.Cantidad;
      
      await ventasRepository.actualizarStock(item.Id_Producto, stockDespues);
      
      await ventasRepository.registrarMovimientoStock(
        item.Id_Producto, idVenta, idUsuario, 'entrada',
        item.Cantidad, stockAntes, stockDespues
      );
    }
    mensajeStock = 'Stock devuelto al inventario.';
  }

  await ventasRepository.anularVentaConDatos(idVenta, idUsuario);
  
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

// ============================================================
//  FACTURACIÓN
// ============================================================

// Generar número de control
const generarNumeroControl = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FAC-${anio}${mes}${dia}-${aleatorio}`;
};

// Generar código de generación
const generarCodigoGeneracion = () => {
  return `CG-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// Generar factura para una venta
const generarFactura = async (idVenta, datosFactura, idUsuario, ip) => {
  const { idPropietario, correoEnvio, requiereFactura } = datosFactura;
  
  if (!requiereFactura) {
    throw { status: 400, message: 'Esta venta no requiere factura' };
  }
  
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }
  
  if (venta.Estado !== 'confirmada') {
    throw { status: 400, message: 'Solo se pueden facturar ventas confirmadas' };
  }
  
  const facturaExistente = await ventasRepository.getFacturaByVenta(idVenta);
  if (facturaExistente) {
    throw { status: 409, message: 'Esta venta ya tiene una factura generada' };
  }
  
  const propietario = await ventasRepository.findPropietarioById(idPropietario);
  if (!propietario) {
    throw { status: 404, message: 'No existe un propietario con ese ID' };
  }
  
  const correoDestino = correoEnvio || propietario.Correo;
  
  if (!propietario.Nombre) {
    throw { status: 400, message: 'El propietario debe tener nombre' };
  }
  if (!correoDestino) {
    throw { status: 400, message: 'Se requiere un correo para enviar la factura' };
  }
  
  const numeroControl = generarNumeroControl();
  const codigoGeneracion = generarCodigoGeneracion();
  
  const factura = await ventasRepository.createFactura({
  idVenta,
  idCliente: idPropietario,
  idTipoDocumento: 1,
  numeroControl,
  codigoGeneracion,
  rutaComprobante: null,
  identificadorComprobante: numeroControl,
  estadoEnvio: 'pendiente',
  correoDestino: correoDestino
});
  
  await ventasRepository.updateVentaFactura(idVenta, {
    requiere_factura: requiereFactura,
    correo_factura: correoDestino
  });
  
  await auditoriaService.registrarAccion({
    usuario_id: idUsuario,
    modulo: 'ventas',
    accion: 'GENERAR_FACTURA',
    descripcion: `Generó factura para venta #${idVenta} - ${numeroControl}`,
    ip: ip,
    referencia_id: idVenta
  }).catch(err => console.error('Error en auditoría:', err.message));
  
  return { factura, numeroControl, codigoGeneracion };
};

// Enviar factura por correo (SOLO UNA VEZ)
const enviarFactura = async (idVenta, idUsuario, ip) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }
  
  if (!venta.requiere_factura) {
    throw { status: 400, message: 'Esta venta no requiere factura' };
  }
  
  const factura = await ventasRepository.getFacturaByVenta(idVenta);
  if (!factura) {
    throw { status: 404, message: 'Esta venta no tiene factura asociada' };
  }
  
  const detalle = await ventasRepository.findDetalleByVenta(idVenta);
  const productos = detalle.map(item => ({
    nombre: item.Nombre_Producto,
    cantidad: item.Cantidad,
    precio_unitario: parseFloat(item.Precio_Unitario),
    subtotal: item.Cantidad * parseFloat(item.Precio_Unitario)
  }));
  
  const propietario = await ventasRepository.findPropietarioById(venta.Id_Propietario);
  const correoDestino = venta.correo_factura || propietario?.Correo;
  
  if (!correoDestino) {
    throw { status: 400, message: 'No hay correo destino para enviar la factura' };
  }
  
  const facturaData = {
    numeroFactura: factura.NumeroControl,
    fechaEmision: factura.FechaEmision,
    total: parseFloat(venta.Total),
    cliente: propietario?.Nombre || 'Cliente',
    productos: productos
  };
  
  const resultado = await emailSender.enviarFacturaPorCorreo(correoDestino, facturaData);
  
  const estadoEnvio = resultado.success ? 'enviado' : 'fallido';
  await ventasRepository.updateFacturaEnvio(idVenta, estadoEnvio, new Date(), resultado.error || null);
  
  await auditoriaService.registrarAccion({
    usuario_id: idUsuario,
    modulo: 'ventas',
    accion: 'ENVIAR_FACTURA',
    descripcion: `Envió factura de venta #${idVenta} a ${correoDestino} - Estado: ${estadoEnvio}`,
    ip: ip,
    referencia_id: idVenta
  }).catch(err => console.error('Error en auditoría:', err.message));
  
  return {
    success: resultado.success,
    message: resultado.message,
    estadoEnvio,
    fechaEnvio: new Date()
  };
};

// Obtener factura de una venta
const getFacturaByVenta = async (idVenta) => {
  const factura = await ventasRepository.getFacturaByVenta(idVenta);
  return factura;
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