const { Router } = require('express');
const ventasController = require('../controllers/ventas.controller');
const { verifyToken } = require('../middlewares/usuarioRecepcionista.middleware'); // ✅ Tu middleware

const router = Router();

// ── Ventas (protegidas con token) ─────────────────────────────
router.get('/',                      verifyToken, ventasController.getAllVentas);
router.get('/:id',                   verifyToken, ventasController.getVentaById);
router.post('/',                     verifyToken, ventasController.createVenta);
router.patch('/:id/anular',          verifyToken, ventasController.anularVenta);
router.patch('/:id/confirmar',       verifyToken, ventasController.confirmarVenta);

// ── Detalle (protegidas con token) ────────────────────────────
router.post('/:id/detalle',          verifyToken, ventasController.addDetalle);
router.get('/:id/total',             verifyToken, ventasController.getTotalVenta);


// Agregar al final del archivo, antes de module.exports

// ============================================================
//  RUTAS DE FACTURACIÓN
// ============================================================

// Generar factura para una venta
router.post('/:id/factura/generar', verifyToken, ventasController.generarFactura);

// Enviar factura por correo
router.post('/:id/factura/enviar', verifyToken, ventasController.enviarFactura);

// Obtener factura de una venta
router.get('/:id/factura', verifyToken, ventasController.getFacturaByVenta);

module.exports = router;