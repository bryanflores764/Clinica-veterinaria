// ============================================================
//  CAPA: Routes
//  Archivo: usuarios.routes.js
// ============================================================

const { Router } = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const { verifyAdmin } = require('../middlewares/usarios.middleware');

const router = Router();
router.get('/veterinarios', usuariosController.getVeterinarios);
router.get('/',             verifyAdmin, usuariosController.getAllUsuarios);
router.post('/',            verifyAdmin, usuariosController.createUsuario);
router.put('/:id',          verifyAdmin, usuariosController.updateUsuario);
router.patch('/:id/toggle', verifyAdmin, usuariosController.toggleActivo);
router.delete('/:id',       verifyAdmin, usuariosController.deleteUsuario);

module.exports = router;