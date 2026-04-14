// ============================================================
//  CAPA: Routes
//  Archivo: propietarios.routes.js
// ============================================================

const { Router } = require('express');
const propietariosController = require('../controllers/propetario.controllers');
const { verifyAdmin } = require('../middlewares/usuarios.middleware');

const router = Router();

router.get('/', verifyAdmin, propietariosController.getAllPropietarios);
router.post('/', verifyAdmin, propietariosController.createPropietario);
router.put('/:id', verifyAdmin, propietariosController.updatePropietario);
router.patch('/:id/toggle', verifyAdmin, propietariosController.toggleEstado);
router.delete('/:id', verifyAdmin, propietariosController.deletePropietario);

module.exports = router;