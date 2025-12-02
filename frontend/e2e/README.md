# Pruebas E2E - Sistema de Ventas

Este directorio contiene las pruebas end-to-end (E2E) del sistema usando Playwright.

## Estructura

```
e2e/
├── fixtures/          # Helpers y datos de prueba
│   ├── auth.ts        # Helper de autenticación
│   └── test-data.ts   # Datos de prueba centralizados
├── pages/             # Page Object Models
    │   ├── LoginPage.ts
    │   ├── RegisterPage.ts
    │   ├── VerifyCodePage.ts
    │   ├── ForgotPasswordPage.ts
    │   ├── ResetPasswordPage.ts
    │   ├── ProfilePage.ts
    │   ├── UserManagementPage.ts
    │   ├── SessionManagementPage.ts
    │   ├── RegisterModeratorPage.ts
    │   ├── CreateProductPage.ts
    │   ├── MyProductsPage.ts
    │   ├── ProductCatalogPage.ts
    │   ├── ProductDetailPage.ts
    │   ├── ProductModerationPage.ts
    │   ├── ReportsManagementPage.ts
    │   └── SavedProductsPage.ts
└── flows/             # Tests organizados por flujos
    ├── auth/          # Tests de autenticación
    │   ├── login.spec.ts
    │   ├── register.spec.ts
    │   ├── verification.spec.ts
    │   ├── password-recovery.spec.ts
    │   ├── profile.spec.ts
    │   └── logout.spec.ts
    ├── users/         # Tests de gestión de usuarios
    │   ├── user-management.spec.ts
    │   ├── session-management.spec.ts
    │   ├── register-moderator.spec.ts
    │   └── user-suspension-flow.spec.ts
    ├── products/      # Tests de productos/servicios
    │   ├── product-creation.spec.ts
    │   ├── product-edition.spec.ts
    │   ├── product-deletion.spec.ts
    │   ├── product-visualization.spec.ts
    │   ├── product-appeals.spec.ts
    │   ├── product-reports.spec.ts
    │   ├── product-saved.spec.ts
    │   └── product-moderation.spec.ts
    └── moderation/   # Tests de moderación
        ├── manage-reports.spec.ts
        ├── moderate-products.spec.ts
        └── report-product.spec.ts
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `frontend/` con las siguientes variables:

```env
# Base de Datos (requerido para tests que acceden a la BD)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres

# Usuarios de prueba para E2E
E2E_COMPRADOR_EMAIL=comprador@test.com
E2E_VENDEDOR_EMAIL=vendedor@test.com
E2E_MODERADOR_EMAIL=moderador@test.com
E2E_ADMIN_EMAIL=admin@test.com
E2E_PASSWORD=password123
```

**Nota importante**: Las variables de base de datos (`DB_*`) son necesarias para tests que requieren acceso directo a la base de datos, como los tests de recuperación de contraseña que obtienen códigos de reset desde la BD.

### Preparar Base de Datos

Antes de ejecutar los tests, asegúrate de tener usuarios de prueba en la base de datos:

- **Comprador**: `comprador@test.com` / `password123`
- **Vendedor**: `vendedor@test.com` / `password123`
- **Moderador**: `moderador@test.com` / `password123`
- **Administrador**: `admin@test.com` / `password123`

## Ejecutar Tests

### Todos los tests
```bash
npm run test:e2e
```

### Tests en modo UI (interactivo)
```bash
npm run test:e2e:ui
```

### Tests en modo debug
```bash
npm run test:e2e:debug
```

### Tests con navegador visible
```bash
npm run test:e2e:headed
```

### Tests específicos
```bash
npx playwright test e2e/flows/auth/login.spec.ts
```

### Ver reporte HTML
```bash
npm run test:e2e:report
```

## Tests Implementados

### Autenticación

- ✅ Login con credenciales válidas/inválidas
- ✅ Registro de nuevos usuarios (comprador/vendedor)
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Cambio de contraseña en perfil
- ✅ Edición de perfil
- ✅ Cerrar sesión

### Gestión de Usuarios (Admin)

- ✅ Listar usuarios con filtros
- ✅ Buscar usuarios
- ✅ Suspender usuarios
- ✅ Activar usuarios suspendidos
- ✅ Ver sesiones de usuario
- ✅ Cerrar sesiones individuales
- ✅ Cerrar todas las sesiones de un usuario
- ✅ Registrar nuevos moderadores

### Productos/Servicios

#### Creación (SIS-059 a SIS-064)
- ✅ Crear producto exitosamente como vendedor
- ✅ Crear servicio con campos específicos
- ✅ Redirigir a login si no está autenticado
- ✅ Denegar acceso a comprador
- ✅ Validar campos requeridos
- ✅ Validar código duplicado

#### Edición (SIS-065 a SIS-068)
- ✅ Editar producto propio exitosamente
- ✅ Denegar edición de producto de otro vendedor
- ✅ Bloquear edición de producto peligroso
- ✅ Bloquear edición de producto suspendido

#### Eliminación (SIS-069 a SIS-071)
- ✅ Eliminar producto propio exitosamente
- ✅ Bloquear eliminación de producto peligroso por vendedor
- ✅ Administrador puede eliminar producto peligroso

#### Visualización (SIS-072 a SIS-074)
- ✅ Mostrar solo productos activos en catálogo público
- ✅ Mostrar información completa de producto activo
- ✅ Ocultar producto peligroso del público

#### Apelaciones (SIS-075 a SIS-077)
- ✅ Crear apelación para producto rechazado
- ✅ Crear apelación para producto suspendido
- ✅ Bloquear apelación de producto peligroso

#### Reportes (SIS-078 a SIS-080)
- ✅ Comprador puede reportar producto
- ✅ Producto reportado sigue visible en catálogo
- ✅ Moderador puede rechazar reporte

#### Productos Guardados (SIS-081 a SIS-083)
- ✅ Guardar producto en favoritos
- ✅ Eliminar producto de favoritos
- ✅ Mostrar lista de productos guardados

#### Moderación (SIS-084, SIS-085)
- ✅ Moderador puede aprobar producto
- ✅ Moderador puede rechazar producto
- ✅ Moderador puede suspender producto activo

### Flujos Completos

- ✅ Flujo completo de suspensión y reactivación de usuario

## Notas Importantes

1. **Tests que requieren códigos reales**: Algunos tests están marcados con `test.skip()` porque requieren códigos reales de verificación o recuperación de contraseña. Estos pueden implementarse con helpers que obtengan los códigos directamente de la base de datos.

2. **Datos de prueba**: Los tests generan emails y cédulas únicos para evitar conflictos. Asegúrate de limpiar la base de datos periódicamente.

3. **Servidor de desarrollo**: Los tests esperan que el servidor de desarrollo esté corriendo en `http://localhost:5173`. Playwright lo inicia automáticamente si no está corriendo.

4. **Base de datos**: Los tests asumen que existe una base de datos con usuarios de prueba. Considera usar una base de datos de prueba separada.

## Próximos Pasos

- [x] Implementar helpers para obtener códigos de verificación de la BD
- [x] Agregar tests de moderación de productos
- [x] Agregar tests de apelaciones
- [ ] Agregar tests de búsqueda y filtros
- [ ] Configurar CI/CD para ejecutar tests automáticamente


