/**
 * Funciones Auxiliares para Pruebas de Integración
 * 
 * Utilidades comunes para simplificar la escritura de pruebas
 */

const bcrypt = require('bcrypt');
const { query } = require('./testDatabase');
const { generateSessionTokens } = require('../../../services/jwt');

/**
 * Crear usuario de prueba en la base de datos
 */
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    cedula: '999999999',
    nombre: 'Usuario',
    apellido: 'Prueba',
    correo: 'test@test.com',
    telefono: '8888-8888',
    direccion: 'San José, Costa Rica',
    genero: 'masculino',
    password: 'password123',
    tipo_usuario: 'comprador',
    estado: 'activo',
    email_verificado: true
  };

  const user = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const result = await query(
    `INSERT INTO usuarios (
      cedula, nombre, apellido, correo, telefono, direccion, 
      genero, password_hash, tipo_usuario, estado, email_verificado, 
      fecha_creacion, fecha_ultimo_acceso
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING id, cedula, nombre, apellido, correo, telefono, direccion, 
              genero, tipo_usuario, estado, email_verificado, fecha_creacion`,
    [
      user.cedula,
      user.nombre,
      user.apellido,
      user.correo,
      user.telefono,
      user.direccion,
      user.genero,
      hashedPassword,
      user.tipo_usuario,
      user.estado,
      user.email_verificado
    ]
  );

  return result.rows[0];
};

/**
 * Crear vendedor de prueba
 */
const createTestSeller = async (userData = {}) => {
  return createTestUser({
    cedula: '888888888',
    nombre: 'Vendedor',
    apellido: 'Prueba',
    correo: 'vendedor@test.com',
    tipo_usuario: 'vendedor',
    ...userData
  });
};

/**
 * Crear moderador de prueba
 */
const createTestModerator = async (userData = {}) => {
  return createTestUser({
    cedula: '777777777',
    nombre: 'Moderador',
    apellido: 'Prueba',
    correo: 'moderador@test.com',
    tipo_usuario: 'moderador',
    ...userData
  });
};

/**
 * Crear administrador de prueba
 */
const createTestAdmin = async (userData = {}) => {
  return createTestUser({
    cedula: '666666666',
    nombre: 'Admin',
    apellido: 'Prueba',
    correo: 'admin@test.com',
    tipo_usuario: 'administrador',
    ...userData
  });
};

/**
 * Generar tokens JWT para usuario de prueba
 */
const generateTestTokens = (user) => {
  return generateSessionTokens(user);
};

/**
 * Crear sesión de prueba
 */
const createTestSession = async (userId, tokens) => {
  const result = await query(
    `INSERT INTO sesiones_usuario (
      usuario_id, token_acceso, token_refresco, 
      direccion_ip, user_agent, fecha_expiracion, activa
    ) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '1 day', true)
    RETURNING id, usuario_id, token_acceso, fecha_creacion, activa`,
    [
      userId,
      tokens.accessToken,
      tokens.refreshToken,
      '127.0.0.1',
      'Test User Agent'
    ]
  );

  return result.rows[0];
};

/**
 * Obtener usuario por correo
 */
const getUserByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM usuarios WHERE correo = $1',
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Obtener usuario por ID
 */
const getUserById = async (id) => {
  const result = await query(
    'SELECT * FROM usuarios WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Verificar si existe un código de verificación
 */
const getVerificationCode = async (userId) => {
  const result = await query(
    'SELECT token_verificacion, fecha_actualizacion FROM usuarios WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Verificar si existe un código de recuperación de contraseña
 */
const getPasswordResetCode = async (userId) => {
  const result = await query(
    'SELECT token_recuperacion, fecha_actualizacion FROM usuarios WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Contar sesiones activas de un usuario
 */
const countActiveSessions = async (userId) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM sesiones_usuario WHERE usuario_id = $1 AND activa = true',
    [userId]
  );
  return parseInt(result.rows[0].count);
};

/**
 * Eliminar usuario de prueba
 */
const deleteTestUser = async (email) => {
  await query('DELETE FROM sesiones_usuario WHERE usuario_id IN (SELECT id FROM usuarios WHERE correo = $1)', [email]);
  await query('DELETE FROM usuarios WHERE correo = $1', [email]);
};

/**
 * Crear producto de prueba
 */
const createTestProduct = async (sellerId, productData = {}) => {
  const defaultProduct = {
    nombre: 'Producto de Prueba',
    descripcion: 'Descripción del producto de prueba',
    precio: 100.00,
    cantidad_disponible: 10,
    categoria_id: 1,
    ubicacion_id: 1,
    estado: 'pendiente_revision'
  };

  const product = { ...defaultProduct, ...productData };

  const result = await query(
    `INSERT INTO items (
      usuario_id, nombre, descripcion, precio, 
      cantidad_disponible, categoria_id, ubicacion_id, 
      estado, fecha_creacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *`,
    [
      sellerId,
      product.nombre,
      product.descripcion,
      product.precio,
      product.cantidad_disponible,
      product.categoria_id,
      product.ubicacion_id,
      product.estado
    ]
  );

  return result.rows[0];
};

/**
 * Generar código de verificación de 6 dígitos
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Esperar X milisegundos (útil para tests de expiración)
 */
const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  createTestUser,
  createTestSeller,
  createTestModerator,
  createTestAdmin,
  generateTestTokens,
  createTestSession,
  getUserByEmail,
  getUserById,
  getVerificationCode,
  getPasswordResetCode,
  countActiveSessions,
  deleteTestUser,
  createTestProduct,
  generateVerificationCode,
  wait
};

