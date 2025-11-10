import app from './src/app.js';
import dotenv from 'dotenv';
import { testConnection, initializeDatabase } from './src/config/database';
import { config, validateConfig, getConfigSummary } from './src/config/config';
import cron from 'node-cron';
const ProductsController = require('./src/controllers/productsController');

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 8080;

// Función para inicializar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando Sistema de Ventas Multiempresa...\n');
    
    // Validar configuración
    console.log('🔍 Validando configuración...');
    if (!validateConfig()) {
      console.error('❌ Configuración inválida. Revisa las variables de entorno.');
      process.exit(1);
    }
    
    // Mostrar resumen de configuración
    console.log('📋 Configuración del sistema:');
    const configSummary = getConfigSummary();
    console.log(`   Puerto: ${configSummary.server.port}`);
    console.log(`   Entorno: ${configSummary.server.nodeEnv}`);
    console.log(`   Base de datos: ${configSummary.database.host}:${configSummary.database.port}/${configSummary.database.name}`);
    console.log(`   Usuario DB: ${configSummary.database.user}`);
    console.log(`   Email: ${configSummary.email.user}`);
    console.log('');
    
    // Probar conexión a la base de datos
    console.log('📊 Verificando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.error('💡 Asegúrate de que PostgreSQL esté ejecutándose y las credenciales sean correctas');
      process.exit(1);
    }
    
    // Inicializar base de datos
    console.log('🔧 Inicializando base de datos...');
    await initializeDatabase();
    
    // Configurar tarea programada para suspensión automática de productos
    // Se ejecuta todos los días a las 02:00 AM
    // Formato cron: 'minuto hora día mes día-semana'
    cron.schedule('0 2 * * *', async () => {
      console.log('\n⏰ Ejecutando tarea programada: Suspensión automática de productos expirados');
      try {
        await ProductsController.suspenderProductosExpirados();
      } catch (error) {
        console.error('❌ Error en tarea programada de suspensión automática:', error);
      }
    });
    
    console.log('✅ Tarea programada configurada: Suspensión automática de productos (diaria a las 02:00 AM)');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n✅ Servidor iniciado exitosamente');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${config.server.nodeEnv}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      console.log('\n🎯 Sistema listo para pruebas de software');
    });
    
  } catch (error) {
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
