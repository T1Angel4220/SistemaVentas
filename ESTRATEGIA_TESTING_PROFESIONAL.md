# 🧪 Estrategia Profesional de Testing - Sistema de Ventas

## 📊 Análisis Crítico del Estado Actual

### ❌ **Problemas Identificados**

1. **Ausencia Total de Framework de Testing**
   - No hay frameworks de testing instalados (Jest, Vitest, Mocha, etc.)
   - Solo existen scripts manuales de prueba (`testDb.ts`, `testMail.ts`)
   - No hay estructura de tests automatizados

2. **Cobertura de Testing: 0%**
   - Backend: Solo scripts de verificación básica
   - Frontend: Sin tests unitarios, de integración ni E2E
   - No hay tests de regresión

3. **Arquitectura Mixta (JavaScript/TypeScript)**
   - Backend: JavaScript (CommonJS) con algunos archivos TypeScript
   - Frontend: TypeScript completo
   - Dificulta la configuración unificada de testing

4. **Falta de Testing de Integración**
   - No hay tests que validen la comunicación Frontend-Backend
   - No hay tests de API endpoints
   - No hay validación de flujos completos

5. **Sin Testing de UI**
   - No hay tests de componentes React
   - No hay tests de interacción de usuario
   - No hay validación de accesibilidad

---

## 🎯 Recomendación: Estrategia de Testing por Capas

### **Pirámide de Testing Recomendada**

```
                    /\
                   /  \
                  / E2E \          ← 10% (Flujos críticos)
                 /______\
                /        \
               /Integración\      ← 30% (APIs, módulos)
              /____________\
             /              \
            /   Unitarios    \    ← 60% (Funciones, componentes)
           /__________________\
```

---

## 🔧 Stack de Testing Recomendado

### **Backend (Node.js/Express)**

#### 1. **Framework Principal: Jest** ⭐ RECOMENDADO
```bash
npm install --save-dev jest @types/jest ts-jest supertest
```

**Ventajas:**
- ✅ Maduro y estable
- ✅ Excelente soporte para TypeScript
- ✅ Mocking integrado
- ✅ Cobertura de código incluida
- ✅ Compatible con CommonJS y ES Modules

#### 2. **Alternativa: Vitest** (Más moderno)
```bash
npm install --save-dev vitest @vitest/ui
```

**Ventajas:**
- ✅ Más rápido que Jest
- ✅ Compatible con Vite (ya lo usas en frontend)
- ✅ Mejor experiencia de desarrollo

#### 3. **Para Testing de APIs: Supertest**
```bash
npm install --save-dev supertest @types/supertest
```

