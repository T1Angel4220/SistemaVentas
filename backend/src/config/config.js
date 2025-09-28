require('dotenv').config();

// Configuración centralizada del sistema
const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },

  // Configuración de la base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'sistema_ventas_multiempresa',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Angel_4220',
    url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'Angel_4220'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'sistema_ventas_multiempresa'}`,
    // Configuraciones adicionales para producción
    max: 20, // Máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexiones inactivas
    connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Configuración de email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true para 465, false para otros puertos
    user: process.env.EMAIL_USER || 'eventconnect90@gmail.com',
    password: process.env.EMAIL_PASS || 'oshzkgssiwxfdiqr',
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'eventconnect90@gmail.com'
  },

  // Configuración de archivos
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5
  },

  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // límite de requests por IP
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'supersecretkey',
    cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000 // 24 horas
  },

  // Configuración de paginación
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_LIMIT) || 10,
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT) || 100
  },

  // Configuración de cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutos
    max: parseInt(process.env.CACHE_MAX) || 100
  }
};

// Función para validar configuración crítica
const validateConfig = () => {
  const errors = [];

  // Validar configuración de base de datos
  if (!config.database.host) errors.push('DB_HOST es requerido');
  if (!config.database.name) errors.push('DB_NAME es requerido');
  if (!config.database.user) errors.push('DB_USER es requerido');
  if (!config.database.password) errors.push('DB_PASSWORD es requerido');

  // Validar configuración de JWT
  if (!config.jwt.secret || config.jwt.secret === 'supersecretkey') {
    errors.push('JWT_SECRET debe ser configurado con un valor seguro');
  }

  // Validar configuración de email
  if (!config.email.user) errors.push('EMAIL_USER es requerido');
  if (!config.email.password) errors.push('EMAIL_PASS es requerido');

  if (errors.length > 0) {
    console.error('❌ Errores de configuración:');
    errors.forEach(error => console.error(`   - ${error}`));
    return false;
  }

  return true;
};

// Función para mostrar configuración (sin datos sensibles)
const getConfigSummary = () => {
  return {
    server: {
      port: config.server.port,
      nodeEnv: config.server.nodeEnv,
      host: config.server.host
    },
    database: {
      host: config.database.host,
      port: config.database.port,
      name: config.database.name,
      user: config.database.user,
      // password: '***' // No mostrar password
    },
    jwt: {
      expiresIn: config.jwt.expiresIn,
      // secret: '***' // No mostrar secret
    },
    email: {
      host: config.email.host,
      port: config.email.port,
      user: config.email.user,
      // password: '***' // No mostrar password
    },
    upload: config.upload,
    cors: config.cors,
    pagination: config.pagination
  };
};

module.exports = {
  config,
  validateConfig,
  getConfigSummary
};
