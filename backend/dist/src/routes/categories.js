"use strict";
const express = require('express');
const router = express.Router();
const CategoriesController = require('../controllers/categoriesController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateCategoryCreate, validateCategoryUpdate } = require('../middlewares/productValidation');
// Rutas públicas (no requieren autenticación)
router.get('/', CategoriesController.getCategories); // GET /api/categories - Listar categorías activas
router.get('/stats', CategoriesController.getCategoryStats); // GET /api/categories/stats - Estadísticas de categorías
router.get('/:id', CategoriesController.getCategoryById); // GET /api/categories/:id - Obtener categoría específica
// Rutas protegidas (solo administradores)
router.post('/', authenticate, authorize('administrador'), validateCategoryCreate, CategoriesController.createCategory); // POST /api/categories - Crear categoría
router.put('/:id', authenticate, authorize('administrador'), validateCategoryUpdate, CategoriesController.updateCategory); // PUT /api/categories/:id - Actualizar categoría
router.delete('/:id', authenticate, authorize('administrador'), CategoriesController.deleteCategory); // DELETE /api/categories/:id - Eliminar categoría
module.exports = router;
