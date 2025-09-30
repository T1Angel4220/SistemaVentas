const { query, testConnection } = require('./src/config/database');

const updateAdminData = async () => {
  const adminEmail = 'admin@sistemaventas.com';

  if (!(await testConnection())) {
    console.error('❌ No se pudo conectar a la base de datos.');
    process.exit(1);
  }

  try {
    console.log(`🔍 Verificando datos del administrador ${adminEmail}...`);
    
    // Verificar datos actuales
    const currentData = await query(
      `SELECT id, cedula, nombre, apellido, correo, telefono, direccion, genero, 
              tipo_usuario, estado, email_verificado, fecha_registro, fecha_ultimo_acceso
       FROM usuarios WHERE correo = $1`,
      [adminEmail]
    );

    if (currentData.rows.length === 0) {
      console.log(`⚠️ No se encontró el usuario ${adminEmail}.`);
      return;
    }

    const user = currentData.rows[0];
    console.log('📊 Datos actuales del administrador:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Nombre: ${user.nombre} ${user.apellido}`);
    console.log(`  Email: ${user.correo}`);
    console.log(`  Teléfono: ${user.telefono || 'NULL'}`);
    console.log(`  Dirección: ${user.direccion || 'NULL'}`);
    console.log(`  Género: ${user.genero || 'NULL'}`);
    console.log(`  Fecha Registro: ${user.fecha_registro || 'NULL'}`);

    // Actualizar datos faltantes
    console.log('\n🔧 Actualizando datos del administrador...');
    await query(
      `UPDATE usuarios SET 
        telefono = $1,
        direccion = $2,
        genero = $3
       WHERE correo = $4`,
      [
        '8888-8888', // Teléfono
        'San José, Costa Rica', // Dirección
        'masculino', // Género
        adminEmail
      ]
    );

    console.log('✅ Datos del administrador actualizados exitosamente.');
    
    // Verificar datos actualizados
    const updatedData = await query(
      `SELECT id, cedula, nombre, apellido, correo, telefono, direccion, genero, 
              tipo_usuario, estado, email_verificado, fecha_registro, fecha_ultimo_acceso
       FROM usuarios WHERE correo = $1`,
      [adminEmail]
    );

    const updatedUser = updatedData.rows[0];
    console.log('\n📊 Datos actualizados del administrador:');
    console.log(`  Teléfono: ${updatedUser.telefono}`);
    console.log(`  Dirección: ${updatedUser.direccion}`);
    console.log(`  Género: ${updatedUser.genero}`);

  } catch (error) {
    console.error('❌ Error al actualizar datos del administrador:', error.message);
  } finally {
    process.exit(0);
  }
};

updateAdminData();
