# Análisis: ¿Por qué hay 127 pruebas en lugar de 125?

## Conteo Esperado

Según CF0001-CF0125:
- **CF0001-CF0004**: 4 pruebas (Smoke Tests)
- **CF0005-CF0050**: 46 pruebas (Autenticación y Moderación)
- **CF0051-CF0061**: 11 pruebas (Reportes y Apelaciones)
- **CF-0062-CF-0125**: 64 pruebas (Productos/Servicios)

**Total esperado: 125 pruebas**

## Conteo Real

Según el grep de `it(` statements:
- **smoke.test.js**: 4 pruebas
- **register.test.js**: 9 pruebas
- **login.test.js**: 9 pruebas
- **password-reset.test.js**: 6 pruebas
- **profile.test.js**: 10 pruebas
- **user-management.test.js**: 12 pruebas
- **reports.test.js**: 13 pruebas ← **AQUÍ ESTÁ EL PROBLEMA**
- **products-crud.test.js**: 20 pruebas
- **products-filters.test.js**: 8 pruebas
- **products-content-detection.test.js**: 4 pruebas
- **products-appeals.test.js**: 6 pruebas
- **products-dangerous.test.js**: 6 pruebas
- **products-reports.test.js**: 5 pruebas
- **products-saved.test.js**: 4 pruebas
- **products-moderation.test.js**: 5 pruebas
- **products-services.test.js**: 6 pruebas

**Total real: 127 pruebas**

## 🔍 Pruebas Adicionales Identificadas

### Prueba Extra #1: CP-010 segunda prueba (reports.test.js)

En `reports.test.js`, el bloque `CP-010: Crear Apelación` tiene **2 pruebas**:

1. **Línea 493**: `debe permitir a un vendedor crear una apelación para su producto rechazado`
   - ✅ Esta corresponde a **CF0059**

2. **Línea 519**: `debe rechazar crear una segunda apelación para el mismo producto`
   - ❌ **ESTA ES UNA PRUEBA ADICIONAL** que no está en la lista CF0001-CF0125

### Prueba Extra #2: Posible duplicación de apelaciones

Hay pruebas de apelaciones en **DOS archivos diferentes**:

1. **`reports.test.js`** (CP-010, CP-011, CP-012):
   - CP-010: Crear apelación (2 pruebas)
   - CP-011: Resolver apelación - aprobar
   - CP-012: Resolver apelación - rechazar

2. **`products-appeals.test.js`** (CF-095 a CF-100):
   - CF-095: Crear apelación
   - CF-096: Rechazar apelación para producto peligroso
   - CF-097: Rechazar apelación sin ser propietario
   - CF-098: Verificar cambio de estado
   - CF-099: Moderador aprueba apelación
   - CF-100: Moderador rechaza apelación

**Problema**: Las apelaciones están cubiertas en ambos archivos, lo que podría estar causando duplicación.

## 📊 Mapeo de Apelaciones

### En reports.test.js (moderation):
- **CP-010** (línea 493): Crear apelación → **CF0059** ✅
- **CP-010** (línea 519): Rechazar segunda apelación → **NO TIENE CF** ❌ **EXTRA**
- **CP-011** (línea 548): Aprobar apelación → **CF0060** ✅
- **CP-012** (línea 588): Rechazar apelación → **CF0061** ✅

### En products-appeals.test.js:
- **CF-095**: Crear apelación → **CF-0094** ✅
- **CF-096**: Rechazar apelación peligroso → **CF-0095** ✅
- **CF-097**: Rechazar apelación sin propietario → **CF-0096** ✅
- **CF-098**: Verificar cambio estado → **CF-0097** ✅
- **CF-099**: Moderador aprueba → **CF-0098** ✅
- **CF-100**: Moderador rechaza → **CF-0099** ✅

## ✅ Conclusión

Las **2 pruebas adicionales** son:

1. **`reports.test.js:519`**: "debe rechazar crear una segunda apelación para el mismo producto"
   - Esta prueba está dentro de CP-010 pero no tiene un CF asignado
   - Es una validación adicional que no estaba en la lista original

2. **Posible duplicación**: Las apelaciones están cubiertas tanto en `reports.test.js` (moderation) como en `products-appeals.test.js` (products), pero revisando el mapeo, parecen cubrir casos diferentes:
   - `reports.test.js` cubre CF0059-CF0061 (reportes y apelaciones desde moderación)
   - `products-appeals.test.js` cubre CF-0094-CF-0099 (apelaciones desde productos)
   
   Sin embargo, hay solapamiento funcional.

## 🔧 Recomendación

Para tener exactamente 125 pruebas, se debe:

1. **Eliminar o comentar** la segunda prueba de CP-010 en `reports.test.js` (línea 519)
   - O asignarle un nuevo número CF si se considera necesaria

2. **Verificar** si hay duplicación real entre `reports.test.js` y `products-appeals.test.js` en las pruebas de apelación, y consolidar si es necesario.

