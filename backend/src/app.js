const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { config } = require('./config/config');

// Importar rutas
const authRoutes = require('./routes/auth');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Configurar CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting más estricto solo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos de login por IP por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de login, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para registro (más permisivo)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 registros por IP por hora
  message: {
    success: false,
    message: 'Demasiados intentos de registro, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      docs: '/api/docs'
    }
  });
});

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
        'GET /api/auth/profile': 'Obtener perfil (requiere autenticación)',
        'POST /api/auth/logout': 'Logout (requiere autenticación)',
        'GET /api/auth/test': 'Probar autenticación (requiere autenticación)',
        'POST /api/auth/register-moderator': 'Registro de moderadores (solo admin)',
        'PUT /api/auth/activate-user/:userId': 'Activar usuario (moderador/admin)',
        'PUT /api/auth/deactivate-user/:userId': 'Desactivar usuario (moderador/admin)',
        'PUT /api/auth/suspend-user/:userId': 'Suspender usuario (moderador/admin)',
        'GET /api/auth/sessions': 'Obtener sesiones activas (requiere autenticación)',
        'DELETE /api/auth/sessions/:sessionId': 'Cerrar sesión específica (requiere autenticación)'
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
// Aplicar rate limiting específico por ruta
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
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
