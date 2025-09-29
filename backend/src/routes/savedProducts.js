const express = require('express');
const router = express.Router();
const SavedProductsController = require('../controllers/savedProductsController');
const { authenticate } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de productos guardados/favoritos
router.post('/:id', SavedProductsController.saveProduct);                    // POST /api/saved-products/:id - Guardar producto como favorito
router.delete('/:id', SavedProductsController.unsaveProduct);                // DELETE /api/saved-products/:id - Quitar producto de favoritos
router.get('/', SavedProductsController.getSavedProducts);                  // GET /api/saved-products - Obtener productos guardados del usuario
router.get('/stats', SavedProductsController.getSavedProductsStats);        // GET /api/saved-products/stats - Estadísticas de favoritos
router.get('/check/:id', SavedProductsController.checkIfSaved);             // GET /api/saved-products/check/:id - Verificar si está guardado

module.exports = router;
