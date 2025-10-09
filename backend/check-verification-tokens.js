const { query, testConnection } = require('./src/config/database');

const checkVerificationTokens = async () => {
  if (!(await testConnection())) {
    console.error('❌ No se pudo conectar a la base de datos.');
    process.exit(1);
  }

  try {
    console.log('🔍 Verificando tokens de verificación activos...');
    
    // Buscar usuarios con tokens de verificación
    const result = await query(
      `SELECT id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado, token_verificacion
       FROM usuarios WHERE token_verificacion IS NOT NULL`
    );

    if (result.rows.length > 0) {
      console.log('✅ Usuarios con tokens de verificación activos:');
      result.rows.forEach(row => {
        console.log(`  ID: ${row.id}, Nombre: ${row.nombre} ${row.apellido}, Email: ${row.correo}`);
        console.log(`    Estado: ${row.estado}, Email Verificado: ${row.email_verificado}`);
        console.log(`    Token: ${row.token_verificacion}`);
        console.log('  ---');
      });
    } else {
      console.log('⚠️ No se encontraron usuarios con tokens de verificación activos.');
    }

    // También buscar usuarios pendientes de verificación
    console.log('\n🔍 Verificando usuarios pendientes de verificación...');
    const pendingResult = await query(
      `SELECT id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado, token_verificacion
       FROM usuarios WHERE estado = 'pendiente_verificacion' OR email_verificado = false`
    );

    if (pendingResult.rows.length > 0) {
      console.log('✅ Usuarios pendientes de verificación:');
      pendingResult.rows.forEach(row => {
        console.log(`  ID: ${row.id}, Nombre: ${row.nombre} ${row.apellido}, Email: ${row.correo}`);
        console.log(`    Estado: ${row.estado}, Email Verificado: ${row.email_verificado}`);
        console.log(`    Token: ${row.token_verificacion || 'NULL'}`);
        console.log('  ---');
      });
    } else {
      console.log('⚠️ No se encontraron usuarios pendientes de verificación.');
    }

  } catch (error) {
    console.error('❌ Error al verificar tokens:', error.message);
  } finally {
    process.exit(0);
  }
};

checkVerificationTokens();
