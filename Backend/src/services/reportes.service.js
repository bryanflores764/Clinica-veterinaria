// ============================================================
//  CAPA: Service
//  Archivo: reportes.service.js
//  Módulo: Reportes y Estadísticas
// ============================================================

const reportesRepository = require('../repository/reportes.repository');
const auditoriaService = require('./auditoria.service');
const fs = require('fs');
const path = require('path');

// Validar formato de fecha
const validarFecha = (fecha) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(fecha)) {
    throw { status: 400, message: 'Formato de fecha inválido. Use YYYY-MM-DD' };
  }
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    throw { status: 400, message: 'Fecha inválida' };
  }
  return true;
};

// Validar rango de fechas
const validarRangoFechas = (fecha_inicio, fecha_fin) => {
  validarFecha(fecha_inicio);
  validarFecha(fecha_fin);
  
  const inicio = new Date(fecha_inicio);
  const fin = new Date(fecha_fin);
  
  if (inicio > fin) {
    throw { status: 400, message: 'La fecha de inicio no puede ser mayor a la fecha de fin' };
  }
  
  return true;
};

// Registrar acción en auditoría
const registrarAuditoriaReporte = async (usuario_id, ip, accion, descripcion) => {
  await auditoriaService.registrarAccion({
    usuario_id,
    modulo: 'reportes',
    accion: accion,
    descripcion: descripcion,
    ip: ip,
    referencia_id: null
  }).catch(err => console.error('Error en auditoría:', err.message));
};

const ReportesService = {

  // ============================================================
  //  REPORTE DE VENTAS (#460, #461, #480, #481, #482, #483)
  // ============================================================

  async getReporteVentas(fecha_inicio, fecha_fin, usuario_id, ip) {
    // Validar rango de fechas
    if (!fecha_inicio || !fecha_fin) {
      throw { status: 400, message: 'Las fechas de inicio y fin son obligatorias' };
    }
    
    validarRangoFechas(fecha_inicio, fecha_fin);
    
    const reporte = await reportesRepository.getReporteVentas(fecha_inicio, fecha_fin);
    const resumen = await reportesRepository.getResumenIngresos(fecha_inicio, fecha_fin);
    
    // Registrar en auditoría
    await registrarAuditoriaReporte(usuario_id, ip, 'GENERAR_REPORTE', 
      `Generó reporte de ventas del ${fecha_inicio} al ${fecha_fin} - Total ingresos: $${resumen.total_ingresos}`);
    
    // Manejar respuesta sin resultados
    if (!reporte || reporte.length === 0) {
      return {
        success: true,
        data: [],
        resumen: resumen,
        message: 'No hay ventas en el período seleccionado'
      };
    }
    
    return {
      success: true,
      data: reporte,
      resumen: resumen,
      periodo: { fecha_inicio, fecha_fin }
    };
  },

  // ============================================================
  //  REPORTE DE PRODUCTOS MÁS VENDIDOS (#491, #492, #493, #494)
  // ============================================================

  async getProductosMasVendidos(fecha_inicio, fecha_fin, limit = 10, usuario_id, ip) {
    if (!fecha_inicio || !fecha_fin) {
      throw { status: 400, message: 'Las fechas de inicio y fin son obligatorias' };
    }
    
    validarRangoFechas(fecha_inicio, fecha_fin);
    
    const productos = await reportesRepository.getProductosMasVendidos(fecha_inicio, fecha_fin, limit);
    
    await registrarAuditoriaReporte(usuario_id, ip, 'GENERAR_REPORTE',
      `Generó reporte de productos más vendidos del ${fecha_inicio} al ${fecha_fin}`);
    
    if (!productos || productos.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No hay productos vendidos en el período seleccionado'
      };
    }
    
    return {
      success: true,
      data: productos,
      periodo: { fecha_inicio, fecha_fin },
      total_productos: productos.length
    };
  },

  // ============================================================
  //  REGISTRO Y LISTADO DE REPORTES GENERADOS (#471, #472, #473)
  // ============================================================

  async listarReportesGenerados(usuario_id, page = 1, limit = 20, esAdmin = false) {
    const offset = (page - 1) * limit;
    const filtroUsuario = esAdmin ? null : usuario_id;
    
    const reportes = await reportesRepository.listarReportesGenerados(filtroUsuario, limit, offset);
    const total = await reportesRepository.countReportes(filtroUsuario);
    
    return {
      success: true,
      data: reportes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // ============================================================
  //  REGISTRAR REPORTE GENERADO (interno)
  // ============================================================

  async registrarReporteGenerado(data) {
    const { usuario_id, tipo_reporte, parametros, fecha_inicio, fecha_fin, total_registros, archivo_nombre } = data;
    
    const resultado = await reportesRepository.registrarReporte({
      usuario_id,
      tipo_reporte,
      parametros,
      fecha_inicio,
      fecha_fin,
      total_registros,
      archivo_nombre
    });
    
    return resultado;
  },

  // ============================================================
  //  OBTENER REPORTE POR ID
  // ============================================================

  async getReporteById(id) {
    const reporte = await reportesRepository.getReporteById(id);
    if (!reporte) {
      throw { status: 404, message: 'No existe un reporte con ese ID' };
    }
    return reporte;
  },

};

module.exports = ReportesService;