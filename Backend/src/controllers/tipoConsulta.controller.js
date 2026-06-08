const service = require('../services/tipoConsulta.service');

const create = async (req, res) => {
  try {
    const { tipo, descripcion, precio } = req.body;
    const data = await service.create(tipo, descripcion, precio);
    res.status(201).json({ success: true, message: 'Tipo de consulta creado exitosamente', data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.status(200).json({ success: true, message: 'Tipos de consulta obtenidos', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Tipo de consulta encontrado', data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { tipo, descripcion, precio } = req.body;
    const data = await service.update(req.params.id, tipo, descripcion, precio);
    res.status(200).json({ success: true, message: 'Tipo de consulta actualizado exitosamente', data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await service.remove(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getAll, getById, update, remove };