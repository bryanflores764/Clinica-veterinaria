// ============================================================
//  CAPA: Controller
//  Archivo: auditoria.controller.js
//  Módulo: Auditoría de Acciones
// ============================================================

const auditoriaService = require('../services/auditoria.service');

const AuditoriaController = {

  // GET /api/auditoria?page=1&limit=20&usuario_id=1&modulo=ventas...
  async getAllAcciones(req, res) {
    try {
      const { 
        usuario_id, modulo, accion, fecha_inicio, fecha_fin, 
        page = 1, limit = 20 
      } = req.query;

      const filtros = {};
      if (usuario_id) filtros.usuario_id = usuario_id;
      if (modulo) filtros.modulo = modulo;
      if (accion) filtros.accion = accion;
      if (fecha_inicio && fecha_fin) {
        filtros.fecha_inicio = fecha_inicio;
        filtros.fecha_fin = fecha_fin;
      }

      const result = await auditoriaService.getAllAcciones(filtros, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/usuario/:usuario_id?page=1&limit=20
  async getAccionesByUsuario(req, res) {
    try {
      const { usuario_id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await auditoriaService.getAccionesByUsuario(usuario_id, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/modulo/:modulo?page=1&limit=20
  async getAccionesByModulo(req, res) {
    try {
      const { modulo } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await auditoriaService.getAccionesByModulo(modulo, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/accion/:accion?page=1&limit=20
  async getAccionesByAccion(req, res) {
    try {
      const { accion } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await auditoriaService.getAccionesByAccion(accion, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/fecha/:fecha_inicio/:fecha_fin?page=1&limit=20
  async getAccionesByFechaRango(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await auditoriaService.getAccionesByFechaRango(
        fecha_inicio, fecha_fin, parseInt(page), parseInt(limit)
      );
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/auditoria/dashboard/modulos (sin paginación)
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

  // GET /api/auditoria/dashboard/usuarios (sin paginación)
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