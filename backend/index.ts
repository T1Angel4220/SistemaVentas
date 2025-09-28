import app from './src/app';
import dotenv from 'dotenv';
import { testConnection, initializeDatabase } from './src/config/database';
import { config, validateConfig, getConfigSummary } from './src/config/config';

// Cargar variables de entorno
dotenv.config();

const PORT = config.server.port;

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
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();
