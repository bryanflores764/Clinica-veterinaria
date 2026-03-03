// ============================================================
//  CAPA: Middleware
//  Archivo: permisos.middleware.js  (va en /middlewares/)
//
//  Responsabilidad:
//    • Expone verificarPermiso(modulo, accion), un middleware de orden
//      superior que protege cualquier endpoint de forma dinámica.
//    • Lee req.usuario.RolId (lo inyecta el middleware de autenticación
//      que ya existe en el proyecto).
//    • Consulta la tabla Permisos para verificar si el rol tiene la
//      acción solicitada sobre el módulo indicado.
//    • Si no tiene permiso → responde 403 Forbidden.
//    • Si tiene permiso    → llama next() y continúa la cadena.
// ============================================================

const PermisosService = require('../services/permisos.service');

/**
 * Middleware dinámico de autorización por permisos.
 *
 * @param {string} modulo  - Nombre del módulo a proteger, ej: "Usuarios"
 * @param {string} accion  - Columna de permiso: "Puede_Crear" | "Puede_Leer"
 *                           | "Puede_Editar" | "Puede_Eliminar"
 * @returns {Function} Middleware de Express (req, res, next)
 *
 * @example
 * // Proteger la creación de usuarios
 * router.post(
 *   '/usuarios',
 *   verificarPermiso('Usuarios', 'Puede_Crear'),
 *   UsuariosController.crearUsuario
 * );
 */
const verificarPermiso = (modulo, accion) => {
  return async (req, res, next) => {
    try {
      // ── 1. Verificar que el middleware de autenticación ya corrió ──
      if (!req.usuario || !req.usuario.RolId) {
        return res.status(401).json({
          ok     : false,
          mensaje: 'No autenticado. Se requiere token de sesión.',
        });
      }

      const { RolId } = req.usuario;

      // ── 2. Consultar la tabla Permisos vía el Service ──
      const tiene = await PermisosService.tienePermiso(RolId, modulo, accion);

      // ── 3. Denegar si no tiene el permiso requerido ──
      if (!tiene) {
        return res.status(403).json({
          ok     : false,
          mensaje: `Acceso denegado. No tienes permiso "${accion}" sobre el módulo "${modulo}".`,
        });
      }

      // ── 4. Tiene permiso → continuar ──
      return next();

    } catch (error) {
      // Error inesperado (BD caída, acción inválida, etc.)
      console.error('[verificarPermiso] Error:', error.message);

      const status = error.statusCode || 500;
      return res.status(status).json({
        ok     : false,
        mensaje: error.message || 'Error interno al verificar permisos.',
      });
    }
  };
};

module.exports = { verificarPermiso };