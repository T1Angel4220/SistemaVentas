const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos del usuario
 * @param {string} expiresIn - Tiempo de expiración (opcional)
 * @returns {string} Token JWT
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  try {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  } catch (error) {
    console.error('❌ Error al generar token:', error.message);
    throw new Error('Error al generar token');
  }
};

/**
 * Genera un token de refresh para renovar sesiones
 * @param {Object} payload - Datos del usuario
 * @returns {string} Token de refresh
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.refreshExpiresIn 
    });
  } catch (error) {
    console.error('❌ Error al generar refresh token:', error.message);
    throw new Error('Error al generar refresh token');
  }
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Datos decodificados del token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error al verificar token');
    }
  }
};

/**
 * Genera un token de verificación de email
 * @param {number} userId - ID del usuario
 * @param {string} email - Email del usuario
 * @returns {string} Token de verificación
 */
const generateEmailVerificationToken = (userId, email) => {
  const payload = {
    userId,
    email,
    type: 'email_verification',
    timestamp: Date.now()
  };
  
  return generateToken(payload, '24h');
};

/**
 * Genera un token de recuperación de contraseña
 * @param {number} userId - ID del usuario
 * @param {string} email - Email del usuario
 * @returns {string} Token de recuperación
 */
const generatePasswordResetToken = (userId, email) => {
  const payload = {
    userId,
    email,
    type: 'password_reset',
    timestamp: Date.now()
  };
  
  return generateToken(payload, '1h');
};

/**
 * Verifica un token de verificación de email
 * @param {string} token - Token a verificar
 * @returns {Object} Datos del token
 */
const verifyEmailVerificationToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'email_verification') {
    throw new Error('Token de tipo incorrecto');
  }
  
  return decoded;
};

/**
 * Verifica un token de recuperación de contraseña
 * @param {string} token - Token a verificar
 * @returns {Object} Datos del token
 */
const verifyPasswordResetToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'password_reset') {
    throw new Error('Token de tipo incorrecto');
  }
  
  return decoded;
};

/**
 * Extrae el token del header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token extraído o null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Genera un token de sesión para el usuario
 * @param {Object} user - Datos del usuario
 * @returns {Object} Tokens generados
 */
const generateSessionTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.correo,
    tipo_usuario: user.tipo_usuario,
    estado: user.estado
  };
  
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
  extractTokenFromHeader,
  generateSessionTokens
};
