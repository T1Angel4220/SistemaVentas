# 🎯 Guía de Pruebas de Sistema (E2E) - Sistema de Ventas

## 🎯 Recomendación Principal: **Playwright** ⭐

### **¿Por qué Playwright para tu proyecto?**

1. ✅ **Compatible con tu stack:**
   - React 19 + TypeScript ✅
   - Vite ✅
   - Múltiples navegadores (Chrome, Firefox, Safari, Edge)

2. ✅ **Ventajas sobre Cypress:**
   - Más rápido (ejecución paralela nativa)
   - Mejor para CI/CD
   - Soporte nativo para TypeScript
   - Testing de API y UI en el mismo framework
   - Auto-waiting inteligente

3. ✅ **Ideal para tu caso:**
   - Ya tienes pruebas de integración (API)
   - Necesitas validar flujos completos Frontend-Backend
   - Sistema con múltiples roles (Comprador, Vendedor, Moderador, Admin)

---

## 📦 Instalación y Configuración

### **Paso 1: Instalar Playwright**

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

### **Paso 2: Configurar Playwright**

Crear archivo `frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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

### **Paso 3: Estructura de Carpetas**

```
frontend/
├── e2e/
│   ├── fixtures/              # Helpers y utilidades
│   │   ├── auth.ts           # Helpers de autenticación
│   │   ├── database.ts       # Helpers de base de datos
│   │   └── test-data.ts      # Datos de prueba
│   │
│   ├── flows/                # Flujos completos de usuario
│   │   ├── auth-flow.spec.ts
│   │   ├── product-lifecycle.spec.ts
│   │   ├── moderation-flow.spec.ts
│   │   └── user-management-flow.spec.ts
│   │
│   ├── pages/                # Page Object Model
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── ProductsPage.ts
│   │   └── ModerationPage.ts
│   │
│   └── utils/                # Utilidades compartidas
│       ├── api-helpers.ts
│       └── test-helpers.ts
│
└── playwright.config.ts
```

---

## 🎭 Page Object Model (POM) - Mejores Prácticas

### **Ejemplo: LoginPage.ts**

```typescript
// frontend/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
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

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async isLoggedIn() {
    return this.page.url().includes('/dashboard');
  }
}
```

---

## 🧪 Tests de Sistema por Módulos

### **Módulo 1: Autenticación** 🔐

```typescript
// frontend/e2e/flows/auth-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Flujo de Autenticación', () => {
  test('Registro completo de nuevo usuario', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const verifyPage = await page;
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Ir a registro
    await registerPage.goto();
    
    // 2. Llenar formulario de registro
    await registerPage.register({
      cedula: '1234567890',
      nombre: 'Test',
      apellido: 'User',
      correo: `test-${Date.now()}@example.com`,
      password: 'password123',
      tipo_usuario: 'comprador'
    });

    // 3. Verificar redirección a verificación de email
    await expect(page).toHaveURL(/.*verify-email/);
    
    // 4. Obtener código de verificación (mock o desde API)
    const verificationCode = '123456'; // En producción, obtener del email o API
    
    // 5. Ingresar código
    await page.fill('input[name="code"]', verificationCode);
    await page.click('button[type="submit"]');

    // 6. Verificar login automático y redirección a dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('Login con credenciales válidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('Login con credenciales inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('credenciales');
  });

  test('Recuperación de contraseña', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Solicitar recuperación
    await page.fill('input[name="correo"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Código enviado')).toBeVisible();
    
    // Ir a página de reset
    await page.goto('/reset-password');
    
    // Ingresar código y nueva contraseña
    await page.fill('input[name="code"]', '123456');
    await page.fill('input[name="newPassword"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    await page.click('button[type="submit"]');
    
    // Verificar redirección a login
    await expect(page).toHaveURL(/.*login/);
  });
});
```

---

### **Módulo 2: Gestión de Productos** 📦

```typescript
// frontend/e2e/flows/product-lifecycle.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CreateProductPage } from '../pages/CreateProductPage';
import { ProductsPage } from '../pages/ProductsPage';

