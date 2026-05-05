const categoriasService = require('../services/categorias.service');

const createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    const categoria = await categoriasService.createCategoria(nombre);

    res.status(201).json({
      success: true,
      message: 'Categoría creada',
      data: categoria
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await categoriasService.getCategorias();

    res.json({
      success: true,
      data: categorias
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const result = await categoriasService.updateCategoria(id, nombre);

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await categoriasService.deleteCategoria(id);

    res.json({
      success: true,
      message: result.mensaje,
      data: result
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createCategoria,
  getCategorias,
  updateCategoria,
  deleteCategoria
};