// ============================================================
//  CAPA: Model
//  Archivo: citas.model.js (MODIFICADO)
// ============================================================

const CitasQueries = {

  CREATE: `
    INSERT INTO citas (Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora)
    VALUES (?, ?, ?, ?, ?)
  `,

  FIND_ALL: `
    SELECT 
      c.IdCita,
      c.FechaHora,
      m.Nombre AS Mascota,
      u.Nombre_Usuario AS Veterinario,
      tc.Tipo_Consulta,
      ec.Estado
    FROM citas c
    INNER JOIN mascotas m ON m.Id = c.Id_Mascota
    INNER JOIN usuarios u ON u.id = c.Id_Veterinario
    INNER JOIN tipoconsulta tc ON tc.Id = c.IdTipoConsulta
    INNER JOIN estadocita ec ON ec.Id = c.IdEstadoCita
    ORDER BY c.FechaHora DESC
  `,

  FIND_BY_ID: `
    SELECT 
      c.IdCita,
      c.Id_Mascota,
      c.Id_Veterinario,
      c.IdTipoConsulta,
      c.IdEstadoCita,
      c.FechaHora,
      m.Nombre AS Mascota,
      u.Nombre_Usuario AS Veterinario,
      tc.Tipo_Consulta,
      ec.Estado
    FROM citas c
    INNER JOIN mascotas m ON m.Id = c.Id_Mascota
    INNER JOIN usuarios u ON u.id = c.Id_Veterinario
    INNER JOIN tipoconsulta tc ON tc.Id = c.IdTipoConsulta
    INNER JOIN estadocita ec ON ec.Id = c.IdEstadoCita
    WHERE c.IdCita = ?
    LIMIT 1
  `,

  FIND_BY_MASCOTA: `
    SELECT 
      c.IdCita,
      c.FechaHora,
      u.Nombre_Usuario AS Veterinario,
      tc.Tipo_Consulta,
      ec.Estado
    FROM citas c
    INNER JOIN usuarios u ON u.id = c.Id_Veterinario
    INNER JOIN tipoconsulta tc ON tc.Id = c.IdTipoConsulta
    INNER JOIN estadocita ec ON ec.Id = c.IdEstadoCita
    WHERE c.Id_Mascota = ?
    ORDER BY c.FechaHora DESC
  `,

  UPDATE: `
    UPDATE citas
    SET Id_Mascota = ?, Id_Veterinario = ?, IdTipoConsulta = ?, IdEstadoCita = ?, FechaHora = ?
    WHERE IdCita = ?
  `,

  UPDATE_ESTADO: `
    UPDATE citas
    SET IdEstadoCita = ?
    WHERE IdCita = ?
  `,

  DELETE: `
    DELETE FROM citas
    WHERE IdCita = ?
  `,

  // ============================================================
  //  NUEVAS CONSULTAS PARA VALIDACIONES (AGREGAR)
  // ============================================================

  // 1. Buscar cita por mascota en una fecha específica (mismo día)
  FIND_BY_MASCOTA_AND_FECHA: `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Mascota = ? 
      AND DATE(FechaHora) = DATE(?)
      AND IdEstadoCita NOT IN (3)
    LIMIT 1
  `,

  // 1b. Buscar cita por mascota en una fecha (excluyendo un ID)
  FIND_BY_MASCOTA_AND_FECHA_EXCLUDE: `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Mascota = ? 
      AND DATE(FechaHora) = DATE(?)
      AND IdEstadoCita NOT IN (3)
      AND IdCita != ?
    LIMIT 1
  `,

  // 2. Buscar cita por veterinario en una fecha/hora específica
  FIND_BY_VETERINARIO_AND_FECHA: `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Veterinario = ? 
      AND FechaHora = ?
      AND IdEstadoCita NOT IN (3)
    LIMIT 1
  `,

  // 2b. Buscar cita por veterinario en una fecha/hora (excluyendo un ID)
  FIND_BY_VETERINARIO_AND_FECHA_EXCLUDE: `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Veterinario = ? 
      AND FechaHora = ?
      AND IdEstadoCita NOT IN (3)
      AND IdCita != ?
    LIMIT 1
  `,

  // 3. Buscar cita duplicada exacta (misma mascota, mismo veterinario, misma fecha/hora)
  FIND_DUPLICADA: `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Mascota = ? 
      AND Id_Veterinario = ?
      AND FechaHora = ?
      AND IdEstadoCita NOT IN (3)
    LIMIT 1
  `,

  // 3b. Buscar cita duplicada exacta (excluyendo un ID)
  FIND_DUPLICADA_EXCLUDE: `
    SELECT IdCita, Id_Mascota, Id_Veterinario, FechaHora, IdEstadoCita
    FROM citas
    WHERE Id_Mascota = ? 
      AND Id_Veterinario = ?
      AND FechaHora = ?
      AND IdEstadoCita NOT IN (3)
      AND IdCita != ?
    LIMIT 1
  `,

};

module.exports = CitasQueries;