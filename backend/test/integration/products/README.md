# Pruebas de Integración - Módulo de Productos/Servicios

## 📋 Estado Actual

### ✅ Completado

1. **Plan de Pruebas**: 64 casos esenciales documentados (CF-063 a CF-126)
2. **Helpers**: `products.helpers.js` con funciones de utilidad
3. **Todos los archivos de pruebas**: 9 archivos con 64 casos de prueba

### 📝 Archivos Creados

- ✅ `products-crud.test.js` - CRUD básico (20 casos)
- ⏳ `products-filters.test.js` - Filtros y búsqueda (8 casos)
- ⏳ `products-content-detection.test.js` - Detección de contenido (4 casos)
- ⏳ `products-appeals.test.js` - Apelaciones (6 casos)
- ⏳ `products-dangerous.test.js` - Productos peligrosos (6 casos)
- ⏳ `products-reports.test.js` - Reportes (5 casos)
- ⏳ `products-saved.test.js` - Productos guardados (4 casos)
- ⏳ `products-moderation.test.js` - Moderación (5 casos)
- ⏳ `products-services.test.js` - Servicios y casos edge (6 casos)

## 🚀 Próximos Pasos

### Para Ejecutar las Pruebas

1. **Instalar dependencias** (si no están instaladas):
   ```bash
   cd backend
   npm install
   ```

2. **Ejecutar todas las pruebas de productos**:
   ```bash
   npm run test:integration -- test/integration/products/*.test.js
   ```

3. **Ejecutar un archivo específico**:
   ```bash
   npm run test:integration -- test/integration/products/products-crud.test.js
   ```

### Para Continuar el Desarrollo

1. Revisar y probar `products-crud.test.js`
2. Crear los archivos restantes siguiendo el mismo patrón
3. Ejecutar todas las pruebas y corregir errores
4. Verificar cobertura de código

## 📊 Casos de Prueba por Archivo

| Archivo | Casos | Estado |
|---------|-------|--------|
| products-crud.test.js | CF-063 a CF-082 | ✅ Creado |
| products-filters.test.js | CF-083 a CF-090 | ✅ Creado |
| products-content-detection.test.js | CF-091 a CF-094 | ✅ Creado |
| products-appeals.test.js | CF-095 a CF-100 | ✅ Creado |
| products-dangerous.test.js | CF-101 a CF-106 | ✅ Creado |
| products-reports.test.js | CF-107 a CF-111 | ✅ Creado |
| products-saved.test.js | CF-112 a CF-115 | ✅ Creado |
| products-moderation.test.js | CF-116 a CF-120 | ✅ Creado |
| products-services.test.js | CF-121 a CF-126 | ✅ Creado |

**Total: 64 casos de prueba esenciales (CF-063 a CF-126)**

## 🔍 Notas de Implementación

- Todas las pruebas usan `beforeEach` para limpiar la base de datos
- Se crean usuarios de prueba (vendedor, comprador, admin) en cada suite
- Se obtienen o crean categorías y ubicaciones de prueba
- Los helpers están en `test/helpers/products.helpers.js`
- Sigue el mismo patrón que las pruebas de autenticación existentes

