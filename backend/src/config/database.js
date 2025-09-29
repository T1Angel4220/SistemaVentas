const { Pool } = require('pg');
const { config } = require('./config');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a la base de datos exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    return false;
  }
};

// Función para ejecutar consultas
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query ejecutada', { text: text.substring(0, 50) + '...', duration: duration + 'ms' });
    return res;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

// Función para obtener un cliente de la pool
const getClient = async () => {
  return await pool.connect();
};

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    console.log('🔧 Verificando estructura de la base de datos...');
    
    // Verificar si las tablas principales existen
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'sesiones_usuario', 'items', 'categorias')
    `);
    
    if (tablesCheck.rows.length < 4) {
      console.log('⚠️  Algunas tablas no existen. Ejecutando scripts de inicialización...');
      
      // Ejecutar script de base de datos
      const dbScript = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
      await query(dbScript);
      
      // Ejecutar datos iniciales
      const initialDataScript = fs.readFileSync(path.join(__dirname, 'initial_data.sql'), 'utf8');
      await query(initialDataScript);
      
      console.log('✅ Base de datos inicializada correctamente');
    } else {
      console.log('✅ Estructura de la base de datos verificada');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    throw error;
  }
};

// Función para limpiar datos de prueba
const cleanTestData = async () => {
  try {
    console.log('🧹 Limpiando datos de prueba...');
    
    await query('DELETE FROM sesiones_usuario WHERE usuario_id > 0');
    await query('DELETE FROM valoraciones WHERE id > 0');
    await query('DELETE FROM mensajes_chat WHERE id > 0');
    await query('DELETE FROM chats WHERE id > 0');
    await query('DELETE FROM productos_guardados WHERE id > 0');
    await query('DELETE FROM apelaciones WHERE id > 0');
    await query('DELETE FROM reportes WHERE id > 0');
    await query('DELETE FROM item_imagenes WHERE id > 0');
    await query('DELETE FROM servicios WHERE id > 0');
    await query('DELETE FROM items WHERE id > 0');
    await query('DELETE FROM usuarios WHERE id > 0');
    
    console.log('✅ Datos de prueba limpiados');
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error.message);
    throw error;
  }
};

// Función para restaurar datos de prueba
const restoreTestData = async () => {
  try {
    console.log('🔄 Restaurando datos de prueba...');
    
    const initialDataScript = fs.readFileSync(path.join(__dirname, 'initial_data.sql'), 'utf8');
    await query(initialDataScript);
    
    console.log('✅ Datos de prueba restaurados');
    return true;
  } catch (error) {
    console.error('❌ Error al restaurar datos:', error.message);
    throw error;
  }
};

// Función para obtener estado de la base de datos
const getDatabaseStatus = async () => {
  try {
    const tables = await query(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    const users = await query('SELECT COUNT(*) as total FROM usuarios');
    const sessions = await query('SELECT COUNT(*) as total FROM sesiones_usuario');
    const items = await query('SELECT COUNT(*) as total FROM items');
    
    return {
      tables: tables.rows,
      users: users.rows[0].total,
      sessions: sessions.rows[0].total,
      items: items.rows[0].total,
      status: 'connected'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Cerrar la pool al terminar la aplicación
process.on('SIGINT', () => {
  pool.end();
});

process.on('SIGTERM', () => {
  pool.end();
});

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initializeDatabase,
  cleanTestData,
  restoreTestData,
  getDatabaseStatus
};
