// ============================================================
//  CAPA: Model
//  Archivo: vacunas.model.js
//  Módulo: Vacunas Aplicadas
// ============================================================

const VacunasQueries = {

  // Crear vacuna aplicada
  CREATE_VACUNA: `
    INSERT INTO vacunas_aplicadas 
    (mascota_id, nombre_vacuna, fecha_aplicacion, proxima_dosis, lote, observaciones, veterinario_id, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')
  `,

  // Obtener vacuna por ID
  FIND_VACUNA_BY_ID: `
    SELECT 
      v.*,
      m.Nombre AS mascota_nombre,
      u.Nombre_Usuario AS veterinario_nombre,
      p.Nombre AS propietario_nombre,
      p.Telefono AS propietario_telefono,
      p.Correo AS propietario_correo
    FROM vacunas_aplicadas v
    INNER JOIN mascotas m ON m.Id = v.mascota_id
    INNER JOIN propietarios p ON p.Id = m.Id_Propietario
    INNER JOIN usuarios u ON u.id = v.veterinario_id
    WHERE v.id = ? AND v.estado = 'activo'
  `,

  // Obtener vacunas por mascota
  FIND_VACUNAS_BY_MASCOTA: `
    SELECT 
      v.*,
      u.Nombre_Usuario AS veterinario_nombre,
      CASE 
        WHEN v.proxima_dosis IS NULL THEN 'completado'
        WHEN v.proxima_dosis < CURDATE() THEN 'vencida'
        WHEN v.proxima_dosis <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'proxima'
        ELSE 'aplicada'
      END AS estado_vacuna
    FROM vacunas_aplicadas v
    INNER JOIN usuarios u ON u.id = v.veterinario_id
    WHERE v.mascota_id = ? AND v.estado = 'activo'
    ORDER BY v.fecha_aplicacion DESC
  `,

  // Actualizar vacuna
  UPDATE_VACUNA: `
    UPDATE vacunas_aplicadas
    SET nombre_vacuna = ?, fecha_aplicacion = ?, proxima_dosis = ?, lote = ?, observaciones = ?, updated_at = NOW()
    WHERE id = ? AND estado = 'activo'
  `,

  // Eliminar vacuna (soft delete)
  DELETE_VACUNA: `
    UPDATE vacunas_aplicadas SET estado = 'inactivo' WHERE id = ?
  `,

  // Obtener alertas de vacunas próximas (próximos 30 días)
  FIND_ALERTAS_VACUNAS: `
    SELECT
      v.*,
      m.Nombre AS mascota_nombre,
      p.Id AS propietario_id,
      p.Nombre AS propietario_nombre,
      p.Telefono AS propietario_telefono,
      p.Correo AS propietario_correo,
      DATEDIFF(v.proxima_dosis, CURDATE()) AS dias_restantes,
      CASE
        WHEN v.proxima_dosis < CURDATE() THEN 'vencida'
        ELSE 'proxima'
      END AS estado_alerta
    FROM vacunas_aplicadas v
    INNER JOIN mascotas m ON m.Id = v.mascota_id
    INNER JOIN propietarios p ON p.Id = m.Id_Propietario
    WHERE v.proxima_dosis IS NOT NULL
      AND v.proxima_dosis <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND v.estado = 'activo'
    ORDER BY v.proxima_dosis ASC
  `,

  // Marcar notificación como enviada
  MARCAR_NOTIFICACION: `
    INSERT INTO notificaciones_vacunas (vacuna_id, propietario_id, notificado, fecha_notificacion)
    VALUES (?, ?, TRUE, NOW())
    ON DUPLICATE KEY UPDATE notificado = TRUE, fecha_notificacion = NOW()
  `,

  // Verificar si ya existe notificación
  CHECK_NOTIFICACION: `
    SELECT id FROM notificaciones_vacunas 
    WHERE vacuna_id = ? AND notificado = TRUE
    LIMIT 1
  `,
};

module.exports = VacunasQueries;