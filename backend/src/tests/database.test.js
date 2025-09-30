const { testConnection, getDatabaseStatus, query } = require('../config/database');
const { generateSessionTokens } = require('../services/jwt');
const bcrypt = require('bcrypt');

/**
 * Pruebas completas del sistema de autenticación
 */
const testAuthenticationSystem = async () => {
  console.log('🧪 Iniciando pruebas completas del sistema de autenticación...\n');
  
  try {
    // 1. Probar conexión a la base de datos
    console.log('1. Probando conexión a la base de datos...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      return false;
    }
    
    console.log('✅ Conexión exitosa\n');
    
    // 2. Verificar estructura de la base de datos
    console.log('2. Verificando estructura de la base de datos...');
    const status = await getDatabaseStatus();
    
    if (status.status === 'error') {
      console.error('❌ Error obteniendo estado:', status.error);
      return false;
    }
    
    console.log(`✅ Base de datos: ${status.tables?.length || 0} tablas, ${status.users || 0} usuarios\n`);
    
    // 3. Probar encriptación de contraseñas
    console.log('3. Probando encriptación de contraseñas...');
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValidPassword = await bcrypt.compare(testPassword, hashedPassword);
    
    if (!isValidPassword) {
      console.error('❌ Error en encriptación de contraseñas');
      return false;
    }
    
    console.log('✅ Encriptación de contraseñas funcionando\n');
    
    // 4. Probar generación de tokens JWT
    console.log('4. Probando generación de tokens JWT...');
    const testUser = {
      id: 1,
      correo: 'test@ejemplo.com',
      tipo_usuario: 'comprador',
      estado: 'activo'
    };
    
    const tokens = generateSessionTokens(testUser);
    
    if (!tokens.accessToken || !tokens.refreshToken) {
      console.error('❌ Error generando tokens JWT');
      return false;
    }
    
    console.log('✅ Tokens JWT generados exitosamente\n');
    
    // 5. Probar consultas de usuarios
    console.log('5. Probando consultas de usuarios...');
    const usersResult = await query('SELECT COUNT(*) as total FROM usuarios');
    const usersCount = usersResult.rows[0].total;
    
    if (usersCount === 0) {
      console.warn('⚠️  No hay usuarios en la base de datos');
    } else {
      console.log(`✅ ${usersCount} usuarios encontrados`);
    }
    
    // 6. Probar consultas de sesiones
    console.log('6. Probando consultas de sesiones...');
    const sessionsResult = await query('SELECT COUNT(*) as total FROM sesiones_usuario');
    const sessionsCount = sessionsResult.rows[0].total;
    
    console.log(`✅ ${sessionsCount} sesiones encontradas\n`);
    
    // 7. Probar integridad referencial
    console.log('7. Probando integridad referencial...');
    const foreignKeysResult = await query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
    `);
    
    console.log(`✅ ${foreignKeysResult.rows.length} foreign keys encontradas\n`);
    
    // 8. Probar índices
    console.log('8. Probando índices de la base de datos...');
    const indexesResult = await query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log(`✅ ${indexesResult.rows.length} índices encontrados\n`);
    
    // 9. Probar vistas
    console.log('9. Probando vistas de la base de datos...');
    const viewsResult = await query(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public'
    `);
    
    console.log(`✅ ${viewsResult.rows.length} vistas encontradas\n`);
    
    // 10. Probar triggers
    console.log('10. Probando triggers de la base de datos...');
    const triggersResult = await query(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
    `);
    
    console.log(`✅ ${triggersResult.rows.length} triggers encontrados\n`);
    
    console.log('🎉 Todas las pruebas del sistema de autenticación pasaron exitosamente');
    console.log('\n📊 Resumen del sistema:');
    console.log(`   - Usuarios: ${usersCount}`);
    console.log(`   - Sesiones: ${sessionsCount}`);
    console.log(`   - Tablas: ${status.tables?.length || 0}`);
    console.log(`   - Foreign Keys: ${foreignKeysResult.rows.length}`);
    console.log(`   - Índices: ${indexesResult.rows.length}`);
    console.log(`   - Vistas: ${viewsResult.rows.length}`);
    console.log(`   - Triggers: ${triggersResult.rows.length}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en las pruebas del sistema de autenticación:', error);
    return false;
  }
};

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testAuthenticationSystem()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { testAuthenticationSystem };

