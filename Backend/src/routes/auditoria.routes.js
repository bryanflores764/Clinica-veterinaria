const { Router } = require('express');
const router = Router();
const auditoriaController = require('../controllers/auditoria.controllers');
const { verifyToken, verifyAdmin } = require('../middlewares/roles.middleware'); // ✅ CAMBIADO

// Auditoría (solo admin)
router.get('/', verifyToken, verifyAdmin, auditoriaController.getAllAcciones);
router.get('/usuario/:usuario_id', verifyToken, verifyAdmin, auditoriaController.getAccionesByUsuario);
router.get('/modulo/:modulo', verifyToken, verifyAdmin, auditoriaController.getAccionesByModulo);
router.get('/accion/:accion', verifyToken, verifyAdmin, auditoriaController.getAccionesByAccion);
router.get('/fecha/:fecha_inicio/:fecha_fin', verifyToken, verifyAdmin, auditoriaController.getAccionesByFechaRango);
router.get('/dashboard/modulos', verifyToken, verifyAdmin, auditoriaController.getCountAccionesByModulo);
router.get('/dashboard/usuarios', verifyToken, verifyAdmin, auditoriaController.getCountAccionesByUsuario);

module.exports = router;