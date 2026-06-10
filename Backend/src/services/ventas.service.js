// ============================================================
//  SERVICE: ventas.service.js
// ============================================================

const ventasRepository = require('../repository/ventas.repository');
const auditoriaService = require('./auditoria.service');
const emailSender = require('../utils/emailSender');

const getIp = (reqIp) => reqIp || '0.0.0.0';

// ── VENTAS CRUD ──────────────────────────────────────────────
const createVenta = async (idPropietario, idUsuario, ip) => {
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

const addDetalleProducto = async (idVenta, idProducto, cantidad, idUsuario, ip) => {
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

  const detalle = await ventasRepository.createDetalleProducto(
    idVenta, idProducto, cantidad, producto.Precio
  );
  
  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'ADD_DETALLE_PRODUCTO',
      descripcion: `Agregó producto "${producto.Nombre_Producto}" x${cantidad} a venta #${idVenta}`,
      ip: getIp(ip),
      referencia_id: idVenta
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }

  return detalle;
};

const addDetalleServicio = async (idVenta, idServicio, cantidad, idUsuario, ip) => {
  if (!idVenta || !idServicio || !cantidad) {
    throw { status: 400, message: 'Id de venta, Id de servicio y cantidad son obligatorios' };
  }

  if (cantidad <= 0) {
    throw { status: 400, message: 'La cantidad debe ser mayor a 0' };
  }

  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }

  const servicio = await ventasRepository.findServicioById(idServicio);
  if (!servicio) {
    throw { status: 404, message: `No existe un servicio con id ${idServicio}` };
  }

  const detalle = await ventasRepository.createDetalleServicio(
    idVenta, idServicio, cantidad, servicio.Precio
  );

  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'ADD_DETALLE_SERVICIO',
      descripcion: `Agregó servicio "${servicio.Nombre_Servicio}" x${cantidad} a venta #${idVenta}`,
      ip: getIp(ip),
      referencia_id: idVenta
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }

  return detalle;
};

const getTotalVenta = async (idVenta) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  }
  const total = await ventasRepository.calcularTotalCompleto(idVenta);
  return { idVenta, total };
};

const getAllVentas = async () => {
  const ventas = await ventasRepository.findAllVentas();
  return ventas;
};

const getVentaById = async (id) => {
  const venta = await ventasRepository.findVentaById(id);
  if (!venta) {
    throw { status: 404, message: `No existe una venta con id ${id}` };
  }
  const detalleCompleto = await ventasRepository.findDetalleByVenta(id);
  
  const productos = detalleCompleto.filter(item => item.Id_Producto !== null);
  const servicios = detalleCompleto.filter(item => item.Id_Servicio !== null);
  
  return { ...venta, productos, servicios };
};

const getAllServicios = async () => {
  return await ventasRepository.findAllServicios();
};

