"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./src/app.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./src/config/database");
const config_1 = require("./src/config/config");
const node_cron_1 = __importDefault(require("node-cron"));
const ProductsController = require('./src/controllers/productsController');
// Cargar variables de entorno
dotenv_1.default.config();
const PORT = process.env.PORT || 8080;
// Función para inicializar el servidor
const startServer = async () => {
    try {
        console.log('🚀 Iniciando Sistema de Ventas Multiempresa...\n');
        // Validar configuración
        console.log('🔍 Validando configuración...');
        if (!(0, config_1.validateConfig)()) {
            console.error('❌ Configuración inválida. Revisa las variables de entorno.');
            process.exit(1);
        }
        // Mostrar resumen de configuración
        console.log('📋 Configuración del sistema:');
        const configSummary = (0, config_1.getConfigSummary)();
        console.log(`   Puerto: ${configSummary.server.port}`);
        console.log(`   Entorno: ${configSummary.server.nodeEnv}`);
        console.log(`   Base de datos: ${configSummary.database.host}:${configSummary.database.port}/${configSummary.database.name}`);
        console.log(`   Usuario DB: ${configSummary.database.user}`);
        console.log(`   Email: ${configSummary.email.user}`);
        console.log('');
        // Probar conexión a la base de datos
        console.log('📊 Verificando conexión a la base de datos...');
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            console.error('💡 Asegúrate de que PostgreSQL esté ejecutándose y las credenciales sean correctas');
            process.exit(1);
        }
        // Inicializar base de datos
        console.log('🔧 Inicializando base de datos...');
        await (0, database_1.initializeDatabase)();
        // Configurar tarea programada para suspensión automática de productos
        // Se ejecuta todos los días a las 02:00 AM
        // Formato cron: 'minuto hora día mes día-semana'
        node_cron_1.default.schedule('0 2 * * *', async () => {
            console.log('\n⏰ Ejecutando tarea programada: Suspensión automática de productos expirados');
            try {
                await ProductsController.suspenderProductosExpirados();
            }
            catch (error) {
                console.error('❌ Error en tarea programada de suspensión automática:', error);
            }
        });
        console.log('✅ Tarea programada configurada: Suspensión automática de productos (diaria a las 02:00 AM)');
        // Iniciar servidor
        app_js_1.default.listen(PORT, () => {
            console.log('\n✅ Servidor iniciado exitosamente');
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📊 Entorno: ${config_1.config.server.nodeEnv}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
            console.log('\n🎯 Sistema listo para pruebas de software');
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};
// Manejar cierre graceful del servidor
process.on('SIGINT', () => {
    console.log('\n Cerrando servidor...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n Cerrando servidor...');
    process.exit(0);
});
// Iniciar el servidor
startServer();
