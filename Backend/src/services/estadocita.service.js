const repo = require('../repository/estadocita.repository');

const create = async (estado) => {
  if (!estado) {
    throw { status: 400, message: 'Estado requerido' };
  }

  return await repo.create(estado);
};

const getAll = async () => {
  return await repo.findAll();
};

module.exports = {
  create,
  getAll
};