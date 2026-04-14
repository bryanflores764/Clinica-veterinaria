const { Router } = require('express');
const razasController = require('../controllers/razas.controllers');
const { verifyAdmin } = require('../middlewares/usuarios.middleware');

const router = Router();

router.get('/', verifyAdmin, razasController.getAllRazas);
router.post('/', verifyAdmin, razasController.createRaza);
router.put('/:id', verifyAdmin, razasController.updateRaza);
router.delete('/:id', verifyAdmin, razasController.deleteRaza);

module.exports = router;