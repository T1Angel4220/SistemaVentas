/**
 * Helpers para pruebas de autenticación
 */

const bcrypt = require('bcrypt');
const { query } = require('../../src/config/database');
const { generateSessionTokens, generateEmailVerificationToken } = require('../../src/services/jwt');
const { config } = require('../../src/config/config');

/**
 * Crea un usuario de prueba en la base de datos
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Usuario creado con token
 */
async function createTestUser(userData = {}) {
  try {
    // Extraer createSession del userData antes de usarlo
    const { createSession = true, ...userDataWithoutCreateSession } = userData;
    
    const defaultData = {
      cedula: `TEST${Date.now()}`,
      nombre: 'Usuario',
      apellido: 'Prueba',
      correo: `test${Date.now()}@prueba.com`,
      telefono: '88888888',
      direccion: 'Dirección de prueba',
      genero: 'masculino',
      password: 'password123',
      tipo_usuario: 'comprador',
      estado: 'activo',
      email_verificado: true
    };

    const user = { ...defaultData, ...userDataWithoutCreateSession };
    const passwordHash = await bcrypt.hash(user.password, config.bcrypt.saltRounds);

    const result = await query(`
      INSERT INTO usuarios (
        cedula, nombre, apellido, correo, telefono, direccion, genero,
        password_hash, tipo_usuario, estado, email_verificado, token_verificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado
    `, [
      user.cedula,
      user.nombre,
      user.apellido,
      user.correo,
      user.telefono,
      user.direccion,
      user.genero,
      passwordHash,
      user.tipo_usuario,
      user.estado,
      user.email_verificado,
      null
    ]);

    const createdUser = result.rows[0];
    const tokens = generateSessionTokens(createdUser);
    
    // Crear sesión si createSession es true (por defecto)
    if (createSession === true) {
      await query(`
        INSERT INTO sesiones_usuario (usuario_id, token_sesion, fecha_expiracion, ip_address, user_agent, activa)
        VALUES ($1, $2, NOW() + INTERVAL '7 days', '127.0.0.1', 'test-agent', TRUE)
      `, [createdUser.id, tokens.accessToken]);
    }

    return {
      ...createdUser,
      password: user.password, // Devolver la contraseña sin hashear para las pruebas
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error.message);
    throw error;
  }
}

/**
 * Crea un comprador de prueba
 */
async function createTestBuyer(userData = {}) {
  return createTestUser({
    tipo_usuario: 'comprador',
    ...userData
  });
}

/**
 * Crea un vendedor de prueba
 */
async function createTestSeller(userData = {}) {
  return createTestUser({
    tipo_usuario: 'vendedor',
    ...userData
  });
}

/**
 * Crea un moderador de prueba
 */
async function createTestModerator(userData = {}) {
  return createTestUser({
    tipo_usuario: 'moderador',
    ...userData
  });
}

/**
 * Crea un administrador de prueba
 */
async function createTestAdmin(userData = {}) {
  return createTestUser({
    tipo_usuario: 'administrador',
    ...userData
  });
}

/**
 * Crea un usuario pendiente de verificación
 */
async function createUnverifiedUser(userData = {}) {
  const verificationToken = generateEmailVerificationToken(null, userData.correo || 'test@prueba.com');
  
  return createTestUser({
    estado: 'pendiente_verificacion',
    email_verificado: false,
    token_verificacion: verificationToken,
    createSession: false, // Usuarios no verificados no tienen sesión
    ...userData
  });
}

/**
 * Crea un usuario suspendido
 */
async function createSuspendedUser(userData = {}) {
  return createTestUser({
    estado: 'suspendido',
    createSession: false, // Usuarios suspendidos no tienen sesión
    ...userData
  });
}

/**
 * Crea un usuario inactivo
 */
async function createInactiveUser(userData = {}) {
  return createTestUser({
    estado: 'inactivo',
    createSession: false, // Usuarios inactivos no tienen sesión
    ...userData
  });
}

/**
 * Crea una sesión de prueba para un usuario
 * @param {number} userId - ID del usuario
 * @param {string} token - Token de sesión
 * @returns {Object} Sesión creada
 */
async function createTestSession(userId, token) {
  try {
    const result = await query(`
      INSERT INTO sesiones_usuario (
        usuario_id, token_sesion, fecha_expiracion, ip_address, user_agent, activa
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId,
      token,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      '127.0.0.1',
      'Mocha/Test',
      true
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando sesión de prueba:', error.message);
    throw error;
  }
}

/**
 * Genera headers de autorización para las pruebas
 * @param {string} token - Token JWT
 * @returns {Object} Headers con Authorization
 */
function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Login manual de un usuario (útil para pruebas)
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Object} Usuario con token
 */
async function loginUser(email, password) {
  try {
    const userResult = await query('SELECT * FROM usuarios WHERE correo = $1', [email]);
    
    if (userResult.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Contraseña inválida');
    }

    const tokens = generateSessionTokens(user);
    await createTestSession(user.id, tokens.accessToken);

    return {
      ...user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  } catch (error) {
    console.error('❌ Error en login de usuario:', error.message);
    throw error;
  }
}

/**
 * Cierra todas las sesiones de un usuario
 * @param {number} userId - ID del usuario
 */
async function closeAllUserSessions(userId) {
  try {
    await query('UPDATE sesiones_usuario SET activa = false WHERE usuario_id = $1', [userId]);
  } catch (error) {
    console.error('❌ Error cerrando sesiones:', error.message);
    throw error;
  }
}

/**
 * Actualiza el estado de un usuario
 * @param {number} userId - ID del usuario
 * @param {string} estado - Nuevo estado
 */
async function updateUserStatus(userId, estado) {
  try {
    const result = await query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error actualizando estado:', error.message);
    throw error;
  }
}

module.exports = {
  createTestUser,
  createTestBuyer,
  createTestSeller,
  createTestModerator,
  createTestAdmin,
  createUnverifiedUser,
  createSuspendedUser,
  createInactiveUser,
  createTestSession,
  getAuthHeaders,
  loginUser,
  closeAllUserSessions,
  updateUserStatus
};

