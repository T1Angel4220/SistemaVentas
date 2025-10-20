/**
 * Configuración de Mocha para Pruebas de Integración
 * 
 * Framework de pruebas elegido por el grupo para:
 * - Pruebas de integración de APIs Express
 * - Validación de endpoints REST
 * - Soporte de pruebas asíncronas
 */

module.exports = {
  // Archivos de prueba de integración
  spec: 'src/__tests__/integration/**/*.test.js',
  
  // Timeout para pruebas que interactúan con BD real
  timeout: 10000,
  
  // Mostrar salida detallada
  reporter: 'spec',
  
  // Color en la salida
  color: true,
  
  // Archivos de setup se manejan dentro de los tests
  // require: [],
  
  // Modo recursivo para subdirectorios
  recursive: true,
  
  // Salir después de la primera falla (útil para desarrollo)
  // bail: true,
  
  // Limpiar require cache entre tests
  'watch-files': ['src/**/*.js'],
  
  // No usar archivos de configuración adicionales
  'no-config': false
};

