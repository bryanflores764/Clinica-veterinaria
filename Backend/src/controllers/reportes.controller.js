// ============================================================
//  CAPA: Controller
//  Archivo: reportes.controller.js
//  Módulo: Reportes y Estadísticas
// ============================================================

const reportesService = require('../services/reportes.service');
const auditoriaService = require('../services/auditoria.service');
const fs = require('fs');
const path = require('path');

// Directorio de reportes
const reportsDir = path.join(__dirname, '../../reports');

const ReportesController = {

  // ============================================================
  //  GENERAR REPORTE DE VENTAS (#460, #461, #462, #463, #480, #481, #482, #483)
  //  GET /api/reportes/ventas?fecha_inicio=2026-01-01&fecha_fin=2026-12-31
  // ============================================================

  async getReporteVentas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection?.remoteAddress;
      
      // ✅ Validar acceso solo para administrador
      if (req.usuario?.RolId !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden generar reportes'
        });
      }
      
      // Validar fechas obligatorias
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son obligatorias'
        });
      }
      
      const result = await reportesService.getReporteVentas(fecha_inicio, fecha_fin, usuario_id, ip);
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Error en getReporteVentas:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // ============================================================
  //  GENERAR REPORTE DE PRODUCTOS MÁS VENDIDOS (#491, #492, #493, #494)
  //  GET /api/reportes/productos-mas-vendidos?fecha_inicio=2026-01-01&fecha_fin=2026-12-31&limit=10
  // ============================================================

  async getProductosMasVendidos(req, res) {
    try {
      const { fecha_inicio, fecha_fin, limit = 10 } = req.query;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection?.remoteAddress;
      
      // ✅ Validar acceso solo para administrador
      if (req.usuario?.RolId !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden generar reportes'
        });
      }
      
      // Validar fechas obligatorias
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son obligatorias'
        });
      }
      
      const result = await reportesService.getProductosMasVendidos(fecha_inicio, fecha_fin, parseInt(limit), usuario_id, ip);
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Error en getProductosMasVendidos:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // ============================================================
  //  LISTAR REPORTES GENERADOS (#471, #472, #473)
  //  GET /api/reportes/listar?page=1&limit=20
  // ============================================================

  async listarReportesGenerados(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const esAdmin = req.usuario?.RolId === 1;
      
      const result = await reportesService.listarReportesGenerados(usuario_id, parseInt(page), parseInt(limit), esAdmin);
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Error en listarReportesGenerados:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  },

  // ============================================================
  //  EXPORTAR REPORTE DE VENTAS A PDF (#502, #503, #504, #505)
  //  GET /api/reportes/ventas/export?fecha_inicio=2026-01-01&fecha_fin=2026-12-31
  // ============================================================

  async exportarReporteVentasPDF(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection?.remoteAddress;
      
      // Validar acceso solo para administrador
      if (req.usuario?.RolId !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden exportar reportes'
        });
      }
      
      // Validar fechas
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son obligatorias'
        });
      }
      
      // Obtener datos del reporte
      const result = await reportesService.getReporteVentas(fecha_inicio, fecha_fin, usuario_id, ip);
      
      if (!result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No hay datos para generar el reporte'
        });
      }
      
      // Crear directorio si no existe
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Generar nombre de archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `reporte_ventas_${fecha_inicio}_${fecha_fin}_${timestamp}.json`;
      const filePath = path.join(reportsDir, filename);
      
      // Guardar reporte como JSON (temporal, sin PDF)
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
      
      // Registrar reporte generado
      await reportesService.registrarReporteGenerado({
        usuario_id,
        tipo_reporte: 'ventas',
        parametros: JSON.stringify({ fecha_inicio, fecha_fin }),
        fecha_inicio,
        fecha_fin,
        total_registros: result.data.length,
        archivo_nombre: filename
      });
      
      // Registrar en auditoría
      await auditoriaService.registrarAccion({
        usuario_id,
        modulo: 'reportes',
        accion: 'EXPORTAR',
        descripcion: `Exportó reporte de ventas del ${fecha_inicio} al ${fecha_fin}`,
        ip: ip,
        referencia_id: null
      }).catch(err => console.error('Error en auditoría:', err.message));
      
      res.status(200).json({
        success: true,
        message: 'Reporte generado exitosamente',
        data: result,
        archivo: filename
      });
      
    } catch (error) {
      console.error('Error en exportarReporteVentasPDF:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error al generar el reporte'
      });
    }
  },

  // ============================================================
  //  EXPORTAR REPORTE DE PRODUCTOS MÁS VENDIDOS
  //  GET /api/reportes/productos-mas-vendidos/export?fecha_inicio=2026-01-01&fecha_fin=2026-12-31&limit=10
  // ============================================================

  async exportarProductosMasVendidosPDF(req, res) {
    try {
      const { fecha_inicio, fecha_fin, limit = 10 } = req.query;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection?.remoteAddress;
      
      // Validar acceso solo para administrador
      if (req.usuario?.RolId !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden exportar reportes'
        });
      }
      
      // Validar fechas
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son obligatorias'
        });
      }
      
      // Obtener datos del reporte
      const result = await reportesService.getProductosMasVendidos(fecha_inicio, fecha_fin, parseInt(limit), usuario_id, ip);
      
      if (!result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No hay datos para generar el reporte'
        });
      }
      
      // Crear directorio si no existe
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Generar nombre de archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `reporte_productos_${fecha_inicio}_${fecha_fin}_${timestamp}.json`;
      const filePath = path.join(reportsDir, filename);
      
      // Guardar reporte como JSON
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
      
      // Registrar reporte generado
      await reportesService.registrarReporteGenerado({
        usuario_id,
        tipo_reporte: 'productos_mas_vendidos',
        parametros: JSON.stringify({ fecha_inicio, fecha_fin, limit }),
        fecha_inicio,
        fecha_fin,
        total_registros: result.data.length,
        archivo_nombre: filename
      });
      
      // Registrar en auditoría
      await auditoriaService.registrarAccion({
        usuario_id,
        modulo: 'reportes',
        accion: 'EXPORTAR',
        descripcion: `Exportó reporte de productos más vendidos del ${fecha_inicio} al ${fecha_fin}`,
        ip: ip,
        referencia_id: null
      }).catch(err => console.error('Error en auditoría:', err.message));
      
      res.status(200).json({
        success: true,
        message: 'Reporte generado exitosamente',
        data: result,
        archivo: filename
      });
      
    } catch (error) {
      console.error('Error en exportarProductosMasVendidosPDF:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error al generar el reporte'
      });
    }
  },

  // ============================================================
  //  DESCARGAR REPORTE POR ID (#512, #513, #514, #515)
  //  GET /api/reportes/download/:id
  // ============================================================

  async descargarReporte(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id || req.usuario?.Id;
      const ip = req.ip || req.connection?.remoteAddress;
      
      // Validar acceso solo para administrador
      if (req.usuario?.RolId !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores pueden descargar reportes'
        });
      }
      
      const reporte = await reportesService.getReporteById(id);
      
      if (!reporte) {
        return res.status(404).json({
          success: false,
          message: 'No existe un reporte con ese ID'
        });
      }
      
      // Verificar que el archivo existe
      const filePath = path.join(reportsDir, reporte.archivo_nombre);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'El archivo del reporte ya no está disponible'
        });
      }
      
      // Registrar descarga en auditoría
      await auditoriaService.registrarAccion({
        usuario_id,
        modulo: 'reportes',
        accion: 'DESCARGAR',
        descripcion: `Descargó reporte ID ${id} - ${reporte.archivo_nombre}`,
        ip: ip,
        referencia_id: id
      }).catch(err => console.error('Error en auditoría:', err.message));
      
      res.download(filePath, reporte.archivo_nombre, (err) => {
        if (err) {
          console.error('Error al descargar:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Error al descargar el archivo'
            });
          }
        }
      });
      
    } catch (error) {
      console.error('Error en descargarReporte:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error al descargar el reporte'
      });
    }
  },

};

module.exports = ReportesController;