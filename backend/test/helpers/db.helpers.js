/**
 * Helpers para gestión de base de datos en pruebas
 */

const { query, pool } = require('../../src/config/database');

/**
 * Limpia todas las tablas de la base de datos
 * Útil para ejecutar antes de cada suite de pruebas
 */
async function cleanDatabase() {
  try {
    // Desactivar temporalmente las restricciones de foreign keys
    await query('SET session_replication_role = replica;');
    
    // Limpiar todas las tablas en orden inverso de dependencias
    const tables = [
      'acciones_moderacion',
      'sesiones_usuario',
      'valoraciones',
      'mensajes_chat',
      'chats',
      'productos_guardados',
      'apelaciones',
      'reportes',
      'item_imagenes',
      'servicios',
      'items',
      'usuarios'
    ];
    
    for (const table of tables) {
      await query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
    }
    
    // Reactivar las restricciones
    await query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Base de datos limpiada');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error.message);
    throw error;
  }
}

/**
 * Limpia solo la tabla de usuarios y sesiones
 * Útil para pruebas de autenticación
 */
async function cleanAuthTables() {
  try {
    // Limpiar TODAS las tablas que dependen de usuarios (en orden de dependencias)
    // Nivel 3: Tablas que dependen de tablas que dependen de usuarios
    await query('DELETE FROM mensajes_chat WHERE id > 0;');
    
    // Nivel 2: Tablas que dependen de items o chats
    await query('DELETE FROM item_imagenes WHERE id > 0;');
    await query('DELETE FROM servicios WHERE id > 0;');
    await query('DELETE FROM productos_guardados WHERE id > 0;');
    await query('DELETE FROM valoraciones WHERE id > 0;');
    await query('DELETE FROM apelaciones WHERE id > 0;');
    await query('DELETE FROM chats WHERE id > 0;');
    
    // Nivel 1: Tablas que dependen directamente de usuarios
    await query('DELETE FROM reportes WHERE id > 0;');
    await query('DELETE FROM items WHERE id > 0;');
    await query('DELETE FROM acciones_moderacion WHERE id > 0;');
    await query('DELETE FROM sesiones_usuario WHERE id > 0;');
    
    // Nivel 0: Tabla principal
    await query('DELETE FROM usuarios WHERE id > 0;');
    
    // Reiniciar secuencias
    await query('ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE sesiones_usuario_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE acciones_moderacion_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE items_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE reportes_id_seq RESTART WITH 1;');
    
    console.log('✅ Tablas de autenticación limpiadas');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando tablas de autenticación:', error.message);
    throw error;
  }
}

/**
 * Limpia solo las tablas de moderación
 */
async function cleanModerationTables() {
  try {
    await query('DELETE FROM acciones_moderacion WHERE id > 0;');
    await query('DELETE FROM apelaciones WHERE id > 0;');
    await query('DELETE FROM reportes WHERE id > 0;');
    await query('ALTER SEQUENCE acciones_moderacion_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE apelaciones_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE reportes_id_seq RESTART WITH 1;');
    
    console.log('✅ Tablas de moderación limpiadas');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando tablas de moderación:', error.message);
    throw error;
  }
}

/**
 * Verifica si existe un usuario por email
 */
async function userExists(email) {
  try {
    const result = await query('SELECT id FROM usuarios WHERE correo = $1', [email]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Error verificando usuario:', error.message);
    throw error;
  }
}

/**
 * Obtiene un usuario por email
 */
async function getUserByEmail(email) {
  try {
    const result = await query('SELECT * FROM usuarios WHERE correo = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error.message);
    throw error;
  }
}

/**
 * Obtiene un usuario por ID
 */
async function getUserById(id) {
  try {
    const result = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error.message);
    throw error;
  }
}

/**
 * Cuenta el número de sesiones activas de un usuario
 */
async function countActiveSessions(userId) {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM sesiones_usuario WHERE usuario_id = $1 AND activa = true',
      [userId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('❌ Error contando sesiones:', error.message);
    throw error;
  }
}

/**
 * Cuenta el número de acciones de moderación
 */
async function countModerationActions(moderatorId) {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM acciones_moderacion WHERE moderador_id = $1',
      [moderatorId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('❌ Error contando acciones de moderación:', error.message);
    throw error;
  }
}

/**
 * Verifica la conexión a la base de datos
 */
async function checkDatabaseConnection() {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error.message);
    return false;
  }
}

/**
 * Cierra todas las conexiones del pool
 */
async function closeDatabase() {
  try {
    await pool.end();
    console.log('✅ Conexiones de base de datos cerradas');
  } catch (error) {
    console.error('❌ Error cerrando conexiones:', error.message);
    throw error;
  }
}

module.exports = {
  cleanDatabase,
  cleanAuthTables,
  cleanModerationTables,
  userExists,
  getUserByEmail,
  getUserById,
  countActiveSessions,
  countModerationActions,
  checkDatabaseConnection,
  closeDatabase
};

