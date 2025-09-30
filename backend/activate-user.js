const { query } = require('./src/config/database');

async function activateUser() {
  try {
    console.log('🔧 Activando usuario manualmente...');
    
    // Buscar el último usuario registrado
    const result = await query(
      'SELECT id, nombre, apellido, correo, estado FROM usuarios ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    const user = result.rows[0];
    console.log('👤 Usuario encontrado:', user.nombre, user.apellido, `(${user.correo})`);
    console.log('📊 Estado actual:', user.estado);
    
    // Activar el usuario
    await query(
      'UPDATE usuarios SET email_verificado = true, estado = $1, token_verificacion = NULL WHERE id = $2',
      ['activo', user.id]
    );
    
    console.log('✅ Usuario activado exitosamente');
    console.log('🎯 Ahora puedes hacer login con:', user.correo);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

activateUser();
