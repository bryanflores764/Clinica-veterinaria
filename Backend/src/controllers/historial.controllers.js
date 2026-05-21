// ============================================================
//  CAPA: Controller
//  Archivo: historial.controller.js
//  Módulos: Historial Clínico y Consultas Médicas
// ============================================================

const historialService = require('../services/historial.service');

const HistorialController = {

  // ============================================================
  //  HISTORIAL CLÍNICO
  // ============================================================

  // POST /api/historial
  async createHistorial(req, res) {
    try {
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await historialService.createHistorial(req.body, usuario_id, ip);
      res.status(201).json({
        success: true,
        message: 'Historial clínico creado exitosamente',
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/historial/:id
  async getHistorialById(req, res) {
    try {
      const { id } = req.params;
      const result = await historialService.getHistorialById(id);
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

  // GET /api/historial/mascota/:mascota_id
  async getHistorialByMascota(req, res) {
    try {
      const { mascota_id } = req.params;
      const result = await historialService.getHistorialByMascota(mascota_id);
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

  // PUT /api/historial/:id
  async updateHistorial(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await historialService.updateHistorial(id, req.body, usuario_id, ip);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // DELETE /api/historial/:id
  async deleteHistorial(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await historialService.deleteHistorial(id, usuario_id, ip);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // ============================================================
  //  CONSULTAS MÉDICAS
  // ============================================================

  // POST /api/historial/consultas
  async createConsulta(req, res) {
    try {
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await historialService.createConsulta(req.body, usuario_id, ip);
      res.status(201).json({
        success: true,
        message: 'Consulta médica agregada exitosamente',
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/historial/consultas/:id
  async getConsultaById(req, res) {
    try {
      const { id } = req.params;
      const result = await historialService.getConsultaById(id);
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

  // GET /api/historial/:historial_id/consultas
  async getConsultasByHistorial(req, res) {
    try {
      const { historial_id } = req.params;
      const result = await historialService.getConsultasByHistorial(historial_id);
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

  // PUT /api/historial/consultas/:id
  async updateConsulta(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await historialService.updateConsulta(id, req.body, usuario_id, ip);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // DELETE /api/historial/consultas/:id
  async deleteConsulta(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await historialService.deleteConsulta(id, usuario_id, ip);
      res.status(200).json({
        success: true,
        message: result.message,
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

module.exports = HistorialController;