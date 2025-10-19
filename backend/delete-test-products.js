const { Pool } = require('pg');
require('dotenv').config();

// Configurar conexión a la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_ventas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Códigos de productos de prueba a eliminar
const codigosProductosPrueba = [
  'LAPTOP-001',
  'PHONE-001',
  'SOFA-001',
  'BIKE-001',
  'CAMERA-001',
  'WATCH-001',
  'DESK-001',
  'CONSOLE-001',
  'HEADPHONES-001',
  'TABLET-001',
  'SERV-CLEAN-001',
  'SERV-PLUMB-001',
  'SERV-TUTOR-001',
  'PRINTER-001',
  'FRIDGE-001'
];

async function deleteTestProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Iniciando eliminación de productos de prueba...\n');
    
    // Construir lista de códigos para la query
    const placeholders = codigosProductosPrueba.map((_, i) => `$${i + 1}`).join(', ');
    
    // Primero, obtener información de los productos a eliminar
    const productosResult = await client.query(
      `SELECT id, codigo, nombre FROM items WHERE codigo IN (${placeholders})`,
      codigosProductosPrueba
    );
    
    if (productosResult.rows.length === 0) {
      console.log('ℹ️  No se encontraron productos de prueba para eliminar.\n');
      return;
    }
    
    console.log(`📋 Productos encontrados para eliminar: ${productosResult.rows.length}\n`);
    productosResult.rows.forEach(p => {
      console.log(`   • ${p.nombre} (${p.codigo})`);
    });
    console.log('');
    
    // Contar imágenes a eliminar
    const imagenesResult = await client.query(
      `SELECT COUNT(*) as total 
       FROM item_imagenes 
       WHERE item_id IN (SELECT id FROM items WHERE codigo IN (${placeholders}))`,
      codigosProductosPrueba
    );
    
    const totalImagenes = parseInt(imagenesResult.rows[0].total);
    console.log(`📸 Total de imágenes a eliminar: ${totalImagenes}\n`);
    
    console.log('⚠️  ¿Estás seguro? Esta acción NO se puede deshacer.');
    console.log('   Esperando 5 segundos antes de continuar...\n');
    
    // Esperar 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔄 Eliminando productos y sus imágenes...\n');
    
    // Las imágenes se eliminan automáticamente por ON DELETE CASCADE
    const deleteResult = await client.query(
      `DELETE FROM items WHERE codigo IN (${placeholders}) RETURNING id, codigo, nombre`,
      codigosProductosPrueba
    );
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ¡ELIMINACIÓN COMPLETADA!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🗑️  Productos eliminados: ${deleteResult.rows.length}`);
    console.log(`📸 Imágenes eliminadas: ${totalImagenes} (cascada)`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    deleteResult.rows.forEach(p => {
      console.log(`   ✓ ${p.nombre} (${p.codigo})`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ Error eliminando productos:', error.message);
    console.error('Detalles:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
deleteTestProducts().catch(console.error);

