const { Router } = require('express');
const ventasController = require('../controllers/ventas.controller');
const { verifyToken } = require('../middlewares/usuarioRecepcionista.middleware');

const router = Router();

// ── Ventas ────────────────────────────────────────────────────
router.get('/', verifyToken, ventasController.getAllVentas);
router.get('/:id', verifyToken, ventasController.getVentaById);
router.post('/', verifyToken, ventasController.createVenta);
router.patch('/:id/anular', verifyToken, ventasController.anularVenta);
router.patch('/:id/confirmar', verifyToken, ventasController.confirmarVenta);
router.get('/:id/total', verifyToken, ventasController.getTotalVenta);

// ── Productos ─────────────────────────────────────────────────
router.post('/:id/detalle', verifyToken, ventasController.addDetalleProducto);

// ── Servicios ─────────────────────────────────────────────────
router.get('/servicios', verifyToken, ventasController.getAllServicios);
router.post('/:id/detalle-servicio', verifyToken, ventasController.addDetalleServicio);

// ── Facturación ───────────────────────────────────────────────
router.post('/:id/factura/generar', verifyToken, ventasController.generarFactura);
router.post('/:id/factura/enviar', verifyToken, ventasController.enviarFactura);
router.get('/:id/factura', verifyToken, ventasController.getFacturaByVenta);

module.exports = router;