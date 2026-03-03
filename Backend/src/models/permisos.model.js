// ============================================================
//  CAPA: Model
//  Archivo: permisos.model.js
//
//  Responsabilidad:
//    • Define la "forma" del objeto Permiso.
//    • Centraliza todas las sentencias SQL del módulo.
//    • No ejecuta queries; sólo los expone como constantes.
// ============================================================

const PermisosQueries = {
  /**
   * INSERT … ON DUPLICATE KEY UPDATE
   * Crea el permiso si no existe; lo actualiza si ya existe.
   */
  UPSERT: `
    INSERT INTO permisos
      (RolId, Modulo, Puede_Crear, Puede_Leer, Puede_Editar, Puede_Eliminar)
    VALUES
      (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      Puede_Crear    = VALUES(Puede_Crear),
      Puede_Leer     = VALUES(Puede_Leer),
      Puede_Editar   = VALUES(Puede_Editar),
      Puede_Eliminar = VALUES(Puede_Eliminar)
  `,

  /** Obtiene el permiso de un rol para un módulo específico */
  FIND_BY_ROL_AND_MODULO: `
    SELECT
      id,
      RolId,
      Modulo,
      Puede_Crear,
      Puede_Leer,
      Puede_Editar,
      Puede_Eliminar
    FROM permisos
    WHERE RolId = ? AND Modulo = ?
    LIMIT 1
  `,

  /** Lista todos los permisos de un rol */
  FIND_ALL_BY_ROL: `
    SELECT
      id,
      RolId,
      Modulo,
      Puede_Crear,
      Puede_Leer,
      Puede_Editar,
      Puede_Eliminar
    FROM permisos
    WHERE RolId = ?
    ORDER BY Modulo ASC
  `,

  /** Lista todos los permisos (útil para admins) */
  FIND_ALL: `
    SELECT
      p.id,
      p.RolId,
      r.Nombre_Rol,
      p.Modulo,
      p.Puede_Crear,
      p.Puede_Leer,
      p.Puede_Editar,
      p.Puede_Eliminar
    FROM permisos p
    INNER JOIN roles r ON r.id = p.RolId
    ORDER BY r.Nombre_Rol, p.Modulo ASC
  `,

  /** Elimina el permiso de un rol sobre un módulo */
  DELETE_BY_ROL_AND_MODULO: `
    DELETE FROM permisos
    WHERE RolId = ? AND Modulo = ?
  `,
};

module.exports = PermisosQueries;