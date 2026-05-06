const { Router } = require('express');
const productosController = require('../controllers/productos.controller');
const { verifyToken } = require('../middlewares/usuarios.middleware'); // ← agregar

const router = Router();

router.get('/',                  productosController.getAllProductos);
router.post('/',                 verifyToken, productosController.createProducto);
router.put('/:id',               verifyToken, productosController.updateProducto);
router.post('/:id/stock',        verifyToken, productosController.ajustarStock);      // ← este es el importante
router.patch('/:id/desactivar',  verifyToken, productosController.desactivarProducto);
router.patch('/:id/activar',     verifyToken, productosController.activarProducto);
router.get('/:id/movimientos',   verifyToken, productosController.getMovimientos);

module.exports = router;