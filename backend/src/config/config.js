const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración centralizada del sistema
const config = {
  server: {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    host: process.env.HOST
  },
  
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  },
  
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS)
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
};

// Función para validar configuración
const validateConfig = () => {
  const required = [
    'PORT', 'NODE_ENV', 'HOST',
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN',
    'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM',
    'BCRYPT_SALT_ROUNDS', 'CORS_ORIGIN'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missing.join(', '));
    console.error('💡 Asegúrate de que el archivo .env existe y contiene todas las variables requeridas');
    return false;
  }
  
  // Validar tipos de datos
  const port = parseInt(process.env.PORT);
  const dbPort = parseInt(process.env.DB_PORT);
  const emailPort = parseInt(process.env.EMAIL_PORT);
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
  
  if (isNaN(port) || port <= 0) {
    console.error('❌ PORT debe ser un número válido');
    return false;
  }
  
  if (isNaN(dbPort) || dbPort <= 0) {
    console.error('❌ DB_PORT debe ser un número válido');
    return false;
  }
  
  if (isNaN(emailPort) || emailPort <= 0) {
    console.error('❌ EMAIL_PORT debe ser un número válido');
    return false;
  }
  
  if (isNaN(saltRounds) || saltRounds <= 0) {
    console.error('❌ BCRYPT_SALT_ROUNDS debe ser un número válido');
    return false;
  }
  
  return true;
};

// Función para obtener resumen de configuración (sin datos sensibles)
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
      user: config.database.user
    },
    email: {
      user: config.email.user,
      host: config.email.host
    }
  };
};

module.exports = {
  config,
  validateConfig,
  getConfigSummary
};
