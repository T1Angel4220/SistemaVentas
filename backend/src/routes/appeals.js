const express = require('express');
const router = express.Router();
const AppealsController = require('../controllers/appealsController');
const { authenticate, requireProductModerate } = require('../middlewares/auth');

// Rutas de apelaciones
// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos

// Rutas para moderadores (requieren permisos de moderación) - RUTAS ESPECÍFICAS PRIMERO
router.get('/pending', authenticate, requireProductModerate, AppealsController.getPendingAppeals);          // GET /api/appeals/pending - Apelaciones pendientes
router.get('/my/appeals', authenticate, AppealsController.getMyAppeals);                     // GET /api/appeals/my/appeals - Mis apelaciones

// Rutas para vendedores (requieren autenticación) - RUTAS CON PARÁMETROS DESPUÉS
router.post('/:id/appeal', authenticate, AppealsController.createAppeal);                    // POST /api/products/:id/appeal - Crear apelación
router.get('/:id/appeals', authenticate, AppealsController.getAppealsByProduct);             // GET /api/products/:id/appeals - Ver apelaciones de un producto
router.patch('/:id/resolve', authenticate, requireProductModerate, AppealsController.resolveAppeal);        // PATCH /api/appeals/:id/resolve - Resolver apelación

module.exports = router;

