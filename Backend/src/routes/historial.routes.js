const { Router } = require('express');
const router = Router();
const historialController = require('../controllers/historial.controllers');
const { verifyToken, verifyVeterinario } = require('../middlewares/roles.middleware'); // ✅ CAMBIADO

// Historial Clínico
router.post('/', verifyToken, verifyVeterinario, historialController.createHistorial);
router.get('/:id', verifyToken, historialController.getHistorialById);
router.get('/mascota/:mascota_id', verifyToken, historialController.getHistorialByMascota);
router.put('/:id', verifyToken, verifyVeterinario, historialController.updateHistorial);
router.delete('/:id', verifyToken, verifyVeterinario, historialController.deleteHistorial);

// Consultas Médicas
router.post('/consultas', verifyToken, verifyVeterinario, historialController.createConsulta);
router.get('/consultas/:id', verifyToken, historialController.getConsultaById);
router.get('/:historial_id/consultas', verifyToken, historialController.getConsultasByHistorial);
router.put('/consultas/:id', verifyToken, verifyVeterinario, historialController.updateConsulta);
router.delete('/consultas/:id', verifyToken, verifyVeterinario, historialController.deleteConsulta);

module.exports = router;