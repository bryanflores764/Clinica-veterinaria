// ============================================================
//  CAPA: Routes
//  Archivo: propietarios.routes.js
// ============================================================

const express                = require('express');
const router                 = express.Router();
const PropietariosController = require('../controllers/propietarios.controller');

// GET    /propietarios           → listar todos
// GET    /propietarios/:id       → buscar por id
// GET    /propietarios/buscar?nombre=Juan  → buscar por nombre
// POST   /propietarios           → crear
// PUT    /propietarios/:id       → actualizar
// DELETE /propietarios/:id       → eliminar

router.get('/',           PropietariosController.getAll);
router.get('/buscar',     PropietariosController.getByNombre);
router.get('/:id',        PropietariosController.getById);
router.post('/',          PropietariosController.create);
router.put('/:id',        PropietariosController.update);
router.delete('/:id',     PropietariosController.delete);

module.exports = router;
