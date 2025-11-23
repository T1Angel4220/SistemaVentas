# 🎯 Estrategia y Plan de Pruebas E2E - Sistema de Ventas

## 📋 Contexto del Proyecto

**Sistema:** Sistema de Ventas Multiempresa  
**Stack Tecnológico:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL
- Autenticación: JWT
- Roles: Comprador, Vendedor, Moderador, Administrador

**Estado Actual:**
- ✅ Pruebas de integración ya implementadas (en otra rama)
- ❌ Pruebas E2E pendientes
- ❌ Sin framework de testing E2E configurado

---

## 🎯 Objetivo de las Pruebas E2E

Las **pruebas E2E (End-to-End)** validan flujos completos de usuario desde la interfaz hasta la base de datos, asegurando que:

1. ✅ **Flujos completos funcionan** (registro → login → acciones)
2. ✅ **Frontend y Backend se comunican correctamente**
3. ✅ **UI responde como se espera** en navegadores reales
4. ✅ **No hay regresiones** al agregar nuevas funcionalidades
5. ✅ **Experiencia de usuario es correcta** para cada rol

---

## 🏆 Herramienta Recomendada: **Playwright** ⭐

### **¿Por qué Playwright?**

1. ✅ **Compatible con tu stack:**
   - React 19 + TypeScript ✅
   - Vite (sin configuración especial) ✅
   - Múltiples navegadores (Chrome, Firefox, Safari, Edge) ✅

2. ✅ **Ventajas técnicas:**
   - **Rápido:** Ejecución paralela nativa
   - **Estable:** Auto-waiting inteligente (menos flakiness)
   - **TypeScript nativo:** Sin configuración adicional
   - **Debugging excelente:** Traces, videos, screenshots automáticos
   - **CI/CD friendly:** Optimizado para pipelines

3. ✅ **Ideal para sistemas multi-rol:**
   - Fácil cambio entre roles de usuario
   - Helpers reutilizables para autenticación
   - Aislamiento de tests por rol

### **Comparación Rápida:**

| Característica | Playwright | Cypress | Selenium |
|----------------|------------|---------|----------|
| Velocidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Multi-navegador | ✅ Nativo | ❌ Solo Chrome | ✅ |
| TypeScript | ✅ Nativo | ⚠️ Config | ⚠️ Config |
| Debugging | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Curva aprendizaje | Media | Baja | Alta |

**Conclusión:** Playwright es la mejor opción para tu proyecto.

---

## 📦 Estructura de Pruebas E2E

### **Organización Recomendada:**

```
frontend/
├── e2e/
│   ├── fixtures/              # Helpers y utilidades reutilizables
│   │   ├── auth.ts           # Helpers de autenticación por rol
│   │   ├── api-helpers.ts    # Helpers para llamadas API directas
│   │   └── test-data.ts      # Datos de prueba centralizados
│   │
│   ├── pages/                # Page Object Model (POM)
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CreateProductPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── ModerationPage.ts
│   │   ├── UserManagementPage.ts
│   │   └── ProfilePage.ts
│   │
│   ├── flows/                # Flujos completos de usuario
│   │   ├── auth-flow.spec.ts
│   │   ├── product-lifecycle.spec.ts
│   │   ├── moderation-flow.spec.ts
│   │   ├── user-management-flow.spec.ts
│   │   ├── search-and-filter-flow.spec.ts
│   │   └── profile-management-flow.spec.ts
│   │
│   ├── smoke/                 # Tests de humo (críticos)
│   │   ├── critical-paths.spec.ts
│   │   └── health-check.spec.ts
│   │
│   └── utils/                 # Utilidades compartidas
│       ├── selectors.ts      # Selectores centralizados
│       └── assertions.ts     # Assertions personalizadas
│
└── playwright.config.ts       # Configuración de Playwright
```

---

## 🎭 Page Object Model (POM) - Estrategia

### **¿Por qué POM?**

1. ✅ **Mantenibilidad:** Cambios en UI se reflejan en un solo lugar
2. ✅ **Reutilización:** Misma página usada en múltiples tests
3. ✅ **Legibilidad:** Tests más claros y fáciles de entender
4. ✅ **Escalabilidad:** Fácil agregar nuevas páginas

### **Estructura de un Page Object:**

