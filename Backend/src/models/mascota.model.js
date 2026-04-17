const MascotasQueries = {

  CREATE: `
    INSERT INTO Mascotas
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
    FROM Mascotas m
    INNER JOIN Propietarios p ON p.Id = m.Id_Propietario
    INNER JOIN Razas r ON r.Id = m.Id_Raza
    INNER JOIN Especies e ON e.Id = r.Id_Especie
  `,

  FIND_BY_ID: `
    SELECT * FROM Mascotas WHERE Id = ?
  `,

  UPDATE: `
    UPDATE Mascotas
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
    DELETE FROM Mascotas WHERE Id = ?
  `
};

module.exports = MascotasQueries;