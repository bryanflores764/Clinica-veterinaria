// ============================================================
//  CAPA: Model
//  Archivo: ventas.model.js
// ============================================================

const VentasQueries = {
  // --- VENTAS ---
  CREATE_VENTA: `
    INSERT INTO ventas (Id_Propietario, Fecha_Venta)
    VALUES (?, NOW())
  `,

  FIND_ALL_VENTAS: `
    SELECT
      v.Id,
      v.Fecha_Venta,
      v.Estado,
      v.Id_Propietario,
      p.Nombre AS Propietario,
      COALESCE(SUM(dv.Cantidad * dv.Precio_Unitario), 0) AS Total
    FROM ventas v
    INNER JOIN propietarios p ON p.Id = v.Id_Propietario
    LEFT  JOIN detalleventa dv ON dv.Id_Venta = v.Id
    GROUP BY v.Id, v.Fecha_Venta, v.Estado, v.Id_Propietario, p.Nombre
    ORDER BY v.Fecha_Venta DESC
  `,

  FIND_VENTA_BY_ID: `
    SELECT
      v.Id,
      v.Fecha_Venta,
      v.Estado,
      v.Id_Propietario,
      p.Nombre AS Propietario,
      COALESCE(SUM(dv.Cantidad * dv.Precio_Unitario), 0) AS Total
    FROM ventas v
    INNER JOIN propietarios p ON p.Id = v.Id_Propietario
    LEFT  JOIN detalleventa dv ON dv.Id_Venta = v.Id
    WHERE v.Id = ?
    GROUP BY v.Id, v.Fecha_Venta, v.Estado, v.Id_Propietario, p.Nombre
  `,

  FIND_DETALLE_BY_VENTA: `
    SELECT
      dv.Id,
      dv.Id_Venta,
      dv.Id_Producto,
      pr.Nombre_Producto,
      dv.Cantidad,
      dv.Precio_Unitario,
      (dv.Cantidad * dv.Precio_Unitario) AS Subtotal
    FROM detalleventa dv
    INNER JOIN productos pr ON pr.Id = dv.Id_Producto
    WHERE dv.Id_Venta = ?
  `,

  // --- DETALLE VENTA ---
  CREATE_DETALLE: `
    INSERT INTO detalleventa (Id_Venta, Id_Producto, Cantidad, Precio_Unitario)
    VALUES (?, ?, ?, ?)
  `,

  // --- STOCK ---
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

  // --- TOTAL ---
  CALCULAR_TOTAL: `
    SELECT COALESCE(SUM(Cantidad * Precio_Unitario), 0) AS Total
    FROM detalleventa
    WHERE Id_Venta = ?
  `,

  // --- ESTADOS ---
  ANULAR_VENTA: `
    UPDATE ventas SET Estado = 'anulada' WHERE Id = ?
  `,

  CONFIRMAR_VENTA: `
    UPDATE ventas SET Estado = 'confirmada' WHERE Id = ?
  `,


  UPDATE_TOTAL: `
  UPDATE ventas
  SET Total = ?
  WHERE Id = ?
`,

// Agregar al final del archivo ventas.model.js

// ============================================================
//  QUERIES DE FACTURACIÓN
// ============================================================

// Crear factura electrónica
CREATE_FACTURA: `
  INSERT INTO facturaelectronica 
  (Id_Venta, Id_Cliente, Id_TipoDocumento, Id_EstadoFactura, 
   NumeroControl, CodigoGeneracion, FechaEmision, 
   RutaComprobante, IdentificadorComprobante, EstadoEnvio, CorreoDestino)
  VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
`,

// Actualizar estado de envío de factura
UPDATE_FACTURA_ENVIO: `
  UPDATE facturaelectronica 
  SET EstadoEnvio = ?, FechaEnvio = ?, MensajeError = ?
  WHERE Id_Venta = ?
`,

// Obtener factura por ID de venta
GET_FACTURA_BY_VENTA: `
  SELECT f.*, 
         c.NombreFiscal, c.NIT, c.NRC, c.DUI, c.DireccionFiscal,
         td.Tipo_Documento, ef.Estado as EstadoFactura
  FROM facturaelectronica f
  INNER JOIN clientesfacturacion c ON c.Id = f.Id_Cliente
  INNER JOIN tiposdocumento td ON td.Id = f.Id_TipoDocumento
  INNER JOIN estadosfactura ef ON ef.Id = f.Id_EstadoFactura
  WHERE f.Id_Venta = ?
`,
};

module.exports = VentasQueries;