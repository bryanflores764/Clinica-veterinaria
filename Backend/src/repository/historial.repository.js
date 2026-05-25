// ============================================================
//  CAPA: Repository
//  Archivo: historial.repository.js
//  Módulos: Historial Clínico y Consultas Médicas
// ============================================================

const connection = require('../database/connection');
const HistorialQueries = require('../models/historial.models');

const HistorialRepository = {

  // ============================================================
  //  HISTORIAL CLÍNICO
  // ============================================================

  // Crear historial clínico
  async createHistorial(data) {
    const { mascota_id, motivo, diagnostico_inicial, observaciones, veterinario_id } = data;
    const [result] = await connection.query(HistorialQueries.CREATE_HISTORIAL, [
      mascota_id, motivo, diagnostico_inicial, observaciones, veterinario_id
    ]);
    return { id: result.insertId, ...data };
  },

  // Obtener historial por ID
  async findHistorialById(id) {
    const [rows] = await connection.query(HistorialQueries.FIND_HISTORIAL_BY_ID, [id]);
    return rows[0] || null;
  },

  // Obtener historial por mascota
  async findHistorialByMascota(mascota_id) {
    const [rows] = await connection.query(HistorialQueries.FIND_HISTORIAL_BY_MASCOTA, [mascota_id]);
    return rows;
  },

  // Actualizar historial clínico
  async updateHistorial(id, data) {
    const { motivo, diagnostico_inicial, observaciones } = data;
    const [result] = await connection.query(HistorialQueries.UPDATE_HISTORIAL, [
      motivo, diagnostico_inicial, observaciones, id
    ]);
    return result.affectedRows;
  },

  // Eliminar historial clínico (soft delete)
  async deleteHistorial(id) {
    const [result] = await connection.query(HistorialQueries.DELETE_HISTORIAL, [id]);
    return result.affectedRows;
  },

  // Verificar si mascota tiene historial activo
  async checkHistorialActivo(mascota_id) {
    const [rows] = await connection.query(HistorialQueries.CHECK_HISTORIAL_ACTIVO, [mascota_id]);
    return rows[0] || null;
  },

  // ============================================================
  //  CONSULTAS MÉDICAS
  // ============================================================

  // Crear consulta médica
  async createConsulta(data) {
    const { historial_id, sintomas, diagnostico, tratamiento, observaciones, veterinario_id } = data;
    const [result] = await connection.query(HistorialQueries.CREATE_CONSULTA, [
      historial_id, sintomas, diagnostico, tratamiento, observaciones, veterinario_id
    ]);
    return { id: result.insertId, ...data };
  },

  // Obtener consulta por ID
  async findConsultaById(id) {
    const [rows] = await connection.query(HistorialQueries.FIND_CONSULTA_BY_ID, [id]);
    return rows[0] || null;
  },

  // Obtener consultas por historial
  async findConsultasByHistorial(historial_id) {
    const [rows] = await connection.query(HistorialQueries.FIND_CONSULTAS_BY_HISTORIAL, [historial_id]);
    return rows;
  },

  // Actualizar consulta médica
  async updateConsulta(id, data) {
    const { sintomas, diagnostico, tratamiento, observaciones } = data;
    const [result] = await connection.query(HistorialQueries.UPDATE_CONSULTA, [
      sintomas, diagnostico, tratamiento, observaciones, id
    ]);
    return result.affectedRows;
  },

  // Eliminar consulta médica (soft delete)
  async deleteConsulta(id) {
    const [result] = await connection.query(HistorialQueries.DELETE_CONSULTA, [id]);
    return result.affectedRows;
  },
};

module.exports = HistorialRepository;