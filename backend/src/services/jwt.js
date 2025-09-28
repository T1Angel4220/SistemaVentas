const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

// Función para generar token JWT
const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: config.jwt.expiresIn,
    issuer: 'sistema-ventas-multiempresa',
    audience: 'sistema-ventas-users'
  };

  return jwt.sign(payload, config.jwt.secret, { ...defaultOptions, ...options });
};

// Función para generar refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'sistema-ventas-multiempresa',
    audience: 'sistema-ventas-refresh'
  });
};

// Función para verificar token JWT
const verifyToken = (token, options = {}) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'sistema-ventas-multiempresa',
      audience: 'sistema-ventas-users',
      ...options
    });
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
};

// Función para verificar refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'sistema-ventas-multiempresa',
      audience: 'sistema-ventas-refresh'
    });
  } catch (error) {
    throw new Error(`Refresh token inválido: ${error.message}`);
  }
};

// Función para decodificar token sin verificar (útil para debugging)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Función para extraer token del header Authorization
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new Error('Header Authorization no encontrado');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Formato de Authorization header inválido. Use: Bearer <token>');
  }

  return parts[1];
};

// Función para generar payload estándar para usuarios
const generateUserPayload = (user) => {
  return {
    id: user.id,
    cedula: user.cedula,
    correo: user.correo,
    tipo_usuario: user.tipo_usuario,
    estado: user.estado,
    email_verificado: user.email_verificado
  };
};

// Función para generar tokens completos (access + refresh)
const generateTokenPair = (user) => {
  const payload = generateUserPayload(user);
  
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken({ id: user.id }),
    expiresIn: config.jwt.expiresIn,
    tokenType: 'Bearer'
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  generateUserPayload,
  generateTokenPair
};
