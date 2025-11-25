# 🧪 Guía para Ejecutar Pruebas de Productos/Servicios

Esta guía te ayudará a ejecutar el plan de pruebas completo del módulo de productos/servicios (64 casos de prueba: CF-063 a CF-126).

## 📋 Prerrequisitos

### 1. Configurar Variables de Entorno

Asegúrate de tener un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# Servidor
PORT=3001
NODE_ENV=test
HOST=localhost

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres

# JWT
JWT_SECRET=tu_secret_key_muy_segura
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email (pueden ser valores de prueba)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=test@example.com
EMAIL_PASSWORD=test123
EMAIL_FROM=noreply@sistema-ventas.com

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2. Verificar Conexión a Base de Datos

Antes de ejecutar las pruebas, verifica que la conexión a PostgreSQL funcione:

```bash
cd backend
node test-connection.js
```

Si no tienes este archivo, puedes verificar manualmente:

```bash
cd backend
node -e "require('dotenv').config(); const { testConnection } = require('./src/config/database'); testConnection().then(result => { console.log(result ? '✅ Conexión OK' : '❌ Error de conexión'); process.exit(result ? 0 : 1); });"
```

### 3. Instalar Dependencias

Si no has instalado las dependencias:

```bash
cd backend
npm install
```

---

## 🚀 Ejecutar Pruebas

### Opción 1: Ejecutar TODAS las Pruebas de Productos

Ejecuta los 9 archivos de pruebas con los 64 casos de prueba:

```bash
cd backend
npm run test:integration -- test/integration/products/*.test.js
```

### Opción 2: Ejecutar un Archivo Específico

#### CRUD Básico (CF-063 a CF-082)
```bash
npm run test:integration -- test/integration/products/products-crud.test.js
```

#### Filtros y Búsqueda (CF-083 a CF-090)
```bash
npm run test:integration -- test/integration/products/products-filters.test.js
```

#### Detección de Contenido (CF-091 a CF-094)
```bash
npm run test:integration -- test/integration/products/products-content-detection.test.js
```

#### Apelaciones (CF-095 a CF-100)
```bash
npm run test:integration -- test/integration/products/products-appeals.test.js
```

#### Productos Peligrosos (CF-101 a CF-106)
```bash
npm run test:integration -- test/integration/products/products-dangerous.test.js
```

#### Reportes (CF-107 a CF-111)
```bash
npm run test:integration -- test/integration/products/products-reports.test.js
```

#### Productos Guardados (CF-112 a CF-115)
```bash
npm run test:integration -- test/integration/products/products-saved.test.js
```

#### Moderación (CF-116 a CF-120)
```bash
npm run test:integration -- test/integration/products/products-moderation.test.js
```

#### Servicios y Casos Edge (CF-121 a CF-126)
```bash
npm run test:integration -- test/integration/products/products-services.test.js
```

### Opción 3: Ejecutar un Caso de Prueba Específico

Para ejecutar un caso específico (por ejemplo, CF-063):

```bash
npm run test:integration -- test/integration/products/products-crud.test.js --grep "CF-063"
```

### Opción 4: Modo Watch (Desarrollo)

Para ejecutar las pruebas en modo watch (se re-ejecutan automáticamente al cambiar archivos):

```bash
npm run test:watch -- test/integration/products/*.test.js
```

### Opción 5: Con Cobertura de Código

Para ver la cobertura de código:

```bash
npm run test:coverage -- test/integration/products/*.test.js
```

Luego abre el reporte HTML:
```bash
# Windows
start coverage/index.html

# Linux/Mac
open coverage/index.html
```

---

## 📊 Estructura de Archivos de Pruebas

| Archivo | Casos de Prueba | Descripción |
|---------|----------------|-------------|
| `products-crud.test.js` | CF-063 a CF-082 (20 casos) | Operaciones CRUD básicas |
| `products-filters.test.js` | CF-083 a CF-090 (8 casos) | Filtros y búsqueda |
| `products-content-detection.test.js` | CF-091 a CF-094 (4 casos) | Detección automática de contenido |
| `products-appeals.test.js` | CF-095 a CF-100 (6 casos) | Sistema de apelaciones |
| `products-dangerous.test.js` | CF-101 a CF-106 (6 casos) | Productos peligrosos |
| `products-reports.test.js` | CF-107 a CF-111 (5 casos) | Sistema de reportes |
| `products-saved.test.js` | CF-112 a CF-115 (4 casos) | Productos guardados (favoritos) |
| `products-moderation.test.js` | CF-116 a CF-120 (5 casos) | Moderación de productos |
| `products-services.test.js` | CF-121 a CF-126 (6 casos) | Servicios y casos edge |

**Total: 64 casos de prueba (CF-063 a CF-126)**

---

## 🔍 Interpretar Resultados

### Ejecución Exitosa

Si todas las pruebas pasan, verás algo como:

