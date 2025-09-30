const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    console.log('Configuración:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ? '***' : 'NO SET'
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión exitosa:', result.rows[0]);
    
    // Verificar si las tablas existen
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'sesiones_usuario')
    `);
    
    console.log('📋 Tablas encontradas:', tablesResult.rows.map(row => row.table_name));
    
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Detalles:', error);
    await pool.end();
    return false;
  }
}

testConnection();
