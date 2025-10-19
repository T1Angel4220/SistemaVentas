module.exports = {
  // Entorno de prueba
  testEnvironment: 'node',
  
  // Directorios donde buscar tests
  roots: ['<rootDir>/src'],
  
  // Patrón de archivos de test
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // Directorio de cobertura
  coverageDirectory: 'coverage',
  
  // Reporters de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Limpiar mocks automáticamente
  clearMocks: true,
  
  // Restablecer mocks antes de cada test
  resetMocks: true,
  
  // Restablecer módulos antes de cada test
  resetModules: true,
  
  // Verbose output
  verbose: true
};

