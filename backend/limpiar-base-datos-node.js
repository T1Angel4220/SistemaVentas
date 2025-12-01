/**
 * =====================================================
 * SCRIPT DE LIMPIEZA DE BASE DE DATOS - NODE.JS
 * =====================================================
 * Este script limpia todas las tablas usando Node.js
 * Útil si no tienes psql instalado
 * =====================================================
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de conexión
const pool = new Pool({
  host: 'postgres-sistema-ventas.postgres.database.azure.com',
  user: 'azureuser',
  port: 5432,
  database: 'sistema_ventas_multiempresa',
  password: 'Angel_4220',
  ssl: {
    rejectUnauthorized: false // Necesario para Azure PostgreSQL
  }
});

// Tablas a limpiar en orden (de dependientes a principales)
const TABLAS = [
  'mensajes_chat',
  'chats',
  'valoraciones',
  'productos_guardados',
  'apelaciones',
  'reportes',
  'acciones_moderacion',
  'sesiones_usuario',
  'item_imagenes',
  'servicios',
  'items',
  'usuarios'
];

// Secuencias a reiniciar
const SECUENCIAS = [
  'usuarios_id_seq',
  'items_id_seq',
  'chats_id_seq',
  'mensajes_chat_id_seq',
  'reportes_id_seq',
  'apelaciones_id_seq',
  'productos_guardados_id_seq',
  'valoraciones_id_seq',
  'item_imagenes_id_seq',
  'servicios_id_seq',
  'acciones_moderacion_id_seq',
  'sesiones_usuario_id_seq'
];

async function limpiarBaseDatos() {
  const client = await pool.connect();
  
  try {
    console.log('========================================');
    console.log('INICIANDO LIMPIEZA DE BASE DE DATOS');
    console.log('========================================');
    console.log('Fecha/Hora:', new Date().toISOString());
    console.log('');

    // Mostrar conteo antes de limpiar
    console.log('REGISTROS ANTES DE LIMPIAR:');
    for (const tabla of TABLAS) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${tabla}`);
      console.log(`  ${tabla}: ${result.rows[0].count} registros`);
    }
    console.log('');

    // Deshabilitar restricciones temporalmente
    await client.query('SET session_replication_role = replica');
    console.log('✓ Restricciones de claves foráneas deshabilitadas temporalmente');
    console.log('');

    // Limpiar tablas
    console.log('Limpiando tablas...');
    for (const tabla of TABLAS) {
      await client.query(`TRUNCATE TABLE ${tabla} CASCADE`);
      console.log(`  ✓ ${tabla} limpiada`);
    }
    console.log('');

    // Reiniciar secuencias
    console.log('Reiniciando secuencias...');
    for (const secuencia of SECUENCIAS) {
      await client.query(`ALTER SEQUENCE ${secuencia} RESTART WITH 1`);
      console.log(`  ✓ ${secuencia} reiniciada`);
    }
    console.log('');

    // Rehabilitar restricciones
    await client.query('SET session_replication_role = DEFAULT');
    console.log('✓ Restricciones de claves foráneas rehabilitadas');
    console.log('');

    // Verificar que todas las tablas están vacías
    console.log('VERIFICACIÓN FINAL:');
    let todasVacias = true;
    for (const tabla of TABLAS) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${tabla}`);
      const count = parseInt(result.rows[0].count);
      const estado = count === 0 ? '✓' : '✗';
      console.log(`  ${estado} ${tabla}: ${count} registros`);
      if (count > 0) todasVacias = false;
    }
    console.log('');

    // Verificar tablas de referencia
    console.log('TABLAS DE REFERENCIA (deben mantenerse):');
    const categorias = await client.query('SELECT COUNT(*) as count FROM categorias');
    const ubicaciones = await client.query('SELECT COUNT(*) as count FROM ubicaciones');
    console.log(`  categorias: ${categorias.rows[0].count} registros`);
    console.log(`  ubicaciones: ${ubicaciones.rows[0].count} registros`);
    console.log('');

    if (todasVacias) {
      console.log('========================================');
      console.log('¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
      console.log('========================================');
      console.log('Todas las tablas están vacías pero la estructura se mantiene');
      console.log('Las secuencias han sido reiniciadas');
      console.log('Las tablas categorias y ubicaciones mantienen sus datos');
      console.log('========================================');
    } else {
      console.log('========================================');
      console.log('ADVERTENCIA: Algunas tablas no están vacías');
      console.log('========================================');
    }

  } catch (error) {
    console.error('========================================');
    console.error('ERROR AL LIMPIAR LA BASE DE DATOS');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================');
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar limpieza
if (require.main === module) {
  limpiarBaseDatos()
    .then(() => {
      console.log('\nProceso completado. Cerrando conexión...');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nError fatal:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = { limpiarBaseDatos };

