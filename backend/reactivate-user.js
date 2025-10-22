/**
 * Script para reactivar un usuario suspendido
 * 
 * Uso: node backend/reactivate-user.js <userId>
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

async function reactivateUser() {
  try {
    const userId = process.argv[2];

    if (!userId) {
      console.log('\n❌ Error: Debes proporcionar el ID del usuario');
      console.log('💡 Uso: node backend/reactivate-user.js <userId>');
      process.exit(1);
    }

    console.log('\n🔄 REACTIVANDO USUARIO...');
    console.log('='.repeat(60));

    // Verificar que el usuario existe
    const userResult = await pool.query(`
      SELECT id, nombre, apellido, correo, estado
      FROM usuarios
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      console.log(`❌ No se encontró usuario con ID: ${userId}`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('\n📋 Usuario encontrado:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.nombre} ${user.apellido}`);
    console.log(`   - Correo: ${user.correo}`);
    console.log(`   - Estado actual: ${user.estado}`);

    if (user.estado === 'activo') {
      console.log('\n✅ El usuario ya está activo. No hay nada que hacer.');
      process.exit(0);
    }

    // Reactivar el usuario
    await pool.query(`
      UPDATE usuarios
      SET estado = 'activo'
      WHERE id = $1
    `, [userId]);

    console.log('\n✅ Usuario reactivado correctamente');

    // Registrar acción de moderación
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
        'activar_usuario',
        'usuarios',
        userId,
        'Usuario reactivado después de prueba del aviso de login'
      ]);
      console.log('✅ Acción registrada en auditoría');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Usuario reactivado exitosamente');
    console.log(`   ${user.nombre} ${user.apellido} ahora puede iniciar sesión`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
reactivateUser();

