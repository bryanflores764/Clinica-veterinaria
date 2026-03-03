const rolesService = require("../services/roles.service");

const createRole = async (req, res) => {
  try {
    const { nombre_rol } = req.body;
    const role = await rolesService.createRole(nombre_rol);
    return res.status(201).json({
      success: true,
      message: "Rol creado exitosamente",
      data: role,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Error interno del servidor",
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await rolesService.getAllRoles();
    return res.status(200).json({
      success: true,
      message: "Roles obtenidos exitosamente",
      data: roles,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Error interno del servidor",
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_rol } = req.body;
    const updated = await rolesService.updateRole(id, nombre_rol);
    return res.status(200).json({
      success: true,
      message: "Rol actualizado exitosamente",
      data: updated,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Error interno del servidor",
    });
  }
};

module.exports = { createRole, getAllRoles, updateRole };