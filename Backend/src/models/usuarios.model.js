// ============================================================
//  CAPA: Model
//  Archivo: usuarios.model.js
// ============================================================

const UsuariosQueries = {

  CREATE: `
    INSERT INTO usuarios (Nombre_Usuario, Correo, Contrasena, RolId)
    VALUES (?, ?, ?, ?)
  `,

  FIND_ALL: `
    SELECT u.id, u.Nombre_Usuario, u.Correo, u.activo, r.Nombre_Rol
    FROM usuarios u
    INNER JOIN roles r ON r.id = u.RolId
    ORDER BY u.id ASC
  `,

  FIND_BY_ID: `
    SELECT u.id, u.Nombre_Usuario, u.Correo, u.activo, u.RolId, u.Contrasena, r.Nombre_Rol
    FROM usuarios u
    INNER JOIN roles r ON r.id = u.RolId
    WHERE u.id = ?
    LIMIT 1
  `,

  FIND_BY_CORREO: `
    SELECT id, Nombre_Usuario, Correo, Contrasena, RolId, activo
    FROM usuarios
    WHERE Correo = ?
    LIMIT 1
  `,

  UPDATE: `
    UPDATE usuarios
    SET Nombre_Usuario = ?, Correo = ?, RolId = ?, Contrasena = ?
    WHERE id = ?
  `,

  TOGGLE_ACTIVO: `
    UPDATE usuarios
    SET activo = NOT activo
    WHERE id = ?
  `,

  DELETE: `
    DELETE FROM usuarios
    WHERE id = ?
  `,

};

module.exports = UsuariosQueries;