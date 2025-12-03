/**
 * Script para borrar datos de usuarios, productos y tablas relacionadas
 * 
 * Este script borra SOLO las filas (no las tablas) de:
 * - usuarios
 * - items (productos/servicios)
 * - apelaciones
 * - reportes
 * - servicios
 * - Y tablas relacionadas (imágenes, productos guardados, chats, etc.)
 * 
 * ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_ventas_multiempresa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function borrarDatos() {
  const client = await pool.connect();
  
  try {
    console.log('=====================================================');
    console.log('🧹 SCRIPT DE LIMPIEZA DE DATOS');
    console.log('=====================================================\n');
    console.log('⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE');
    console.log('   Se eliminarán TODAS las filas de:');
    console.log('   - usuarios');
    console.log('   - items (productos/servicios)');
    console.log('   - apelaciones');
    console.log('   - reportes');
    console.log('   - servicios');
    console.log('   - Y tablas relacionadas\n');
    console.log('=====================================================\n');

    // Desactivar temporalmente las restricciones de foreign keys
    await client.query('SET session_replication_role = replica;');
    console.log('🔧 Restricciones de foreign keys desactivadas temporalmente\n');

    // Iniciar transacción
    await client.query('BEGIN;');

    // Paso 1: Borrar tablas que dependen de otras
    console.log('🗑️  Paso 1/12: Eliminando mensajes de chat...');
    await client.query('DELETE FROM mensajes_chat;');
    console.log('   ✅ Mensajes de chat eliminados\n');

    console.log('🗑️  Paso 2/12: Eliminando valoraciones...');
    await client.query('DELETE FROM valoraciones;');
    console.log('   ✅ Valoraciones eliminadas\n');

    console.log('🗑️  Paso 3/12: Eliminando chats...');
    await client.query('DELETE FROM chats;');
    console.log('   ✅ Chats eliminados\n');

    console.log('🗑️  Paso 4/12: Eliminando productos guardados...');
    await client.query('DELETE FROM productos_guardados;');
    console.log('   ✅ Productos guardados eliminados\n');

    console.log('🗑️  Paso 5/12: Eliminando apelaciones...');
    await client.query('DELETE FROM apelaciones;');
    console.log('   ✅ Apelaciones eliminadas\n');

    console.log('🗑️  Paso 6/12: Eliminando reportes...');
    await client.query('DELETE FROM reportes;');
    console.log('   ✅ Reportes eliminados\n');

    console.log('🗑️  Paso 7/12: Eliminando imágenes de productos...');
    await client.query('DELETE FROM item_imagenes;');
    console.log('   ✅ Imágenes de productos eliminadas\n');

    console.log('🗑️  Paso 8/12: Eliminando servicios...');
    await client.query('DELETE FROM servicios;');
    console.log('   ✅ Servicios eliminados\n');

    console.log('🗑️  Paso 9/12: Eliminando acciones de moderación...');
    await client.query('DELETE FROM acciones_moderacion;');
    console.log('   ✅ Acciones de moderación eliminadas\n');

    console.log('🗑️  Paso 10/12: Eliminando sesiones de usuario...');
    await client.query('DELETE FROM sesiones_usuario;');
    console.log('   ✅ Sesiones de usuario eliminadas\n');

    // Paso 2: Borrar tablas principales
    console.log('🗑️  Paso 11/12: Eliminando productos y servicios (items)...');
    await client.query('DELETE FROM items;');
    console.log('   ✅ Productos y servicios eliminados\n');

    console.log('🗑️  Paso 12/12: Eliminando usuarios...');
    await client.query('DELETE FROM usuarios;');
    console.log('   ✅ Usuarios eliminados\n');

    // Paso 3: Reiniciar secuencias
    console.log('🔄 Reiniciando secuencias...');
    const sequences = [
      'usuarios_id_seq',
      'items_id_seq',
      'item_imagenes_id_seq',
      'servicios_id_seq',
      'productos_guardados_id_seq',
      'reportes_id_seq',
      'apelaciones_id_seq',
      'chats_id_seq',
      'mensajes_chat_id_seq',
      'valoraciones_id_seq',
      'acciones_moderacion_id_seq',
      'sesiones_usuario_id_seq'
    ];

    for (const seq of sequences) {
      try {
        await client.query(`ALTER SEQUENCE IF EXISTS ${seq} RESTART WITH 1;`);
      } catch (error) {
        // Ignorar errores si la secuencia no existe
        console.log(`   ⚠️  Secuencia ${seq} no encontrada (se ignora)`);
      }
    }
    console.log('   ✅ Secuencias reiniciadas\n');

    // Confirmar transacción
    await client.query('COMMIT;');
    
    // Reactivar las restricciones de foreign keys
    await client.query('SET session_replication_role = DEFAULT;');
    console.log('🔧 Restricciones de foreign keys reactivadas\n');

    console.log('=====================================================');
    console.log('🎉 ¡Limpieza completada exitosamente!');
    console.log('=====================================================');
    console.log('✅ Todas las filas han sido eliminadas');
    console.log('✅ Las tablas se mantienen intactas');
    console.log('✅ Las secuencias han sido reiniciadas\n');

  } catch (error) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK;');
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.error('\n❌ Error durante la limpieza:', error.message);
    console.error('   La transacción ha sido revertida');
    console.error('   No se realizaron cambios en la base de datos\n');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
borrarDatos()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando el script:', error);
    process.exit(1);
  });