// ── CONFIRMAR VENTA ──────────────────────────────────────────
const confirmarVenta = async (idVenta, idUsuario, ip, datosPago = {}) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  if (venta.Estado === 'anulada') throw { status: 409, message: 'No se puede confirmar una venta anulada' };
  if (venta.Estado === 'confirmada') throw { status: 409, message: `La venta con id ${idVenta} ya fue confirmada` };

  // Obtener detalle completo y SEPARAR productos de servicios
  const detalleCompleto = await ventasRepository.findDetalleByVenta(idVenta);
  const productos = detalleCompleto.filter(item => item.Id_Producto !== null);
  const servicios = detalleCompleto.filter(item => item.Id_Servicio !== null);
  
  if (productos.length === 0 && servicios.length === 0) {
    throw { status: 400, message: 'No se puede confirmar una venta sin productos o servicios' };
  }

  const { metodoPago, montoRecibido } = datosPago;
  const metodosValidos = ['efectivo', 'tarjeta', 'transferencia'];
  if (!metodoPago || !metodosValidos.includes(metodoPago)) {
    throw { status: 400, message: `Método de pago inválido. Opciones: ${metodosValidos.join(', ')}` };
  }

  // ── Validar stock SOLO para productos ──────────────────
  for (const item of productos) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    if (!producto || producto.Stock < item.Cantidad) {
      throw {
        status: 409,
        message: `Stock insuficiente para "${item.Nombre_Producto}". Disponible: ${producto?.Stock ?? 0}`,
      };
    }
  }

  // ── Descontar stock y registrar movimiento SOLO para productos ──
  for (const item of productos) {
    const producto = await ventasRepository.getStockProducto(item.Id_Producto);
    const stockAntes = producto.Stock;
    const stockDespues = stockAntes - item.Cantidad;

    // Descontar stock
    await ventasRepository.descontarStock(item.Id_Producto, item.Cantidad);
    
    // Registrar movimiento de stock SOLO para productos (con Id_Usuario válido)
    await ventasRepository.registrarMovimientoStock(
      item.Id_Producto, 
      idVenta, 
      idUsuario,  // ← Este ID existe porque el usuario está autenticado
      'salida', 
      item.Cantidad, 
      stockAntes, 
      stockDespues
    );
  }

  // ── Los SERVICIOS NO generan movimientos de stock ──
  // (No hacer nada con los servicios aquí)

  // Calcular total combinado
  let totalProductos = 0;
  for (const item of productos) {
    totalProductos += item.Cantidad * item.Precio_Unitario;
  }
  
  let totalServicios = 0;
  for (const item of servicios) {
    totalServicios += item.Cantidad * item.Precio_Unitario;
  }
  
  const totalNum = parseFloat((totalProductos + totalServicios).toFixed(2));

  // Calcular cambio
  let montoRecibidoFinal, cambioFinal;

  if (metodoPago === 'efectivo') {
    const monto = parseFloat(montoRecibido);
    if (isNaN(monto) || monto <= 0) {
      throw { status: 400, message: 'El monto recibido es obligatorio para pagos en efectivo' };
    }
    if (monto < totalNum) {
      throw {
        status: 400,
        message: `Monto recibido ($${monto.toFixed(2)}) es menor al total ($${totalNum.toFixed(2)})`,
      };
    }
    montoRecibidoFinal = monto;
    cambioFinal = parseFloat((monto - totalNum).toFixed(2));
  } else {
    montoRecibidoFinal = totalNum;
    cambioFinal = 0.00;
  }

  await ventasRepository.confirmarVentaConPago(
    idVenta, totalNum, metodoPago, montoRecibidoFinal, cambioFinal
  );

  // Registrar auditoría de la venta (con Id_Usuario)
  try {
    await auditoriaService.registrarAccion({
      usuario_id: idUsuario,
      modulo: 'ventas',
      accion: 'CONFIRMAR',
      descripcion: `Confirmó venta #${idVenta} | Total: $${totalNum.toFixed(2)} | Pago: ${metodoPago} | Productos: ${productos.length} | Servicios: ${servicios.length}`,
      ip: getIp(ip),
      referencia_id: idVenta,
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
  }

  return {
    id: idVenta,
    estado: 'confirmada',
    total: totalNum,
    metodoPago,
    montoRecibido: montoRecibidoFinal,
    cambio: cambioFinal,
    mensaje: `Venta #${idVenta} confirmada exitosamente`,
  };
};

// ── ANULAR VENTA ─────────────────────────────────────────────
const anularVenta = async (idVenta, idUsuario, ip) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) throw { status: 404, message: `No existe una venta con id ${idVenta}` };
  if (venta.Estado === 'anulada') throw { status: 409, message: `La venta con id ${idVenta} ya está anulada` };

  let mensajeStock = '';
  
  if (venta.Estado === 'confirmada') {
    // Obtener SOLO productos (los servicios no tienen stock que devolver)
    const detalleCompleto = await ventasRepository.findDetalleByVenta(idVenta);
    const productos = detalleCompleto.filter(item => item.Id_Producto !== null);
    
    for (const item of productos) {
      const producto = await ventasRepository.getStockProducto(item.Id_Producto);
      const stockAntes = producto.Stock;
      const stockDespues = stockAntes + item.Cantidad;
      
      await ventasRepository.actualizarStock(item.Id_Producto, stockDespues);
      await ventasRepository.registrarMovimientoStock(
        item.Id_Producto, idVenta, idUsuario, 'entrada',
        item.Cantidad, stockAntes, stockDespues
      );
    }
    
    mensajeStock = productos.length > 0 
      ? `Se devolvieron ${productos.length} producto(s) al inventario.` 
      : 'No había productos que devolver (solo servicios).';
  }

  await ventasRepository.anularVentaConDatos(idVenta, idUsuario);
  
  return { 
    id: idVenta, 
    estado: 'anulada', 
    mensaje: `Venta #${idVenta} anulada exitosamente. ${mensajeStock}` 
  };
};

