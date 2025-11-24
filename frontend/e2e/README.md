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
│   └── RegisterModeratorPage.ts
└── flows/             # Tests organizados por flujos
    ├── auth/          # Tests de autenticación
    │   ├── login.spec.ts
    │   ├── register.spec.ts
    │   ├── verification.spec.ts
    │   ├── password-recovery.spec.ts
    │   ├── profile.spec.ts
    │   └── logout.spec.ts
    └── users/         # Tests de gestión de usuarios
        ├── user-management.spec.ts
        ├── session-management.spec.ts
        ├── register-moderator.spec.ts
        └── user-suspension-flow.spec.ts
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `frontend/` con las siguientes variables:

```env
# Usuarios de prueba para E2E
E2E_COMPRADOR_EMAIL=comprador@test.com
E2E_VENDEDOR_EMAIL=vendedor@test.com
E2E_MODERADOR_EMAIL=moderador@test.com
E2E_ADMIN_EMAIL=admin@test.com
E2E_PASSWORD=password123
```

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

### Flujos Completos

- ✅ Flujo completo de suspensión y reactivación de usuario

## Notas Importantes

1. **Tests que requieren códigos reales**: Algunos tests están marcados con `test.skip()` porque requieren códigos reales de verificación o recuperación de contraseña. Estos pueden implementarse con helpers que obtengan los códigos directamente de la base de datos.

2. **Datos de prueba**: Los tests generan emails y cédulas únicos para evitar conflictos. Asegúrate de limpiar la base de datos periódicamente.

3. **Servidor de desarrollo**: Los tests esperan que el servidor de desarrollo esté corriendo en `http://localhost:5173`. Playwright lo inicia automáticamente si no está corriendo.

4. **Base de datos**: Los tests asumen que existe una base de datos con usuarios de prueba. Considera usar una base de datos de prueba separada.

## Próximos Pasos

- [ ] Implementar helpers para obtener códigos de verificación de la BD
- [ ] Agregar tests de moderación de productos
- [ ] Agregar tests de apelaciones
- [ ] Agregar tests de búsqueda y filtros
- [ ] Configurar CI/CD para ejecutar tests automáticamente

