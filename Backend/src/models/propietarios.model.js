// ============================================================
//  CAPA: Model
//  Archivo: propietarios.model.js
// ============================================================

const PropietariosQueries = {

    // Crear el usuario
  CREATE: `
    INSERT INTO Propietarios (Nombre, Telefono, Correo, Direccion)
    VALUES (?, ?, ?, ?)
  `,
    // Encontrar todos los datos
  FIND_ALL: `
    SELECT Id, Nombre, Telefono, Correo, Direccion
    FROM Propietarios
    ORDER BY Nombre ASC
  `,
    // Encontrar por id
  FIND_BY_ID: `
    SELECT Id, Nombre, Telefono, Correo, Direccion
    FROM Propietarios
    WHERE Id = ?
    LIMIT 1
  `,

  FIND_BY_NOMBRE: `
    SELECT Id, Nombre, Telefono, Correo, Direccion
    FROM Propietarios
    WHERE Nombre LIKE ?
    LIMIT 10
  `,

  FIND_BY_CORREO: `
    SELECT Id, Nombre, Telefono, Correo, Direccion
    FROM Propietarios
    WHERE Correo = ?
    LIMIT 1
  `,

  UPDATE: `
    UPDATE Propietarios
    SET Nombre = ?, Telefono = ?, Correo = ?, Direccion = ?
    WHERE Id = ?
  `,

  DELETE: `
    DELETE FROM Propietarios
    WHERE Id = ?
  `,

};

module.exports = PropietariosQueries;
