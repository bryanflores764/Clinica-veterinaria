const especiesService = require('../services/especies.service');

const createEspecie = async (req, res) => {
  try {
    const { nombre } = req.body;
    const especie = await especiesService.createEspecie(nombre);

    res.status(201).json({ success: true, data: especie });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getAllEspecies = async (req, res) => {
  try {
    const especies = await especiesService.getAllEspecies();
    res.json({ success: true, data: especies });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const updateEspecie = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const updated = await especiesService.updateEspecie(id, nombre);

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const deleteEspecie = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await especiesService.deleteEspecie(id);

    res.json({ success: true, message: result.mensaje });

  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createEspecie,
  getAllEspecies,
  updateEspecie,
  deleteEspecie
};