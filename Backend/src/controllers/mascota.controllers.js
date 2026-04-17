const mascotasService = require('../services/mascota.service');

const createMascota = async (req, res) => {
  try {
    const { propietarioId, razaId, nombre, fecha_nacimiento, peso, color } = req.body;

    const mascota = await mascotasService.createMascota(
      propietarioId,
      razaId,
      nombre,
      fecha_nacimiento,
      peso,
      color
    );

    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: mascota
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const getAllMascotas = async (req, res) => {
  try {
    const mascotas = await mascotasService.getAllMascotas();

    res.status(200).json({
      success: true,
      data: mascotas
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const updateMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { propietarioId, razaId, nombre, fecha_nacimiento, peso, color } = req.body;

    const updated = await mascotasService.updateMascota(
      id,
      propietarioId,
      razaId,
      nombre,
      fecha_nacimiento,
      peso,
      color
    );

    res.status(200).json({
      success: true,
      message: 'Mascota actualizada',
      data: updated
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

const deleteMascota = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await mascotasService.deleteMascota(id);

    res.status(200).json({
      success: true,
      message: result.mensaje
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createMascota,
  getAllMascotas,
  updateMascota,
  deleteMascota
};