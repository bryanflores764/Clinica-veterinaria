// ============================================================
//  CAPA: Routes
//  Archivo: usuarios.routes.js
// ============================================================

const { Router } = require('express');
const router = Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/roles.middleware');
const { registrarAuditoria } = require('../middlewares/auditoria.middleware');

// ✅ ORDEN CORRECTO
router.get('/veterinarios',      usuariosController.getVeterinarios);
router.use(verifyToken);
router.use(registrarAuditoria('usuarios'));


router.get('/',         verifyAdmin, usuariosController.getAllUsuarios);
router.post('/',        verifyAdmin, usuariosController.createUsuario);
router.put('/:id',      verifyAdmin, usuariosController.updateUsuario);
router.patch('/:id/toggle', verifyAdmin, usuariosController.toggleActivo);
router.delete('/:id',   verifyAdmin, usuariosController.deleteUsuario);

module.exports = router;