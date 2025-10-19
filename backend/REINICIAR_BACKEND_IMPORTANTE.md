# ⚠️ IMPORTANTE: REINICIAR BACKEND

## 🚨 Cambios Críticos que Requieren Reinicio

Se han realizado cambios en el **BACKEND** que requieren reiniciar el servidor para que funcionen:

### 1. Productos pendientes de moderación ahora permiten contacto
**Archivo:** `backend/src/controllers/productsController.js`
**Línea:** 426

**Cambio:**
```javascript
// ❌ ANTES: Solo productos activos
WHERE i.id = $1 AND i.estado = 'activo'

// ✅ AHORA: Activos, pendientes e inactivos
WHERE i.id = $1 AND i.estado IN ('activo', 'pendiente_revision', 'inactivo')
```

### 2. Endpoint getProductById ahora devuelve todos los datos del vendedor
**Archivo:** `backend/src/controllers/productsController.js`
**Línea:** 338-351

**Cambio:** Se agregaron campos adicionales del vendedor:
- `vendedor_apellido`
- `vendedor_correo`
- `vendedor_telefono`
- `vendedor_direccion`

### 3. Paginación de productos en moderación corregida
**Archivo:** `backend/src/controllers/productsController.js`
**Líneas:** 1051-1124

**Problema:** Los placeholders SQL para LIMIT y OFFSET estaban mal construidos.

**Cambio:**
```javascript
// ❌ ANTES:
LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}

// ✅ AHORA:
limitPlaceholder = '$2'; // o '$1' según el caso
offsetPlaceholder = '$3'; // o '$2' según el caso
```

**Mejoras:**
- Límite por defecto cambiado de 10 a 12 productos
- Se agregaron `has_next` y `has_prev` a la respuesta
- Se asegura que page y limit sean números con `parseInt()`

---

## 🔧 Cómo Reiniciar el Backend

### Opción 1: Manualmente
```bash
# En la terminal del backend:
# 1. Presiona Ctrl + C para detener
# 2. Espera que se detenga completamente
# 3. Ejecuta:
npm start
```

### Opción 2: Script (si lo tienes)
```bash
cd backend
reiniciar-backend.bat
```

---

## ✅ Verificar que Funciona

Después de reiniciar el backend:

### Prueba 1: Contactar vendedor en producto pendiente
1. Como VENDEDOR, crea un producto nuevo (quedará en `pendiente_revision`)
2. Como MODERADOR, ve a `/products/moderation`
3. Haz clic en "Ver Detalles" del producto pendiente
4. Haz clic en "Contactar vendedor"
5. ✅ Debe ir a `/products/contact/:id` y mostrar el formulario
6. ❌ NO debe redirigir a `/products`

### Prueba 2: Verificar datos del vendedor
1. En la página de contacto, verifica que se muestren:
   - ✅ Nombre completo del vendedor
   - ✅ Email del vendedor
   - ✅ Teléfono del vendedor (si lo tiene)
   - ✅ Dirección del vendedor

---

## ⚠️ Síntomas de que NO se ha reiniciado

Si ves estos problemas, el backend NO se ha reiniciado:

1. ❌ Al intentar contactar al vendedor de un producto pendiente, redirige a `/products`
2. ❌ Aparece error "Producto no encontrado" en la consola del backend
3. ❌ Los datos del vendedor no se muestran completos en la página de contacto

---

## 📝 Resumen

**¿Qué cambió?**
- El backend ahora permite contactar al vendedor de productos pendientes de moderación

**¿Qué necesito hacer?**
- Reiniciar el servidor backend (`Ctrl + C` → `npm start`)

**¿Cómo sé que funcionó?**
- Los moderadores pueden contactar vendedores de productos pendientes sin error

