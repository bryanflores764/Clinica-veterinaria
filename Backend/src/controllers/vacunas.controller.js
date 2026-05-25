// ============================================================
//  CAPA: Controller
//  Archivo: vacunas.controller.js
//  Módulo: Vacunas Aplicadas
// ============================================================

const vacunasService = require('../services/vacunas.service');

const VacunasController = {

  // POST /api/vacunas
  async createVacuna(req, res) {
    try {
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await vacunasService.createVacuna(req.body, usuario_id, ip);
      res.status(201).json({
        success: true,
        message: 'Vacuna registrada exitosamente',
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // GET /api/vacunas/:id
  async getVacunaById(req, res) {
    try {
      const { id } = req.params;
      const result = await vacunasService.getVacunaById(id);
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

  // GET /api/vacunas/mascota/:mascota_id (CON ORDENAMIENTO DINÁMICO)
  async getVacunasByMascota(req, res) {
    try {
      const { mascota_id } = req.params;
      const { order_by = 'fecha_aplicacion', order = 'DESC' } = req.query;
      
      const result = await vacunasService.getVacunasByMascota(mascota_id, order_by, order);
      res.status(200).json({
        success: true,
        data: result,
        ordenamiento: {
          order_by: order_by,
          order: order.toUpperCase()
        }
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // PUT /api/vacunas/:id
  async updateVacuna(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await vacunasService.updateVacuna(id, req.body, usuario_id, ip);
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

  // DELETE /api/vacunas/:id
  async deleteVacuna(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      const result = await vacunasService.deleteVacuna(id, usuario_id, ip);
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

  // GET /api/vacunas/alertas
  async getAlertasVacunas(req, res) {
    try {
      const result = await vacunasService.getAlertasVacunas();
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

  // POST /api/vacunas/:id/notificar
  async marcarNotificacion(req, res) {
    try {
      const { id } = req.params;
      const { propietario_id } = req.body;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection.remoteAddress;

      if (!propietario_id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del propietario es obligatorio'
        });
      }

      const result = await vacunasService.marcarNotificacion(id, propietario_id, usuario_id, ip);
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

module.exports = VacunasController;