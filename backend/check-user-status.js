const { query, testConnection } = require('./src/config/database');

const checkUserStatus = async () => {
  const userEmail = 'sebastianalejandroob20@gmail.com'; // Email del usuario a verificar

  if (!(await testConnection())) {
    console.error('❌ No se pudo conectar a la base de datos.');
    process.exit(1);
  }

  try {
    console.log(`🔍 Verificando estado del usuario ${userEmail}...`);
    const result = await query(
      `SELECT id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado, 
              fecha_registro, fecha_ultimo_acceso, token_verificacion
       FROM usuarios WHERE correo = $1`,
      [userEmail]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Usuario encontrado:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Nombre: ${user.nombre} ${user.apellido}`);
      console.log(`  Email: ${user.correo}`);
      console.log(`  Tipo: ${user.tipo_usuario}`);
      console.log(`  Estado: ${user.estado}`);
      console.log(`  Email Verificado: ${user.email_verificado}`);
      console.log(`  Token Verificación: ${user.token_verificacion ? 'Presente' : 'NULL'}`);
      console.log(`  Fecha Registro: ${user.fecha_registro}`);
      console.log(`  Último Acceso: ${user.fecha_ultimo_acceso || 'Nunca'}`);
    } else {
      console.log(`⚠️ No se encontró el usuario ${userEmail}.`);
    }
  } catch (error) {
    console.error('❌ Error al verificar usuario:', error.message);
  } finally {
    process.exit(0);
  }
};

checkUserStatus();
