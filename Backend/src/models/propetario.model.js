// ============================================================
//  CAPA: Model
//  Archivo: propietarios.model.js
// ============================================================

const PropietariosQueries = {
  CREATE: `
    INSERT INTO propietarios
      (Nombre, Telefono, Correo, Direccion, Estado)
    VALUES
      (?, ?, ?, ?, 'activo')
  `,

  UPDATE: `
    UPDATE propietarios
    SET
      Nombre = ?,
      Telefono = ?,
      Correo = ?,
      Direccion = ?
    WHERE id = ?
  `,

  FIND_BY_ID: `
    SELECT
      id,
      Nombre,
      Telefono,
      Correo,
      Direccion,
      Estado
    FROM propietarios
    WHERE id = ?
    LIMIT 1
  `,

  FIND_ALL: `
    SELECT
      id,
      Nombre,
      Telefono,
      Correo,
      Direccion,
      Estado
    FROM propietarios
    ORDER BY Nombre ASC
  `,

  DELETE_BY_ID: `
    DELETE FROM propietarios
    WHERE id = ?
  `
};

module.exports = PropietariosQueries;