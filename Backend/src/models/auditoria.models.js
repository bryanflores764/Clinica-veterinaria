// ============================================================
//  CAPA: Model
//  Archivo: auditoria.model.js
//  Módulo: Auditoría de Acciones
// ============================================================

const AuditoriaQueries = {

  // Registrar acción
  CREATE_ACCION: `
    INSERT INTO auditoria_acciones 
    (usuario_id, modulo, accion, descripcion, ip, referencia_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  // Obtener todas las acciones (con filtros opcionales)
  FIND_ALL_ACCIONES: `
    SELECT 
      a.*,
      u.Nombre_Usuario AS usuario_nombre,
      u.Correo AS usuario_correo,
      r.Nombre_Rol AS usuario_rol
    FROM auditoria_acciones a
    INNER JOIN usuarios u ON u.id = a.usuario_id
    INNER JOIN roles r ON r.id = u.RolId
    WHERE 1=1
  `,

  // Obtener acciones por usuario
  FIND_ACCIONES_BY_USUARIO: `
    SELECT 
      a.*,
      u.Nombre_Usuario AS usuario_nombre
    FROM auditoria_acciones a
    INNER JOIN usuarios u ON u.id = a.usuario_id
    WHERE a.usuario_id = ?
    ORDER BY a.fecha DESC
  `,

  // Obtener acciones por módulo
  FIND_ACCIONES_BY_MODULO: `
    SELECT 
      a.*,
      u.Nombre_Usuario AS usuario_nombre
    FROM auditoria_acciones a
    INNER JOIN usuarios u ON u.id = a.usuario_id
    WHERE a.modulo = ?
    ORDER BY a.fecha DESC
  `,

  // Obtener acciones por acción específica (CREATE, UPDATE, DELETE)
  FIND_ACCIONES_BY_ACCION: `
    SELECT 
      a.*,
      u.Nombre_Usuario AS usuario_nombre
    FROM auditoria_acciones a
    INNER JOIN usuarios u ON u.id = a.usuario_id
    WHERE a.accion = ?
    ORDER BY a.fecha DESC
  `,

  // Obtener acciones por rango de fechas
  FIND_ACCIONES_BY_FECHA_RANGO: `
    SELECT 
      a.*,
      u.Nombre_Usuario AS usuario_nombre
    FROM auditoria_acciones a
    INNER JOIN usuarios u ON u.id = a.usuario_id
    WHERE a.fecha BETWEEN ? AND ?
    ORDER BY a.fecha DESC
  `,

  // Contar acciones por módulo (para dashboard)
  COUNT_ACCIONES_BY_MODULO: `
    SELECT 
      modulo,
      COUNT(*) AS total
    FROM auditoria_acciones
    GROUP BY modulo
    ORDER BY total DESC
  `,

  // Contar acciones por usuario (para dashboard)
  COUNT_ACCIONES_BY_USUARIO: `
    SELECT 
      u.Nombre_Usuario,
      COUNT(a.id) AS total
    FROM auditoria_acciones a
    INNER JOIN usuarios u ON u.id = a.usuario_id
    GROUP BY a.usuario_id
    ORDER BY total DESC
    LIMIT 10
  `,
};

module.exports = AuditoriaQueries;