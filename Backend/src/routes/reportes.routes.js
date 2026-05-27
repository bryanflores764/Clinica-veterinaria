// ============================================================
//  CAPA: Routes
//  Archivo: reportes.routes.js
// ============================================================

const { Router } = require('express');
const router = Router();
const reportesController = require('../controllers/reportes.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/roles.middleware');
const { registrarAuditoria } = require('../middlewares/auditoria.middleware');

router.use(verifyToken);
router.use(verifyAdmin);
router.use(registrarAuditoria('reportes'));

// Reportes en JSON
router.get('/ventas', reportesController.getReporteVentas);
router.get('/productos-mas-vendidos', reportesController.getProductosMasVendidos);
router.get('/listar', reportesController.listarReportesGenerados);

// Exportar a PDF
router.get('/ventas/export', reportesController.exportarReporteVentasPDF);
router.get('/productos-mas-vendidos/export', reportesController.exportarProductosMasVendidosPDF);

// Descargar reporte por ID
router.get('/download/:id', reportesController.descargarReporte);

module.exports = router;