**Uso:**
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/login', () => {
  it('debe autenticar usuario válido', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'test@test.com', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### **Frontend (React/TypeScript)**

#### 1. **Framework Principal: Vitest + React Testing Library** ⭐ RECOMENDADO
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Ventajas:**
- ✅ Ya usas Vite, integración perfecta
- ✅ React Testing Library es el estándar de la industria
- ✅ Enfoque en testing de comportamiento, no implementación

#### 2. **Para E2E: Playwright** ⭐ RECOMENDADO
```bash
npm install --save-dev @playwright/test
```

**Ventajas sobre Cypress:**
- ✅ Más rápido
- ✅ Mejor soporte para múltiples navegadores
- ✅ Testing de API y UI en el mismo framework
- ✅ Mejor para CI/CD

#### 3. **Alternativa E2E: Cypress**
```bash
npm install --save-dev cypress
```

---

## 📦 Estructura de Testing por Módulos

### **Módulo 1: Autenticación y Autorización** 🔐

#### **Backend Tests**

```
backend/src/__tests__/
  ├── auth/
  │   ├── auth.controller.test.js      # Tests de controladores
  │   ├── auth.routes.test.js          # Tests de rutas con Supertest
  │   ├── auth.middleware.test.js      # Tests de middlewares
  │   └── auth.service.test.js         # Tests de servicios (JWT, bcrypt)
```

**Casos de Prueba Críticos:**
- ✅ Registro de usuario (comprador, vendedor)
- ✅ Login con credenciales válidas/inválidas
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Cambio de contraseña
- ✅ Validación de tokens JWT
- ✅ Expiración de sesiones
- ✅ Cierre de sesión
- ✅ Protección de rutas (middleware authenticate)

#### **Frontend Tests**

```
frontend/src/__tests__/
  ├── components/auth/
  │   ├── LoginForm.test.tsx
  │   └── RegisterForm.test.tsx
  ├── pages/
  │   ├── LoginPage.test.tsx
  │   └── RegisterPage.test.tsx
  └── contexts/
      └── AuthContext.test.tsx
```

**Casos de Prueba:**
- ✅ Renderizado de formularios
- ✅ Validación de campos
- ✅ Manejo de errores
- ✅ Redirección después de login
- ✅ Persistencia de sesión

---

### **Módulo 2: Gestión de Productos** 📦

#### **Backend Tests**

```
backend/src/__tests__/
  ├── products/
  │   ├── products.controller.test.js
  │   ├── products.routes.test.js
  │   ├── products.validation.test.js
  │   └── products.permissions.test.js
```

**Casos de Prueba:**
- ✅ Crear producto (vendedor)
- ✅ Editar producto (solo propietario)
- ✅ Eliminar producto
- ✅ Listar productos con filtros
- ✅ Búsqueda de productos
- ✅ Validación de permisos
- ✅ Subida de imágenes
- ✅ Validación de contenido peligroso

#### **Frontend Tests**

```
frontend/src/__tests__/
  ├── components/products/
  │   └── ProductCard.test.tsx
  ├── pages/
  │   ├── CreateProductPage.test.tsx
  │   ├── ProductsPage.test.tsx
  │   └── ProductDetailPage.test.tsx
```

---

### **Módulo 3: Moderación de Contenido** 🛡️

#### **Backend Tests**

```
backend/src/__tests__/
  ├── moderation/
  │   ├── moderation.controller.test.js
  │   ├── content-detection.test.js
  │   └── moderation-history.test.js
```

**Casos de Prueba:**
- ✅ Aprobar producto
- ✅ Rechazar producto
- ✅ Suspender producto
- ✅ Marcar como peligroso
- ✅ Detección automática de contenido inadecuado
- ✅ Historial de moderación
- ✅ Permisos de moderador/admin

---

### **Módulo 4: Gestión de Usuarios** 👥

#### **Backend Tests**

```
backend/src/__tests__/
  ├── users/
  │   ├── user-management.test.js
  │   ├── user-permissions.test.js
  │   └── user-sessions.test.js
```

**Casos de Prueba:**
- ✅ Activar/desactivar usuarios
- ✅ Suspender usuarios
- ✅ Gestión de sesiones
- ✅ Cierre de sesiones por admin
- ✅ Validación de roles

---

### **Módulo 5: Categorías y Ubicaciones** 📍

#### **Backend Tests**

```
backend/src/__tests__/
  ├── categories/
  │   └── categories.test.js
  └── locations/
      └── locations.test.js
```

---

## 🚀 Plan de Implementación (Fases)

### **Fase 1: Configuración Base (Semana 1)**

1. **Instalar dependencias de testing**
   ```bash
   # Backend
   cd backend
   npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
   
   # Frontend
   cd frontend
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
   ```

2. **Configurar Jest (Backend)**
   ```javascript
   // backend/jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/src'],
     testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
     collectCoverageFrom: [
       'src/**/*.{js,ts}',
       '!src/**/*.d.ts',
       '!src/tests/**',
     ],
     coverageDirectory: 'coverage',
     coverageReporters: ['text', 'lcov', 'html'],
   };
   ```

3. **Configurar Vitest (Frontend)**
   ```typescript
   // frontend/vitest.config.ts
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react-swc';
   
   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: './src/test/setup.ts',
     },
   });
   ```

4. **Crear base de datos de testing**
   - Base de datos separada para tests
   - Scripts de migración/seeding para tests

### **Fase 2: Tests Unitarios (Semanas 2-3)**

**Prioridad Alta:**
1. ✅ Servicios críticos (JWT, email, contentDetection)
2. ✅ Utilidades (validators, geoLocation)
3. ✅ Componentes UI básicos (Button, Input, Card)

**Ejemplo de Test Unitario:**
```javascript
// backend/src/__tests__/services/jwt.test.js
const { generateSessionTokens, verifyToken } = require('../../services/jwt');

describe('JWT Service', () => {
  describe('generateSessionTokens', () => {
    it('debe generar accessToken y refreshToken', () => {
      const user = { id: 1, correo: 'test@test.com' };
      const tokens = generateSessionTokens(user);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
    });
  });
});
```

### **Fase 3: Tests de Integración (Semanas 4-5)**

**Prioridad:**
1. ✅ Endpoints de autenticación
2. ✅ CRUD de productos
3. ✅ Flujos de moderación
4. ✅ Gestión de usuarios

**Ejemplo de Test de Integración:**
```javascript
// backend/src/__tests__/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../app');
const { query } = require('../../config/database');

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    // Limpiar base de datos de test
    await query('DELETE FROM usuarios WHERE correo LIKE $1', ['test%@%']);
  });

  it('debe registrar un nuevo usuario', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        cedula: '1234567890',
        nombre: 'Test',
        apellido: 'User',
        correo: 'test@example.com',
        password: 'password123',
        tipo_usuario: 'comprador'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toHaveProperty('id');
  });

  it('debe rechazar email duplicado', async () => {
    // Primero crear usuario
    await request(app).post('/api/auth/register').send({...});
    
    // Intentar crear otro con mismo email
    const response = await request(app)
      .post('/api/auth/register')
      .send({...});

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('email ya está registrado');
  });
});
```

### **Fase 4: Tests E2E (Semanas 6-7)**

**Flujos Críticos a Testear:**
1. ✅ Registro → Verificación → Login → Dashboard
2. ✅ Crear Producto → Moderación → Aprobación
3. ✅ Búsqueda y Filtrado de Productos
4. ✅ Gestión de Sesiones (Admin)

**Ejemplo con Playwright:**
```typescript
// frontend/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('flujo completo de registro y login', async ({ page }) => {
  // 1. Ir a página de registro
  await page.goto('http://localhost:5173/register');
  
  // 2. Llenar formulario
  await page.fill('input[name="nombre"]', 'Test User');
  await page.fill('input[name="correo"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // 3. Enviar formulario
  await page.click('button[type="submit"]');
  
  // 4. Verificar redirección a verificación
  await expect(page).toHaveURL(/.*verify-email/);
  
  // 5. Ingresar código (mock)
  // ...
  
  // 6. Verificar login exitoso
  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## 📊 Métricas y Cobertura Objetivo

### **Cobertura de Código Objetivo:**

| Módulo | Cobertura Mínima | Cobertura Ideal |
|--------|------------------|------------------|
| Servicios Críticos | 90% | 95% |
| Controladores | 80% | 90% |
| Middlewares | 85% | 95% |
| Componentes UI | 70% | 85% |
| Páginas | 60% | 75% |
| **GLOBAL** | **75%** | **85%** |

### **Herramientas de Cobertura:**

```bash
# Backend
npm install --save-dev jest --coverage

# Frontend
npm install --save-dev @vitest/coverage-v8
```

---

## 🔄 Integración Continua (CI/CD)

### **GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd backend && npm test
      - run: cd backend && npm run test:coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install
      - run: cd frontend && npm test
      - run: cd frontend && npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install
      - run: cd frontend && npx playwright install
      - run: cd frontend && npm run test:e2e
```

---

## 🎯 Priorización de Testing

### **Alta Prioridad (Implementar Primero):**
1. 🔴 **Autenticación y Autorización** - Seguridad crítica
2. 🔴 **Moderación de Contenido** - Prevención de contenido peligroso
3. 🔴 **Gestión de Productos** - Funcionalidad core
4. 🟡 **Gestión de Usuarios** - Administración
5. 🟡 **Sesiones** - Seguridad

### **Media Prioridad:**
6. 🟡 Categorías y Ubicaciones
7. 🟡 Productos Guardados
8. 🟡 Reportes y Apelaciones

### **Baja Prioridad:**
9. 🟢 UI Components (se pueden testear visualmente)
10. 🟢 Utilidades menores

---

## 📝 Scripts de Testing Recomendados

### **Backend package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:auth": "jest --testPathPattern=auth"
  }
}
```

### **Frontend package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## ⚠️ Consideraciones Críticas

### **1. Base de Datos de Testing**
- ✅ **OBLIGATORIO:** Base de datos separada para tests
- ✅ Usar transacciones que se revierten después de cada test
- ✅ Seeders para datos de prueba consistentes

### **2. Variables de Entorno**
- ✅ Archivo `.env.test` separado
- ✅ No usar credenciales de producción
- ✅ Mock de servicios externos (email, etc.)

### **3. Performance**
- ✅ Tests deben ejecutarse en < 5 minutos
- ✅ Paralelización de tests
- ✅ Tests E2E solo en CI/CD o antes de releases

### **4. Mantenibilidad**
- ✅ Tests deben ser legibles y autodocumentados
- ✅ Usar factories para datos de prueba
- ✅ Evitar duplicación (DRY)

---

## 🎓 Recursos de Aprendizaje

1. **Jest Documentation:** https://jestjs.io/
2. **React Testing Library:** https://testing-library.com/react
3. **Playwright:** https://playwright.dev/
4. **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencias de testing
- [ ] Configurar Jest (Backend)
- [ ] Configurar Vitest (Frontend)
- [ ] Crear base de datos de testing
- [ ] Escribir primeros tests unitarios (servicios)
- [ ] Escribir tests de integración (APIs)
- [ ] Configurar Playwright para E2E
- [ ] Configurar CI/CD
- [ ] Alcanzar 75% de cobertura
- [ ] Documentar estrategia de testing

---

## 📞 Conclusión

**Recomendación Final:** Implementar testing de forma incremental, empezando por los módulos críticos (Autenticación, Productos, Moderación). Usar **Jest + Supertest** para backend y **Vitest + React Testing Library + Playwright** para frontend.

**Tiempo Estimado:** 6-8 semanas para implementación completa con cobertura del 75%.

**ROI:** Reducción del 60-80% en bugs en producción, mayor confianza en deployments, y mejor documentación viva del código.

