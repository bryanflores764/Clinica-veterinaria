// ============================================================
//  CAPA: Service
//  Archivo: propietarios.service.js
// ============================================================

const propietariosRepository = require('../repository/propetario.repository');

const createPropietario = async (nombre, telefono, correo, direccion) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  if (correo) {
    const existing = await propietariosRepository.findPropietarioByCorreo(correo);
    if (existing) {
      throw { status: 409, message: `El correo "${correo}" ya está registrado` };
    }
  }

  return await propietariosRepository.createPropietario(nombre, telefono, correo, direccion);
};

const getAllPropietarios = async () => {
  const propietarios = await propietariosRepository.findAllPropietarios();

  if (!propietarios.length) {
    throw { status: 404, message: 'No hay propietarios registrados' };
  }

  return propietarios;
};

const updatePropietario = async (id, nombre, telefono, correo, direccion) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  const propietario = await propietariosRepository.findPropietarioById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe un propietario con id ${id}` };
  }

  // 🔴 BLOQUEO
  if (propietario.Estado === 'inactivo') {
    throw { status: 403, message: 'El propietario está inactivo y no puede modificarse' };
  }

  if (correo) {
    const duplicate = await propietariosRepository.findPropietarioByCorreo(correo);
    if (duplicate && duplicate.id !== parseInt(id)) {
      throw { status: 409, message: `El correo "${correo}" ya está en uso` };
    }
  }

  await propietariosRepository.updatePropietario(id, nombre, telefono, correo, direccion);

  return {
    id,
    Nombre: nombre,
    Telefono: telefono,
    Correo: correo,
    Direccion: direccion
  };
};

const toggleEstado = async (id) => {
  const propietario = await propietariosRepository.findPropietarioById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe un propietario con id ${id}` };
  }

  await propietariosRepository.toggleEstado(id);

  return await propietariosRepository.findPropietarioById(id);
};

const deletePropietario = async (id) => {
  const propietario = await propietariosRepository.findPropietarioById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe un propietario con id ${id}` };
  }

  await propietariosRepository.deletePropietario(id);

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
  toggleEstado
};