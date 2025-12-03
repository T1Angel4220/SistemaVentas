# 📋 Orden de Ejecución de Pruebas E2E

Este documento describe el orden óptimo de ejecución de las pruebas E2E, basado en las dependencias entre módulos y pruebas.

## 🎯 Orden General de Módulos

Las pruebas se ejecutan en el siguiente orden:

1. **auth** (Autenticación) - Base para todo
2. **users** (Usuarios) - Requiere autenticación
3. **moderation** (Moderación) - Requiere usuarios y productos
4. **products** (Productos) - Al final porque puede depender de usuarios y moderación

## 📦 MÓDULO 1: Autenticación (auth)

**Orden óptimo basado en dependencias:**

1. **register.spec.ts** - Crea usuarios (base para todo)
   - Prueba el registro de nuevos usuarios
   - Crea usuarios de prueba que se usarán en otras pruebas

2. **login.spec.ts** - Autenticación (requiere usuarios)
   - Prueba el inicio de sesión
   - Requiere que existan usuarios en la BD

3. **verification.spec.ts** - Verificación de email (requiere registro)
   - Prueba la verificación de códigos de email
   - Requiere usuarios registrados con códigos de verificación

4. **password-recovery.spec.ts** - Recuperación de contraseña (requiere login)
   - Prueba la recuperación de contraseña
   - Requiere usuarios autenticados

5. **profile.spec.ts** - Perfil de usuario (requiere login)
   - Prueba la edición de perfil y cambio de contraseña
   - Requiere usuarios autenticados

6. **logout.spec.ts** - Cerrar sesión (requiere login)
   - Prueba el cierre de sesión
   - Requiere usuarios autenticados

## 👥 MÓDULO 2: Gestión de Usuarios (users)

**Orden óptimo basado en dependencias:**

1. **register-moderator.spec.ts** - Registrar moderadores (requiere admin autenticado)
   - Prueba el registro de nuevos moderadores
   - Requiere que un administrador esté autenticado

2. **user-management.spec.ts** - Gestión de usuarios (requiere admin autenticado)
   - Prueba la gestión de usuarios (listar, buscar, etc.)
   - Requiere que un administrador esté autenticado

3. **user-suspension-flow.spec.ts** - Suspensión de usuarios (requiere usuarios y admin)
   - Prueba el flujo completo de suspensión de usuarios
   - Requiere usuarios existentes y administrador autenticado

4. **session-management.spec.ts** - Gestión de sesiones (requiere usuarios autenticados)
   - Prueba la gestión de sesiones de usuario
   - Requiere usuarios autenticados con sesiones activas

## 🛡️ MÓDULO 3: Moderación (moderation)

**Orden óptimo basado en dependencias:**

1. **report-product.spec.ts** - Reportar productos (requiere productos y usuarios)
   - Prueba el reporte de productos
   - Requiere productos existentes y usuarios autenticados

2. **manage-reports.spec.ts** - Gestionar reportes (requiere reportes y moderador)
   - Prueba la gestión de reportes
   - Requiere reportes existentes y moderador autenticado

3. **moderate-products.spec.ts** - Moderar productos (requiere reportes y moderador)
   - Prueba la moderación de productos
   - Requiere reportes existentes y moderador autenticado

## 📦 MÓDULO 4: Productos (products)

**Orden óptimo basado en dependencias (ya tienen orden numérico):**

1. **01-product-creation.spec.ts** - Crear productos (base)
   - Prueba la creación de productos y servicios
   - Base para todas las demás pruebas de productos

2. **02-product-edition.spec.ts** - Editar productos (requiere productos creados)
   - Prueba la edición de productos
   - Requiere productos existentes creados previamente

3. **03-product-deletion.spec.ts** - Eliminar productos (requiere productos creados)
   - Prueba la eliminación de productos
   - Requiere productos existentes creados previamente