```typescript
// Ejemplo conceptual
export class LoginPage {
  // Locators (elementos de la página)
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="correo"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-500');
  }
  
  // Métodos de interacción
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
  
  async isLoggedIn(): Promise<boolean> {
    return this.page.url().includes('/dashboard');
  }
}
```

---

## 🧪 Flujos Críticos a Testear

### **Prioridad ALTA (Implementar Primero):**

#### **1. Flujo de Autenticación Completo** 🔐

**Casos de Prueba:**
- ✅ Registro de nuevo usuario (comprador)
- ✅ Registro de nuevo usuario (vendedor)
- ✅ Verificación de email con código
- ✅ Login con credenciales válidas
- ✅ Login con credenciales inválidas
- ✅ Validación de campos requeridos
- ✅ Recuperación de contraseña (solicitar → código → reset)
- ✅ Cambio de contraseña desde perfil
- ✅ Logout exitoso
- ✅ Persistencia de sesión (refresh page)
- ✅ Redirección después de login según rol

**Valor de Negocio:** 🔴 CRÍTICO - Sin autenticación, el sistema no funciona

**Tiempo Estimado:** 3-4 días

---

#### **2. Flujo de Gestión de Productos (Vendedor)** 📦

**Casos de Prueba:**
- ✅ Crear producto completo (con imágenes, ubicación, categoría)
- ✅ Crear servicio completo (con horarios, días disponibles)
- ✅ Editar producto existente
- ✅ Eliminar producto
- ✅ Validación de formularios (campos requeridos, formatos)
- ✅ Subida de imágenes (múltiples, validación de formato)
- ✅ Vista previa de imágenes
- ✅ Cambio de disponibilidad
- ✅ Ver "Mis Productos" con filtros
- ✅ Búsqueda en "Mis Productos"

**Valor de Negocio:** 🔴 CRÍTICO - Funcionalidad core del sistema

**Tiempo Estimado:** 4-5 días

---

#### **3. Flujo de Moderación (Moderador/Admin)** 🛡️

**Casos de Prueba:**
- ✅ Ver productos pendientes de revisión
- ✅ Aprobar producto pendiente
- ✅ Rechazar producto con motivo
- ✅ Suspender producto
- ✅ Marcar producto como peligroso
- ✅ **Verificar desactivación de botones** (según estado del producto)
- ✅ Ver historial de moderación
- ✅ Filtrar productos por estado
- ✅ Paginación en lista de moderación
- ✅ Ver detalles de producto desde moderación

**Valor de Negocio:** 🔴 CRÍTICO - Prevención de contenido peligroso

**Tiempo Estimado:** 3-4 días

---

#### **4. Flujo de Búsqueda y Catálogo (Comprador)** 🔍

**Casos de Prueba:**
- ✅ Búsqueda por nombre de producto
- ✅ Filtros por categoría (jerárquica)
- ✅ Filtros por precio (mín/máx)
- ✅ Filtros por ubicación (provincia, cantón, distrito)
- ✅ Filtros por tipo (producto/servicio)
- ✅ Combinación de múltiples filtros
- ✅ Paginación de resultados
- ✅ Ver detalles de producto
- ✅ Guardar producto como favorito
- ✅ Contactar vendedor
- ✅ Ver productos guardados

**Valor de Negocio:** 🟡 ALTA - Experiencia del usuario final

**Tiempo Estimado:** 3-4 días

---

### **Prioridad MEDIA:**

#### **5. Flujo de Gestión de Usuarios (Admin)** 👥

**Casos de Prueba:**
- ✅ Listar usuarios con filtros
- ✅ Buscar usuario por nombre/email
- ✅ Activar/desactivar usuario
- ✅ Suspender usuario
- ✅ Ver sesiones activas de usuario
- ✅ Cerrar sesión específica
- ✅ Cerrar todas las sesiones de un usuario

**Valor de Negocio:** 🟡 MEDIA - Funcionalidad administrativa

**Tiempo Estimado:** 2-3 días

---

#### **6. Flujo de Perfil de Usuario** 👤

**Casos de Prueba:**
- ✅ Ver perfil
- ✅ Editar información personal
- ✅ Cambiar contraseña
- ✅ Ver estadísticas (vendedor)
- ✅ Validación de campos

