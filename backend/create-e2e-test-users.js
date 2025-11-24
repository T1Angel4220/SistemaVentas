const bcrypt = require('bcrypt');
const { query } = require('./src/config/database');

/**
 * Script para crear usuarios de prueba específicos para tests E2E
 * Estos usuarios deben coincidir exactamente con las variables en frontend/.env
 */
async function createE2ETestUsers() {
  try {
    console.log('🔧 Creando usuarios de prueba para E2E...');
    
    // Contraseña para todos los usuarios de prueba E2E
    const password = 'password123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Hash generado:', passwordHash);
    
    // Definir usuarios de prueba E2E
    const usuariosE2E = [
      {
        cedula: '1000000001',
        nombre: 'Test',
        apellido: 'Comprador',
        correo: 'comprador@test.com',
        telefono: '0999000001',
        direccion: 'Dirección de Prueba',
        genero: 'masculino',
        tipo_usuario: 'comprador',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: '1000000002',
        nombre: 'Test',
        apellido: 'Vendedor',
        correo: 'vendedor@test.com',
        telefono: '0999000002',
        direccion: 'Dirección de Prueba',
        genero: 'masculino',
        tipo_usuario: 'vendedor',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: '1000000003',
        nombre: 'Test',
        apellido: 'Moderador',
        correo: 'moderador@test.com',
        telefono: '0999000003',
        direccion: 'Dirección de Prueba',
        genero: 'masculino',
        tipo_usuario: 'moderador',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: '1000000004',
        nombre: 'Test',
        apellido: 'Admin',
        correo: 'admin@test.com',
        telefono: '0999000004',
        direccion: 'Dirección de Prueba',
        genero: 'masculino',
        tipo_usuario: 'administrador',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: '1000000005',
        nombre: 'Test',
        apellido: 'Suspendido',
        correo: 'suspended@test.com',
        telefono: '0999000005',
        direccion: 'Dirección de Prueba',
        genero: 'masculino',
        tipo_usuario: 'comprador',
        estado: 'suspendido',
        email_verificado: true
      }
    ];
    
    console.log(`\n📝 Procesando ${usuariosE2E.length} usuarios de prueba E2E...\n`);
    
    for (const usuario of usuariosE2E) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await query(
          'SELECT id, correo FROM usuarios WHERE correo = $1',
          [usuario.correo]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`⚠️  Usuario ${usuario.correo} ya existe, actualizando...`);
          
          // Actualizar usuario existente
          await query(`
            UPDATE usuarios SET
              cedula = $1,
              nombre = $2,
              apellido = $3,
              telefono = $4,
              direccion = $5,
              genero = $6,
              password_hash = $7,
              tipo_usuario = $8,
              estado = $9,
              email_verificado = $10,
              token_verificacion = NULL,
              fecha_actualizacion = NOW()
            WHERE correo = $11
          `, [
            usuario.cedula,
            usuario.nombre,
            usuario.apellido,
            usuario.telefono,
            usuario.direccion,
            usuario.genero,
            passwordHash,
            usuario.tipo_usuario,
            usuario.estado,
            usuario.email_verificado,
            usuario.correo
          ]);
          
          console.log(`✅ Usuario ${usuario.correo} actualizado correctamente`);
        } else {
          console.log(`➕ Creando usuario ${usuario.correo}...`);
          
          // Crear nuevo usuario
          await query(`
            INSERT INTO usuarios (
              cedula, nombre, apellido, correo, telefono, direccion, genero,
              password_hash, tipo_usuario, estado, email_verificado, token_verificacion,
              fecha_registro, fecha_creacion, fecha_actualizacion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW())
          `, [
            usuario.cedula,
            usuario.nombre,
            usuario.apellido,
            usuario.correo,
            usuario.telefono,
            usuario.direccion,
            usuario.genero,
            passwordHash,
            usuario.tipo_usuario,
            usuario.estado,
            usuario.email_verificado,
            null // token_verificacion = null porque email ya está verificado
          ]);
          
          console.log(`✅ Usuario ${usuario.correo} creado correctamente`);
        }
      } catch (error) {
        console.error(`❌ Error procesando usuario ${usuario.correo}:`, error.message);
      }
    }
    
    console.log('\n✅ Proceso completado!\n');
    
    // Verificar usuarios creados
    console.log('📋 Verificando usuarios creados...\n');
    for (const usuario of usuariosE2E) {
      const result = await query(
        'SELECT id, nombre, apellido, correo, tipo_usuario, estado, email_verificado FROM usuarios WHERE correo = $1',
        [usuario.correo]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(`  ✓ ${user.correo} - ${user.tipo_usuario} - ${user.estado} - Email verificado: ${user.email_verificado}`);
      } else {
        console.log(`  ✗ ${usuario.correo} - NO ENCONTRADO`);
      }
    }
    
    console.log('\n🎉 Usuarios de prueba E2E listos!\n');
    console.log('📌 Credenciales para todos los usuarios:');
    console.log('   Email: [según el usuario]');
    console.log('   Contraseña: password123\n');
    
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba E2E:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createE2ETestUsers();
}

module.exports = { createE2ETestUsers };


