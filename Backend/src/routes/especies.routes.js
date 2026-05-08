const { Router } = require('express');
const especiesController = require('../controllers/especies.controllers');
const { verifyAdmin } = require('../middlewares/usarios.middleware');

const router = Router();

router.get('/', verifyAdmin, especiesController.getAllEspecies);
router.post('/', verifyAdmin, especiesController.createEspecie);
router.put('/:id', verifyAdmin, especiesController.updateEspecie);
router.delete('/:id', verifyAdmin, especiesController.deleteEspecie);

module.exports = router;