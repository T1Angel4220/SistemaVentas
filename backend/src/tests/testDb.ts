import { testConnection, getDatabaseStatus, initializeDatabase } from '../config/database';

// Función para ejecutar pruebas de base de datos
const runDatabaseTests = async () => {
  console.log('🧪 INICIANDO PRUEBAS DE BASE DE DATOS');
  console.log('=====================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Conexión a la base de datos
  console.log('Test 1: Conexión a la base de datos');
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('✅ PASS: Conexión exitosa\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL: No se pudo conectar\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error en conexión:', error.message, '\n');
    testsFailed++;
  }

  // Test 2: Estado de la base de datos
  console.log('Test 2: Estado general de la base de datos');
  try {
    const status = await getDatabaseStatus();
    
    if (status.status === 'connected') {
      console.log('✅ PASS: Estado de la base de datos es correcto');
      console.log('   Timestamp:', status.timestamp);
      status.tables.forEach(table => {
        console.log(`   ${table.tabla}: ${table.total} registros`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Estado de la base de datos es incorrecto');
      console.log('   Error:', status.error, '\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar estado:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Inicialización de la base de datos
  console.log('Test 3: Inicialización de la base de datos');
  try {
    const initialized = await initializeDatabase();
    
    if (initialized) {
      console.log('✅ PASS: Base de datos inicializada correctamente\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Error en la inicialización\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error en inicialización:', error.message, '\n');
    testsFailed++;
  }

  // Resumen final
  console.log('=====================================');
  console.log('RESUMEN DE PRUEBAS');
  console.log('=====================================');
  console.log(`✅ Pruebas exitosas: ${testsPassed}`);
  console.log(`❌ Pruebas fallidas: ${testsFailed}`);
  console.log(`📊 Total de pruebas: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    console.log('La base de datos está lista para usar en pruebas de software');
  } else {
    console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
    console.log('Revisa la configuración de la base de datos');
  }

  return {
    passed: testsPassed,
    failed: testsFailed,
    total: testsPassed + testsFailed,
    success: testsFailed === 0
  };
};

// Ejecutar pruebas
runDatabaseTests()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error fatal en las pruebas:', error);
    process.exit(1);
  });
