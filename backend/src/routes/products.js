const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/productsController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// Rutas públicas (no requieren autenticación)
router.get('/', ProductsController.getProducts);                    // GET /api/products - Listar productos con filtros
router.get('/:id', ProductsController.getProductById);             // GET /api/products/:id - Obtener producto específico

// Rutas protegidas (requieren autenticación)
router.post('/', authenticate, ProductsController.createProduct);   // POST /api/products - Crear producto (vendedores)

// Rutas que requieren ser propietario del producto o admin
router.put('/:id', authenticate, ProductsController.updateProduct);           // PUT /api/products/:id - Actualizar producto
router.delete('/:id', authenticate, ProductsController.deleteProduct);       // DELETE /api/products/:id - Eliminar producto
router.patch('/:id/availability', authenticate, ProductsController.toggleAvailability); // PATCH /api/products/:id/availability - Cambiar disponibilidad

// Rutas específicas del vendedor
router.get('/my/products', authenticate, ProductsController.getMyProducts);  // GET /api/products/my/products - Mis productos

module.exports = router;
