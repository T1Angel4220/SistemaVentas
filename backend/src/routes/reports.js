const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reportsController');
const { authenticate, requireProductModerate } = require('../middlewares/auth');

// Rutas de reportes/denuncias

// Rutas para usuarios autenticados (compradores y moderadores)
router.post('/:id/report', authenticate, ReportsController.createReport);                     // POST /api/products/:id/report - Reportar producto
router.get('/:id/reports', authenticate, ReportsController.getReportsByProduct);              // GET /api/products/:id/reports - Ver reportes de un producto
router.get('/my/reports', authenticate, ReportsController.getMyReports);                      // GET /api/reports/my/reports - Mis reportes

// Rutas para moderadores (requieren permisos de moderación)
router.get('/pending', authenticate, requireProductModerate, ReportsController.getPendingReports);         // GET /api/reports/pending - Reportes pendientes
router.get('/system-detected', authenticate, requireProductModerate, ReportsController.getSystemDetectedProducts); // GET /api/reports/system-detected - Productos detectados por el sistema
router.get('/statistics', authenticate, requireProductModerate, ReportsController.getReportStatistics);    // GET /api/reports/statistics - Estadísticas de reportes
router.patch('/:id/resolve', authenticate, requireProductModerate, ReportsController.resolveReport);       // PATCH /api/reports/:id/resolve - Resolver reporte

module.exports = router;

