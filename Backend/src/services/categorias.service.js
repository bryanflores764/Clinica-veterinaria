const categoriasRepository = require('../repository/categorias.repository');

const createCategoria = async (nombre) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  return await categoriasRepository.createCategoria(nombre);
};

const getCategorias = async () => {
  const categorias = await categoriasRepository.findAll();

  if (!categorias.length) {
    throw { status: 404, message: 'No hay categorías registradas' };
  }

  return categorias;
};

const updateCategoria = async (id, nombre) => {
  if (!nombre) {
    throw { status: 400, message: 'El nombre es obligatorio' };
  }

  const categoria = await categoriasRepository.findById(id);
  if (!categoria) {
    throw { status: 404, message: `No existe una categoría con id ${id}` };
  }

  await categoriasRepository.updateCategoria(id, nombre);

  return { id, Nombre_Categoria: nombre };
};

const deleteCategoria = async (id) => {
  const categoria = await categoriasRepository.findById(id);

  if (!categoria) {
    throw { status: 404, message: `No existe una categoría con id ${id}` };
  }

  await categoriasRepository.deleteCategoria(id);

  return { id, mensaje: 'Categoría eliminada correctamente' };
};

module.exports = {
  createCategoria,
  getCategorias,
  updateCategoria,
  deleteCategoria
};