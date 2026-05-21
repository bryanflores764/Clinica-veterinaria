// ============================================================
//  CAPA: Controller
//  Archivo: auditoria.controller.js
//  Módulo: Auditoría de Acciones
//  Nota: Solo accesible para administradores
// ============================================================

const auditoriaService = require('../services/auditoria.service');

const AuditoriaController = {

  // GET /api/auditoria
  async getAllAcciones(req, res) {
    try {
      const { usuario_id, modulo, accion, fecha_inicio, fecha_fin, limit, offset } = req.query;

      const filtros = {};
      if (usuario_id) filtros.usuario_id = usuario_id;
      if (modulo) filtros.modulo = modulo;
      if (accion) filtros.accion = accion;
      if (fecha_inicio && fecha_fin) {
        filtros.fecha_inicio = fecha_inicio;
        filtros.fecha_fin = fecha_fin;
      }
      if (limit) filtros.limit = parseInt(limit);
      if (offset) filtros.offset = parseInt(offset);

      const result = await auditoriaService.getAllAcciones(filtros);
      res.status(200).json({
        success: true,
        data: result,
        total: result.length
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/usuario/:usuario_id
  async getAccionesByUsuario(req, res) {
    try {
      const { usuario_id } = req.params;
      const result = await auditoriaService.getAccionesByUsuario(usuario_id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/modulo/:modulo
  async getAccionesByModulo(req, res) {
    try {
      const { modulo } = req.params;
      const result = await auditoriaService.getAccionesByModulo(modulo);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/accion/:accion
  async getAccionesByAccion(req, res) {
    try {
      const { accion } = req.params;
      const result = await auditoriaService.getAccionesByAccion(accion);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/fecha/:fecha_inicio/:fecha_fin
  async getAccionesByFechaRango(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.params;
      const result = await auditoriaService.getAccionesByFechaRango(fecha_inicio, fecha_fin);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/dashboard/modulos
  async getCountAccionesByModulo(req, res) {
    try {
      const result = await auditoriaService.getCountAccionesByModulo();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/dashboard/usuarios
  async getCountAccionesByUsuario(req, res) {
    try {
      const result = await auditoriaService.getCountAccionesByUsuario();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
};

module.exports = AuditoriaController;