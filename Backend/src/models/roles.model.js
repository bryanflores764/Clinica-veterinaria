// ============================================================
//  CAPA: Model
//  Archivo: roles.model.js
//
//  Responsabilidad:
//    • Define la "forma" del objeto Rol.
//    • Centraliza todas las sentencias SQL del módulo.
//    • No ejecuta queries; sólo los expone como constantes.
// ============================================================

const RolesQueries = {

  /** Inserta un nuevo rol */
  CREATE: `
    INSERT INTO roles (Nombre_Rol)
    VALUES (?)
  `,

  /** Lista todos los roles */
  FIND_ALL: `
    SELECT id, Nombre_Rol
    FROM roles
    ORDER BY id ASC
  `,

  /** Busca un rol por su ID */
  FIND_BY_ID: `
    SELECT id, Nombre_Rol
    FROM roles
    WHERE id = ?
    LIMIT 1
  `,

  /** Busca un rol por nombre (para validar duplicados) */
  FIND_BY_NAME: `
    SELECT id, Nombre_Rol
    FROM roles
    WHERE Nombre_Rol = ?
    LIMIT 1
  `,

  /** Actualiza el nombre de un rol */
  UPDATE: `
    UPDATE roles
    SET Nombre_Rol = ?
    WHERE id = ?
  `,
};

module.exports = RolesQueries;