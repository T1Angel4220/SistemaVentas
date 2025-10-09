const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/productsController');
const { 
  authenticate, 
  requireProductCreate, 
  requireProductUpdate, 
  requireProductDelete,
  requireProductModerate,
  optionalAuth 
} = require('../middlewares/auth');
const { validateProductCreate, validateProductUpdate, validateProductAvailability, validateProductFilters } = require('../middlewares/productValidation');
const { upload, handleMulterError } = require('../middlewares/upload');

// Rutas públicas (no requieren autenticación)
router.get('/', validateProductFilters, ProductsController.getProducts);                    // GET /api/products - Listar productos con filtros
router.get('/:id', ProductsController.getProductById);             // GET /api/products/:id - Obtener producto específico

// Rutas protegidas con permisos específicos por rol
router.post('/', authenticate, requireProductCreate, upload.array('images', 5), handleMulterError, validateProductCreate, ProductsController.createProduct);   // POST /api/products - Crear producto (vendedores, moderadores, administradores)

// Rutas que requieren permisos específicos según el rol
router.put('/:id', authenticate, requireProductUpdate, validateProductUpdate, ProductsController.updateProduct);           // PUT /api/products/:id - Actualizar producto
router.delete('/:id', authenticate, requireProductDelete, ProductsController.deleteProduct);       // DELETE /api/products/:id - Eliminar producto
router.patch('/:id/availability', authenticate, requireProductUpdate, validateProductAvailability, ProductsController.toggleAvailability); // PATCH /api/products/:id/availability - Cambiar disponibilidad

// Rutas específicas del vendedor (requieren autenticación)
router.get('/my/products', authenticate, validateProductFilters, ProductsController.getMyProducts);  // GET /api/products/my/products - Mis productos

// Rutas de moderación (solo moderadores y administradores)
router.patch('/:id/moderate', authenticate, requireProductModerate, ProductsController.moderateProduct); // PATCH /api/products/:id/moderate - Moderar producto
router.get('/moderation/pending', authenticate, requireProductModerate, ProductsController.getPendingModeration); // GET /api/products/moderation/pending - Productos pendientes de moderación

module.exports = router;
