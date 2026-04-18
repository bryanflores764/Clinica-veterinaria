const MascotasQueries = {

  CREATE: `
    INSERT INTO mascotas
    (Id_Propietario, Id_Raza, Nombre, Fecha_Nacimiento, Peso, Color)
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  FIND_ALL: `
    SELECT 
      m.Id,
      m.Nombre,
      m.Fecha_Nacimiento,
      m.Peso,
      m.Color,
      p.Nombre AS Propietario,
      r.Nombre_Raza,
      e.Nombre_Especie
    FROM mascotas m
    INNER JOIN propietarios p ON p.Id = m.Id_Propietario
    INNER JOIN razas r ON r.Id = m.Id_Raza
    INNER JOIN especies e ON e.Id = r.Id_Especie
  `,

  FIND_BY_ID: `
    SELECT * FROM mascotas WHERE Id = ?
  `,

  UPDATE: `
    UPDATE mascotas
    SET 
      Id_Propietario = ?,
      Id_Raza = ?,
      Nombre = ?,
      Fecha_Nacimiento = ?,
      Peso = ?,
      Color = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM mascotas WHERE Id = ?
  `
};

module.exports = MascotasQueries;