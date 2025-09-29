const express = require('express');
const cors = require('cors');
const path = require('path');
const { config } = require('./config/config');
const { requestLogger } = require('./middlewares/auth');

// Importar rutas
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const savedProductsRoutes = require('./routes/savedProducts');

const app = express();

// Middlewares globales
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas principales
app.get('/', (req, res) => {
  res.json({ 
    message: 'API del Sistema de Ventas Multiempresa',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      savedProducts: '/api/saved-products',
      docs: '/api/docs'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/saved-products', savedProductsRoutes);

// Ruta de documentación básica
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Sistema de Ventas Multiempresa - API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrar nuevo usuario',
        'POST /api/auth/login': 'Iniciar sesión',
        'GET /api/auth/verify-email': 'Verificar email',
        'POST /api/auth/request-password-reset': 'Solicitar recuperación de contraseña',
        'POST /api/auth/reset-password': 'Resetear contraseña',
        'GET /api/auth/profile': 'Obtener perfil del usuario (requiere autenticación)',
        'GET /api/auth/test': 'Probar autenticación'
      },
      products: {
        'GET /api/products': 'Listar productos con filtros',
        'GET /api/products/:id': 'Obtener producto específico',
        'POST /api/products': 'Crear producto (vendedores)',
        'PUT /api/products/:id': 'Actualizar producto',
        'DELETE /api/products/:id': 'Eliminar producto',
        'PATCH /api/products/:id/availability': 'Cambiar disponibilidad',
        'GET /api/products/my/products': 'Mis productos (vendedor)'
      },
      categories: {
        'GET /api/categories': 'Listar categorías activas',
        'GET /api/categories/stats': 'Estadísticas de categorías',
        'GET /api/categories/:id': 'Obtener categoría específica',
        'POST /api/categories': 'Crear categoría (admin)',
        'PUT /api/categories/:id': 'Actualizar categoría (admin)',
        'DELETE /api/categories/:id': 'Eliminar categoría (admin)'
      },
      savedProducts: {
        'POST /api/saved-products/:id': 'Guardar producto como favorito',
        'DELETE /api/saved-products/:id': 'Quitar producto de favoritos',
        'GET /api/saved-products': 'Obtener productos guardados',
        'GET /api/saved-products/stats': 'Estadísticas de favoritos',
        'GET /api/saved-products/check/:id': 'Verificar si está guardado'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: config.server.nodeEnv === 'development' ? err.message : {}
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;
