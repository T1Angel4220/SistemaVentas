const { Pool } = require('pg');
const { config } = require('./config');

// Configuración de la base de datos desde config centralizado
const dbConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  // Configuraciones adicionales para producción
  max: config.database.max,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
};

// Crear el pool de conexiones
const pool = new Pool(dbConfig);

// Eventos del pool para logging
pool.on('connect', () => {
  console.log('✅ Nueva conexión establecida con la base de datos');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos exitosa:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para ejecutar consultas con manejo de errores
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query ejecutada en ${duration}ms:`, text.substring(0, 50) + '...');
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

// Función para obtener un cliente del pool
const getClient = async () => {
  return await pool.connect();
};

// Función para cerrar todas las conexiones
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error al cerrar el pool:', error.message);
  }
};

// Función para verificar el estado de la base de datos
const getDatabaseStatus = async () => {
  try {
    const result = await query(`
      SELECT 
        'usuarios' as tabla, COUNT(*) as total FROM usuarios
      UNION ALL
      SELECT 'items', COUNT(*) FROM items
      UNION ALL
      SELECT 'reportes', COUNT(*) FROM reportes
      UNION ALL
      SELECT 'chats', COUNT(*) FROM chats
      ORDER BY tabla
    `);
    
    return {
      status: 'connected',
      tables: result.rows,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Función para inicializar la base de datos (crear tablas si no existen)
const initializeDatabase = async () => {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Verificar si las tablas principales existen
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'items', 'categorias', 'reportes')
    `);
    
    if (tablesCheck.rows.length < 4) {
      console.log('⚠️  Algunas tablas no existen. Ejecutando script de creación...');
      console.log('📝 Por favor, ejecuta manualmente: psql -d sistema_ventas_multiempresa -f backend/src/config/database.sql');
      console.log('📝 Luego ejecuta: psql -d sistema_ventas_multiempresa -f backend/src/config/initial_data.sql');
    } else {
      console.log('✅ Todas las tablas principales existen');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    return false;
  }
};

// Función para limpiar datos de prueba (útil para testing)
const cleanTestData = async () => {
  try {
    console.log('🧹 Limpiando datos de prueba...');
    
    // Eliminar en orden correcto para respetar foreign keys
    await query('DELETE FROM valoraciones WHERE evaluador_id > 7 OR evaluado_id > 7');
    await query('DELETE FROM mensajes_chat WHERE chat_id IN (SELECT id FROM chats WHERE comprador_id > 7 OR vendedor_id > 7)');
    await query('DELETE FROM chats WHERE comprador_id > 7 OR vendedor_id > 7');
    await query('DELETE FROM productos_guardados WHERE usuario_id > 7');
    await query('DELETE FROM apelaciones WHERE usuario_apelante_id > 7');
    await query('DELETE FROM reportes WHERE usuario_reportador_id > 7');
    await query('DELETE FROM item_imagenes WHERE item_id > 12');
    await query('DELETE FROM servicios WHERE item_id > 12');
    await query('DELETE FROM items WHERE vendedor_id > 7');
    await query('DELETE FROM sesiones_usuario WHERE usuario_id > 7');
    await query('DELETE FROM acciones_moderacion WHERE moderador_id > 3');
    await query('DELETE FROM usuarios WHERE id > 7');
    
    console.log('✅ Datos de prueba eliminados');
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar datos de prueba:', error.message);
    return false;
  }
};

// Función para restaurar datos de prueba
const restoreTestData = async () => {
  try {
    console.log('🔄 Restaurando datos de prueba...');
    
    // Ejecutar el script de datos iniciales
    const fs = require('fs');
    const path = require('path');
    const initialDataPath = path.join(__dirname, 'initial_data.sql');
    
    if (fs.existsSync(initialDataPath)) {
      const sql = fs.readFileSync(initialDataPath, 'utf8');
      await query(sql);
      console.log('✅ Datos de prueba restaurados');
      return true;
    } else {
      console.log('⚠️  Archivo de datos iniciales no encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al restaurar datos de prueba:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool,
  getDatabaseStatus,
  initializeDatabase,
  cleanTestData,
  restoreTestData
};
