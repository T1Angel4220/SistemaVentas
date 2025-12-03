# Comandos para Ejecutar Pruebas E2E

## Comandos Básicos

### Ejecutar un archivo de prueba específico (sin abrir navegador)
```bash
cd frontend
npx playwright test e2e/flows/users/session-management.spec.ts --workers=1
```

### Ejecutar un archivo de prueba específico (CON navegador visible)
```bash
cd frontend
npx playwright test e2e/flows/users/session-management.spec.ts --workers=1 --headed
```

### Ejecutar todas las pruebas en orden (sin navegador)
```bash
cd frontend
npm run test:e2e:ordered
```

### Ejecutar todas las pruebas en orden (CON navegador visible)
```bash
cd frontend
npm run test:e2e:ordered:headed
```

## Comandos Útiles por Módulo

### Auth (Autenticación)
```bash
# Con navegador visible
npx playwright test e2e/flows/auth --workers=1 --headed

# Sin navegador
npx playwright test e2e/flows/auth --workers=1
```

### Users (Usuarios)
```bash
# Con navegador visible
npx playwright test e2e/flows/users --workers=1 --headed

# Sin navegador
npx playwright test e2e/flows/users --workers=1
```

### Moderation (Moderación)
```bash
# Con navegador visible
npx playwright test e2e/flows/moderation --workers=1 --headed

# Sin navegador
npx playwright test e2e/flows/moderation --workers=1
```

### Products (Productos)
```bash
# Con navegador visible
npx playwright test e2e/flows/products --workers=1 --headed

# Sin navegador
npx playwright test e2e/flows/products --workers=1
```

## Comandos Específicos por Archivo

### Session Management (Gestión de Sesiones)
```bash
# Con navegador visible
npx playwright test e2e/flows/users/session-management.spec.ts --workers=1 --headed

# Sin navegador
npx playwright test e2e/flows/users/session-management.spec.ts --workers=1
```

## Modo Debug

```bash
# Con navegador visible y modo debug (pausa en cada paso)
npx playwright test e2e/flows/users/session-management.spec.ts --workers=1 --headed --debug
```

## Modo UI (Interactivo)

```bash
# Abre la interfaz gráfica de Playwright para seleccionar pruebas
npx playwright test --ui
```

## Ver Reporte HTML

```bash
# Después de ejecutar las pruebas
npx playwright show-report
```

