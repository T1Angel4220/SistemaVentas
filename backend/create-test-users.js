const bcrypt = require('bcryptjs');
const { query } = require('./src/config/database');
const path = require('path');

// Asegurar que el .env esté cargado
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function createTestUsers() {
  try {
    console.log('🔧 Creando usuarios de prueba...');
    
    // Contraseña para todos los usuarios de prueba
    const password = 'S1805787841';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Hash generado para todos los usuarios');
    
    // Definir todos los usuarios de prueba
    const usuarios = [
      // Administrador
      {
        cedula: '123456789',
        nombre: 'Admin',
        apellido: 'Sistema',
        correo: 'admin@sistemaventas.com',
        telefono: '8888-8888',
        direccion: 'San José, Costa Rica',
        genero: 'masculino',
        tipo_usuario: 'administrador'
      },
      // Moderadores
      {
        cedula: '234567890',
        nombre: 'María',
        apellido: 'González',
        correo: 'maria.moderador@sistemaventas.com',
        telefono: '8888-8889',
        direccion: 'Escazú, Costa Rica',
        genero: 'femenino',
        tipo_usuario: 'moderador'
      },
      {
        cedula: '345678901',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        correo: 'carlos.moderador@sistemaventas.com',
        telefono: '8888-8890',
        direccion: 'Cartago, Costa Rica',
        genero: 'masculino',
        tipo_usuario: 'moderador'
      },
      // Vendedores
      {
        cedula: '456789012',
        nombre: 'Ana',
        apellido: 'Martínez',
        correo: 'ana.vendedor@sistemaventas.com',
        telefono: '8888-8891',
        direccion: 'Santa Ana, Costa Rica',
        genero: 'femenino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '567890123',
        nombre: 'Luis',
        apellido: 'Hernández',
        correo: 'luis.vendedor@sistemaventas.com',
        telefono: '8888-8892',
        direccion: 'Alajuela, Costa Rica',
        genero: 'masculino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '678901234',
        nombre: 'Carmen',
        apellido: 'López',
        correo: 'carmen.vendedor@sistemaventas.com',
        telefono: '8888-8893',
        direccion: 'Heredia, Costa Rica',
        genero: 'femenino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '789012345',
        nombre: 'Roberto',
        apellido: 'Sánchez',
        correo: 'roberto.vendedor@sistemaventas.com',
        telefono: '8888-8894',
        direccion: 'Puntarenas, Costa Rica',
        genero: 'masculino',
        tipo_usuario: 'vendedor'
      },
      // Compradores
      {
        cedula: '890123456',
        nombre: 'Sofia',
        apellido: 'Ramírez',
        correo: 'sofia.comprador@sistemaventas.com',
        telefono: '8888-8895',
        direccion: 'San José, Costa Rica',
        genero: 'femenino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '901234567',
        nombre: 'Diego',
        apellido: 'Castro',
        correo: 'diego.comprador@sistemaventas.com',
        telefono: '8888-8896',
        direccion: 'Cartago, Costa Rica',
        genero: 'masculino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '012345678',
        nombre: 'Valeria',
        apellido: 'Morales',
        correo: 'valeria.comprador@sistemaventas.com',
        telefono: '8888-8897',
        direccion: 'Alajuela, Costa Rica',
        genero: 'femenino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '123450987',
        nombre: 'Andrés',
        apellido: 'Vargas',
        correo: 'andres.comprador@sistemaventas.com',
        telefono: '8888-8898',
        direccion: 'Heredia, Costa Rica',
        genero: 'masculino',
        tipo_usuario: 'comprador'
      }
    ];
    
    let creados = 0;
    let actualizados = 0;
    let errores = 0;
    
    for (const usuario of usuarios) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await query(
          'SELECT id FROM usuarios WHERE correo = $1 OR cedula = $2',
          [usuario.correo, usuario.cedula]
        );
        
        if (existingUser.rows.length > 0) {
          // Actualizar contraseña del usuario existente
          await query(
            'UPDATE usuarios SET password_hash = $1, nombre = $2, apellido = $3, telefono = $4, direccion = $5, genero = $6, tipo_usuario = $7, estado = $8, email_verificado = $9 WHERE correo = $10',
            [
              passwordHash,
              usuario.nombre,
              usuario.apellido,
              usuario.telefono,
              usuario.direccion,
              usuario.genero,
              usuario.tipo_usuario,
              'activo',
              true,
              usuario.correo
            ]
          );
          actualizados++;
          console.log(`✓ Actualizado: ${usuario.correo} (${usuario.tipo_usuario})`);
        } else {
          // Crear nuevo usuario
          await query(`
            INSERT INTO usuarios (
              cedula, nombre, apellido, correo, telefono, direccion, genero, 
              password_hash, tipo_usuario, estado, email_verificado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            'activo',
            true
          ]);
          creados++;
          console.log(`✓ Creado: ${usuario.correo} (${usuario.tipo_usuario})`);
        }
      } catch (error) {
        errores++;
        console.error(`✗ Error con ${usuario.correo}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumen:');
    console.log(`   ✅ Usuarios creados: ${creados}`);
    console.log(`   🔄 Usuarios actualizados: ${actualizados}`);
    if (errores > 0) {
      console.log(`   ❌ Errores: ${errores}`);
    }
    
    console.log('\n🔑 Credenciales para todos los usuarios:');
    console.log('   Contraseña: password123');
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('\n🎉 Todos los usuarios de prueba están listos');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error no manejado:', error.message);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createTestUsers };
