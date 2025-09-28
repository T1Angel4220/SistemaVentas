import app from './src/app';
import dotenv from 'dotenv';
import { testConnection, initializeDatabase } from './src/config/database';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

// Función para inicializar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando Sistema de Ventas Multiempresa...\n');
    
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
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
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
