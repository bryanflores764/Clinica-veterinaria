// ============================================================
//  CAPA: Routes
//  Archivo: citas.routes.js
// ============================================================

const express         = require('express');
const router          = express.Router();
const CitasController = require('../controllers/citas.controller');

// GET    /api/citas                        → listar todas
// GET    /api/citas/:id                    → buscar por IdCita
// GET    /api/citas/mascota/:idMascota     → citas de una mascota
// POST   /api/citas                        → crear
// PUT    /api/citas/:id                    → actualizar completa
// PATCH  /api/citas/:id/estado             → solo cambiar estado
// DELETE /api/citas/:id                    → eliminar

router.get('/',                       CitasController.getAll);
router.get('/mascota/:idMascota',     CitasController.getByMascota);
router.get('/:id',                    CitasController.getById);
router.post('/',                      CitasController.create);
router.put('/:id',                    CitasController.update);
router.patch('/:id/estado',           CitasController.updateEstado);
router.delete('/:id',                 CitasController.delete);

module.exports = router;