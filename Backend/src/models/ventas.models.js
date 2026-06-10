// ============================================================
//  MODELO: ventas.models.js
// ============================================================

const VentasQueries = {

  // ── VENTAS ────────────────────────────────────────────────────
  CREATE_VENTA: `
    INSERT INTO ventas (Id_Propietario, Fecha_Venta, Estado, Total)
    VALUES (?, NOW(), 'activa', 0.00)
  `,

  FIND_ALL_VENTAS: `
    SELECT
      v.Id,
      v.Fecha_Venta,
      v.Estado,
      v.Id_Propietario,
      v.Total,
      v.Metodo_Pago,
      v.Monto_Recibido,
      v.Cambio,
      p.Nombre AS Propietario
    FROM ventas v
    INNER JOIN propietarios p ON p.Id = v.Id_Propietario
    ORDER BY v.Fecha_Venta DESC
  `,

  FIND_VENTA_BY_ID: `
    SELECT
      v.Id,
      v.Fecha_Venta,
      v.Estado,
      v.Id_Propietario,
      v.Total,
      v.Metodo_Pago,
      v.Monto_Recibido,
      v.Cambio,
      v.requiere_factura,
      v.correo_factura,
      p.Nombre AS Propietario
    FROM ventas v
    INNER JOIN propietarios p ON p.Id = v.Id_Propietario
    WHERE v.Id = ?
  `,

  // ── DETALLE DE VENTA (UNIFICADO) ─────────────────────────────
  FIND_DETALLE_BY_VENTA: `
    SELECT 
      dv.Id,
      dv.Id_Venta,
      dv.Id_Producto,
      dv.Id_Servicio,
      dv.Cantidad,
      dv.Precio_Unitario,
      (dv.Cantidad * dv.Precio_Unitario) as Subtotal,
      p.Nombre_Producto,
      tc.Tipo_Consulta as Nombre_Servicio,
      CASE 
        WHEN dv.Id_Producto IS NOT NULL THEN 'producto'
        WHEN dv.Id_Servicio IS NOT NULL THEN 'servicio'
      END as tipo_item
    FROM detalleventa dv
    LEFT JOIN productos p ON p.Id = dv.Id_Producto
    LEFT JOIN tipoconsulta tc ON tc.Id = dv.Id_Servicio
    WHERE dv.Id_Venta = ?
    ORDER BY dv.Id ASC
  `,

  // ── CREAR DETALLE DE PRODUCTO ─────────────────────────────────
  CREATE_DETALLE_PRODUCTO: `
    INSERT INTO detalleventa (Id_Venta, Id_Producto, Cantidad, Precio_Unitario)
    VALUES (?, ?, ?, ?)
  `,

  // ── CREAR DETALLE DE SERVICIO ─────────────────────────────────
  CREATE_DETALLE_SERVICIO: `
    INSERT INTO detalleventa (Id_Venta, Id_Servicio, Cantidad, Precio_Unitario)
    VALUES (?, ?, ?, ?)
  `,

  // ── STOCK ─────────────────────────────────────────────────────
  GET_STOCK_PRODUCTO: `
    SELECT Id, Nombre_Producto, Stock, Precio, Estado
    FROM productos
    WHERE Id = ?
  `,

  DESCONTAR_STOCK: `
    UPDATE productos
    SET Stock = Stock - ?
    WHERE Id = ? AND Stock >= ?
  `,

  ACTUALIZAR_STOCK: `
    UPDATE productos SET Stock = ? WHERE Id = ?
  `,

  // ── MOVIMIENTOS STOCK ─────────────────────────────────────────
  REGISTRAR_MOVIMIENTO: `
    INSERT INTO movimientosstock
      (Id_Producto, Id_Venta, Id_Usuario, Tipo, Cantidad, Stock_Antes, Stock_Despues, Fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `,

  // ── ESTADOS ───────────────────────────────────────────────────
  CONFIRMAR_VENTA_CON_PAGO: `
    UPDATE ventas
    SET Estado = 'confirmada',
        Total = ?,
        Metodo_Pago = ?,
        Monto_Recibido = ?,
        Cambio = ?
    WHERE Id = ?
  `,

  ANULAR_VENTA: `
    UPDATE ventas
    SET Estado = 'anulada',
        Anulado_Por = ?,
        Fecha_Anulacion = NOW()
    WHERE Id = ?
  `,

  // ── SERVICIOS DISPONIBLES ─────────────────────────────────────
  FIND_ALL_SERVICIOS: `
    SELECT Id, Tipo_Consulta as Nombre_Servicio, Descripcion, Precio
    FROM tipoconsulta
    WHERE Estado = 'activo'
    ORDER BY Tipo_Consulta ASC
  `,

  FIND_SERVICIO_BY_ID: `
    SELECT Id, Tipo_Consulta as Nombre_Servicio, Precio
    FROM tipoconsulta
    WHERE Id = ?
  `,

  // ── FACTURACIÓN ───────────────────────────────────────────────
  CREATE_FACTURA: `
    INSERT INTO facturaelectronica
      (Id_Venta, Id_Cliente, Id_TipoDocumento,
       NumeroControl, CodigoGeneracion, FechaEmision,
       RutaComprobante, IdentificadorComprobante, EstadoEnvio, CorreoDestino)
    VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
  `,

  UPDATE_FACTURA_ENVIO: `
    UPDATE facturaelectronica
    SET EstadoEnvio = ?, FechaEnvio = ?, MensajeError = ?
    WHERE Id_Venta = ?
  `,

  GET_FACTURA_BY_VENTA: `
    SELECT f.*,
           p.Nombre as NombreFiscal,
           p.Correo,
           td.Tipo_Documento
    FROM facturaelectronica f
    INNER JOIN propietarios p ON p.Id = f.Id_Cliente
    INNER JOIN tiposdocumento td ON td.Id = f.Id_TipoDocumento
    WHERE f.Id_Venta = ?
  `,

  UPDATE_VENTA_FACTURA: `
    UPDATE ventas SET requiere_factura = ?, correo_factura = ? WHERE Id = ?
  `,
};

module.exports = VentasQueries;