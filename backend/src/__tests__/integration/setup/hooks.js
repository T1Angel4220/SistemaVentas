/**
 * Hooks Globales para Pruebas de Integración con Mocha
 * 
 * Se ejecutan antes/después de todas las suites de pruebas
 */

const { 
  testConnection, 
  cleanDatabase, 
  closePool 
} = require('./testDatabase');

/**
 * BEFORE ALL TESTS
 * Se ejecuta UNA VEZ antes de todas las pruebas
 */
before(async function() {
  // Aumentar timeout para operaciones de BD
  this.timeout(10000);
  
  console.log('\n🚀 Iniciando Suite de Pruebas de Integración\n');
  console.log('=' .repeat(60));
  
  // Verificar conexión a base de datos
  const connected = await testConnection();
  if (!connected) {
    throw new Error('No se pudo conectar a la base de datos de pruebas');
  }
  
  // Limpiar datos antes de empezar
  console.log('🧹 Limpiando datos de pruebas anteriores...');
  await cleanDatabase();
  
  console.log('✅ Entorno de pruebas preparado\n');
  console.log('=' .repeat(60) + '\n');
});

/**
 * AFTER ALL TESTS
 * Se ejecuta UNA VEZ después de todas las pruebas
 */
after(async function() {
  this.timeout(10000);
  
  console.log('\n' + '='.repeat(60));
  console.log('🧹 Limpiando datos de prueba...');
  
  // Limpiar datos después de todas las pruebas
  await cleanDatabase();
  
  // Cerrar conexiones a BD
  await closePool();
  
  console.log('✅ Suite de pruebas completada');
  console.log('='.repeat(60) + '\n');
});

/**
 * BEFORE EACH TEST
 * Se ejecuta antes de CADA prueba individual
 */
beforeEach(async function() {
  // Aquí puedes agregar lógica que necesites antes de cada test
  // Por ejemplo: iniciar una transacción
});

/**
 * AFTER EACH TEST
 * Se ejecuta después de CADA prueba individual
 */
afterEach(async function() {
  // Aquí puedes agregar lógica de limpieza después de cada test
  // Por ejemplo: hacer rollback de la transacción
});

