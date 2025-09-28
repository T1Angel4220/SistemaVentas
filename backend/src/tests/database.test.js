const { testConnection, getDatabaseStatus, query } = require('../config/database');

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

  // Test 2: Verificar tablas principales
  console.log('Test 2: Verificar tablas principales');
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'items', 'categorias', 'reportes', 'chats', 'valoraciones')
      ORDER BY table_name
    `);
    
    const expectedTables = ['categorias', 'chats', 'items', 'reportes', 'usuarios', 'valoraciones'];
    const actualTables = result.rows.map(row => row.table_name).sort();
    
    if (JSON.stringify(expectedTables) === JSON.stringify(actualTables)) {
      console.log('✅ PASS: Todas las tablas principales existen');
      console.log('   Tablas encontradas:', actualTables.join(', '), '\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan tablas principales');
      console.log('   Esperadas:', expectedTables.join(', '));
      console.log('   Encontradas:', actualTables.join(', '), '\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar tablas:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Verificar datos iniciales
  console.log('Test 3: Verificar datos iniciales');
  try {
    const result = await query(`
      SELECT 
        'usuarios' as tabla, COUNT(*) as total FROM usuarios
      UNION ALL
      SELECT 'categorias', COUNT(*) FROM categorias
      UNION ALL
      SELECT 'ubicaciones', COUNT(*) FROM ubicaciones
      UNION ALL
      SELECT 'items', COUNT(*) FROM items
      ORDER BY tabla
    `);
    
    const hasData = result.rows.every(row => parseInt(row.total) > 0);
    
    if (hasData) {
      console.log('✅ PASS: Datos iniciales cargados correctamente');
      result.rows.forEach(row => {
        console.log(`   ${row.tabla}: ${row.total} registros`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan datos iniciales');
      result.rows.forEach(row => {
        console.log(`   ${row.tabla}: ${row.total} registros`);
      });
      console.log('');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar datos:', error.message, '\n');
    testsFailed++;
  }

  // Test 4: Verificar usuarios de prueba
  console.log('Test 4: Verificar usuarios de prueba');
  try {
    const result = await query(`
      SELECT tipo_usuario, COUNT(*) as total
      FROM usuarios 
      WHERE email_verificado = true
      GROUP BY tipo_usuario
      ORDER BY tipo_usuario
    `);
    
    const expectedRoles = ['administrador', 'comprador', 'moderador', 'vendedor'];
    const actualRoles = result.rows.map(row => row.tipo_usuario);
    
    if (expectedRoles.every(role => actualRoles.includes(role))) {
      console.log('✅ PASS: Todos los tipos de usuario están presentes');
      result.rows.forEach(row => {
        console.log(`   ${row.tipo_usuario}: ${row.total} usuarios`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan tipos de usuario');
      console.log('   Esperados:', expectedRoles.join(', '));
      console.log('   Encontrados:', actualRoles.join(', '), '\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar usuarios:', error.message, '\n');
    testsFailed++;
  }

  // Test 5: Verificar productos y servicios
  console.log('Test 5: Verificar productos y servicios');
  try {
    const result = await query(`
      SELECT tipo, COUNT(*) as total
      FROM items 
      WHERE estado = 'activo'
      GROUP BY tipo
      ORDER BY tipo
    `);
    
    const hasProducts = result.rows.some(row => row.tipo === 'producto' && parseInt(row.total) > 0);
    const hasServices = result.rows.some(row => row.tipo === 'servicio' && parseInt(row.total) > 0);
    
    if (hasProducts && hasServices) {
      console.log('✅ PASS: Productos y servicios están presentes');
      result.rows.forEach(row => {
        console.log(`   ${row.tipo}: ${row.total} items`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan productos o servicios');
      result.rows.forEach(row => {
        console.log(`   ${row.tipo}: ${row.total} items`);
      });
      console.log('');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar items:', error.message, '\n');
    testsFailed++;
  }

  // Test 6: Verificar integridad referencial
  console.log('Test 6: Verificar integridad referencial');
  try {
    const result = await query(`
      SELECT 
        'items con categoria invalida' as problema, COUNT(*) as total
      FROM items i 
      LEFT JOIN categorias c ON i.categoria_id = c.id 
      WHERE c.id IS NULL
      UNION ALL
      SELECT 
        'items con vendedor invalido', COUNT(*)
      FROM items i 
      LEFT JOIN usuarios u ON i.vendedor_id = u.id 
      WHERE u.id IS NULL
      UNION ALL
      SELECT 
        'reportes con item invalido', COUNT(*)
      FROM reportes r 
      LEFT JOIN items i ON r.item_id = i.id 
      WHERE i.id IS NULL
    `);
    
    const hasReferentialIssues = result.rows.some(row => parseInt(row.total) > 0);
    
    if (!hasReferentialIssues) {
      console.log('✅ PASS: Integridad referencial correcta\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Problemas de integridad referencial');
      result.rows.forEach(row => {
        if (parseInt(row.total) > 0) {
          console.log(`   ${row.problema}: ${row.total} registros`);
        }
      });
      console.log('');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar integridad:', error.message, '\n');
    testsFailed++;
  }

  // Test 7: Verificar índices
  console.log('Test 7: Verificar índices importantes');
  try {
    const result = await query(`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname IN ('idx_usuarios_correo', 'idx_items_vendedor', 'idx_items_estado', 'idx_reportes_estado')
      ORDER BY tablename, indexname
    `);
    
    const expectedIndexes = ['idx_reportes_estado', 'idx_items_estado', 'idx_items_vendedor', 'idx_usuarios_correo'];
    const actualIndexes = result.rows.map(row => row.indexname).sort();
    
    if (expectedIndexes.every(index => actualIndexes.includes(index))) {
      console.log('✅ PASS: Índices importantes están presentes');
      result.rows.forEach(row => {
        console.log(`   ${row.indexname} en ${row.tablename}`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan índices importantes');
      console.log('   Esperados:', expectedIndexes.join(', '));
      console.log('   Encontrados:', actualIndexes.join(', '), '\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar índices:', error.message, '\n');
    testsFailed++;
  }

  // Test 8: Verificar vistas
  console.log('Test 8: Verificar vistas útiles');
  try {
    const result = await query(`
      SELECT viewname
      FROM pg_views 
      WHERE schemaname = 'public' 
      AND viewname IN ('vista_productos_activos', 'vista_reportes_pendientes', 'vista_estadisticas_usuarios')
      ORDER BY viewname
    `);
    
    const expectedViews = ['vista_estadisticas_usuarios', 'vista_productos_activos', 'vista_reportes_pendientes'];
    const actualViews = result.rows.map(row => row.viewname).sort();
    
    if (expectedViews.every(view => actualViews.includes(view))) {
      console.log('✅ PASS: Vistas útiles están presentes');
      result.rows.forEach(row => {
        console.log(`   ${row.viewname}`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan vistas útiles');
      console.log('   Esperadas:', expectedViews.join(', '));
      console.log('   Encontradas:', actualViews.join(', '), '\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar vistas:', error.message, '\n');
    testsFailed++;
  }

  // Test 9: Verificar triggers
  console.log('Test 9: Verificar triggers');
  try {
    const result = await query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      AND trigger_name IN ('trigger_usuarios_actualizacion', 'trigger_items_actualizacion')
      ORDER BY event_object_table, trigger_name
    `);
    
    const expectedTriggers = ['trigger_items_actualizacion', 'trigger_usuarios_actualizacion'];
    const actualTriggers = result.rows.map(row => row.trigger_name).sort();
    
    if (expectedTriggers.every(trigger => actualTriggers.includes(trigger))) {
      console.log('✅ PASS: Triggers están presentes');
      result.rows.forEach(row => {
        console.log(`   ${row.trigger_name} en ${row.event_object_table}`);
      });
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Faltan triggers');
      console.log('   Esperados:', expectedTriggers.join(', '));
      console.log('   Encontrados:', actualTriggers.join(', '), '\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar triggers:', error.message, '\n');
    testsFailed++;
  }

  // Test 10: Verificar estado general de la base de datos
  console.log('Test 10: Estado general de la base de datos');
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

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  runDatabaseTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error fatal en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = { runDatabaseTests };
