"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = void 0;
const database_1 = require("../config/database");
/**
 * Pruebas de conexión a la base de datos
 */
const testDatabaseConnection = async () => {
    console.log('🧪 Iniciando pruebas de base de datos...\n');
    try {
        // Probar conexión
        console.log('1. Probando conexión a la base de datos...');
        const connected = await (0, database_1.testConnection)();
        if (!connected) {
            console.error('❌ No se pudo conectar a la base de datos');
            return false;
        }
        console.log('✅ Conexión exitosa\n');
        // Obtener estado de la base de datos
        console.log('2. Obteniendo estado de la base de datos...');
        const status = await (0, database_1.getDatabaseStatus)();
        if (status.status === 'error') {
            console.error('❌ Error obteniendo estado:', status.error);
            return false;
        }
        console.log('✅ Estado de la base de datos:');
        console.log(`   - Tablas: ${status.tables?.length || 0}`);
        console.log(`   - Usuarios: ${status.users || 0}`);
        console.log(`   - Sesiones: ${status.sessions || 0}`);
        console.log(`   - Items: ${status.items || 0}\n`);
        // Verificar tablas principales
        console.log('3. Verificando tablas principales...');
        const requiredTables = ['usuarios', 'sesiones_usuario', 'items', 'categorias', 'ubicaciones'];
        const existingTables = status.tables?.map((table) => table.tablename) || [];
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        if (missingTables.length > 0) {
            console.error('❌ Tablas faltantes:', missingTables.join(', '));
            return false;
        }
        console.log('✅ Todas las tablas principales existen\n');
        // Verificar datos de prueba
        console.log('4. Verificando datos de prueba...');
        if (status.users === 0) {
            console.warn('⚠️  No hay usuarios en la base de datos');
        }
        else {
            console.log(`✅ ${status.users} usuarios encontrados`);
        }
        if (status.items === 0) {
            console.warn('⚠️  No hay items en la base de datos');
        }
        else {
            console.log(`✅ ${status.items} items encontrados`);
        }
        console.log('\n🎉 Todas las pruebas de base de datos pasaron exitosamente');
        return true;
    }
    catch (error) {
        console.error('❌ Error en las pruebas de base de datos:', error);
        return false;
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    testDatabaseConnection()
        .then(success => {
        process.exit(success ? 0 : 1);
    })
        .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}