test.describe('Ciclo de Vida de Producto', () => {
  test.beforeEach(async ({ page }) => {
    // Login como vendedor
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('vendedor@example.com', 'password123');
  });

  test('Crear nuevo producto completo', async ({ page }) => {
    const createPage = new CreateProductPage(page);
    const productsPage = new ProductsPage(page);

    // 1. Ir a crear producto
    await createPage.goto();

    // 2. Llenar formulario
    await createPage.fillProductForm({
      nombre: 'Producto de Prueba E2E',
      descripcion: 'Descripción del producto de prueba',
      precio: '100',
      tipo: 'producto',
      categoria: 'Electrónica',
      provincia: 'Pichincha',
      canton: 'Quito',
      distrito: 'Centro',
      direccion: 'Calle Principal 123',
      disponibilidad: true
    });

    // 3. Subir imagen
    await createPage.uploadImage('test-image.jpg');

    // 4. Enviar formulario
    await createPage.submit();

    // 5. Verificar mensaje de éxito
    await expect(page.locator('text=Producto creado')).toBeVisible();

    // 6. Verificar que aparece en "Mis Productos"
    await productsPage.goto();
    await expect(page.locator('text=Producto de Prueba E2E')).toBeVisible();
  });

  test('Editar producto existente', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();
    
    // Buscar producto
    await productsPage.searchProduct('Producto de Prueba');
    
    // Hacer clic en editar
    await productsPage.clickEdit('Producto de Prueba E2E');
    
    // Modificar precio
    await page.fill('input[name="precio"]', '150');
    await page.click('button[type="submit"]');
    
    // Verificar actualización
    await expect(page.locator('text=Producto actualizado')).toBeVisible();
  });

  test('Eliminar producto', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();
    
    // Buscar y eliminar
    await productsPage.deleteProduct('Producto de Prueba E2E');
    
    // Confirmar eliminación
    await page.click('button:has-text("Confirmar")');
    
    // Verificar eliminación
    await expect(page.locator('text=Producto eliminado')).toBeVisible();
    await expect(page.locator('text=Producto de Prueba E2E')).not.toBeVisible();
  });
});
```

---

### **Módulo 3: Moderación de Contenido** 🛡️

```typescript
// frontend/e2e/flows/moderation-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ModerationPage } from '../pages/ModerationPage';

test.describe('Flujo de Moderación', () => {
  test.beforeEach(async ({ page }) => {
    // Login como moderador
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('moderador@example.com', 'password123');
  });

  test('Aprobar producto pendiente', async ({ page }) => {
    const moderationPage = new ModerationPage(page);

    await moderationPage.goto();
    
    // Verificar que hay productos pendientes
    await expect(moderationPage.pendingProductsCount).toBeVisible();
    
    // Seleccionar primer producto pendiente
    await moderationPage.selectProduct(0);
    
    // Ver detalles
    await moderationPage.viewDetails();
    
    // Aprobar producto
    await moderationPage.approveProduct();
    
    // Confirmar acción
    await page.click('button:has-text("Confirmar")');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Producto aprobado')).toBeVisible();
    
    // Verificar que el producto ya no está en pendientes
    await moderationPage.goto();
    // El producto no debería aparecer en la lista de pendientes
  });

  test('Rechazar producto con motivo', async ({ page }) => {
    const moderationPage = new ModerationPage(page);

    await moderationPage.goto();
    await moderationPage.selectProduct(0);
    await moderationPage.viewDetails();
    
    // Rechazar producto
    await moderationPage.rejectProduct('Producto no cumple con las políticas');
    
    // Verificar mensaje
    await expect(page.locator('text=Producto rechazado')).toBeVisible();
  });

  test('Marcar producto como peligroso', async ({ page }) => {
    const moderationPage = new ModerationPage(page);

    await moderationPage.goto();
    await moderationPage.selectProduct(0);
    await moderationPage.viewDetails();
    
    // Marcar como peligroso
    await moderationPage.markAsDangerous('Contenido prohibido');
    
    // Verificar que se desactivan todos los botones
    await expect(page.locator('button:has-text("Aprobar")')).toBeDisabled();
    await expect(page.locator('button:has-text("Rechazar")')).toBeDisabled();
    await expect(page.locator('button:has-text("Suspender")')).toBeDisabled();
  });
});
```

---

### **Módulo 4: Gestión de Usuarios** 👥

```typescript
// frontend/e2e/flows/user-management-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UserManagementPage } from '../pages/UserManagementPage';

