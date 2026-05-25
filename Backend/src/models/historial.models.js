// ============================================================
//  CAPA: Model
//  Archivo: historial.model.js
//  Módulos: Historial Clínico y Consultas Médicas
// ============================================================

const HistorialQueries = {

  // ============================================================
  //  HISTORIAL CLÍNICO
  // ============================================================

  // Crear historial clínico
  CREATE_HISTORIAL: `
    INSERT INTO historial_clinico 
    (mascota_id, motivo, diagnostico_inicial, observaciones, veterinario_id, estado)
    VALUES (?, ?, ?, ?, ?, 'activo')
  `,

  // Obtener historial por ID
  FIND_HISTORIAL_BY_ID: `
    SELECT 
      h.*,
      m.Nombre AS mascota_nombre,
      u.Nombre_Usuario AS veterinario_nombre
    FROM historial_clinico h
    INNER JOIN mascotas m ON m.Id = h.mascota_id
    INNER JOIN usuarios u ON u.id = h.veterinario_id
    WHERE h.id = ? AND h.estado = 'activo'
  `,

  // Obtener historial por mascota
  FIND_HISTORIAL_BY_MASCOTA: `
    SELECT 
      h.*,
      u.Nombre_Usuario AS veterinario_nombre
    FROM historial_clinico h
    INNER JOIN usuarios u ON u.id = h.veterinario_id
    WHERE h.mascota_id = ? AND h.estado = 'activo'
    ORDER BY h.fecha_apertura DESC
  `,

  // Actualizar historial clínico
  UPDATE_HISTORIAL: `
    UPDATE historial_clinico
    SET motivo = ?, diagnostico_inicial = ?, observaciones = ?, updated_at = NOW()
    WHERE id = ? AND estado = 'activo'
  `,

  // Eliminar historial clínico (soft delete)
  DELETE_HISTORIAL: `
    UPDATE historial_clinico SET estado = 'inactivo' WHERE id = ?
  `,

  // ============================================================
  //  CONSULTAS MÉDICAS
  // ============================================================

  // Crear consulta médica
  CREATE_CONSULTA: `
    INSERT INTO consultas_medicas 
    (historial_id, sintomas, diagnostico, tratamiento, observaciones, veterinario_id, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'activo')
  `,

  // Obtener consulta por ID
  FIND_CONSULTA_BY_ID: `
    SELECT 
      c.*,
      u.Nombre_Usuario AS veterinario_nombre
    FROM consultas_medicas c
    INNER JOIN usuarios u ON u.id = c.veterinario_id
    WHERE c.id = ? AND c.estado = 'activo'
  `,

  // Obtener consultas por historial
  FIND_CONSULTAS_BY_HISTORIAL: `
    SELECT 
      c.*,
      u.Nombre_Usuario AS veterinario_nombre
    FROM consultas_medicas c
    INNER JOIN usuarios u ON u.id = c.veterinario_id
    WHERE c.historial_id = ? AND c.estado = 'activo'
    ORDER BY c.fecha DESC
  `,

  // Actualizar consulta médica
  UPDATE_CONSULTA: `
    UPDATE consultas_medicas
    SET sintomas = ?, diagnostico = ?, tratamiento = ?, observaciones = ?, updated_at = NOW()
    WHERE id = ? AND estado = 'activo'
  `,

  // Eliminar consulta médica (soft delete)
  DELETE_CONSULTA: `
    UPDATE consultas_medicas SET estado = 'inactivo' WHERE id = ?
  `,

  // Verificar si mascota tiene historial activo
  CHECK_HISTORIAL_ACTIVO: `
    SELECT id FROM historial_clinico 
    WHERE mascota_id = ? AND estado = 'activo'
    LIMIT 1
  `,
};

module.exports = HistorialQueries;