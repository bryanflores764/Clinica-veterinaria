const razasService = require('../services/razas.service');

const createRaza = async (req, res) => {
  try {
    const { especieId, nombre } = req.body;

    const raza = await razasService.createRaza(especieId, nombre);

    res.status(201).json({ success: true, data: raza });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getAllRazas = async (req, res) => {
  try {
    const razas = await razasService.getAllRazas();
    res.json({ success: true, data: razas });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const updateRaza = async (req, res) => {
  try {
    const { id } = req.params;
    const { especieId, nombre } = req.body;

    const updated = await razasService.updateRaza(id, especieId, nombre);

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const deleteRaza = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await razasService.deleteRaza(id);

    res.json({ success: true, message: result.mensaje });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRaza,
  getAllRazas,
  updateRaza,
  deleteRaza
};