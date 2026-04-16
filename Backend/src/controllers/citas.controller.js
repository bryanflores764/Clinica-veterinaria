// ============================================================
//  CAPA: Controller
//  Archivo: citas.controller.js
// ============================================================

const citasService = require('../services/citas.service');

const CitasController = {

  async getAll(req, res) {
    try {
      const citas = await citasService.getAllCitas();
      res.status(200).json(citas);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  async getById(req, res) {
    try {
      const cita = await citasService.getCitaById(req.params.id);
      res.status(200).json(cita);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  async getByMascota(req, res) {
    try {
      const citas = await citasService.getCitasByMascota(req.params.idMascota);
      res.status(200).json(citas);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  async create(req, res) {
    try {
      const { Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora } = req.body;
      const result = await citasService.createCita(Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora);
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  async update(req, res) {
    try {
      const { Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora } = req.body;
      const result = await citasService.updateCita(req.params.id, Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora);
      res.status(200).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  async updateEstado(req, res) {
    try {
      const { IdEstadoCita } = req.body;
      const result = await citasService.updateEstadoCita(req.params.id, IdEstadoCita);
      res.status(200).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  async delete(req, res) {
    try {
      const result = await citasService.deleteCita(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

};

module.exports = CitasController;