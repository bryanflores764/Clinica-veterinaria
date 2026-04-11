// ============================================================
//  CAPA: Routes
//  Archivo: propietario.routes.js
// ============================================================

const { Router } = require('express');
const propietarioController = require('../controllers/propetario.controllers');
const { verifyAdmin } = require('../middlewares/usuarios.middleware');

const router = Router();

router.get('/',    verifyAdmin, propietarioController.getAllPropietarios);
router.post('/',   verifyAdmin, propietarioController.createPropietario);
router.put('/:id', verifyAdmin, propietarioController.updatePropietario);
router.delete('/:id', verifyAdmin, propietarioController.deletePropietario);

module.exports = router;