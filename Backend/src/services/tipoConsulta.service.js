const repo = require('../repository/tipoConsulta.repositpory');

const create = async (tipo) => {
  if (!tipo) {
    throw { status: 400, message: 'Tipo de consulta requerido' };
  }

  return await repo.create(tipo);
};

const getAll = async () => {
  return await repo.findAll();
};

const update = async (id, tipo) => {
  const existe = await repo.findById(id);

  if (!existe) {
    throw { status: 404, message: 'No existe el tipo de consulta' };
  }

  await repo.update(id, tipo);

  return { id, Tipo_Consulta: tipo };
};

const remove = async (id) => {
  const existe = await repo.findById(id);

  if (!existe) {
    throw { status: 404, message: 'No existe el tipo de consulta' };
  }

  await repo.remove(id);

  return { message: 'Eliminado correctamente' };
};

module.exports = {
  create,
  getAll,
  update,
  remove
};