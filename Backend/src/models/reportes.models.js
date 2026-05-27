// ============================================================
//  CAPA: Model
//  Archivo: reportes.model.js
//  Módulo: Reportes y Estadísticas
// ============================================================

const ReportesQueries = {

  // ============================================================
  //  REPORTE DE VENTAS
  // ============================================================

  GET_REPORTE_VENTAS: `
    SELECT 
      DATE(v.Fecha_Venta) AS fecha,
      COUNT(v.Id) AS num_ventas,
      SUM(v.Total) AS total_ingresos,
      AVG(v.Total) AS promedio_venta,
      SUM(CASE WHEN v.Estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
      SUM(CASE WHEN v.Estado = 'anulada' THEN 1 ELSE 0 END) AS anuladas
    FROM ventas v
    WHERE v.Estado IN ('confirmada', 'anulada')
      AND DATE(v.Fecha_Venta) BETWEEN ? AND ?
    GROUP BY DATE(v.Fecha_Venta)
    ORDER BY fecha DESC
  `,

  // Resumen general de ingresos
  GET_RESUMEN_INGRESOS: `
    SELECT 
      COALESCE(SUM(CASE WHEN Estado = 'confirmada' THEN Total ELSE 0 END), 0) AS total_ingresos,
      COUNT(CASE WHEN Estado = 'confirmada' THEN 1 END) AS total_ventas,
      COALESCE(AVG(CASE WHEN Estado = 'confirmada' THEN Total END), 0) AS ticket_promedio,
      COUNT(CASE WHEN Estado = 'anulada' THEN 1 END) AS ventas_anuladas
    FROM ventas
    WHERE DATE(Fecha_Venta) BETWEEN ? AND ?
  `,

  // ============================================================
  //  REPORTE DE PRODUCTOS MÁS VENDIDOS
  // ============================================================

  GET_PRODUCTOS_MAS_VENDIDOS: `
    SELECT 
      pr.Id AS producto_id,
      pr.Nombre_Producto AS producto,
      c.Nombre_Categoria AS categoria,
      SUM(d.Cantidad) AS total_vendido,
      SUM(d.Cantidad * d.Precio_Unitario) AS total_ingresos,
      COUNT(DISTINCT v.Id) AS num_ventas
    FROM productos pr
    INNER JOIN detalleventa d ON d.Id_Producto = pr.Id
    INNER JOIN ventas v ON v.Id = d.Id_Venta
    INNER JOIN categorias c ON c.Id = pr.Id_Categoria
    WHERE v.Estado = 'confirmada'
      AND DATE(v.Fecha_Venta) BETWEEN ? AND ?
    GROUP BY pr.Id, pr.Nombre_Producto, c.Nombre_Categoria
    ORDER BY total_vendido DESC
    LIMIT ?
  `,

  // ============================================================
  //  REGISTRO DE REPORTES GENERADOS
  // ============================================================

  REGISTRAR_REPORTE: `
    INSERT INTO reportes_generados 
    (usuario_id, tipo_reporte, parametros, fecha_inicio, fecha_fin, total_registros, archivo_nombre)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  LISTAR_REPORTES_GENERADOS: `
    SELECT 
      rg.id,
      rg.tipo_reporte,
      rg.parametros,
      rg.fecha_inicio,
      rg.fecha_fin,
      rg.total_registros,
      rg.archivo_nombre,
      rg.fecha_generacion,
      u.Nombre_Usuario AS generado_por
    FROM reportes_generados rg
    INNER JOIN usuarios u ON u.id = rg.usuario_id
    WHERE (? IS NULL OR rg.usuario_id = ?)
    ORDER BY rg.fecha_generacion DESC
    LIMIT ? OFFSET ?
  `,

  COUNT_REPORTES: `
    SELECT COUNT(*) as total FROM reportes_generados rg
    WHERE (? IS NULL OR rg.usuario_id = ?)
  `,

  GET_REPORTE_BY_ID: `
    SELECT * FROM reportes_generados WHERE id = ?
  `,

};

module.exports = ReportesQueries;