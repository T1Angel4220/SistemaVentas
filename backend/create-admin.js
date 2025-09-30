const bcrypt = require('bcrypt');
const { query } = require('./src/config/database');

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...');
    
    // Generar hash de la contraseña admin123
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Hash generado:', passwordHash);
    
    // Verificar si el admin ya existe
    const existingAdmin = await query(
      'SELECT id FROM usuarios WHERE correo = $1',
      ['admin@sistemaventas.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin ya existe, actualizando contraseña...');
      
      // Actualizar contraseña del admin existente
      await query(
        'UPDATE usuarios SET password_hash = $1 WHERE correo = $2',
        [passwordHash, 'admin@sistemaventas.com']
      );
      
      console.log('✅ Contraseña del admin actualizada');
    } else {
      console.log('➕ Creando nuevo admin...');
      
      // Crear nuevo admin
      await query(`
        INSERT INTO usuarios (
          cedula, nombre, apellido, correo, telefono, direccion, genero, 
          password_hash, tipo_usuario, estado, email_verificado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        '123456789',
        'Admin',
        'Sistema', 
        'admin@sistemaventas.com',
        '8888-8888',
        'San José, Costa Rica',
        'masculino',
        passwordHash,
        'administrador',
        'activo',
        true
      ]);
      
      console.log('✅ Admin creado exitosamente');
    }
    
    // Verificar que el admin se creó correctamente
    const admin = await query(
      'SELECT id, nombre, apellido, correo, tipo_usuario, estado FROM usuarios WHERE correo = $1',
      ['admin@sistemaventas.com']
    );
    
    if (admin.rows.length > 0) {
      console.log('📋 Admin creado:');
      console.log('   ID:', admin.rows[0].id);
      console.log('   Nombre:', admin.rows[0].nombre, admin.rows[0].apellido);
      console.log('   Email:', admin.rows[0].correo);
      console.log('   Tipo:', admin.rows[0].tipo_usuario);
      console.log('   Estado:', admin.rows[0].estado);
      console.log('   Contraseña: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
