// ============================================================
//  CAPA: Controller
//  Archivo: permisos.controller.js
//
//  Responsabilidad:
//    • Recibe la solicitud HTTP (req) y envía la respuesta (res).
//    • Extrae y pasa parámetros al Service.
//    • Maneja los errores que lanza el Service y responde con el
//      código HTTP adecuado.
//    • NO contiene lógica de negocio ni SQL.
// ============================================================

const PermisosService = require('../services/permisos.service');

const PermisosController = {
  /**
   * POST /permisos
   * Inserta o actualiza un permiso (upsert).
   *
   * Body esperado:
   * {
   *   "RolId"         : 1,
   *   "Modulo"        : "Usuarios",
   *   "Puede_Crear"   : 1,
   *   "Puede_Leer"    : 1,
   *   "Puede_Editar"  : 0,
   *   "Puede_Eliminar": 0
   * }
   */
  async asignarPermiso(req, res) {
    try {
      const resultado = await PermisosService.asignarPermiso(req.body);

      return res.status(200).json({
        ok     : true,
        mensaje: resultado.mensaje,
        data   : {
          insertId : resultado.insertId,
          afectados: resultado.afectados,
        },
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        ok     : false,
        mensaje: error.message || 'Error interno del servidor.',
      });
    }
  },

  /**
   * GET /permisos
   * Devuelve todos los permisos (con nombre de rol).
   * Útil para el panel de administración.
   */
  async obtenerTodos(req, res) {
    try {
      const permisos = await PermisosService.obtenerTodosLosPermisos();

      return res.status(200).json({
        ok  : true,
        data: permisos,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        ok     : false,
        mensaje: error.message || 'Error interno del servidor.',
      });
    }
  },

  /**
   * GET /permisos/rol/:rolId
   * Devuelve todos los permisos de un rol específico.
   */
  async obtenerPorRol(req, res) {
    try {
      const { rolId } = req.params;
      const permisos = await PermisosService.obtenerPermisosPorRol(rolId);

      return res.status(200).json({
        ok  : true,
        data: permisos,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        ok     : false,
        mensaje: error.message || 'Error interno del servidor.',
      });
    }
  },

  /**
   * DELETE /permisos/rol/:rolId/modulo/:modulo
   * Elimina el permiso de un rol sobre un módulo.
   */
  async eliminarPermiso(req, res) {
    try {
      const { rolId, modulo } = req.params;
      const resultado = await PermisosService.eliminarPermiso(rolId, modulo);

      return res.status(200).json({
        ok     : true,
        mensaje: resultado.mensaje,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        ok     : false,
        mensaje: error.message || 'Error interno del servidor.',
      });
    }
  },
};

module.exports = PermisosController;