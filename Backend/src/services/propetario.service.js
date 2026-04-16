// ============================================================
//  CAPA: Service
//  Archivo: propietarios.service.js
// ============================================================

const propietariosRepository = require('../repository/propetario.repository');

const createPropietario = async (nombre, telefono, correo, direccion) => {
  if (!nombre || !correo) {
    throw { status: 400, message: 'Nombre y correo son obligatorios' };
  }

  const existing = await propietariosRepository.findByCorreo(correo);
  if (existing) {
    throw { status: 409, message: `El correo "${correo}" ya está registrado` };
  }

  return await propietariosRepository.createPropietario(
    nombre,
    telefono,
    correo,
    direccion
  );
};

const getAllPropietarios = async () => {
  const propietarios = await propietariosRepository.findAll();
  if (!propietarios.length) {
    throw { status: 404, message: 'No hay propietarios registrados' };
  }
  return propietarios;
};

const updatePropietario = async (id, nombre, telefono, correo, direccion) => {
  if (!nombre || !correo) {
    throw { status: 400, message: 'Nombre y correo son obligatorios' };
  }

  const propietario = await propietariosRepository.findById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe propietario con id ${id}` };
  }

  // 🔥 Validar estado
  if (propietario.Estado === 'inactivo') {
    throw {
      status: 403,
      message: 'El propietario está inactivo'
    };
  }

  // 🔥 Validar duplicado correctamente
  const existente = await propietariosRepository.findByCorreo(correo);

  if (existente && existente.Id !== parseInt(id)) {
    throw {
      status: 409,
      message: `El correo "${correo}" ya está en uso`
    };
  }

  await propietariosRepository.updatePropietario(
    id,
    nombre,
    telefono,
    correo,
    direccion
  );

  return {
    id,
    nombre,
    telefono,
    correo,
    direccion
  };
};

const toggleEstado = async (id) => {
  const propietario = await propietariosRepository.findById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe propietario con id ${id}` };
  }

  await propietariosRepository.toggleEstado(id);
  const updated = await propietariosRepository.findById(id);

  return updated;
};

const deletePropietario = async (id) => {
  const propietario = await propietariosRepository.findById(id);

  if (!propietario) {
    throw { status: 404, message: `No existe propietario con id ${id}` };
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
  toggleEstado,
  deletePropietario
};