**Valor de Negocio:** 🟡 MEDIA - Funcionalidad secundaria

**Tiempo Estimado:** 2 días

---

#### **7. Flujo de Reportes y Apelaciones** 📋

**Casos de Prueba:**
- ✅ Reportar producto
- ✅ Ver reportes pendientes (moderador)
- ✅ Resolver reporte
- ✅ Apelar producto rechazado
- ✅ Gestionar apelaciones (moderador)

**Valor de Negocio:** 🟢 BAJA - Funcionalidad de soporte

**Tiempo Estimado:** 2 días

---

## 🚀 Plan de Implementación Detallado

### **Fase 1: Setup y Configuración (Semana 1)**

#### **Día 1-2: Instalación y Configuración**

**Tareas:**
- [ ] Instalar Playwright: `npm install --save-dev @playwright/test`
- [ ] Instalar navegadores: `npx playwright install`
- [ ] Crear `playwright.config.ts` con configuración básica
- [ ] Configurar scripts en `package.json`
- [ ] Crear estructura de carpetas (`e2e/`, `pages/`, `flows/`, `fixtures/`)

**Configuración Base:**
```typescript
// playwright.config.ts - Configuración mínima
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Entregable:** Playwright configurado y funcionando

---

#### **Día 3-4: Setup de Datos y Helpers**

**Tareas:**
- [ ] Crear base de datos de testing (separada de desarrollo)
- [ ] Crear usuarios de prueba (comprador, vendedor, moderador, admin)
- [ ] Crear `fixtures/auth.ts` con helpers de autenticación
- [ ] Crear `fixtures/test-data.ts` con datos centralizados
- [ ] Crear `utils/selectors.ts` con selectores comunes
- [ ] Configurar variables de entorno para testing

**Entregable:** Helpers y datos de prueba listos

---

#### **Día 5: Primer Test y Validación**

**Tareas:**
- [ ] Crear primer Page Object (`LoginPage.ts`)
- [ ] Escribir primer test E2E (login básico)
- [ ] Ejecutar y validar que funciona
- [ ] Configurar CI/CD básico (GitHub Actions)

**Entregable:** Primer test E2E funcionando

---

### **Fase 2: Flujos Críticos (Semanas 2-3)**

#### **Semana 2: Autenticación y Productos**

**Día 1-2: Flujo de Autenticación**
- [ ] Completar Page Objects: `LoginPage`, `RegisterPage`, `DashboardPage`
- [ ] Implementar tests de registro completo
- [ ] Implementar tests de login/logout
- [ ] Implementar tests de recuperación de contraseña
- [ ] Implementar tests de cambio de contraseña

**Día 3-5: Flujo de Productos (Vendedor)**
- [ ] Crear Page Objects: `CreateProductPage`, `ProductsPage`, `ProductDetailPage`
- [ ] Implementar test de crear producto
- [ ] Implementar test de editar producto
- [ ] Implementar test de eliminar producto
- [ ] Implementar test de subida de imágenes
- [ ] Implementar test de validaciones de formulario

**Entregable:** Flujos de autenticación y productos funcionando

---

#### **Semana 3: Moderación y Búsqueda**

**Día 1-2: Flujo de Moderación**
- [ ] Crear Page Object: `ModerationPage`
- [ ] Implementar test de aprobar producto
- [ ] Implementar test de rechazar producto
- [ ] Implementar test de suspender producto
- [ ] Implementar test de marcar como peligroso
- [ ] **Implementar test de desactivación de botones** (según estado)

**Día 3-5: Flujo de Búsqueda y Catálogo**
- [ ] Crear Page Object: `ProductsCatalogPage`
- [ ] Implementar tests de búsqueda
- [ ] Implementar tests de filtros (categoría, precio, ubicación)
- [ ] Implementar test de paginación
- [ ] Implementar test de productos guardados
- [ ] Implementar test de contacto con vendedor

**Entregable:** Flujos de moderación y búsqueda funcionando

---

### **Fase 3: Flujos Secundarios (Semana 4)**

**Día 1-2: Gestión de Usuarios**
- [ ] Crear Page Object: `UserManagementPage`
- [ ] Implementar tests de listar usuarios
- [ ] Implementar tests de activar/suspender usuarios
- [ ] Implementar tests de gestión de sesiones

**Día 3-4: Perfil y Reportes**
- [ ] Completar Page Object: `ProfilePage`
- [ ] Implementar tests de editar perfil
- [ ] Implementar tests de reportes y apelaciones

**Día 5: Optimización y Refinamiento**
- [ ] Revisar y optimizar tests existentes
- [ ] Agregar más casos edge
- [ ] Mejorar mensajes de error en tests

**Entregable:** Suite completa de flujos principales

---

### **Fase 4: Optimización y CI/CD (Semana 5)**

**Día 1-2: Optimización**
- [ ] Optimizar tiempos de ejecución (paralelización)
- [ ] Reducir flakiness (mejorar waits, selectores)
- [ ] Agregar más assertions
- [ ] Mejorar reportes

**Día 3-4: CI/CD**
- [ ] Configurar GitHub Actions completo
- [ ] Configurar ejecución en PRs
- [ ] Configurar ejecución nightly
- [ ] Configurar notificaciones

**Día 5: Documentación**
- [ ] Documentar flujos testeados
- [ ] Crear guía de ejecución
- [ ] Documentar troubleshooting

**Entregable:** Pipeline de CI/CD funcionando, documentación completa

---

## 📊 Métricas y Objetivos

### **Métricas de Calidad:**

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Cobertura de Flujos Críticos** | 100% | Todos los flujos de alta prioridad |
| **Tiempo de Ejecución (Smoke)** | < 2 min | Tests críticos básicos |
| **Tiempo de Ejecución (Full)** | < 15 min | Suite completa |
| **Tasa de Éxito** | > 95% | % de tests que pasan |
| **Flakiness** | < 2% | % de tests que fallan intermitentemente |

### **KPIs de Testing:**

- ✅ **Detección de Bugs:** % de bugs encontrados por E2E antes de producción
- ✅ **Tiempo de Feedback:** Tiempo desde commit hasta resultados de tests
- ✅ **Confianza en Deployments:** % de deployments sin rollback

---

## 🔧 Configuración Técnica

### **Playwright Configuration Recomendada:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### **Scripts de package.json:**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:chrome": "playwright test --project=chromium",
    "test:e2e:smoke": "playwright test --grep @smoke",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 🎯 Estrategia de Ejecución

### **Niveles de Testing:**

#### **1. Smoke Tests (Tests de Humo)**
- **Objetivo:** Validar que el sistema básico funciona
- **Ejecución:** Antes de cada deploy, en cada PR
- **Duración:** < 2 minutos
- **Casos:** 
  - Login exitoso
  - Crear producto básico
  - Aprobar producto

**Comando:** `npm run test:e2e:smoke`

---

#### **2. Regression Tests (Tests de Regresión)**
- **Objetivo:** Validar que cambios no rompieron funcionalidad
- **Ejecución:** En cada PR, antes de merge
- **Duración:** < 10 minutos
- **Casos:** Todos los flujos críticos (alta prioridad)

**Comando:** `npm run test:e2e -- --grep "@critical"`

---

#### **3. Full Suite (Suite Completa)**
- **Objetivo:** Validación exhaustiva antes de release
- **Ejecución:** Antes de releases, nightly builds
- **Duración:** < 15 minutos
- **Casos:** Todos los flujos (alta + media prioridad)

**Comando:** `npm run test:e2e`

---

## 📋 Datos de Prueba

### **Estrategia de Datos:**

1. **Usuarios de Prueba Pre-creados:**
   ```
   - comprador@test.com / password123
   - vendedor@test.com / password123
   - moderador@test.com / password123
   - admin@test.com / password123
   ```

2. **Base de Datos de Testing:**
   - BD separada para E2E (`sistema_ventas_test`)
   - Reset antes de cada suite
   - Seeders para datos consistentes

3. **Datos Dinámicos:**
   - Usar timestamps para emails únicos: `test-${Date.now()}@test.com`
   - IDs aleatorios para evitar conflictos
   - Cleanup automático después de tests

---

## 🔄 Integración con CI/CD

### **GitHub Actions Workflow:**

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      
      - name: Setup Database
        run: |
          cd backend
          # Scripts de setup de BD de prueba
      
      - name: Start Backend
        run: |
          cd backend
          npm run dev &
        env:
          NODE_ENV: test
      
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 🎓 Mejores Prácticas

### **DO's (Hacer):**

✅ **Usar Page Object Model** - Mantenibilidad  
✅ **Tests independientes** - Cada test debe poder ejecutarse solo  
✅ **Datos de prueba aislados** - No depender de otros tests  
✅ **Nombres descriptivos** - `test('debe aprobar producto pendiente')`  
✅ **Assertions claras** - Verificar comportamiento, no implementación  
✅ **Cleanup automático** - Limpiar datos después de cada test  
✅ **Screenshots en fallos** - Facilita debugging  
✅ **Tests determinísticos** - Mismo resultado siempre  
✅ **Usar data-testid** - Selectores más estables  
✅ **Agrupar tests relacionados** - `test.describe()`  

### **DON'Ts (No Hacer):**

❌ **Hardcodear waits** - Usar auto-waiting de Playwright  
❌ **Tests dependientes** - No hacer que un test dependa de otro  
❌ **Selectores frágiles** - Evitar `div:nth-child(3)`  
❌ **Tests muy largos** - Máximo 50 líneas por test  
❌ **Datos de producción** - Nunca usar datos reales  
❌ **Ignorar fallos** - Investigar cada fallo  
❌ **Tests flaky** - Si falla intermitentemente, arreglarlo  
❌ **Hardcodear URLs** - Usar `baseURL` de configuración  
❌ **Múltiples assertions en un test** - Un test, una cosa  

---

## 📝 Checklist de Implementación

### **Pre-requisitos:**
- [ ] Node.js 18+ instalado
- [ ] Base de datos de testing configurada
- [ ] Usuarios de prueba creados
- [ ] Variables de entorno configuradas

### **Fase 1: Setup (Semana 1)**
- [ ] Instalar Playwright
- [ ] Configurar `playwright.config.ts`
- [ ] Crear estructura de carpetas
- [ ] Crear helpers de autenticación
- [ ] Configurar datos de prueba
- [ ] Primer test funcionando

### **Fase 2: Flujos Críticos (Semanas 2-3)**
- [ ] Flujo de autenticación completo
- [ ] Flujo de productos (crear, editar, eliminar)
- [ ] Flujo de moderación (con desactivación de botones)
- [ ] Flujo de búsqueda y filtrado

### **Fase 3: Flujos Secundarios (Semana 4)**
- [ ] Flujo de gestión de usuarios
- [ ] Flujo de perfil
- [ ] Flujo de reportes y apelaciones

### **Fase 4: Optimización (Semana 5)**
- [ ] Configurar CI/CD
- [ ] Optimizar tiempos de ejecución
- [ ] Configurar reportes
- [ ] Documentar flujos

---

## 🎯 Conclusión y Próximos Pasos

### **Resumen de la Estrategia:**

1. ✅ **Herramienta:** Playwright (mejor opción para tu stack)
2. ✅ **Estrategia:** Page Object Model + Flujos por módulos
3. ✅ **Prioridad:** Empezar con flujos críticos (Auth, Products, Moderation)
4. ✅ **Implementación:** Incremental, 5 semanas
5. ✅ **CI/CD:** Integrar desde Fase 1

### **ROI Esperado:**

- ✅ **Reducción de bugs en producción:** 60-80%
- ✅ **Confianza en deployments:** 95%+
- ✅ **Tiempo de feedback:** < 10 minutos
- ✅ **Detección temprana:** Antes de que llegue a producción

### **Próximos Pasos Inmediatos:**

1. ✅ Revisar y aprobar esta estrategia
2. ⏭️ Instalar Playwright: `cd frontend && npm install --save-dev @playwright/test`
3. ⏭️ Configurar `playwright.config.ts`
4. ⏭️ Crear estructura de carpetas
5. ⏭️ Escribir primer test (login básico)

---

## 📚 Recursos y Referencias

- **Playwright Docs:** https://playwright.dev/
- **Best Practices:** https://playwright.dev/docs/best-practices
- **Page Object Model:** https://playwright.dev/docs/pom
- **CI/CD Integration:** https://playwright.dev/docs/ci
- **Selectors Guide:** https://playwright.dev/docs/selectors

---

**Documento creado:** 2024  
**Versión:** 2.0  
**Enfoque:** Pruebas E2E con Playwright
