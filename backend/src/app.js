const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { config } = require('./config/config');

// Importar rutas
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const savedProductsRoutes = require('./routes/savedProducts');
const imagesRoutes = require('./routes/images');
const locationsRoutes = require('./routes/locations');
const appealsRoutes = require('./routes/appeals');
const reportsRoutes = require('./routes/reports');

// Crear aplicación Express
const app = express();

// Configurar Express para confiar en proxies (necesario para obtener la IP real del cliente)
app.set('trust proxy', true);

// Middleware de seguridad (temporalmente deshabilitado para imágenes)
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:", "http://localhost:3001"],
//     },
//   },
// }));

// Configurar CORS
// Parsear CORS_ORIGIN que puede ser una cadena separada por comas
const corsOrigins = config.cors.origin 
  ? config.cors.origin.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:80', 'http://localhost'];

// Configurar CORS con manejo mejorado de preflight
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, apps móviles)
    if (!origin) {
      return callback(null, true);
    }
    
    // Permitir cualquier localhost (con o sin puerto)
    if (origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') ||
        origin === 'http://localhost' ||
        origin === 'http://localhost:80') {
      console.log(`✅ CORS permitido para origin: ${origin}`);
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista permitida
    const isAllowed = corsOrigins.some(allowed => {
      return origin === allowed || origin.startsWith(allowed);
    });
    
    if (isAllowed) {
      console.log(`✅ CORS permitido para origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para origin: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Content-Length'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Middleware específico para archivos estáticos
app.use('/uploads', (req, res, next) => {
  // Permitir acceso desde cualquier origen para archivos estáticos
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Rate limiting - TEMPORALMENTE DESHABILITADO
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 requests por IP por ventana
//   message: {
//     success: false,
//     message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Rate limiting más estricto solo para login
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 10, // máximo 10 intentos de login por IP por ventana
//   message: {
//     success: false,
//     message: 'Demasiados intentos de login, intenta de nuevo más tarde'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Rate limiting para registro (más permisivo)
// const registerLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hora
//   max: 20, // máximo 20 registros por IP por hora
//   message: {
//     success: false,
//     message: 'Demasiados intentos de registro, intenta de nuevo más tarde'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

// Middleware para logging de requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Ruta de salud
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Ventas Multiempresa - API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      savedProducts: '/api/saved-products',
      images: '/api/images',
      locations: '/api/locations',
      docs: '/api/docs'
    }
  });
});

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/products', appealsRoutes);  // Rutas de apelaciones (incluyen /api/products/:id/appeal)
app.use('/api/products', reportsRoutes);  // Rutas de reportes (incluyen /api/products/:id/report)
app.use('/api/appeals', appealsRoutes);   // Rutas adicionales de apelaciones
app.use('/api/reports', reportsRoutes);   // Rutas adicionales de reportes
app.use('/api/categories', categoriesRoutes);
app.use('/api/saved-products', savedProductsRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/locations', locationsRoutes);

// Ruta de documentación
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentación de la API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registro de usuarios',
        'POST /api/auth/login': 'Login de usuarios',
        'GET /api/auth/verify-email': 'Verificación de email',
        'POST /api/auth/request-password-reset': 'Solicitar recuperación de contraseña',
        'POST /api/auth/reset-password': 'Resetear contraseña',
        'GET /api/auth/profile': 'Obtener perfil del usuario (requiere autenticación)',
        'POST /api/auth/logout': 'Logout (requiere autenticación)',
        'GET /api/auth/test': 'Probar autenticación (requiere autenticación)',
        'POST /api/auth/register-moderator': 'Registro de moderadores (solo admin)',
        'PUT /api/auth/activate-user/:userId': 'Activar usuario (moderador/admin)',
        'PUT /api/auth/deactivate-user/:userId': 'Desactivar usuario (moderador/admin)',
        'PUT /api/auth/suspend-user/:userId': 'Suspender usuario (moderador/admin)',
        'GET /api/auth/sessions': 'Obtener sesiones activas (requiere autenticación)',
        'DELETE /api/auth/sessions/:sessionId': 'Cerrar sesión específica (requiere autenticación)'
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
      },
      images: {
        'POST /api/images/products/:id': 'Subir imágenes de producto',
        'GET /api/images/products/:id': 'Obtener imágenes de producto',
        'DELETE /api/images/products/:id/:imageId': 'Eliminar imagen específica',
        'PATCH /api/images/products/:id/:imageId/main': 'Marcar imagen como principal',
        'PATCH /api/images/products/:id/reorder': 'Reordenar imágenes'
      },
      locations: {
        'GET /api/locations': 'Listar ubicaciones con filtros',
        'GET /api/locations/stats': 'Estadísticas de ubicaciones',
        'GET /api/locations/provinces': 'Listar provincias',
        'GET /api/locations/provinces/:provincia/cantons': 'Cantones por provincia',
        'GET /api/locations/provinces/:provincia/cantons/:canton/districts': 'Distritos por cantón',
        'GET /api/locations/:id': 'Obtener ubicación específica',
        'POST /api/locations': 'Crear ubicación (admin)',
        'PUT /api/locations/:id': 'Actualizar ubicación (admin)',
        'DELETE /api/locations/:id': 'Eliminar ubicación (admin)'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      description: 'Incluir el token JWT en el header Authorization'
    },
    examples: {
      register: {
        method: 'POST',
        url: '/api/auth/register',
        body: {
          cedula: '123456789',
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan@ejemplo.com',
          telefono: '8888-8888',
          direccion: 'San José, Costa Rica',
          genero: 'masculino',
          password: 'password123',
          tipo_usuario: 'comprador'
        }
      },
      login: {
        method: 'POST',
        url: '/api/auth/login',
        body: {
          correo: 'juan@ejemplo.com',
          password: 'password123'
        }
      }
    }
  });
});

// Rutas de la API
// Aplicar rate limiting específico por ruta - TEMPORALMENTE DESHABILITADO
// app.use('/api/auth/login', loginLimiter);
// app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  // Error de validación de Joi
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  // Error de base de datos
  if (error.code && error.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'Error de integridad de datos',
      details: error.message
    });
  }
  
  // Error de autenticación JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(config.server.nodeEnv === 'development' && { error: error.message })
  });
});

module.exports = app;
