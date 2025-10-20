/**
 * Configuración de Base de Datos para Pruebas de Integración
 * 
 * Utiliza la misma conexión PostgreSQL pero con funciones
 * especializadas para limpiar y restaurar datos entre pruebas.
 */

const { Pool } = require('pg');
const { config } = require('../../../config/config');

// Pool de conexiones para pruebas
const testPool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 5, // Menos conexiones para pruebas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

/**
 * Ejecutar query en BD de prueba
 */
const query = async (text, params) => {
  try {
    const res = await testPool.query(text, params);
    return res;
  } catch (error) {
    console.error('❌ Error en query de prueba:', error.message);
    throw error;
  }
};

/**
 * Limpiar todas las tablas para pruebas
 * Elimina solo datos de prueba, mantiene estructura
 */
const cleanDatabase = async () => {
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await query('BEGIN');
    
    // Eliminar en orden inverso de dependencias
    await query('DELETE FROM sesiones_usuario WHERE id > 0');
    await query('DELETE FROM valoraciones WHERE id > 0');
    await query('DELETE FROM mensajes_chat WHERE id > 0');
    await query('DELETE FROM chats WHERE id > 0');
    await query('DELETE FROM productos_guardados WHERE id > 0');
    await query('DELETE FROM apelaciones WHERE id > 0');
    await query('DELETE FROM reportes WHERE id > 0');
    await query('DELETE FROM item_imagenes WHERE id > 0');
    await query('DELETE FROM servicios WHERE id > 0');
    await query('DELETE FROM items WHERE id > 0');
    
    // Solo eliminar usuarios de prueba (no los del sistema)
    await query(`
      DELETE FROM usuarios 
      WHERE correo LIKE '%@test.com' 
        OR correo LIKE '%@ejemplo.com'
        OR correo LIKE '%@example.com'
    `);
    
    await query('COMMIT');
    
    return true;
  } catch (error) {
    await query('ROLLBACK');
    console.error('❌ Error al limpiar base de datos:', error.message);
    throw error;
  }
};

/**
 * Resetear secuencias de IDs
 */
const resetSequences = async () => {
  try {
    // No resetear completamente, solo ajustar
    const sequences = [
      'usuarios_id_seq',
      'items_id_seq',
      'sesiones_usuario_id_seq',
      'item_imagenes_id_seq'
    ];
    
    for (const seq of sequences) {
      await query(`SELECT setval('${seq}', (SELECT COALESCE(MAX(id), 1) FROM ${seq.replace('_id_seq', '')}), true)`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al resetear secuencias:', error.message);
    return false;
  }
};

/**
 * Verificar conexión a BD
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as now, current_database() as database');
    console.log(`✅ Conexión a BD de pruebas exitosa: ${result.rows[0].database}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a BD de pruebas:', error.message);
    return false;
  }
};

/**
 * Obtener cliente de la pool
 */
const getClient = async () => {
  return await testPool.connect();
};

/**
 * Cerrar pool de conexiones
 */
const closePool = async () => {
  try {
    await testPool.end();
    console.log('✅ Pool de conexiones de prueba cerrado');
  } catch (error) {
    console.error('❌ Error al cerrar pool:', error.message);
  }
};

/**
 * Iniciar transacción para prueba
 */
const beginTransaction = async (client) => {
  await client.query('BEGIN');
};

/**
 * Confirmar transacción
 */
const commitTransaction = async (client) => {
  await client.query('COMMIT');
};

/**
 * Revertir transacción
 */
const rollbackTransaction = async (client) => {
  await client.query('ROLLBACK');
};

module.exports = {
  testPool,
  query,
  cleanDatabase,
  resetSequences,
  testConnection,
  getClient,
  closePool,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
};