4. **04-product-visualization.spec.ts** - Visualizar productos (requiere productos)
   - Prueba la visualización de productos
   - Requiere productos existentes

5. **05-product-appeals.spec.ts** - Apelaciones (requiere productos suspendidos)
   - Prueba las apelaciones de productos suspendidos
   - Requiere productos suspendidos previamente

6. **06-product-reports.spec.ts** - Reportes de productos (requiere productos)
   - Prueba los reportes de productos
   - Requiere productos existentes

7. **07-product-saved.spec.ts** - Productos guardados (requiere productos)
   - Prueba la funcionalidad de guardar productos
   - Requiere productos existentes

8. **08-product-moderation.spec.ts** - Moderación de productos (requiere productos y reportes)
   - Prueba la moderación de productos
   - Requiere productos y reportes existentes

## 🚀 Cómo Ejecutar las Pruebas en Orden

### Opción 1: Usar el Script de Orden (Recomendado)

```bash
# Ejecutar todas las pruebas en orden
npm run test:e2e:ordered

# Con navegador visible
npm run test:e2e:ordered:headed

# En modo debug
npm run test:e2e:ordered:debug

# Con UI interactiva
npm run test:e2e:ordered:ui
```

### Opción 2: Ejecutar Manualmente por Módulo

```bash
# Módulo 1: auth
npx playwright test e2e/flows/auth/register.spec.ts
npx playwright test e2e/flows/auth/login.spec.ts
npx playwright test e2e/flows/auth/verification.spec.ts
npx playwright test e2e/flows/auth/password-recovery.spec.ts
npx playwright test e2e/flows/auth/profile.spec.ts
npx playwright test e2e/flows/auth/logout.spec.ts

# Módulo 2: users
npx playwright test e2e/flows/users/register-moderator.spec.ts
npx playwright test e2e/flows/users/user-management.spec.ts
npx playwright test e2e/flows/users/user-suspension-flow.spec.ts
npx playwright test e2e/flows/users/session-management.spec.ts

# Módulo 3: moderation
npx playwright test e2e/flows/moderation/report-product.spec.ts
npx playwright test e2e/flows/moderation/manage-reports.spec.ts
npx playwright test e2e/flows/moderation/moderate-products.spec.ts

# Módulo 4: products
npx playwright test e2e/flows/products/01-product-creation.spec.ts
npx playwright test e2e/flows/products/02-product-edition.spec.ts
npx playwright test e2e/flows/products/03-product-deletion.spec.ts
npx playwright test e2e/flows/products/04-product-visualization.spec.ts
npx playwright test e2e/flows/products/05-product-appeals.spec.ts
npx playwright test e2e/flows/products/06-product-reports.spec.ts
npx playwright test e2e/flows/products/07-product-saved.spec.ts
npx playwright test e2e/flows/products/08-product-moderation.spec.ts
```

## ⚠️ Notas Importantes

1. **Dependencias entre pruebas**: Algunas pruebas dependen de que otras se hayan ejecutado primero. Por ejemplo, las pruebas de productos requieren que existan usuarios autenticados.

2. **Estado de la base de datos**: Algunas pruebas pueden modificar el estado de la base de datos. Asegúrate de tener un script de restauración de datos si es necesario.

3. **Usuarios de prueba**: Asegúrate de que los usuarios de prueba existan en la base de datos antes de ejecutar las pruebas:
   - `comprador@test.com` / `password123`
   - `vendedor@test.com` / `password123`
   - `moderador@test.com` / `password123`
   - `admin@test.com` / `password123`

4. **Orden dentro de cada archivo**: Algunos archivos usan `test.describe.serial` para ejecutar las pruebas dentro del archivo en orden secuencial.

## 🔧 Solución de Problemas

Si una prueba falla, el script continuará ejecutando las siguientes pruebas. Para detener en el primer error, modifica el script `run-tests-ordered.js` y descomenta la línea `process.exit(1)` en el bloque catch.

