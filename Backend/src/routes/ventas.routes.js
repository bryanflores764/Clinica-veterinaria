// ============================================================
//  CAPA: Routes
//  Archivo: ventas.routes.js
// ============================================================

const { Router } = require('express');
const ventasController = require('../controllers/ventas.controller');

const router = Router();

// ── Ventas ────────────────────────────────────────────────────
router.get('/',                      ventasController.getAllVentas);    // #320
router.get('/:id',                   ventasController.getVentaById);    // #321
router.post('/',                     ventasController.createVenta);     // #278
router.patch('/:id/anular',          ventasController.anularVenta);     // #333
router.patch('/:id/confirmar',       ventasController.confirmarVenta);  // #346

// ── Detalle ───────────────────────────────────────────────────
router.post('/:id/detalle',          ventasController.addDetalle);      // #292
router.get('/:id/total',             ventasController.getTotalVenta);   // #307

module.exports = router;