// ============================================================
//  CAPA: Controller
//  Archivo: propietarios.controller.js
// ============================================================

const PropietariosRepository = require('../repository/propietarios.repository');

const PropietariosController = {

  async getAll(req, res) {
    try {
      const propietarios = await PropietariosRepository.findAll();
      res.status(200).json(propietarios);
    } catch (err) {
      res.status(err.status || 500).json({ errores: err.errores || ['Error interno del servidor.'] });
    }
  },

  async getById(req, res) {
    try {
      const propietario = await PropietariosRepository.findById(req.params.id);
      res.status(200).json(propietario);
    } catch (err) {
      res.status(err.status || 500).json({ errores: err.errores || ['Error interno del servidor.'] });
    }
  },

  async getByNombre(req, res) {
    try {
      const propietarios = await PropietariosRepository.findByNombre(req.query.nombre);
      res.status(200).json(propietarios);
    } catch (err) {
      res.status(err.status || 500).json({ errores: err.errores || ['Error interno del servidor.'] });
    }
  },

  async create(req, res) {
    try {
      const result = await PropietariosRepository.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ errores: err.errores || ['Error interno del servidor.'] });
    }
  },

  async update(req, res) {
    try {
      const result = await PropietariosRepository.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ errores: err.errores || ['Error interno del servidor.'] });
    }
  },

  async delete(req, res) {
    try {
      const result = await PropietariosRepository.delete(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ errores: err.errores || ['Error interno del servidor.'] });
    }
  },

};

module.exports = PropietariosController;
