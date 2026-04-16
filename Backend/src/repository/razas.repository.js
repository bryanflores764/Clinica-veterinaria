// ============================================================
//  CAPA: Repository
// ============================================================

const connection = require('../database/connection');
const RazasQueries = require('../models/razas.models');


// 🔹 Crear raza
const createRaza = async (especieId, nombre) => {
  const [result] = await connection.execute(
    `INSERT INTO razas (Id_Especie, Nombre_Raza)
     VALUES (?, ?)`,
    [especieId, nombre]
  );

  return {
    id: result.insertId,
    Id_Especie: especieId,
    Nombre_Raza: nombre
  };
};

// 🔹 Obtener todas
const findAll = async () => {
  const [rows] = await connection.execute(`
    SELECT r.Id, r.Nombre_Raza, e.Nombre_Especie
    FROM razas r
    INNER JOIN especies e ON e.Id = r.Id_Especie
  `);

  return rows;
};

// 🔥 ESTE ES EL QUE TE FALTA
const findById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT * FROM razas WHERE Id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

// 🔹 Actualizar
const updateRaza = async (id, especieId, nombre) => {
  const [result] = await connection.execute(
    `UPDATE razas
     SET Id_Especie = ?, Nombre_Raza = ?
     WHERE Id = ?`,
    [especieId, nombre, id]
  );

  return result.affectedRows;
};

// 🔹 Eliminar
const deleteRaza = async (id) => {
  const [result] = await connection.execute(
    `DELETE FROM razas WHERE Id = ?`,
    [id]
  );

  return result.affectedRows;
};

module.exports = {
  createRaza,
  findAll,
  findById, // 🔥 IMPORTANTE
  updateRaza,
  deleteRaza
};