// ============================================================
//  CAPA: Controller
//  Archivo: propietario.controller.js
// ============================================================

const propietarioService = require('../services/propetario.service');

const createPropietario = async (req, res) => {
  try {
    const { nombre, telefono, correo, direccion } = req.body;

    const propietario = await propietarioService.createPropietario(
      nombre,
      telefono,
      correo,
      direccion
    );

    return res.status(201).json({
      success: true,
      message: 'Propietario creado exitosamente',
      data: propietario
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  }
};

const getAllPropietarios = async (req, res) => {
  try {
    const propietarios = await propietarioService.getAllPropietarios();

    return res.status(200).json({
      success: true,
      message: 'Propietarios obtenidos exitosamente',
      data: propietarios
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  }
};

const updatePropietario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion } = req.body;

    const updated = await propietarioService.updatePropietario(
      id,
      nombre,
      telefono,
      correo,
      direccion
    );

    return res.status(200).json({
      success: true,
      message: 'Propietario actualizado exitosamente',
      data: updated
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  }
};

const deletePropietario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await propietarioService.deletePropietario(id);

    return res.status(200).json({
      success: true,
      message: result.mensaje
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  }
};

module.exports = {
  createPropietario,
  getAllPropietarios,
  updatePropietario,
  deletePropietario,
};