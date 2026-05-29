// ============================================================
//  CAPA: Repository
//  Archivo: reportes.repository.js
//  Módulo: Reportes y Estadísticas
// ============================================================

const connection = require('../database/connection');
const ReportesQueries = require('../models/reportes.models');

const ReportesRepository = {

  // ============================================================
  //  REPORTE DE VENTAS
  // ============================================================

  async getReporteVentas(fecha_inicio, fecha_fin) {
    const [rows] = await connection.query(ReportesQueries.GET_REPORTE_VENTAS, [fecha_inicio, fecha_fin]);
    return rows;
  },

  async getResumenIngresos(fecha_inicio, fecha_fin) {
    const [rows] = await connection.query(ReportesQueries.GET_RESUMEN_INGRESOS, [fecha_inicio, fecha_fin]);
    return rows[0];
  },

  // ============================================================
  //  REPORTE DE PRODUCTOS MÁS VENDIDOS
  // ============================================================

  async getProductosMasVendidos(fecha_inicio, fecha_fin, limit = 10) {
    const [rows] = await connection.query(ReportesQueries.GET_PRODUCTOS_MAS_VENDIDOS, [fecha_inicio, fecha_fin, limit]);
    return rows;
  },

  // ============================================================
  //  REGISTRO DE REPORTES GENERADOS
  // ============================================================

  async registrarReporte(data) {
    const { usuario_id, tipo_reporte, parametros, fecha_inicio, fecha_fin, total_registros, archivo_nombre } = data;
    const [result] = await connection.query(ReportesQueries.REGISTRAR_REPORTE, [
      usuario_id, tipo_reporte, parametros, fecha_inicio, fecha_fin, total_registros, archivo_nombre
    ]);
    return { id: result.insertId };
  },

  async listarReportesGenerados(usuario_id = null, limit = 20, offset = 0) {
    const [rows] = await connection.query(ReportesQueries.LISTAR_REPORTES_GENERADOS, [usuario_id, usuario_id, limit, offset]);
    return rows;
  },

  async countReportes(usuario_id = null) {
    const [rows] = await connection.query(ReportesQueries.COUNT_REPORTES, [usuario_id, usuario_id]);
    return rows[0].total;
  },

  async getReporteById(id) {
    const [rows] = await connection.query(ReportesQueries.GET_REPORTE_BY_ID, [id]);
    return rows[0] || null;
  },

};

module.exports = ReportesRepository;