// ============================================================
//  CAPA: Routes
//  Archivo: citas.routes.js
// ============================================================

const express         = require('express');
const router          = express.Router();
const CitasController = require('../controllers/citas.controller');

// ============================================================
//  RUTAS ESPECÍFICAS PRIMERO (antes de /:id)
//  Express evalúa rutas en orden — las rutas con segmentos
//  estáticos deben ir ANTES que las rutas con parámetros dinámicos
// ============================================================

// GET  /api/citas/veterinario/:id
router.get('/veterinario/:id',       CitasController.getCitasByVeterinario);

// GET  /api/citas/mascota/historial/:id
router.get('/mascota/historial/:id', CitasController.getCitasByMascotaId);

// GET  /api/citas/mascota/:idMascota
router.get('/mascota/:idMascota',    CitasController.getByMascota);

// ============================================================
//  RUTAS GENÉRICAS (después de las específicas)
// ============================================================

router.get('/',              CitasController.getAll);
router.get('/:id',           CitasController.getById);
router.post('/',             CitasController.create);
router.put('/:id',           CitasController.update);
router.patch('/:id/estado',  CitasController.updateEstado);
router.patch('/:id/completar', CitasController.completarCita);
router.delete('/:id',        CitasController.delete);

module.exports = router;