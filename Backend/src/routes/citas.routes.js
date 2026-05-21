// ============================================================
//  CAPA: Routes
//  Archivo: citas.routes.js
// ============================================================

const express         = require('express');
const router          = express.Router();
const CitasController = require('../controllers/citas.controller');

// ============================================================
//  RUTAS EXISTENTES
// ============================================================

// GET    /api/citas                        → listar todas
// GET    /api/citas/:id                    → buscar por IdCita
// GET    /api/citas/mascota/:idMascota     → citas de una mascota
// POST   /api/citas                        → crear
// PUT    /api/citas/:id                    → actualizar completa
// PATCH  /api/citas/:id/estado             → solo cambiar estado
// DELETE /api/citas/:id                    → eliminar

router.get('/',                       CitasController.getAll);
router.get('/:id',                    CitasController.getById);
router.get('/mascota/:idMascota',     CitasController.getByMascota);
router.post('/',                      CitasController.create);
router.put('/:id',                    CitasController.update);
router.patch('/:id/estado',           CitasController.updateEstado);
router.delete('/:id',                 CitasController.delete);

// ============================================================
//  NUEVAS RUTAS PARA VETERINARIO
// ============================================================

// GET    /api/citas/veterinario/:id     → citas de un veterinario específico
router.get('/veterinario/:id',        CitasController.getCitasByVeterinario);

// GET    /api/citas/mascota/historial/:id → historial de citas de una mascota
router.get('/mascota/historial/:id',  CitasController.getCitasByMascotaId);

// PATCH  /api/citas/:id/completar      → marcar cita como completada
router.patch('/:id/completar',        CitasController.completarCita);

module.exports = router;