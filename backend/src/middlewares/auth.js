const { verifyToken, extractTokenFromHeader } = require('../services/jwt');
const { query } = require('../config/database');

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Extraer token del header
    const token = extractTokenFromHeader(authHeader);

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario en la base de datos
    const result = await query(
      'SELECT id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado FROM usuarios WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (user.estado !== 'activo') {
      return res.status(403).json({
        success: false,
        message: 'Cuenta no activa'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en autenticación:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar roles específicos
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar si el email está verificado
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (!req.user.email_verificado) {
    return res.status(403).json({
      success: false,
      message: 'Email no verificado. Por favor verifica tu email antes de continuar.'
    });
  }

  next();
};

// Middleware para verificar si es propietario del recurso o administrador/moderador
const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const isOwner = req.user.id === parseInt(resourceUserId);
    const isAdminOrModerator = ['administrador', 'moderador'].includes(req.user.tipo_usuario);

    if (!isOwner && !isAdminOrModerator) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Middleware para rate limiting básico (por IP)
const rateLimitByIP = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
      });
    }

    userRequests.push(now);
    next();
  };
};

// Middleware para validar datos de entrada
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user.id : null
    };
    
    console.log(`📊 ${logData.method} ${logData.url} - ${logData.status} (${logData.duration})`);
  });
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireEmailVerification,
  requireOwnershipOrAdmin,
  rateLimitByIP,
  validateInput,
  requestLogger
};
