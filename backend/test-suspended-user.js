/**
 * Script para probar el aviso de cuenta suspendida
 * 
 * Este script:
 * 1. Busca un usuario de prueba
 * 2. Lo suspende temporalmente
 * 3. Muestra las credenciales para probar el login
 * 4. (Opcional) Lo reactiva después de la prueba
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testSuspendedUser() {
  try {
    console.log('\n🔍 SCRIPT DE PRUEBA - AVISO DE CUENTA SUSPENDIDA');
    console.log('='.repeat(60));

    // 1. Buscar un usuario de prueba (comprador o vendedor)
    console.log('\n1️⃣  Buscando usuario de prueba...');
    const userResult = await pool.query(`
      SELECT id, nombre, apellido, correo, tipo_usuario, estado
      FROM usuarios
      WHERE tipo_usuario IN ('comprador', 'vendedor')
      AND estado = 'activo'
      ORDER BY fecha_registro DESC
      LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ No hay usuarios de prueba disponibles.');
      console.log('💡 Registra un usuario primero desde el frontend.');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.nombre} ${user.apellido}`);
    console.log(`   - Correo: ${user.correo}`);
    console.log(`   - Tipo: ${user.tipo_usuario}`);
    console.log(`   - Estado actual: ${user.estado}`);

    // 2. Suspender el usuario
    console.log('\n2️⃣  Suspendiendo usuario...');
    await pool.query(`
      UPDATE usuarios
      SET estado = 'suspendido'
      WHERE id = $1
    `, [user.id]);

    console.log('✅ Usuario suspendido correctamente');

    // 3. Registrar acción de moderación
    console.log('\n3️⃣  Registrando acción de moderación...');
    const adminResult = await pool.query(`
      SELECT id FROM usuarios WHERE tipo_usuario = 'administrador' LIMIT 1
    `);

    if (adminResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO acciones_moderacion 
        (moderador_id, accion, tabla_afectada, registro_id, detalles)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        adminResult.rows[0].id,
        'suspender_usuario',
        'usuarios',
        user.id,
        'Usuario suspendido para prueba del aviso de login'
      ]);
      console.log('✅ Acción registrada en auditoría');
    }

    // 4. Mostrar instrucciones de prueba
    console.log('\n' + '='.repeat(60));
    console.log('🧪 PRUEBA DEL AVISO DE CUENTA SUSPENDIDA');
    console.log('='.repeat(60));
    console.log('\n📋 CREDENCIALES PARA PROBAR:');
    console.log(`   Correo: ${user.correo}`);
    console.log(`   Contraseña: [la que usaste al registrar]`);
    console.log('\n📝 PASOS PARA PROBAR:');
    console.log('   1. Ve a http://localhost:5173/login');
    console.log('   2. Ingresa las credenciales de arriba');
    console.log('   3. Haz clic en "Iniciar Sesión"');
    console.log('\n✨ DEBERÍAS VER:');
    console.log('   ✅ Aviso especial con título "🚫 Cuenta Suspendida"');
    console.log('   ✅ Mensaje detallado del motivo');
    console.log('   ✅ Panel de ayuda con 3 opciones');
    console.log('   ✅ Diseño en tonos rojos/naranjas');
    console.log('   ✅ Animaciones fluidas');

    // 5. Ofrecer opción para reactivar
    console.log('\n' + '='.repeat(60));
    console.log('🔄 PARA REACTIVAR EL USUARIO DESPUÉS DE PROBAR:');
    console.log('='.repeat(60));
    console.log(`   node backend/reactivate-user.js ${user.id}`);
    console.log('\n   O puedes usar la interfaz de Gestión de Usuarios');
    console.log('   como administrador o moderador.');

    console.log('\n✅ Script completado exitosamente');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
testSuspendedUser();

