// ============================================================
//  CAPA: Service
// ============================================================

const razasRepository = require('../repository/razas.repository');
const especiesRepository = require('../repository/especies.repository');

const createRaza = async (especieId, nombre) => {
  if (!especieId || !nombre) {
    throw { status: 400, message: 'Especie y nombre son obligatorios' };
  }

  const especie = await especiesRepository.findEspecieById(especieId);
  if (!especie) {
    throw { status: 404, message: `No existe la especie con id ${especieId}` };
  }

  const existing = await razasRepository.findRazaByNombre(nombre);
  if (existing) {
    throw { status: 409, message: `La raza "${nombre}" ya existe` };
  }

  return await razasRepository.createRaza(especieId, nombre);
};

const getAllRazas = async () => {
  const razas = await razasRepository.findAllRazas();

  if (!razas.length) {
    throw { status: 404, message: 'No hay razas registradas' };
  }

  return razas;
};

const updateRaza = async (id, especieId, nombre) => {
  const raza = await razasRepository.findRazaById(id);

  if (!raza) {
    throw { status: 404, message: `No existe raza con id ${id}` };
  }

  const especie = await especiesRepository.findEspecieById(especieId);
  if (!especie) {
    throw { status: 404, message: `No existe la especie con id ${especieId}` };
  }

  await razasRepository.updateRaza(id, especieId, nombre);

  return {
    id,
    Id_Especie: especieId,
    Nombre_Raza: nombre
  };
};

const deleteRaza = async (id) => {
  const raza = await razasRepository.findRazaById(id);

  if (!raza) {
    throw { status: 404, message: `No existe raza con id ${id}` };
  }

  await razasRepository.deleteRaza(id);

  return {
    id,
    mensaje: `Raza "${raza.Nombre_Raza}" eliminada`
  };
};

module.exports = {
  createRaza,
  getAllRazas,
  updateRaza,
  deleteRaza
};