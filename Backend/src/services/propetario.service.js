// ============================================================
//  CAPA: Service
//  Archivo: propietario.service.js
// ============================================================

const propietarioRepository = require('../repository/propetario.repository');

const createPropietario = async (nombre, telefono, correo, direccion) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  if (correo) {
    const existing = await propietarioRepository.findPropietarioByCorreo(correo);
    if (existing) {
      throw { status: 409, message: `El correo "${correo}" ya está registrado` };
    }
  }

  return await propietarioRepository.createPropietario(nombre, telefono, correo, direccion);
};

const getAllPropietarios = async () => {
  const propietarios = await propietarioRepository.findAllPropietarios();

  if (!propietarios.length) {
    throw { status: 404, message: 'No hay propietarios registrados' };
  }

  return propietarios;
};

const updatePropietario = async (id, nombre, telefono, correo, direccion) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  const propietario = await propietarioRepository.findPropietarioById(id);
  if (!propietario) {
    throw { status: 404, message: `No existe un propietario con id ${id}` };
  }

  if (correo) {
    const duplicate = await propietarioRepository.findPropietarioByCorreo(correo);
    if (duplicate && duplicate.id !== parseInt(id)) {
      throw { status: 409, message: `El correo "${correo}" ya está en uso` };
    }
  }

  await propietarioRepository.updatePropietario(id, nombre, telefono, correo, direccion);

  return {
    id,
    Nombre: nombre,
    Telefono: telefono,
    Correo: correo,
    Direccion: direccion
  };
};

const deletePropietario = async (id) => {
  const propietario = await propietarioRepository.findPropietarioById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe un propietario con id ${id}` };
  }

  await propietarioRepository.deletePropietario(id);

  return {
    id,
    mensaje: `Propietario "${propietario.Nombre}" eliminado exitosamente`
  };
};

module.exports = {
  createPropietario,
  getAllPropietarios,
  updatePropietario,
  deletePropietario,
};