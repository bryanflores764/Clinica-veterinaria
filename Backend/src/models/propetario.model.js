// ============================================================
//  CAPA: Model
//  Archivo: propietarios.model.js
//
//  Responsabilidad:
//    • Define la "forma" del objeto Propietario.
//    • Centraliza todas las sentencias SQL del módulo.
//    • No ejecuta queries; sólo los expone como constantes.
// ============================================================

const PropietariosQueries = {
  /**
   * INSERT
   * Crea un nuevo propietario
   */
  CREATE: `
    INSERT INTO propietarios
      (Nombre, Telefono, Correo, Direccion)
    VALUES
      (?, ?, ?, ?)
  `,

  /**
   * UPDATE
   * Actualiza un propietario por ID
   */
  UPDATE: `
    UPDATE propietarios
    SET
      Nombre = ?,
      Telefono = ?,
      Correo = ?,
      Direccion = ?
    WHERE id = ?
  `,

  /**
   * Obtiene un propietario por ID
   */
  FIND_BY_ID: `
    SELECT
      id,
      Nombre,
      Telefono,
      Correo,
      Direccion
    FROM propietarios
    WHERE id = ?
    LIMIT 1
  `,

  /**
   * Lista todos los propietarios
   */
  FIND_ALL: `
    SELECT
      id,
      Nombre,
      Telefono,
      Correo,
      Direccion
    FROM propietarios
    ORDER BY Nombre ASC
  `,

  /**
   * Elimina un propietario por ID
   */
  DELETE_BY_ID: `
    DELETE FROM propietarios
    WHERE id = ?
  `,
};

module.exports = PropietariosQueries;