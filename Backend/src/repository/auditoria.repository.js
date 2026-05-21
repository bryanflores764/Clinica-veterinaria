// ============================================================
//  CAPA: Repository
//  Archivo: auditoria.repository.js
//  Módulo: Auditoría de Acciones
// ============================================================

const connection = require('../database/connection');
const AuditoriaQueries = require('../models/auditoria.models');

const AuditoriaRepository = {

  // Registrar acción
  async createAccion(data) {
    const { usuario_id, modulo, accion, descripcion, ip, referencia_id } = data;
    const [result] = await connection.query(AuditoriaQueries.CREATE_ACCION, [
      usuario_id, modulo, accion, descripcion, ip || null, referencia_id || null
    ]);
    return { id: result.insertId };
  },

  // Obtener todas las acciones (con filtros opcionales)
  async findAllAcciones(filtros = {}) {
    let query = AuditoriaQueries.FIND_ALL_ACCIONES;
    const params = [];

    if (filtros.usuario_id) {
      query += ` AND a.usuario_id = ?`;
      params.push(filtros.usuario_id);
    }
    if (filtros.modulo) {
      query += ` AND a.modulo = ?`;
      params.push(filtros.modulo);
    }
    if (filtros.accion) {
      query += ` AND a.accion = ?`;
      params.push(filtros.accion);
    }
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query += ` AND a.fecha BETWEEN ? AND ?`;
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    query += ` ORDER BY a.fecha DESC`;

    if (filtros.limit) {
      query += ` LIMIT ?`;
      params.push(filtros.limit);
    }
    if (filtros.offset) {
      query += ` OFFSET ?`;
      params.push(filtros.offset);
    }

    const [rows] = await connection.query(query, params);
    return rows;
  },

  // Obtener acciones por usuario
  async findAccionesByUsuario(usuario_id) {
    const [rows] = await connection.query(AuditoriaQueries.FIND_ACCIONES_BY_USUARIO, [usuario_id]);
    return rows;
  },

  // Obtener acciones por módulo
  async findAccionesByModulo(modulo) {
    const [rows] = await connection.query(AuditoriaQueries.FIND_ACCIONES_BY_MODULO, [modulo]);
    return rows;
  },

  // Obtener acciones por acción específica
  async findAccionesByAccion(accion) {
    const [rows] = await connection.query(AuditoriaQueries.FIND_ACCIONES_BY_ACCION, [accion]);
    return rows;
  },

  // Obtener acciones por rango de fechas
  async findAccionesByFechaRango(fecha_inicio, fecha_fin) {
    const [rows] = await connection.query(AuditoriaQueries.FIND_ACCIONES_BY_FECHA_RANGO, [fecha_inicio, fecha_fin]);
    return rows;
  },

  // Contar acciones por módulo (para dashboard)
  async countAccionesByModulo() {
    const [rows] = await connection.query(AuditoriaQueries.COUNT_ACCIONES_BY_MODULO);
    return rows;
  },

  // Contar acciones por usuario (para dashboard)
  async countAccionesByUsuario() {
    const [rows] = await connection.query(AuditoriaQueries.COUNT_ACCIONES_BY_USUARIO);
    return rows;
  },
};

module.exports = AuditoriaRepository;