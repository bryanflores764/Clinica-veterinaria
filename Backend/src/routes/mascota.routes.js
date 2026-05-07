const { Router } = require('express');
const mascotasController = require('../controllers/mascota.controllers');
const { verifyAdmin } = require('../middlewares/usarios.middleware');

const router = Router();

router.get('/', verifyAdmin, mascotasController.getAllMascotas);
router.post('/', verifyAdmin, mascotasController.createMascota);
router.put('/:id', verifyAdmin, mascotasController.updateMascota);
router.delete('/:id', verifyAdmin, mascotasController.deleteMascota);

module.exports = router;