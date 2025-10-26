/**
 * Configuración global para Mocha
 * Este archivo se ejecuta antes de todas las pruebas
 */

const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Asegurar que estamos en modo de prueba
process.env.NODE_ENV = 'test';

// Configurar timeouts globales
process.env.MOCHA_TIMEOUT = '10000';

// Suprimir logs innecesarios durante las pruebas (opcional)
// console.log = () => {};
// console.info = () => {};

console.log('🧪 Configuración de pruebas cargada');
console.log(`📊 Modo: ${process.env.NODE_ENV}`);
console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
console.log(`⏱️  Timeout: ${process.env.MOCHA_TIMEOUT}ms\n`);

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  // No salir del proceso para permitir que Mocha maneje el error
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // No salir del proceso para permitir que Mocha maneje el error
});

