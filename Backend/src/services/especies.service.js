const especiesRepository = require('../repository/especies.repository');

const createEspecie = async (nombre) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  const existing = await especiesRepository.findEspecieByNombre(nombre);
  if (existing) {
    throw { status: 409, message: `La especie "${nombre}" ya existe` };
  }

  return await especiesRepository.createEspecie(nombre);
};

const getAllEspecies = async () => {
  const especies = await especiesRepository.findAllEspecies();

  if (!especies.length) {
    throw { status: 404, message: 'No hay especies registradas' };
  }

  return especies;
};

const updateEspecie = async (id, nombre) => {
  const especie = await especiesRepository.findEspecieById(id);

  if (!especie) {
    throw { status: 404, message: `No existe especie con id ${id}` };
  }

  await especiesRepository.updateEspecie(id, nombre);
  return { id, Nombre_Especie: nombre };
};

const deleteEspecie = async (id) => {
  const especie = await especiesRepository.findEspecieById(id);

  if (!especie) {
    throw { status: 404, message: `No existe especie con id ${id}` };
  }

  await especiesRepository.deleteEspecie(id);
  return { id, mensaje: `Especie "${especie.Nombre_Especie}" eliminada` };
};

module.exports = {
  createEspecie,
  getAllEspecies,
  updateEspecie,
  deleteEspecie
};