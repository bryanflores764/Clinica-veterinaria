const service = require('../services/tipoConsulta.service');

const create = async (req, res) => {
  try {
    const { tipo } = req.body;
    const data = await service.create(tipo);

    res.status(201).json({ success: true, data });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const getAll = async (req, res) => {
  try {
    const data = await service.getAll();

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  create,
  getAll
};