```
🧪 Configuración de pruebas cargada
📊 Modo: test
🗄️  Base de datos: sistema_ventas_multiempresa
⏱️  Timeout: 10000ms

  1. CRUD de Productos/Servicios
    ✓ CF-063: Debe crear producto válido como vendedor (123ms)
    ✓ CF-064: Debe crear servicio válido como vendedor (98ms)
    ...

  64 passing (45s)
```

### Errores Comunes

#### Error: "Variables de entorno faltantes"
```
❌ Variables de entorno faltantes: DB_PASSWORD, JWT_SECRET
💡 Asegúrate de que el archivo .env existe y contiene todas las variables requeridas
```

**Solución**: Verifica que el archivo `.env` existe en `backend/` y tiene todas las variables requeridas.

#### Error: "Connection refused" o "ECONNREFUSED"
```
❌ Error de conexión a la base de datos: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución**: 
1. Verifica que PostgreSQL esté ejecutándose
2. Verifica que `DB_HOST` y `DB_PORT` sean correctos
3. Verifica que la base de datos existe

#### Error: "password authentication failed"
```
❌ Error de conexión a la base de datos: password authentication failed for user "postgres"
```

**Solución**: Verifica que `DB_USER` y `DB_PASSWORD` sean correctos en el archivo `.env`.

#### Error: "database does not exist"
```
❌ Error de conexión a la base de datos: database "sistema_ventas_multiempresa" does not exist
```

**Solución**: Crea la base de datos:
```sql
CREATE DATABASE sistema_ventas_multiempresa;
```

---

## 📝 Orden Recomendado de Ejecución

Si quieres ejecutar las pruebas en un orden específico (para debugging):

1. **Primero**: CRUD básico (establece productos base)
   ```bash
   npm run test:integration -- test/integration/products/products-crud.test.js
   ```

2. **Segundo**: Detección de contenido (valida productos peligrosos)
   ```bash
   npm run test:integration -- test/integration/products/products-content-detection.test.js
   ```

3. **Tercero**: Filtros y búsqueda (valida visualización)
   ```bash
   npm run test:integration -- test/integration/products/products-filters.test.js
   ```

4. **Cuarto**: Moderación (valida cambios de estado)
   ```bash
   npm run test:integration -- test/integration/products/products-moderation.test.js
   ```

5. **Quinto**: Apelaciones (valida flujo completo)
   ```bash
   npm run test:integration -- test/integration/products/products-appeals.test.js
   ```

6. **Sexto**: Reportes (valida flujo completo)
   ```bash
   npm run test:integration -- test/integration/products/products-reports.test.js
   ```

7. **Séptimo**: Productos guardados (valida funcionalidad)
   ```bash
   npm run test:integration -- test/integration/products/products-saved.test.js
   ```

8. **Octavo**: Productos peligrosos (valida restricciones)
   ```bash
   npm run test:integration -- test/integration/products/products-dangerous.test.js
   ```

9. **Noveno**: Servicios y casos edge (valida validaciones)
   ```bash
   npm run test:integration -- test/integration/products/products-services.test.js
   ```

---

## 🐛 Debugging

### Ver Logs Detallados

Para ver logs durante las pruebas, edita `test/setup.js` y comenta estas líneas:

```javascript
// console.log = () => {};
// console.info = () => {};
```

### Ejecutar una Prueba Específica con Timeout Mayor

Si una prueba es lenta, puedes aumentar el timeout:

```bash
npm run test:integration -- test/integration/products/products-crud.test.js --timeout 30000
```

### Ver Respuestas HTTP Completas

Si necesitas ver las respuestas HTTP completas, puedes agregar esto temporalmente en el archivo de prueba:

```javascript
console.log('Response:', JSON.stringify(res.body, null, 2));
```

---

## ✅ Checklist Antes de Ejecutar

- [ ] Archivo `.env` configurado en `backend/`
- [ ] PostgreSQL ejecutándose
- [ ] Base de datos `sistema_ventas_multiempresa` existe
- [ ] Dependencias instaladas (`npm install`)
- [ ] Conexión a base de datos verificada
- [ ] Servidor backend no está ejecutándose (puede causar conflictos de puerto)

---

## 📚 Recursos Adicionales

- **Plan de Pruebas Completo**: `test/PLAN_PRUEBAS_PRODUCTOS_SERVICIOS.md`
- **Casos de Prueba Detallados**: `test/CASOS_PRUEBA_PRODUCTOS_SERVICIOS.txt`
- **Configuración de Pruebas**: `test/CONFIGURACION_PRUEBAS.md`
- **README General**: `test/README.md`

---

## 🎯 Objetivo de Cobertura

- **Cobertura de Código**: > 70%
- **Casos de Prueba Totales**: 64 casos esenciales
- **Tiempo de Ejecución Esperado**: < 3 minutos
- **Tasa de Éxito Esperada**: 100%

---

**¡Buena suerte con las pruebas! 🚀**

