# 🔄 Suspensión Automática de Productos

## ✅ Funcionalidad Implementada

Se ha implementado un **sistema de suspensión automática** que suspende productos en estado `pendiente_revision` que han excedido **1 día** sin ser revisados por moderadores.

---

## 🎯 Objetivo

Garantizar que los productos pendientes de moderación no permanezcan indefinidamente sin revisar, mejorando la gestión y calidad del contenido en la plataforma.

---

## 🔧 Componentes Implementados

### 1. **Función de Suspensión Automática**
- **Ubicación**: `backend/src/controllers/productsController.js`
- **Función**: `suspenderProductosExpirados()`
- **Descripción**: Busca y suspende productos que llevan más de 1 día en `pendiente_revision`

### 2. **Tarea Programada (Cron Job)**
- **Ubicación**: `backend/index.ts`
- **Frecuencia**: Diaria a las 02:00 AM (hora de Costa Rica)
- **Formato Cron**: `0 2 * * *`

### 3. **Script de Prueba Manual**
- **Ubicación**: `backend/test-auto-suspend.js`
- **Ejecución**: `node test-auto-suspend.js` o `test-auto-suspend.bat`

---

## 📋 Lógica de Funcionamiento

### Criterios de Suspensión
1. Estado del producto: `pendiente_revision`
2. Tiempo transcurrido: Más de 1 día (24 horas) desde `fecha_publicacion`
3. Exclusión: Productos marcados como `es_peligroso = true` (estos se manejan manualmente)

### Acciones Automáticas
1. **Cambiar estado**: `pendiente_revision` → `suspendido`
2. **Establecer motivo**: Mensaje indicando suspensión automática por tiempo expirado
3. **Actualizar fechas**: `fecha_revision` y `fecha_actualizacion` a la hora actual
4. **Registrar auditoría**: Entrada en `acciones_moderacion` con `moderador_id = NULL` (indicando acción automática)

---

## 🔍 Ejemplo de Funcionamiento

```sql
-- Producto creado el 2024-01-10 10:00:00
-- Si hoy es 2024-01-11 10:01:00 o posterior
-- → Producto será suspendido automáticamente

UPDATE items 
SET estado = 'suspendido',
    motivo_rechazo = 'Producto suspendido automáticamente por exceder el tiempo límite de revisión (1 día)...',
    fecha_revision = CURRENT_TIMESTAMP
WHERE id = X AND estado = 'pendiente_revision' 
AND fecha_publicacion < CURRENT_TIMESTAMP - INTERVAL '1 day';
```

---

## 🧪 Pruebas

### Prueba Manual
```bash
# Desde la carpeta backend
node test-auto-suspend.js

# O en Windows
test-auto-suspend.bat
```

### Prueba Automática
La tarea se ejecuta automáticamente todos los días a las 02:00 AM. Los logs se muestran en la consola del servidor.

---

## 📊 Logs y Monitoreo

La función genera logs detallados:

```
🔄 === INICIANDO SUSPENSIÓN AUTOMÁTICA DE PRODUCTOS ===
⏰ Fecha/Hora: 2024-01-11T02:00:00.000Z
📋 Encontrados 3 producto(s) pendiente(s) por más de 1 día
  ✓ Producto #5 "Producto Test 1" suspendido (1 días pendiente)
  ✓ Producto #8 "Producto Test 2" suspendido (2 días pendiente)
  ✓ Producto #12 "Producto Test 3" suspendido (1 días pendiente)

✅ Suspensión automática completada: 3 producto(s) suspendido(s)
```

---

## ⚙️ Configuración

### Cambiar Frecuencia del Cron
Editar en `backend/index.ts`:

```typescript
// Actual (diaria a las 02:00 AM)
cron.schedule('0 2 * * *', ...)

// Cada hora (para pruebas)
cron.schedule('0 * * * *', ...)

// Cada 6 horas
cron.schedule('0 */6 * * *', ...)
```

### Cambiar Tiempo Límite
Editar en `backend/src/controllers/productsController.js`:

```sql
-- Actual (1 día)
AND fecha_publicacion < CURRENT_TIMESTAMP - INTERVAL '1 day'

-- 2 días
AND fecha_publicacion < CURRENT_TIMESTAMP - INTERVAL '2 days'

-- 12 horas
AND fecha_publicacion < CURRENT_TIMESTAMP - INTERVAL '12 hours'
```

---

## 🔐 Seguridad y Auditoría

### Registro de Acciones
Todas las suspensiones automáticas se registran en `acciones_moderacion`:
- `moderador_id`: `NULL` (indica acción automática)
- `accion`: `'suspension_automatica_tiempo_expirado'`
- `tabla_afectada`: `'items'`
- `registro_id`: ID del producto suspendido
- `detalles`: Mensaje descriptivo con días pendiente

### Consultar Suspensiones Automáticas
```sql
SELECT * FROM acciones_moderacion 
WHERE accion = 'suspension_automatica_tiempo_expirado'
ORDER BY fecha_accion DESC;
```

---

## 📝 Notas Importantes

1. **Productos Peligrosos**: Los productos con `es_peligroso = true` **NO** se suspenden automáticamente (requieren revisión manual)

2. **Apelaciones**: Los productos suspendidos automáticamente pueden ser apelados por el vendedor

3. **Tiempo de Ejecución**: El cron se ejecuta una vez al día, por lo que un producto podría estar pendiente hasta 25 horas antes de ser suspendido

4. **Zona Horaria**: Ajustar la zona horaria en `index.ts` según tu ubicación:
   ```typescript
   timezone: "America/Costa_Rica" // Cambiar según necesidad
   ```

---

## ✅ Checklist de Verificación

- [x] ✅ Función de suspensión automática implementada
- [x] ✅ Cron job configurado (diario a las 02:00 AM)
- [x] ✅ Script de prueba manual creado
- [x] ✅ Registro en auditoría con `moderador_id = NULL`
- [x] ✅ Exclusión de productos peligrosos
- [x] ✅ Logs detallados para monitoreo
- [x] ✅ Manejo de errores robusto
- [x] ✅ Documentación completa

---

## 🚀 Próximos Pasos Sugeridos

1. **Notificaciones por Email**: Enviar email al vendedor cuando su producto sea suspendido automáticamente
2. **Dashboard de Estadísticas**: Mostrar cuántos productos fueron suspendidos automáticamente
3. **Configuración Administrativa**: Permitir cambiar el tiempo límite desde el panel de administración
4. **Advertencias Previas**: Notificar al vendedor cuando el producto está cerca del límite de tiempo

---

**Fecha de implementación**: 2024  
**Estado**: ✅ Completado y Funcional  
**Versión**: 1.0
