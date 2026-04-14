const mascotasRepository = require('../repository/mascota.repository');
const propietariosRepository = require('../repository/propetario.repository');
const razasRepository = require('../repository/razas.repository');

const createMascota = async (propietarioId, razaId, nombre, fecha, peso, color) => {
  if (!propietarioId || !razaId || !nombre) {
    throw { status: 400, message: 'Propietario, raza y nombre son obligatorios' };
  }

  const propietario = await propietariosRepository.findPropietarioById(propietarioId);
  if (!propietario) {
    throw { status: 404, message: `No existe propietario con id ${propietarioId}` };
  }

  const raza = await razasRepository.findRazaById(razaId);
  if (!raza) {
    throw { status: 404, message: `No existe raza con id ${razaId}` };
  }

  return await mascotasRepository.createMascota(
    propietarioId,
    razaId,
    nombre,
    fecha,
    peso,
    color
  );
};

const getAllMascotas = async () => {
  const mascotas = await mascotasRepository.findAllMascotas();

  if (!mascotas.length) {
    throw { status: 404, message: 'No hay mascotas registradas' };
  }

  return mascotas;
};

const updateMascota = async (id, propietarioId, razaId, nombre, fecha, peso, color) => {
  const mascota = await mascotasRepository.findMascotaById(id);

  if (!mascota) {
    throw { status: 404, message: `No existe mascota con id ${id}` };
  }

  await mascotasRepository.updateMascota(
    id,
    propietarioId,
    razaId,
    nombre,
    fecha,
    peso,
    color
  );

  return { id, Nombre: nombre };
};

const deleteMascota = async (id) => {
  const mascota = await mascotasRepository.findMascotaById(id);

  if (!mascota) {
    throw { status: 404, message: `No existe mascota con id ${id}` };
  }

  await mascotasRepository.deleteMascota(id);

  return {
    id,
    mensaje: `Mascota "${mascota.Nombre}" eliminada`
  };
};

module.exports = {
  createMascota,
  getAllMascotas,
  updateMascota,
  deleteMascota
};