const express = require('express');
const router = express.Router();
const LocationsController = require('../controllers/locationsController');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas públicas (no requieren autenticación)
router.get('/', LocationsController.getLocations);                           // GET /api/locations - Listar ubicaciones con filtros
router.get('/stats', LocationsController.getLocationStats);                  // GET /api/locations/stats - Estadísticas de ubicaciones
router.get('/provinces', LocationsController.getProvinces);                 // GET /api/locations/provinces - Listar provincias
router.get('/provinces/:provincia/cantons', LocationsController.getCantonsByProvince); // GET /api/locations/provinces/:provincia/cantons - Cantones por provincia
router.get('/provinces/:provincia/cantons/:canton/districts', LocationsController.getDistrictsByCanton); // GET /api/locations/provinces/:provincia/cantons/:canton/districts - Distritos por cantón
router.get('/:id', LocationsController.getLocationById);                    // GET /api/locations/:id - Obtener ubicación específica

// Rutas protegidas (solo administradores)
router.post('/', authenticate, authorize('administrador'), LocationsController.createLocation);     // POST /api/locations - Crear ubicación
router.put('/:id', authenticate, authorize('administrador'), LocationsController.updateLocation); // PUT /api/locations/:id - Actualizar ubicación
router.delete('/:id', authenticate, authorize('administrador'), LocationsController.deleteLocation); // DELETE /api/locations/:id - Eliminar ubicación

module.exports = router;
