const connection = require('../database/connection');
const MascotasQueries = require('../models/mascota.model');

// 🔹 Crear
const createMascota = async (propietarioId, razaId, nombre, fecha_nacimiento, peso, color) => {
  const [result] = await connection.execute(
    `INSERT INTO mascotas 
     (Id_Propietario, Id_Raza, Nombre, Fecha_Nacimiento, Peso, Color)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [propietarioId, razaId, nombre, fecha_nacimiento, peso, color]
  );

  return {
    id: result.insertId,
    Nombre: nombre
  };
};

// 🔹 Obtener todas
const findAll = async () => {
  const [rows] = await connection.execute(`
    SELECT
      m.Id,
      m.Nombre,
      m.Fecha_Nacimiento,
      m.Peso,
      m.Color,
      p.Nombre AS Propietario,
      p.Telefono AS Telefono_Propietario,
      r.Nombre_Raza,
      e.Nombre_Especie
    FROM mascotas m
    INNER JOIN propietarios p ON p.Id = m.Id_Propietario
    INNER JOIN razas r ON r.Id = m.Id_Raza
    INNER JOIN especies e ON e.Id = r.Id_Especie
  `);

  return rows;
};

// 🔥 ESTE ES EL QUE TE FALTA
const findById = async (id) => {
  const [rows] = await connection.execute(
    `SELECT * FROM mascotas WHERE Id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

// 🔹 Actualizar
const updateMascota = async (id, propietarioId, razaId, nombre, fecha_nacimiento, peso, color) => {
  const [result] = await connection.execute(
    `UPDATE mascotas
     SET Id_Propietario = ?, Id_Raza = ?, Nombre = ?, Fecha_Nacimiento = ?, Peso = ?, Color = ?
     WHERE Id = ?`,
    [propietarioId, razaId, nombre, fecha_nacimiento, peso, color, id]
  );

  return result.affectedRows;
};

// 🔹 Eliminar
const deleteMascota = async (id) => {
  const [result] = await connection.execute(
    `DELETE FROM mascotas WHERE Id = ?`,
    [id]
  );

  return result.affectedRows;
};

module.exports = {
  createMascota,
  findAll,
  findById, // 🔥 CLAVE
  updateMascota,
  deleteMascota
};