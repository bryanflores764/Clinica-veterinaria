// ============================================================
//  CAPA: Repository
//  Archivo: vacunas.repository.js
//  Módulo: Vacunas Aplicadas
// ============================================================

const connection = require('../database/connection');
const VacunasQueries = require('../models/vacunas.models');

const VacunasRepository = {

  // Crear vacuna aplicada
  async createVacuna(data) {
    const { mascota_id, nombre_vacuna, fecha_aplicacion, proxima_dosis, lote, observaciones, veterinario_id } = data;
    const [result] = await connection.query(VacunasQueries.CREATE_VACUNA, [
      mascota_id, nombre_vacuna, fecha_aplicacion, proxima_dosis || null, lote || null, observaciones || null, veterinario_id
    ]);
    return { id: result.insertId, ...data };
  },

  // Obtener vacuna por ID
  async findVacunaById(id) {
    const [rows] = await connection.query(VacunasQueries.FIND_VACUNA_BY_ID, [id]);
    return rows[0] || null;
  },

  // Obtener vacunas por mascota
  async findVacunasByMascota(mascota_id) {
    const [rows] = await connection.query(VacunasQueries.FIND_VACUNAS_BY_MASCOTA, [mascota_id]);
    return rows;
  },

  // Actualizar vacuna
  async updateVacuna(id, data) {
    const { nombre_vacuna, fecha_aplicacion, proxima_dosis, lote, observaciones } = data;
    const [result] = await connection.query(VacunasQueries.UPDATE_VACUNA, [
      nombre_vacuna, fecha_aplicacion, proxima_dosis || null, lote || null, observaciones || null, id
    ]);
    return result.affectedRows;
  },

  // Eliminar vacuna (soft delete)
  async deleteVacuna(id) {
    const [result] = await connection.query(VacunasQueries.DELETE_VACUNA, [id]);
    return result.affectedRows;
  },

  // Obtener alertas de vacunas próximas
  async findAlertasVacunas() {
    const [rows] = await connection.query(VacunasQueries.FIND_ALERTAS_VACUNAS);
    return rows;
  },

  // Marcar notificación como enviada
  async marcarNotificacion(vacuna_id, propietario_id) {
    const [result] = await connection.query(VacunasQueries.MARCAR_NOTIFICACION, [vacuna_id, propietario_id]);
    return result;
  },

  // Verificar si ya existe notificación
  async checkNotificacion(vacuna_id) {
    const [rows] = await connection.query(VacunasQueries.CHECK_NOTIFICACION, [vacuna_id]);
    return rows[0] || null;
  },
};

module.exports = VacunasRepository;