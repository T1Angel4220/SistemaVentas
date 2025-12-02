# Comandos para Ejecutar Pruebas E2E

## Ejecutar Todas las Pruebas de Moderación

```bash
cd frontend
npx playwright test e2e/flows/moderation
```

## Ejecutar con UI Visible (Headed Mode)

Para ver el navegador mientras se ejecutan las pruebas:

```bash
cd frontend
npx playwright test e2e/flows/moderation --headed
```

O usando la configuración de proyectos:

```bash
cd frontend
npx playwright test e2e/flows/moderation --headed --project=chromium
```

## Ejecutar una Prueba Específica

### Ejecutar solo las pruebas de reportes de productos (PR-001 a PR-005):
```bash
npx playwright test e2e/flows/moderation/report-product.spec.ts --headed
```

### Ejecutar solo las pruebas de gestión de reportes (PR-006 a PR-013):
```bash
npx playwright test e2e/flows/moderation/manage-reports.spec.ts --headed
```

### Ejecutar solo las pruebas de moderación de productos (PR-014 a PR-020):
```bash
npx playwright test e2e/flows/moderation/moderate-products.spec.ts --headed
```

## Ejecutar una Prueba Individual

```bash
npx playwright test e2e/flows/moderation/report-product.spec.ts -g "PR-001" --headed
```

## Modo Debug (Pausar en cada paso)

```bash
npx playwright test e2e/flows/moderation --debug
```

## Modo UI (Interfaz Gráfica de Playwright)

```bash
npx playwright test --ui
```

Luego selecciona las pruebas que quieres ejecutar desde la interfaz.

## Ver Reporte HTML

Después de ejecutar las pruebas:

```bash
npx playwright show-report
```

## Opciones Adicionales Útiles

### Ejecutar con timeouts aumentados:
```bash
npx playwright test e2e/flows/moderation --headed --timeout=120000
```

### Ejecutar en modo lento (para ver mejor):
```bash
npx playwright test e2e/flows/moderation --headed --slow-mo=1000
```

### Ejecutar con captura de video:
```bash
npx playwright test e2e/flows/moderation --headed --video=on
```

## Variables de Entorno

Las pruebas requieren que el backend esté corriendo en `http://localhost:3001` y el frontend en `http://localhost:5173`.

Si usas puertos diferentes, puedes configurarlos en `playwright.config.ts` o usar variables de entorno.

## Notas

- El modo `--headed` muestra el navegador durante la ejecución
- El modo `--debug` pausa la ejecución y permite inspeccionar el estado
- El modo `--ui` abre una interfaz gráfica para seleccionar y ejecutar pruebas
- Usa `--slow-mo=1000` para ralentizar las acciones y ver mejor qué está pasando

