const { query } = require('./src/config/database');

async function debugTokens() {
  try {
    console.log('🔍 Verificando tokens en la base de datos...');
    
    // Buscar todos los usuarios con tokens de verificación
    const result = await query(
      'SELECT id, nombre, apellido, correo, token_verificacion, estado FROM usuarios WHERE token_verificacion IS NOT NULL'
    );
    
    console.log('📋 Usuarios con tokens de verificación:');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nombre} ${user.apellido} (${user.correo})`);
      console.log(`   Token: ${user.token_verificacion}`);
      console.log(`   Estado: ${user.estado}`);
      console.log('   ---');
    });
    
    if (result.rows.length === 0) {
      console.log('❌ No hay usuarios con tokens de verificación pendientes');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugTokens();
