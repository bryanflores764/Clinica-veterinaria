const { Router } = require('express');
const productosController = require('../controllers/productos.controller');

const router = Router();

router.get('/', productosController.getAllProductos);
router.post('/', productosController.createProducto);
router.put('/:id', productosController.updateProducto);
router.post('/:id/stock', productosController.ajustarStock);
router.patch('/:id/desactivar', productosController.desactivarProducto);
router.get('/:id/movimientos', productosController.getMovimientos);

module.exports = router;