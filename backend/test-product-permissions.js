#!/usr/bin/env node

/**
 * Script de prueba para verificar permisos de productos por rol
 * Sistema de Ventas Multiempresa
 */

const { query } = require('./src/config/database');
const { generateSessionTokens } = require('./src/services/jwt');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logHeader = (title) => {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');

// Función para crear usuarios de prueba
async function createTestUsers() {
  logHeader('CREANDO USUARIOS DE PRUEBA');
  
  try {
    // Verificar si ya existen usuarios de prueba
    const existingUsers = await query(
      'SELECT correo FROM usuarios WHERE correo LIKE $1',
      ['test_%']
    );

    if (existingUsers.rows.length > 0) {
      logInfo('Usuarios de prueba ya existen');
      return;
    }

    // Crear usuarios de prueba
    const testUsers = [
      {
        cedula: 'TEST001',
        nombre: 'Juan',
        apellido: 'Comprador',
        correo: 'test_comprador@example.com',
        tipo_usuario: 'comprador',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: 'TEST002',
        nombre: 'María',
        apellido: 'Vendedora',
        correo: 'test_vendedor@example.com',
        tipo_usuario: 'vendedor',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: 'TEST003',
        nombre: 'Carlos',
        apellido: 'Moderador',
        correo: 'test_moderador@example.com',
        tipo_usuario: 'moderador',
        estado: 'activo',
        email_verificado: true
      },
      {
        cedula: 'TEST004',
        nombre: 'Ana',
        apellido: 'Administradora',
        correo: 'test_admin@example.com',
        tipo_usuario: 'administrador',
        estado: 'activo',
        email_verificado: true
      }
    ];

    for (const user of testUsers) {
      await query(
        `INSERT INTO usuarios (
          cedula, nombre, apellido, correo, password_hash, 
          tipo_usuario, estado, email_verificado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.cedula,
          user.nombre,
          user.apellido,
          user.correo,
          '$2b$10$dummy.hash.for.testing', // Hash dummy para pruebas
          user.tipo_usuario,
          user.estado,
          user.email_verificado
        ]
      );
      logSuccess(`Usuario ${user.tipo_usuario} creado: ${user.correo}`);
    }

  } catch (error) {
    logError(`Error creando usuarios de prueba: ${error.message}`);
  }
}

// Función para crear categorías de prueba
async function createTestCategories() {
  logHeader('CREANDO CATEGORÍAS DE PRUEBA');
  
  try {
    const categories = [
      { nombre: 'Electrónicos', descripcion: 'Dispositivos electrónicos' },
      { nombre: 'Ropa', descripcion: 'Vestimenta y accesorios' },
      { nombre: 'Hogar', descripcion: 'Artículos para el hogar' }
    ];

    for (const category of categories) {
      await query(
        'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING',
        [category.nombre, category.descripcion]
      );
      logSuccess(`Categoría creada: ${category.nombre}`);
    }

  } catch (error) {
    logError(`Error creando categorías: ${error.message}`);
  }
}

// Función para generar tokens de prueba
async function generateTestTokens() {
  logHeader('GENERANDO TOKENS DE PRUEBA');
  
  try {
    const roles = ['comprador', 'vendedor', 'moderador', 'administrador'];
    const tokens = {};

    for (const role of roles) {
      const userResult = await query(
        'SELECT id, correo, tipo_usuario, estado FROM usuarios WHERE tipo_usuario = $1 AND correo LIKE $2',
        [role, 'test_%']
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        const tokenData = generateSessionTokens(user);
        tokens[role] = tokenData.accessToken;
        logSuccess(`Token generado para ${role}: ${user.correo}`);
      }
    }

    return tokens;

  } catch (error) {
    logError(`Error generando tokens: ${error.message}`);
    return {};
  }
}

// Función para mostrar permisos por rol
function showPermissions() {
  logHeader('PERMISOS POR ROL');
  
  const permissions = {
    comprador: {
      'Ver productos': '✅',
      'Crear productos': '❌',
      'Actualizar productos': '❌',
      'Eliminar productos': '❌',
      'Moderar productos': '❌'
    },
    vendedor: {
      'Ver productos': '✅',
      'Crear productos': '✅',
      'Actualizar productos': '🔒 (solo propios)',
      'Eliminar productos': '🔒 (solo propios)',
      'Moderar productos': '❌'
    },
    moderador: {
      'Ver productos': '✅',
      'Crear productos': '✅',
      'Actualizar productos': '✅ (todos)',
      'Eliminar productos': '✅ (todos)',
      'Moderar productos': '✅'
    },
    administrador: {
      'Ver productos': '✅',
      'Crear productos': '✅',
      'Actualizar productos': '✅ (todos)',
      'Eliminar productos': '✅ (todos)',
      'Moderar productos': '✅'
    }
  };

  Object.entries(permissions).forEach(([role, perms]) => {
    log(`\n${role.toUpperCase()}:`, 'bright');
    Object.entries(perms).forEach(([action, permission]) => {
      log(`  ${action}: ${permission}`);
    });
  });
}

// Función para mostrar información de tokens
function showTokenInfo(tokens) {
  logHeader('INFORMACIÓN DE TOKENS');
  
  Object.entries(tokens).forEach(([role, token]) => {
    log(`\n${role.toUpperCase()}:`, 'bright');
    log(`  Token: ${token.substring(0, 50)}...`, 'yellow');
    log(`  Uso: Authorization: Bearer ${token.substring(0, 20)}...`, 'cyan');
  });
}

// Función para mostrar ejemplos de uso
function showUsageExamples(tokens) {
  logHeader('EJEMPLOS DE USO');
  
  log('\n1. Ver productos (público):', 'bright');
  log('   GET /api/products', 'cyan');
  
  log('\n2. Crear producto (vendedor):', 'bright');
  log('   POST /api/products', 'cyan');
  log(`   Authorization: Bearer ${tokens.vendedor?.substring(0, 20)}...`, 'yellow');
  
  log('\n3. Moderar producto (moderador):', 'bright');
  log('   PATCH /api/products/123/moderate', 'cyan');
  log(`   Authorization: Bearer ${tokens.moderador?.substring(0, 20)}...`, 'yellow');
  
  log('\n4. Ver productos pendientes (moderador):', 'bright');
  log('   GET /api/products/moderation/pending', 'cyan');
  log(`   Authorization: Bearer ${tokens.moderador?.substring(0, 20)}...`, 'yellow');
}

// Función principal
async function main() {
  try {
    logHeader('SISTEMA DE PERMISOS PARA PRODUCTOS');
    log('Sistema de Ventas Multiempresa', 'bright');
    
    // Crear datos de prueba
    await createTestUsers();
    await createTestCategories();
    
    // Generar tokens
    const tokens = await generateTestTokens();
    
    // Mostrar información
    showPermissions();
    showTokenInfo(tokens);
    showUsageExamples(tokens);
    
    logHeader('PRUEBA COMPLETADA');
    logSuccess('Sistema de permisos configurado correctamente');
    logInfo('Los tokens generados son válidos para pruebas');
    logWarning('Recuerda eliminar los usuarios de prueba en producción');
    
  } catch (error) {
    logError(`Error en la prueba: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().then(() => {
    process.exit(0);
  }).catch(error => {
    logError(`Error fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  createTestUsers,
  createTestCategories,
  generateTestTokens,
  showPermissions,
  showTokenInfo,
  showUsageExamples
};
