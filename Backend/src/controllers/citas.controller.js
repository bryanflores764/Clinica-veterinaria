// ============================================================
//  CAPA: Controller
//  Archivo: citas.controller.js  (CORREGIDO)
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
      const result = await citasService.createCita(
        Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor.' });
    }
  },

  // FIX: parsear explícitamente los valores del body antes de pasarlos al service
  async update(req, res) {
  try {
    const id = req.params.id;
    const { Id_Mascota, Id_Veterinario, IdTipoConsulta, IdEstadoCita, FechaHora } = req.body;;

    // IMPORTANTE: Si Id_Veterinario es "null" o "undefined" como string, convertirlo
    const cleanVeterinario = (Id_Veterinario === 'null' || Id_Veterinario === 'undefined') 
      ? undefined 
      : Id_Veterinario;

    const result = await citasService.updateCita(
      id,
      Id_Mascota     ? Number(Id_Mascota)     : undefined,
      cleanVeterinario ? Number(cleanVeterinario) : undefined,  // ← clave
      IdTipoConsulta ? Number(IdTipoConsulta) : undefined,
      IdEstadoCita   ? Number(IdEstadoCita)   : undefined,
      FechaHora
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    console.error(`❌ [Controller PUT /citas] Error:`, err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor.'
    });
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

  async getCitasByVeterinario(req, res) {
    try {
      const citas = await citasService.getCitasByVeterinario(req.params.id);
      res.status(200).json({ success: true, data: citas });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor.' });
    }
  },

  async getCitasByMascotaId(req, res) {
    try {
      const citas = await citasService.getCitasByMascotaId(req.params.id);
      res.status(200).json({ success: true, data: citas });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor.' });
    }
  },

  async completarCita(req, res) {
    try {
      const result = await citasService.completarCita(req.params.id);
      res.status(200).json({ success: true, message: result.message, data: result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message || 'Error interno del servidor.' });
    }
  }
};

module.exports = CitasController;