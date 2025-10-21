const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_ventas_multiempresa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

console.log('\n=====================================================');
console.log('  🧹 LIMPIEZA DE BASE DE DATOS');
console.log('=====================================================\n');

console.log('⚠️  ADVERTENCIA: Esta acción eliminará datos de usuarios y productos\n');
console.log('   Se eliminarán:');
console.log('   - Todos los COMPRADORES');
console.log('   - Todos los VENDEDORES');
console.log('   - Todos los productos');
console.log('   - Todas las sesiones');
console.log('   - Todos los chats y mensajes');
console.log('   - Todos los reportes');
console.log('   - Todas las imágenes\n');
console.log('   SE MANTENDRÁN:');
console.log('   ✅ Administradores');
console.log('   ✅ Moderadores');
console.log('   ✅ Acciones de moderación (auditoría)');
console.log('   ✅ Categorías');
console.log('   ✅ Ubicaciones\n');
console.log('=====================================================\n');

async function limpiarBaseDatos() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');

    // Mostrar usuario administrador antes de eliminar
    console.log('📋 Usuario Administrador que se mantendrá:');
    const adminResult = await client.query(
      "SELECT id, cedula, nombre, apellido, correo, tipo_usuario FROM usuarios WHERE tipo_usuario = 'administrador'"
    );
    
    if (adminResult.rows.length === 0) {
      console.log('❌ ERROR: No se encontró ningún usuario administrador');
      console.log('   No se puede continuar con la limpieza');
      return;
    }
    
    console.table(adminResult.rows);
    console.log('');

    // Paso 1: Eliminar sesiones
    console.log('🗑️  Paso 1/11: Eliminando todas las sesiones...');
    await client.query('DELETE FROM sesiones_usuario');
    console.log('   ✅ Sesiones eliminadas\n');

    // Paso 2: Eliminar mensajes
    console.log('🗑️  Paso 2/11: Eliminando todos los mensajes...');
    await client.query('DELETE FROM mensajes_chat');
    console.log('   ✅ Mensajes eliminados\n');

    // Paso 3: Eliminar chats
    console.log('🗑️  Paso 3/11: Eliminando todos los chats...');
    await client.query('DELETE FROM chats');
    console.log('   ✅ Chats eliminados\n');

    // Paso 4: Eliminar productos guardados
    console.log('🗑️  Paso 4/11: Eliminando productos guardados...');
    await client.query('DELETE FROM productos_guardados');
    console.log('   ✅ Productos guardados eliminados\n');

    // Paso 5: Eliminar valoraciones
    console.log('🗑️  Paso 5/11: Eliminando todas las valoraciones...');
    await client.query('DELETE FROM valoraciones');
    console.log('   ✅ Valoraciones eliminadas\n');

    // Paso 6: Eliminar apelaciones (debe ir antes de reportes)
    console.log('🗑️  Paso 6/11: Eliminando todas las apelaciones...');
    await client.query('DELETE FROM apelaciones');
    console.log('   ✅ Apelaciones eliminadas\n');

    // Paso 7: Eliminar reportes
    console.log('🗑️  Paso 7/11: Eliminando todos los reportes...');
    await client.query('DELETE FROM reportes');
    console.log('   ✅ Reportes eliminados\n');

    // Paso 8: Eliminar imágenes de productos
    console.log('🗑️  Paso 8/11: Eliminando imágenes de productos...');
    await client.query('DELETE FROM item_imagenes');
    console.log('   ✅ Imágenes eliminadas\n');

    // Paso 9: Eliminar productos
    console.log('🗑️  Paso 9/11: Eliminando todos los productos...');
    await client.query('DELETE FROM items');
    console.log('   ✅ Productos eliminados\n');

    // Paso 10: Mostrar usuarios que se van a eliminar
    console.log('🗑️  Paso 10/10: Usuarios que serán eliminados (solo compradores y vendedores):');
    const usuariosEliminar = await client.query(
      "SELECT id, cedula, nombre, apellido, correo, tipo_usuario FROM usuarios WHERE tipo_usuario IN ('comprador', 'vendedor')"
    );
    
    if (usuariosEliminar.rows.length > 0) {
      console.table(usuariosEliminar.rows);
    } else {
      console.log('   (No hay compradores ni vendedores)');
    }
    console.log('');

    // Paso 11: Eliminar solo compradores y vendedores (NO moderadores)
    console.log('🗑️  Paso 11/10: Eliminando compradores y vendedores...');
    const deleteResult = await client.query(
      "DELETE FROM usuarios WHERE tipo_usuario IN ('comprador', 'vendedor')"
    );
    console.log(`   ✅ ${deleteResult.rowCount} usuarios eliminados\n`);

    // Verificación final
    console.log('========================================');
    console.log('  📊 VERIFICACIÓN FINAL');
    console.log('========================================\n');

    // Contar usuarios
    const usuariosCount = await client.query(
      'SELECT tipo_usuario, COUNT(*) as total FROM usuarios GROUP BY tipo_usuario'
    );
    console.log('👥 Usuarios restantes:');
    console.table(usuariosCount.rows);

    // Contar otros registros
    const productosCount = await client.query('SELECT COUNT(*) as total FROM items');
    console.log(`📦 Productos restantes: ${productosCount.rows[0].total}`);

    const sesionesCount = await client.query('SELECT COUNT(*) as total FROM sesiones_usuario');
    console.log(`🔐 Sesiones restantes: ${sesionesCount.rows[0].total}`);

    const chatsCount = await client.query('SELECT COUNT(*) as total FROM chats');
    console.log(`💬 Chats restantes: ${chatsCount.rows[0].total}`);

    const mensajesCount = await client.query('SELECT COUNT(*) as total FROM mensajes_chat');
    console.log(`📨 Mensajes restantes: ${mensajesCount.rows[0].total}`);

    const reportesCount = await client.query('SELECT COUNT(*) as total FROM reportes');
    console.log(`📋 Reportes restantes: ${reportesCount.rows[0].total}`);

    const imagenesCount = await client.query('SELECT COUNT(*) as total FROM item_imagenes');
    console.log(`🖼️  Imágenes restantes: ${imagenesCount.rows[0].total}`);

    const valoracionesCount = await client.query('SELECT COUNT(*) as total FROM valoraciones');
    console.log(`⭐ Valoraciones restantes: ${valoracionesCount.rows[0].total}\n`);

    // Mostrar usuarios preservados
    console.log('========================================');
    console.log('  ✅ USUARIOS PRESERVADOS');
    console.log('========================================\n');
    
    const usuariosPreservados = await client.query(
      "SELECT id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado FROM usuarios WHERE tipo_usuario IN ('administrador', 'moderador') ORDER BY tipo_usuario, id"
    );
    console.table(usuariosPreservados.rows);

    console.log('\n========================================');
    console.log('  ✅ ¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
    console.log('========================================');
    console.log('  Usuarios preservados: Administradores y Moderadores');
    console.log('  Usuarios eliminados: Compradores y Vendedores');
    console.log('  Puedes crear nuevos usuarios desde el registro');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERROR durante la limpieza:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar limpieza
limpiarBaseDatos().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