test.describe('Gestión de Usuarios (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    // Login como administrador
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'password123');
  });

  test('Suspender usuario', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);

    await userManagementPage.goto();
    
    // Buscar usuario
    await userManagementPage.searchUser('test@example.com');
    
    // Suspender usuario
    await userManagementPage.suspendUser('test@example.com', 'Violación de políticas');
    
    // Verificar mensaje
    await expect(page.locator('text=Usuario suspendido')).toBeVisible();
    
    // Verificar cambio de estado
    await expect(page.locator('text=Estado: Suspendido')).toBeVisible();
  });

  test('Cerrar sesión de usuario', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const sessionPage = await page;

    await userManagementPage.goto();
    
    // Ir a gestión de sesiones
    await page.click('a:has-text("Sesiones")');
    
    // Seleccionar sesión
    await sessionPage.click('button:has-text("Cerrar Sesión")');
    
    // Verificar mensaje
    await expect(page.locator('text=Sesión cerrada')).toBeVisible();
  });
});
```

---

## 🛠️ Helpers y Utilidades

### **Auth Helper**

```typescript
// frontend/e2e/fixtures/auth.ts
import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async loginAs(role: 'comprador' | 'vendedor' | 'moderador' | 'administrador') {
    const credentials = {
      comprador: { email: 'comprador@example.com', password: 'password123' },
      vendedor: { email: 'vendedor@example.com', password: 'password123' },
      moderador: { email: 'moderador@example.com', password: 'password123' },
      administrador: { email: 'admin@example.com', password: 'password123' }
    };

    await this.page.goto('/login');
    await this.page.fill('input[name="correo"]', credentials[role].email);
    await this.page.fill('input[name="password"]', credentials[role].password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL(/.*dashboard/);
  }

  async logout() {
    await this.page.click('button:has-text("Cerrar Sesión")');
    await this.page.waitForURL(/.*login/);
  }
}
```

### **API Helper (Para Setup de Datos)**

```typescript
// frontend/e2e/utils/api-helpers.ts
export class ApiHelper {
  private baseURL = 'http://localhost:3001/api';

  async createTestUser(userData: any) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async createTestProduct(productData: any, token: string) {
    const response = await fetch(`${this.baseURL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return response.json();
  }

  async cleanupTestData(userId: number, token: string) {
    // Limpiar datos de prueba
    await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

---

## 📋 Scripts de package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:chrome": "playwright test --project=chromium",
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 🎯 Flujos Críticos a Testear (Prioridad)

### **Alta Prioridad (Implementar Primero):**

1. ✅ **Flujo de Autenticación Completo**
   - Registro → Verificación → Login → Dashboard
   - Login → Logout
   - Recuperación de contraseña

2. ✅ **Flujo de Producto (Vendedor)**
   - Crear → Editar → Eliminar
   - Subida de imágenes
   - Validación de formularios

3. ✅ **Flujo de Moderación**
   - Aprobar producto
   - Rechazar producto
   - Marcar como peligroso
   - Verificar desactivación de botones

4. ✅ **Flujo de Búsqueda y Filtrado**
   - Búsqueda por nombre
   - Filtros por categoría, precio, ubicación
   - Paginación

### **Media Prioridad:**

5. 🟡 Gestión de Usuarios (Admin)
6. 🟡 Gestión de Sesiones
7. 🟡 Productos Guardados (Favoritos)
8. 🟡 Reportes y Apelaciones

---

## 🔄 Integración con CI/CD

### **GitHub Actions Workflow**

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
          path: frontend/test-results/
```

---

## 📊 Reportes y Visualización

Playwright genera reportes HTML automáticamente:

```bash
# Ver reporte después de ejecutar tests
npm run test:e2e:report
```

El reporte incluye:
- ✅ Screenshots de fallos
- ✅ Videos de ejecución
- ✅ Trazas de interacción
- ✅ Timeline de ejecución

---

## ✅ Checklist de Implementación

- [ ] Instalar Playwright
- [ ] Configurar `playwright.config.ts`
- [ ] Crear estructura de carpetas (e2e/, pages/, fixtures/)
- [ ] Implementar Page Object Model básico
- [ ] Crear helpers de autenticación
- [ ] Escribir primer test E2E (Login)
- [ ] Configurar datos de prueba
- [ ] Implementar tests de flujos críticos
- [ ] Configurar CI/CD
- [ ] Documentar flujos testeados

---

## 🎓 Conclusión

**Para tu proyecto SistemaVentas, recomiendo:**

1. ✅ **Playwright** como herramienta principal de E2E
2. ✅ **Page Object Model** para mantener tests mantenibles
3. ✅ **Organización por flujos** (auth-flow, product-lifecycle, etc.)
4. ✅ **Helpers reutilizables** para autenticación y datos de prueba
5. ✅ **Integración con CI/CD** para ejecución automática

**Tiempo estimado:** 2-3 semanas para implementar flujos críticos.

**ROI:** Validación completa de funcionalidad desde perspectiva del usuario, detección temprana de bugs de integración, confianza en deployments.


