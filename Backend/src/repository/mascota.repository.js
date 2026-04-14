const connection = require('../database/connection');
const MascotasQueries = require('../models/mascota.model');

const createMascota = async (propietarioId, razaId, nombre, fecha, peso, color) => {
  const [result] = await connection.execute(MascotasQueries.CREATE, [
    propietarioId,
    razaId,
    nombre,
    fecha,
    peso,
    color
  ]);

  return {
    Id: result.insertId,
    Nombre: nombre
  };
};

const findAllMascotas = async () => {
  const [rows] = await connection.execute(MascotasQueries.FIND_ALL);
  return rows;
};

const findMascotaById = async (id) => {
  const [rows] = await connection.execute(MascotasQueries.FIND_BY_ID, [id]);
  return rows[0] || null;
};

const updateMascota = async (id, propietarioId, razaId, nombre, fecha, peso, color) => {
  const [result] = await connection.execute(MascotasQueries.UPDATE, [
    propietarioId,
    razaId,
    nombre,
    fecha,
    peso,
    color,
    id
  ]);

  return result.affectedRows;
};

const deleteMascota = async (id) => {
  const [result] = await connection.execute(MascotasQueries.DELETE, [id]);
  return result.affectedRows;
};

module.exports = {
  createMascota,
  findAllMascotas,
  findMascotaById,
  updateMascota,
  deleteMascota
};