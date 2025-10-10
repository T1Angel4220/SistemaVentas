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

// Rutas específicas que deben ir ANTES de /:id para evitar conflictos
router.get('/saved', authenticate, ProductsController.getSavedProducts);                     // GET /api/products/saved - Productos guardados
router.get('/view/:id', ProductsController.getProductForView);                              // GET /api/products/view/:id - Obtener producto para vista de comprador
router.post('/:id/save', authenticate, ProductsController.saveProduct);                      // POST /api/products/:id/save - Guardar producto
router.delete('/:id/unsave', authenticate, ProductsController.unsaveProduct);                // DELETE /api/products/:id/unsave - Eliminar de guardados
router.get('/:id/saved-status', authenticate, ProductsController.getSavedStatus);            // GET /api/products/:id/saved-status - Verificar si está guardado

router.get('/:id', ProductsController.getProductById);             // GET /api/products/:id - Obtener producto específico

// Rutas protegidas con permisos específicos por rol
router.post('/', authenticate, requireProductCreate, upload.array('images', 5), handleMulterError, validateProductCreate, ProductsController.createProduct);   // POST /api/products - Crear producto (vendedores, moderadores, administradores)

// Middleware para debug de FormData
const debugFormData = (req, res, next) => {
  console.log('🔍 DEBUG FORM DATA:', {
    body: req.body,
    bodyKeys: Object.keys(req.body),
    files: req.files ? req.files.length : 0
  });
  next();
};

// Rutas que requieren permisos específicos según el rol
router.put('/:id', authenticate, requireProductUpdate, upload.array('images', 5), handleMulterError, debugFormData, validateProductUpdate, ProductsController.updateProduct);           // PUT /api/products/:id - Actualizar producto
router.delete('/:id', authenticate, requireProductDelete, ProductsController.deleteProduct);       // DELETE /api/products/:id - Eliminar producto
router.patch('/:id/availability', authenticate, requireProductUpdate, validateProductAvailability, ProductsController.toggleAvailability); // PATCH /api/products/:id/availability - Cambiar disponibilidad

// Rutas específicas del vendedor (requieren autenticación)
router.get('/my/products', authenticate, validateProductFilters, ProductsController.getMyProducts);  // GET /api/products/my/products - Mis productos

// Rutas de moderación (solo moderadores y administradores)
router.patch('/:id/moderate', authenticate, requireProductModerate, ProductsController.moderateProduct); // PATCH /api/products/:id/moderate - Moderar producto
router.get('/moderation/pending', authenticate, requireProductModerate, ProductsController.getPendingModeration); // GET /api/products/moderation/pending - Productos pendientes de moderación

module.exports = router;