// ── FACTURACIÓN ───────────────────────────────────────────────
const generarNumeroControl = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear().toString().slice(-2);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FAC-${anio}${mes}${dia}-${aleatorio}`;
};

const generarCodigoGeneracion = async () => {
  return await ventasRepository.getUltimoCodigoFactura();
};

const generarFactura = async (idVenta, datosFactura, idUsuario, ip) => {
  const { correoEnvio, requiereFactura } = datosFactura;
  
  if (!requiereFactura) throw { status: 400, message: 'Requiere factura' };
  
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) throw { status: 404, message: `No existe venta ${idVenta}` };
  if (venta.Estado !== 'confirmada') throw { status: 400, message: 'Venta no confirmada' };
  
  const facturaExistente = await ventasRepository.getFacturaByVenta(idVenta);
  if (facturaExistente) throw { status: 409, message: 'Factura ya generada' };

  const propietario = await ventasRepository.findPropietarioById(venta.Id_Propietario);
  if (!propietario) throw { status: 404, message: 'Propietario no existe' };

  const correoDestino = correoEnvio || propietario.Correo;
  if (!correoDestino) throw { status: 400, message: 'Correo requerido' };
  
  const numeroControl = generarNumeroControl();
  const codigoGeneracion = await generarCodigoGeneracion();
  
  await ventasRepository.createFactura({
    idVenta,
    idCliente: venta.Id_Propietario,
    idTipoDocumento: 1,
    numeroControl,
    codigoGeneracion,
    rutaComprobante: null,
    identificadorComprobante: numeroControl,
    estadoEnvio: 'pendiente',
    correoDestino
  });
  
  await ventasRepository.updateVentaFactura(idVenta, {
    requiere_factura: requiereFactura,
    correo_factura: correoDestino
  });
  
  return { 
    numeroControl, 
    codigoGeneracion,
    datosPago: {
      metodoPago: venta.Metodo_Pago,
      montoRecibido: venta.Monto_Recibido,
      cambio: venta.Cambio,
      total: venta.Total
    }
  };
};

const enviarFactura = async (idVenta, idUsuario, ip) => {
  const venta = await ventasRepository.findVentaById(idVenta);
  if (!venta) throw { status: 404, message: `No existe venta ${idVenta}` };

  const factura = await ventasRepository.getFacturaByVenta(idVenta);
  if (!factura) throw { status: 404, message: 'No tiene factura' };
  
  // Obtener detalle completo (productos y servicios)
  const detalleCompleto = await ventasRepository.findDetalleByVenta(idVenta);
  
  const productos = detalleCompleto
    .filter(item => item.Id_Producto !== null)
    .map(item => ({
      nombre: item.Nombre_Producto,
      cantidad: item.Cantidad,
      precio_unitario: parseFloat(item.Precio_Unitario),
      subtotal: item.Cantidad * parseFloat(item.Precio_Unitario)
    }));
    
  const servicios = detalleCompleto
    .filter(item => item.Id_Servicio !== null)
    .map(item => ({
      nombre: item.Nombre_Servicio,
      cantidad: item.Cantidad,
      precio_unitario: parseFloat(item.Precio_Unitario),
      subtotal: item.Cantidad * parseFloat(item.Precio_Unitario)
    }));
  
  const propietario = await ventasRepository.findPropietarioById(venta.Id_Propietario);
  const correoDestino = venta.correo_factura || propietario?.Correo;
  
  if (!correoDestino) throw { status: 400, message: 'No hay correo destino' };
  
  const facturaData = {
    numeroFactura: factura.NumeroControl,
    codigoGeneracion: factura.CodigoGeneracion,
    fechaEmision: factura.FechaEmision,
    total: parseFloat(venta.Total),
    cliente: propietario?.Nombre || 'Cliente',
    productos: productos,
    servicios: servicios,   // ← AÑADIR SERVICIOS
    metodoPago: venta.Metodo_Pago,
    montoRecibido: venta.Monto_Recibido ? parseFloat(venta.Monto_Recibido) : null,
    cambio: venta.Cambio ? parseFloat(venta.Cambio) : null,
    correoCliente: propietario?.Correo || correoDestino
  };
  
  const resultado = await emailSender.enviarFacturaPorCorreo(correoDestino, facturaData);
  const estadoEnvio = resultado.success ? 'enviado' : 'fallido';
  
  await ventasRepository.updateFacturaEnvio(idVenta, estadoEnvio, new Date(), resultado.error || null);
  
  return {
    success: resultado.success,
    message: resultado.message,
    estadoEnvio
  };
};

const getFacturaByVenta = async (idVenta) => {
  return await ventasRepository.getFacturaByVenta(idVenta);
};

// ── EXPORTAR ──────────────────────────────────────────────────
module.exports = {
  createVenta,
  addDetalleProducto,
  addDetalleServicio,
  getTotalVenta,
  getAllVentas,
  getVentaById,
  confirmarVenta,
  anularVenta,
  generarFactura,
  enviarFactura,
  getFacturaByVenta,
  getAllServicios,
};