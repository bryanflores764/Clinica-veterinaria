const service = require('../services/estadocita.service');

const create = async (req, res) => {
  try {
    const { estado } = req.body;

    const data = await service.create(estado);

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