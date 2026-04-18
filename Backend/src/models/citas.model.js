// ============================================================
//  CAPA: Model
//  Archivo: citas.model.js
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

};

module.exports = CitasQueries;