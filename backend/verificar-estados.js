const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_ventas_multiempresa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'S1805787841',
});

async function verificarEstados() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         VERIFICACIÓN DE ENUM estado_item                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Consultar valores del ENUM estado_item
    const result = await pool.query(`
      SELECT enumlabel as estado
      FROM pg_enum
      WHERE enumtypid = 'estado_item'::regtype
      ORDER BY enumlabel
    `);

    console.log('📊 Valores actuales del ENUM estado_item:\n');
    
    result.rows.forEach((row, index) => {
      const emoji = row.estado === 'en_apelacion' ? '✅' : '  ';
      console.log(`${emoji} ${index + 1}. ${row.estado}`);
    });

    // Verificar si existe 'en_apelacion'
    const tieneApelacion = result.rows.some(row => row.estado === 'en_apelacion');
    
    console.log('\n' + '─'.repeat(66));
    if (tieneApelacion) {
      console.log('✅ Estado "en_apelacion" ENCONTRADO - El cambio fue aplicado correctamente');
    } else {
      console.log('❌ Estado "en_apelacion" NO ENCONTRADO - Ejecuta add-apelacion-estado.bat');
    }
    console.log('─'.repeat(66) + '\n');

    // Mostrar también cuántos items hay en cada estado
    console.log('📈 Distribución de productos por estado:\n');
    const itemsResult = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM items
      GROUP BY estado
      ORDER BY cantidad DESC
    `);

    if (itemsResult.rows.length > 0) {
      itemsResult.rows.forEach(row => {
        console.log(`   ${row.estado}: ${row.cantidad} producto(s)`);
      });
    } else {
      console.log('   No hay productos registrados aún.');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error al verificar estados:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstados();

