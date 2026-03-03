const rolesRepository = require("../repository/roles.repository");

const createRole = async (nombre_rol) => {
  if (!nombre_rol || nombre_rol.trim() === "") {
    throw { status: 400, message: "El nombre del rol es obligatorio" };
  }

  const existing = await rolesRepository.findRoleByName(nombre_rol.trim());
  if (existing) {
    throw { status: 409, message: `El rol "${nombre_rol}" ya existe` };
  }

  const newRole = await rolesRepository.createRole(nombre_rol.trim());
  return newRole;
};

const getAllRoles = async () => {
  const roles = await rolesRepository.findAllRoles();
  if (!roles.length) {
    throw { status: 404, message: "No hay roles registrados" };
  }
  return roles;
};

const updateRole = async (id, nombre_rol) => {
  if (!nombre_rol || nombre_rol.trim() === "") {
    throw { status: 400, message: "El nombre del rol es obligatorio" };
  }

  const role = await rolesRepository.findRoleById(id);
  if (!role) {
    throw { status: 404, message: `No existe un rol con id ${id}` };
  }

  const duplicate = await rolesRepository.findRoleByName(nombre_rol.trim());
  if (duplicate && duplicate.id !== parseInt(id)) {
    throw { status: 409, message: `El nombre "${nombre_rol}" ya está en uso` };
  }

  await rolesRepository.updateRole(id, nombre_rol.trim());
  return { id, Nombre_Rol: nombre_rol.trim() };
};

module.exports = { createRole, getAllRoles, updateRole };