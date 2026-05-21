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

  // Obtener todas las acciones (con filtros y paginación)
  async findAllAcciones(filtros = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let query = AuditoriaQueries.FIND_ALL_ACCIONES;
    let countQuery = `SELECT COUNT(*) as total FROM auditoria_acciones a WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (filtros.usuario_id) {
      query += ` AND a.usuario_id = ?`;
      countQuery += ` AND a.usuario_id = ?`;
      params.push(filtros.usuario_id);
      countParams.push(filtros.usuario_id);
    }
    if (filtros.modulo) {
      query += ` AND a.modulo = ?`;
      countQuery += ` AND a.modulo = ?`;
      params.push(filtros.modulo);
      countParams.push(filtros.modulo);
    }
    if (filtros.accion) {
      query += ` AND a.accion = ?`;
      countQuery += ` AND a.accion = ?`;
      params.push(filtros.accion);
      countParams.push(filtros.accion);
    }
    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query += ` AND a.fecha BETWEEN ? AND ?`;
      countQuery += ` AND a.fecha BETWEEN ? AND ?`;
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
      countParams.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    // Obtener total de registros
    const [countResult] = await connection.query(countQuery, countParams);
    const total = countResult[0].total;

    // Agregar orden y paginación
    query += ` ORDER BY a.fecha DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await connection.query(query, params);
    
    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Obtener acciones por usuario (con paginación)
  async findAccionesByUsuario(usuario_id, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as total FROM auditoria_acciones a WHERE a.usuario_id = ?`;
    const [countResult] = await connection.query(countQuery, [usuario_id]);
    const total = countResult[0].total;
    
    const [rows] = await connection.query(
      `${AuditoriaQueries.FIND_ACCIONES_BY_USUARIO} LIMIT ? OFFSET ?`,
      [usuario_id, limit, offset]
    );
    
    return {
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    };
  },

  // Obtener acciones por módulo (con paginación)
  async findAccionesByModulo(modulo, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as total FROM auditoria_acciones a WHERE a.modulo = ?`;
    const [countResult] = await connection.query(countQuery, [modulo]);
    const total = countResult[0].total;
    
    const [rows] = await connection.query(
      `${AuditoriaQueries.FIND_ACCIONES_BY_MODULO} LIMIT ? OFFSET ?`,
      [modulo, limit, offset]
    );
    
    return {
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    };
  },

  // Obtener acciones por acción específica (con paginación)
  async findAccionesByAccion(accion, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as total FROM auditoria_acciones a WHERE a.accion = ?`;
    const [countResult] = await connection.query(countQuery, [accion]);
    const total = countResult[0].total;
    
    const [rows] = await connection.query(
      `${AuditoriaQueries.FIND_ACCIONES_BY_ACCION} LIMIT ? OFFSET ?`,
      [accion, limit, offset]
    );
    
    return {
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    };
  },

  // Obtener acciones por rango de fechas (con paginación)
  async findAccionesByFechaRango(fecha_inicio, fecha_fin, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) as total FROM auditoria_acciones a WHERE a.fecha BETWEEN ? AND ?`;
    const [countResult] = await connection.query(countQuery, [fecha_inicio, fecha_fin]);
    const total = countResult[0].total;
    
    const [rows] = await connection.query(
      `${AuditoriaQueries.FIND_ACCIONES_BY_FECHA_RANGO} LIMIT ? OFFSET ?`,
      [fecha_inicio, fecha_fin, limit, offset]
    );
    
    return {
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    };
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