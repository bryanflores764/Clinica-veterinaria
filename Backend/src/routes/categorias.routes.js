const { Router } = require('express');
const categoriasController = require('../controllers/categorias.controller');

const router = Router();

router.post('/', categoriasController.createCategoria);
router.get('/', categoriasController.getCategorias);
router.put('/:id', categoriasController.updateCategoria);
router.delete('/:id', categoriasController.deleteCategoria);

module.exports = router;