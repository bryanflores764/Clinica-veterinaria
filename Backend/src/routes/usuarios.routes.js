// ============================================================
//  CAPA: Routes
//  Archivo: usuarios.routes.js
// ============================================================

const { Router } = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const { verifyAdmin } = require('../middlewares/usuarios.middleware');

const router = Router();

router.get('/',           verifyAdmin, usuariosController.getAllUsuarios);
router.post('/',          verifyAdmin, usuariosController.createUsuario);
router.put('/:id',        verifyAdmin, usuariosController.updateUsuario);
router.patch('/:id/toggle', verifyAdmin, usuariosController.toggleActivo);

module.exports = router;