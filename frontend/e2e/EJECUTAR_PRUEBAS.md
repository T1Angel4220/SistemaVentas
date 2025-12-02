# 🚀 Guía Rápida para Ejecutar Pruebas E2E

## ⚡ Comando Principal (Con UI Visible)

Para ver el navegador mientras se ejecutan las pruebas:

```bash
cd frontend
npx playwright test e2e/flows/moderation --headed
```

## 📋 Comandos por Categoría

### Todas las Pruebas de Moderación
```bash
npx playwright test e2e/flows/moderation --headed
```

### Solo Reportes de Productos (PR-001 a PR-005)
```bash
npx playwright test e2e/flows/moderation/report-product.spec.ts --headed
```

### Solo Gestión de Reportes (PR-006 a PR-013)
```bash
npx playwright test e2e/flows/moderation/manage-reports.spec.ts --headed
```

### Solo Moderación de Productos (PR-014 a PR-020)
```bash
npx playwright test e2e/flows/moderation/moderate-products.spec.ts --headed
```

## 🔍 Modo Debug (Recomendado para Desarrollo)

```bash
npx playwright test e2e/flows/moderation --headed --debug
```

Este modo:
- Pausa la ejecución en cada paso
- Permite inspeccionar el estado
- Permite avanzar paso a paso

## 🎨 Interfaz Gráfica (UI Mode)

```bash
npx playwright test --ui
```

Luego selecciona las pruebas que quieres ejecutar desde la interfaz visual.

## 🐌 Modo Lento (Para Ver Mejor)

```bash
npx playwright test e2e/flows/moderation --headed --slow-mo=1000
```

Ralentiza las acciones 1 segundo para ver mejor qué está pasando.

## 📊 Ver Reporte Después de Ejecutar

```bash
npx playwright show-report
```

Muestra un reporte HTML interactivo con:
- Screenshots de fallos
- Videos de la ejecución
- Trazas detalladas

## ⚙️ Pre-requisitos

1. ✅ Backend corriendo en `http://localhost:3001`
2. ✅ Frontend corriendo en `http://localhost:5173`
3. ✅ Base de datos con usuarios de prueba:
   - comprador@test.com
   - vendedor@test.com
   - moderador@test.com
   - admin@test.com

## 🔧 Solución de Problemas

### Las pruebas no encuentran elementos
- Aumenta el timeout: `--timeout=120000`
- Ejecuta en modo lento: `--slow-mo=2000`

### El navegador se cierra muy rápido
- Usa `--headed` para verlo
- Usa `--debug` para pausar

### Error de conexión
- Verifica que el backend y frontend estén corriendo
- Revisa las URLs en `playwright.config.ts`

## 📝 Ejecutar Prueba Individual

```bash
npx playwright test e2e/flows/moderation/report-product.spec.ts -g "PR-001" --headed
```

El flag `-g` filtra por el nombre del test.

