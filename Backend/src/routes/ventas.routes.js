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

module.exports = router;