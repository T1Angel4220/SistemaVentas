# Pruebas E2E - Módulo de Moderación/Reportes

Este directorio contiene las pruebas end-to-end (E2E) para el módulo de moderación y reportes del Sistema de Ventas.

## Descripción

Las pruebas cubren todas las funcionalidades del módulo de reportes:
- Creación de reportes
- Visualización de reportes
- Resolución de reportes
- Filtrado y búsqueda
- Validaciones y permisos
- Estadísticas

## Estructura

```
flows/reports/
├── reports.spec.ts          # Archivo principal con las 20 pruebas
└── README.md                # Este archivo

pages/
├── ReportsManagementPage.ts # Page Object para gestión de reportes
└── ProductDetailPage.ts     # Page Object para detalle de producto

fixtures/
└── reports-test-data.ts     # Datos de prueba para reportes

utils/
└── reports-api-helper.ts    # Helper para operaciones API de reportes
```

## Pruebas Implementadas

### Grupo 1: Creación de Reportes (7 pruebas)
- ✅ PRUEBA 1: Crear Reporte Exitoso - Comprador
- ✅ PRUEBA 2: Crear Reporte - Validación de Motivo Mínimo
- ✅ PRUEBA 3: Crear Reporte - Tipo de Reporte Inválido
- ✅ PRUEBA 4: Crear Reporte - Producto No Encontrado
- ⏭️ PRUEBA 5: Crear Reporte - Auto-Reporte (Comprador) (requiere setup adicional)
- ✅ PRUEBA 6: Crear Reporte - Reporte Duplicado
- ✅ PRUEBA 7: Crear Reporte - Moderador Reporta Producto

### Grupo 2: Visualización de Reportes (6 pruebas)
- ✅ PRUEBA 8: Ver Reportes Pendientes - Moderador
- ✅ PRUEBA 9: Ver Reportes Pendientes - Sin Permisos
- ✅ PRUEBA 10: Filtrar Reportes por Tipo
- ✅ PRUEBA 11: Filtrar Reportes por Estado
- ✅ PRUEBA 18: Ver Mis Reportes - Usuario
- ✅ PRUEBA 19: Ver Reportes de Producto - Propietario

### Grupo 3: Resolución de Reportes (6 pruebas)
- ⏭️ PRUEBA 12: Resolver Reporte - Aprobar (requiere setup de reportes)
- ⏭️ PRUEBA 13: Resolver Reporte - Rechazar (requiere setup de reportes)
- ⏭️ PRUEBA 14: Resolver Reporte - Suspender (requiere setup de reportes)
- ⏭️ PRUEBA 15: Resolver Reporte - Marcar como Peligroso (requiere setup de reportes)
- ⏭️ PRUEBA 16: Resolver Reporte - Validación Explicación Mínima (requiere setup)
- ✅ PRUEBA 17: Resolver Reporte - Reporte Ya Resuelto

### Grupo 4: Estadísticas y Otros (3 pruebas)
- ✅ PRUEBA 20: Estadísticas de Reportes
- ✅ PRUEBA 21: Interfaz Usuario - Visualización Reportes
- ✅ PRUEBA 22: Acceso No Autenticado

**Total: 22 pruebas** (16 completamente funcionales, 6 requieren setup adicional)

## Ejecutar las Pruebas

### Ejecutar todas las pruebas E2E

```bash
npm run test:e2e
```

### Ejecutar solo las pruebas de reportes

```bash
npm run test:e2e:reports
```

### Ejecutar con interfaz UI (recomendado para desarrollo)

```bash
npm run test:e2e:reports:ui
```

### Ejecutar en modo debug

```bash
npm run test:e2e:reports:debug
```

### Ejecutar en modo headed (ver el navegador)

```bash
npm run test:e2e:reports:headed
```

### Ver reporte HTML

```bash
npm run test:e2e:report
```

## Pre-requisitos

### 1. Base de Datos

Asegúrate de tener usuarios de prueba en la base de datos:

- **Comprador**: `comprador@test.com` / `password123`
- **Vendedor**: `vendedor@test.com` / `password123`
- **Moderador**: `moderador@test.com` / `password123`
- **Administrador**: `admin@test.com` / `password123`

### 2. Productos de Prueba

Las pruebas asumen que existe al menos un producto activo en el sistema (ID = 1). Si no existe, puedes:

1. Crear productos de prueba usando el script:
   ```bash
   cd backend
   node insert-test-products.js
   ```

2. O modificar `testProductId` en el archivo de pruebas.

### 3. Servidores en Ejecución

- **Frontend**: Debe estar corriendo en `http://localhost:5173`
- **Backend**: Debe estar corriendo en `http://localhost:3001`

El servidor frontend se inicia automáticamente con Playwright, pero el backend debe estar corriendo manualmente.

## Variables de Entorno

Asegúrate de tener un archivo `.env` en `frontend/` con:

```env
E2E_COMPRADOR_EMAIL=comprador@test.com
E2E_VENDEDOR_EMAIL=vendedor@test.com
E2E_MODERADOR_EMAIL=moderador@test.com
E2E_ADMIN_EMAIL=admin@test.com
E2E_PASSWORD=password123
```

## Notas Importantes

### Pruebas que requieren setup adicional

Algunas pruebas están marcadas con `test.skip()` porque requieren:
- Productos creados por usuarios específicos
- Reportes en estados específicos
- Configuración adicional de base de datos

Para completar estas pruebas:
1. Crear helpers para setup de productos
2. Crear helpers para setup de reportes en diferentes estados
3. Implementar cleanup entre pruebas

### Dependencias entre pruebas

Las pruebas están diseñadas para ser independientes, pero algunas pueden depender de:
- Datos existentes en la BD
- Estado previo de reportes

Se recomienda limpiar datos de prueba entre ejecuciones o usar una BD de pruebas separada.

## Troubleshooting

### Las pruebas fallan con "No hay productos"

1. Verifica que hay productos activos en la base de datos
2. Actualiza `testProductId` en el archivo de pruebas
3. Crea productos de prueba usando el script mencionado

### Las pruebas fallan con "No autenticado"

1. Verifica que los usuarios de prueba existen
2. Verifica las credenciales en `.env`
3. Verifica que el backend está corriendo

### Las pruebas fallan con timeout

1. Aumenta los timeouts en `playwright.config.ts`
2. Verifica que los servidores están respondiendo correctamente
3. Ejecuta en modo `headed` para ver qué está pasando

## Estructura de las Pruebas

Cada prueba sigue este patrón:

```typescript
test('Nombre de la Prueba', async ({ page }) => {
  // 1. Setup - Login, navegación inicial
  await authHelper.loginAs('comprador');
  
  // 2. Acción - Interactuar con la UI
  await productPage.createReport(...);
  
  // 3. Verificación - Validar resultado
  expect(result).toBeTruthy();
});
```

## Contribuir

Para agregar nuevas pruebas:

1. Agregar el test case en `reports.spec.ts`
2. Si es necesario, agregar métodos en los Page Objects
3. Agregar datos de prueba en `reports-test-data.ts`
4. Documentar en este README

## Referencias

- [Documentación de Playwright](https://playwright.dev/)
- [Especificación de Pruebas](./PRUEBAS_SISTEMA_REPORTES.md) (ver archivo en backend/test/reportes/)



