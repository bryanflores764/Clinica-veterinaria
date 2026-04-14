// ============================================================
//  CAPA: Model
//  Archivo: razas.model.js
// ============================================================

const RazasQueries = {
  CREATE: `
    INSERT INTO razas (Id_Especie, Nombre_Raza)
    VALUES (?, ?)
  `,

  FIND_ALL: `
    SELECT 
      r.Id,
      r.Nombre_Raza,
      r.Id_Especie,
      e.Nombre_Especie
    FROM razas r
    INNER JOIN especies e ON e.Id = r.Id_Especie
    ORDER BY e.Nombre_Especie, r.Nombre_Raza ASC
  `,

  FIND_BY_ID: `
    SELECT 
      r.Id,
      r.Nombre_Raza,
      r.Id_Especie,
      e.Nombre_Especie
    FROM razas r
    INNER JOIN especies e ON e.Id = r.Id_Especie
    WHERE r.Id = ?
    LIMIT 1
  `,

  UPDATE: `
    UPDATE razas
    SET
      Id_Especie = ?,
      Nombre_Raza = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM razas
    WHERE Id = ?
  `
};

module.exports = RazasQueries;