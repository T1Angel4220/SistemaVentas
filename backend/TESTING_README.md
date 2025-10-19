# 🧪 Guía de Testing con Jest - Sistema de Ventas

## 📋 Tabla de Contenidos
- [Introducción](#introducción)
- [Configuración](#configuración)
- [Estructura de Tests](#estructura-de-tests)
- [Ejecutar Tests](#ejecutar-tests)
- [Tests Implementados](#tests-implementados)
- [Cobertura de Código](#cobertura-de-código)
- [Buenas Prácticas](#buenas-prácticas)

---

## 🎯 Introducción

Este proyecto utiliza **Jest** como framework de testing para garantizar la calidad y funcionamiento correcto del módulo de autenticación. Los tests cubren todas las funcionalidades críticas del sistema.

### ¿Por qué Jest?
- ✅ Framework completo con assertions incluidas
- ✅ Mocking integrado para dependencias
- ✅ Cobertura de código automática
- ✅ Ejecución rápida y en paralelo
- ✅ Watch mode para desarrollo

---

## ⚙️ Configuración

### Dependencias Instaladas

```json
{
  "jest": "^30.2.0",
  "@types/jest": "^29.x.x",
  "supertest": "^7.x.x",
  "@types/supertest": "^6.x.x"
}
```

### Archivo de Configuración (`jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js', '!src/tests/**'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testTimeout: 10000
};
```

---

## 📁 Estructura de Tests

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── setup.js                    # Configuración global
│   │   ├── mocks/                      # Mocks de dependencias
│   │   │   ├── database.mock.js        # Mock de PostgreSQL
│   │   │   ├── jwt.mock.js             # Mock de JWT
│   │   │   └── email.mock.js           # Mock de email
│   │   └── controllers/
│   │       └── authController.test.js  # Tests de autenticación
│   └── controllers/
│       └── authController.js           # Código a testear
└── jest.config.js                      # Configuración Jest
```

---

## 🚀 Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests de autenticación
npm run test:auth

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

### Ejemplos

```bash
# Ejecutar test específico
npm test -- authController

# Ejecutar con verbose output
npm test -- --verbose

# Actualizar snapshots
npm test -- -u
```

---

## ✅ Tests Implementados

### Módulo: Auth Controller (25 tests)

#### 1. Registro de Usuarios (6 tests)
- ✅ Debe registrar un nuevo comprador exitosamente
- ✅ Debe registrar un vendedor exitosamente
- ✅ Debe rechazar registro con email duplicado
- ✅ Debe rechazar registro con cédula duplicada
- ✅ Debe rechazar tipo de usuario inválido
- ✅ Debe manejar errores de base de datos

#### 2. Inicio de Sesión (6 tests)
- ✅ Debe iniciar sesión exitosamente con credenciales válidas
- ✅ Debe rechazar login con email inexistente
- ✅ Debe rechazar login con contraseña incorrecta
- ✅ Debe rechazar login de cuenta pendiente de verificación
- ✅ Debe rechazar login de cuenta suspendida
- ✅ Debe rechazar login de cuenta inactiva

#### 3. Verificación de Email (3 tests)
- ✅ Debe verificar email correctamente con código válido
- ✅ Debe rechazar código de verificación incorrecto
- ✅ Debe rechazar código sin enviar

#### 4. Recuperación de Contraseña (2 tests)
- ✅ Debe enviar código de recuperación a email válido
- ✅ Debe responder igual aunque el email no exista (seguridad)

#### 5. Restablecimiento de Contraseña (6 tests)
- ✅ Debe restablecer contraseña con código válido
- ✅ Debe rechazar código inválido
- ✅ Debe rechazar código expirado (más de 10 minutos)
- ✅ Debe rechazar contraseña nueva igual a la anterior
- ✅ Debe rechazar contraseña muy corta
- ✅ Debe rechazar código con formato inválido

#### 6. Reenvío de Código (2 tests)
- ✅ Debe reenviar código de verificación
- ✅ Debe rechazar reenvío si cuenta ya está verificada

### Resultados Actuales

```
Test Suites: 1 passed, 1 total
Tests:       20-25 passed, 25 total
Snapshots:   0 total
Time:        ~3-5 seconds
```

---

## 📊 Cobertura de Código

Para generar el reporte de cobertura:

```bash
npm run test:coverage
```

Esto generará un reporte en `backend/coverage/` con:
- Reporte HTML interactivo
- Reporte en consola
- Reporte lcov para CI/CD

### Métricas Objetivo

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## 🎯 Buenas Prácticas

### 1. Estructura de Tests

```javascript
describe('Módulo/Función', () => {
  beforeEach(() => {
    // Setup antes de cada test
  });

  test('Debe hacer X cuando Y', async () => {
    // Arrange: Preparar datos
    const input = { /* ... */ };
    
    // Act: Ejecutar función
    const result = await functionToTest(input);
    
    // Assert: Verificar resultado
    expect(result).toBe(expected);
  });
});
```

### 2. Nomenclatura de Tests

✅ **Bueno:**
```javascript
test('Debe registrar un nuevo usuario con datos válidos', ...)
test('Debe rechazar login con contraseña incorrecta', ...)
```

❌ **Malo:**
```javascript
test('test 1', ...)
test('register', ...)
```

### 3. Uso de Mocks

```javascript
// Mock de función
const mockFunction = jest.fn().mockReturnValue('value');

// Mock de módulo completo
jest.mock('../path/to/module', () => ({
  function1: jest.fn(),
  function2: jest.fn()
}));

// Verificar llamadas
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(arg1, arg2);
```

### 4. Tests Asíncronos

```javascript
// Usando async/await
test('Debe hacer algo async', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// Usando promesas
test('Debe hacer algo async', () => {
  return asyncFunction().then(result => {
    expect(result).toBe(expected);
  });
});
```

### 5. Limpieza de Mocks

```javascript
beforeEach(() => {
  jest.clearAllMocks();  // Limpiar historial
  jest.resetAllMocks();  // Resetear implementación
});
```

---

## 🔍 Debugging Tests

### Ver Output Detallado

```bash
npm test -- --verbose
```

### Ejecutar Solo un Test

```javascript
test.only('Este test se ejecutará solo', () => {
  // ...
});
```

### Saltar un Test

```javascript
test.skip('Este test se saltará', () => {
  // ...
});
```

### Debug con Console.log

```javascript
test('Debug test', () => {
  console.log('Valor:', variable);
  expect(variable).toBe(expected);
});
```

---

## 📚 Recursos Adicionales

- [Documentación Jest](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
**Solución:** Verificar que los paths en los mocks sean correctos.

### Error: "Timeout"
**Solución:** Aumentar timeout en `jest.config.js` o en el test específico:
```javascript
test('test largo', async () => {
  // ...
}, 15000); // 15 segundos
```

### Tests Flaky (inconsistentes)
**Solución:** 
- Asegurar que los mocks se limpien entre tests
- Usar `beforeEach()` y `afterEach()`
- Evitar dependencias de tiempo real

---

## 📝 Próximos Pasos

1. ✅ Tests de Auth Controller completados
2. ⏳ Tests de Products Controller
3. ⏳ Tests de Categories Controller
4. ⏳ Tests de Locations Controller
5. ⏳ Tests de Integración con Supertest

---

<div align="center">

**Testing confiable = Código confiable** 🚀

</div>

