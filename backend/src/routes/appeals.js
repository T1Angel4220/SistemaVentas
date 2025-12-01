const express = require('express');
const router = express.Router();
const AppealsController = require('../controllers/appealsController');
const { authenticate, requireProductModerate } = require('../middlewares/auth');

// Rutas de apelaciones

// Rutas para vendedores (requieren autenticación)
router.post('/:id/appeal', authenticate, AppealsController.createAppeal);                    // POST /api/products/:id/appeal - Crear apelación
router.get('/:id/appeals', authenticate, AppealsController.getAppealsByProduct);             // GET /api/products/:id/appeals - Ver apelaciones de un producto
router.get('/my/appeals', authenticate, AppealsController.getMyAppeals);                     // GET /api/appeals/my/appeals - Mis apelaciones

// Rutas para moderadores (requieren permisos de moderación)
router.get('/pending', authenticate, requireProductModerate, AppealsController.getPendingAppeals);          // GET /api/appeals/pending - Apelaciones pendientes
router.get('/history', authenticate, requireProductModerate, AppealsController.getAllAppeals);              // GET /api/appeals/history - Historial completo de apelaciones
router.patch('/:id/resolve', authenticate, requireProductModerate, AppealsController.resolveAppeal);        // PATCH /api/appeals/:id/resolve - Resolver apelación

module.exports = router;

