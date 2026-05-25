const { Router } = require('express');
const router = Router();
const vacunasController = require('../controllers/vacunas.controller');
const { verifyToken, verifyVeterinario } = require('../middlewares/roles.middleware');

// Solo escritura requiere veterinario
router.post('/', verifyToken, verifyVeterinario, vacunasController.createVacuna);
router.put('/:id', verifyToken, verifyVeterinario, vacunasController.updateVacuna);
router.delete('/:id', verifyToken, verifyVeterinario, vacunasController.deleteVacuna);
router.post('/:id/notificar', verifyToken, verifyVeterinario, vacunasController.marcarNotificacion);

// Lectura solo requiere autenticación
router.get('/alertas', verifyToken, vacunasController.getAlertasVacunas);

router.get('/:id', verifyToken, vacunasController.getVacunaById);
router.get('/mascota/:mascota_id', verifyToken, vacunasController.getVacunasByMascota);

module.exports = router;