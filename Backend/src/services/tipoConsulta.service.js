const repo = require('../repository/tipoConsulta.repositpory');

const create = async (tipo, descripcion, precio) => {
  if (!tipo || tipo.trim() === '') {
    throw { status: 400, message: 'El tipo de consulta es obligatorio' };
  }

  if (precio === undefined || precio === null || precio === '') {
    throw { status: 400, message: 'El precio es obligatorio' };
  }

  if (isNaN(precio) || Number(precio) < 0) {
    throw { status: 400, message: 'El precio debe ser un número mayor o igual a 0' };
  }

  const existe = await repo.findByName(tipo.trim());
  if (existe) {
    throw { status: 409, message: `Ya existe un tipo de consulta con el nombre "${tipo}"` };
  }

  return await repo.create(tipo.trim(), descripcion?.trim() || null, Number(precio));
};

const getAll = async () => {
  const data = await repo.findAll();
  return data;
};

const getById = async (id) => {
  const data = await repo.findById(id);
  if (!data) throw { status: 404, message: 'No existe el tipo de consulta' };
  return data;
};

const update = async (id, tipo, descripcion, precio) => {
  if (!tipo || tipo.trim() === '') {
    throw { status: 400, message: 'El tipo de consulta es obligatorio' };
  }

  if (precio === undefined || precio === null || precio === '') {
    throw { status: 400, message: 'El precio es obligatorio' };
  }

  if (isNaN(precio) || Number(precio) < 0) {
    throw { status: 400, message: 'El precio debe ser un número mayor o igual a 0' };
  }

  const existe = await repo.findById(id);
  if (!existe) throw { status: 404, message: 'No existe el tipo de consulta' };

  // Verificar duplicado excluyendo el mismo registro
  const duplicado = await repo.findByName(tipo.trim());
  if (duplicado && String(duplicado.Id) !== String(id)) {
    throw { status: 409, message: `Ya existe un tipo de consulta con el nombre "${tipo}"` };
  }

  await repo.update(id, tipo.trim(), descripcion?.trim() || null, Number(precio));
  return { id, Tipo_Consulta: tipo.trim(), Descripcion: descripcion?.trim() || null, Precio: Number(precio) };
};

const remove = async (id) => {
  const existe = await repo.findById(id);
  if (!existe) throw { status: 404, message: 'No existe el tipo de consulta' };

  await repo.remove(id);
  return { message: `Tipo de consulta "${existe.Tipo_Consulta}" eliminado correctamente` };
};

module.exports = { create, getAll, getById, update, remove };