# 🚀 Guía de Despliegue en Azure - Sistema de Ventas Multiempresa

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Preparar el Proyecto](#paso-1-preparar-el-proyecto)
3. [Paso 2: Crear Base de Datos PostgreSQL](#paso-2-crear-base-de-datos-postgresql)
4. [Paso 3: Desplegar Backend (App Service)](#paso-3-desplegar-backend-app-service)
5. [Paso 4: Desplegar Frontend (Static Web App)](#paso-4-desplegar-frontend-static-web-app)
6. [Paso 5: Configurar Almacenamiento de Imágenes](#paso-5-configurar-almacenamiento-de-imágenes)
7. [Paso 6: Verificación y Pruebas](#paso-6-verificación-y-pruebas)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📌 Requisitos Previos

- ✅ Cuenta de Azure con plan estudiantil activo
- ✅ Repositorio en GitHub con tu código
- ✅ Node.js instalado localmente (para pruebas)
- ✅ Git instalado
- ✅ Acceso a [portal.azure.com](https://portal.azure.com)

---

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Verificar dependencias del Backend

Asegúrate de que `tsx` esté en `dependencies` (no en `devDependencies`):

```json
{
  "dependencies": {
    "tsx": "^4.20.5",
    // ... otras dependencias
  }
}
```

### 1.2 Crear archivo de configuración para producción

Crea `backend/.env.production` (NO lo subas a GitHub):

```env
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# PostgreSQL (se configurará después de crear la BD)
DB_HOST=TU_SERVIDOR_POSTGRES.postgres.database.azure.com
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=azureuser
DB_PASSWORD=TU_CONTRASEÑA_SEGURA

# JWT (genera una clave segura)
JWT_SECRET=GENERA_UNA_CLAVE_SECRETA_MUY_SEGURA_AQUI
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eventconnect90@gmail.com
EMAIL_PASSWORD=oshzkgssiwxfdiqr
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>

# CORS (se actualizará con la URL del frontend)
CORS_ORIGIN=https://TU_STATIC_WEB_APP.azurestaticapps.net
FRONTEND_URL=https://TU_STATIC_WEB_APP.azurestaticapps.net

# BCRYPT
BCRYPT_SALT_ROUNDS=10
```

### 1.3 Actualizar CORS en el Backend

Edita `backend/src/app.js` para que acepte la URL de producción:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:3001',
    process.env.CORS_ORIGIN || 'https://TU_STATIC_WEB_APP.azurestaticapps.net'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Length'],
  optionsSuccessStatus: 200
}));
```

### 1.4 Crear archivo de configuración del Frontend

Crea `frontend/.env.production` (NO lo subas a GitHub):

```env
VITE_API_URL=https://TU_BACKEND_APP.azurewebsites.net/api
```

### 1.5 Verificar scripts de build

Asegúrate de que `package.json` del backend tenga:

```json
{
  "scripts": {
    "start": "tsx index.ts",
    "dev": "tsx index.ts"
  }
}
```

---

## 🗄️ Paso 2: Crear Base de Datos PostgreSQL

### 2.1 Crear el servidor PostgreSQL

1. Ve a [portal.azure.com](https://portal.azure.com)
2. Busca **"Azure Database for PostgreSQL"** → **"Flexible Server"**
3. Click en **"Crear"**
4. Completa el formulario:

   **Pestaña "Básico":**
   - **Suscripción:** Tu suscripción estudiantil
     - **Grupo de recursos:** Crea uno nuevo (ej: `rg-sistema-ventas`)
   - **Nombre del servidor:** `postgres-sistema-ventas` (debe ser único)
   - **Región:** La más cercana (ej: `South Central US` o `Brazil South`)
   - **Versión de PostgreSQL:** 15 o superior
   - **Tipo de carga de trabajo:** Desarrollo
   - **Plan de Compute:** Burstable B1ms (más económico)
   - **Almacenamiento:** 32 GB (mínimo)

   **Pestaña "Redes":**
   - **Método de conectividad:** Acceso público
   - **Reglas de firewall:**
     - ✅ Agregar regla: `AllowAzureServices` (permite acceso desde Azure)
     - ✅ Agregar tu IP actual (temporal, para configurar la BD)

   **Pestaña "Seguridad":**
   - **Usuario administrador:** `azureuser` (o el que prefieras)
   - **Contraseña:** Genera una contraseña segura (guárdala bien)

5. Click en **"Revisar y crear"** → **"Crear"**
6. Espera 5-10 minutos a que se cree el servidor

### 2.2 Configurar la base de datos

1. Una vez creado, ve a **"Bases de datos"** → **"Crear base de datos"**
2. Nombre: `sistema_ventas_multiempresa`
3. Click en **"Crear"**

### 2.3 Obtener la cadena de conexión

1. Ve a **"Configuración"** → **"Cadenas de conexión"**
2. Copia la cadena de tipo **"psql"** o **"Node.js"**
3. Ejemplo:
   ```
   postgres://azureuser:TU_PASSWORD@postgres-sistema-ventas.postgres.database.azure.com:5432/sistema_ventas_multiempresa?sslmode=require
   ```

### 2.4 Ejecutar scripts de inicialización

**Opción A: Desde tu máquina local (temporalmente)**

1. Conecta tu IP en las reglas de firewall de PostgreSQL
2. Ejecuta los scripts SQL desde tu máquina:
   ```bash
   psql "postgres://azureuser:PASSWORD@postgres-sistema-ventas.postgres.database.azure.com:5432/sistema_ventas_multiempresa?sslmode=require" -f backend/src/config/database.sql
   ```

**Opción B: Desde Azure Cloud Shell**

1. Abre Azure Cloud Shell en el portal
2. Conecta a PostgreSQL y ejecuta los scripts

---

## 🚀 Paso 3: Desplegar Backend (App Service)

### 3.1 Crear App Service

1. En Azure Portal, busca **"App Services"**
2. Click en **"Crear"**
3. Completa el formulario:

   **Pestaña "Básico":**
   - **Suscripción:** Tu suscripción
   - **Grupo de recursos:** El mismo que usaste para PostgreSQL
   - **Nombre:** `backend-sistema-ventas` (debe ser único)
   - **Publicar:** Código
   - **Pila en tiempo de ejecución:** Node 18 LTS o Node 20 LTS
   - **Sistema operativo:** Linux
   - **Región:** La misma que PostgreSQL

   **Pestaña "Plan de App Service":**
   - **Plan de Linux:** Crear nuevo
   - **Nombre del plan:** `plan-sistema-ventas`
   - **Plan de tarifa:** F1 (Gratis) - Si tienes crédito estudiantil
   - O **B1 Basic** (más estable, ~$13/mes)

4. Click en **"Revisar y crear"** → **"Crear"**
5. Espera 2-3 minutos

### 3.2 Configurar variables de entorno

1. Ve a tu App Service → **"Configuración"** → **"Configuración de aplicación"**
2. Agrega las siguientes variables (click en **"+ Nueva configuración de aplicación"**):

   ```
   PORT = 3001
   NODE_ENV = production
   HOST = 0.0.0.0
   
   DB_HOST = postgres-sistema-ventas.postgres.database.azure.com
   DB_PORT = 5432
   DB_NAME = sistema_ventas_multiempresa
   DB_USER = azureuser
   DB_PASSWORD = TU_CONTRASEÑA_POSTGRES
   
   JWT_SECRET = TU_CLAVE_SECRETA_MUY_SEGURA
   JWT_EXPIRES_IN = 24h
   JWT_REFRESH_EXPIRES_IN = 7d
   
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_SECURE = false
   EMAIL_USER = eventconnect90@gmail.com
   EMAIL_PASSWORD = oshzkgssiwxfdiqr
   EMAIL_FROM = Sistema de Ventas <eventconnect90@gmail.com>
   
   CORS_ORIGIN = https://TU_STATIC_WEB_APP.azurestaticapps.net
   FRONTEND_URL = https://TU_STATIC_WEB_APP.azurestaticapps.net
   
   BCRYPT_SALT_ROUNDS = 10
   ```

3. Click en **"Guardar"** (puede tardar 1-2 minutos)

### 3.3 Configurar comando de inicio

1. Ve a **"Configuración"** → **"Configuración general"**
2. En **"Comando de inicio"**, agrega:
   ```
   tsx index.ts
   ```
3. Click en **"Guardar"**

### 3.4 Habilitar "Always On" (para cron jobs)

1. Ve a **"Configuración"** → **"Configuración general"**
2. Activa **"Always On"** (solo disponible en planes de pago)
   - ⚠️ Si usas plan F1 (gratis), las tareas cron pueden no ejecutarse siempre

### 3.5 Conectar con GitHub

1. Ve a **"Centro de implementación"**
2. Selecciona **"GitHub"** como fuente
3. Autoriza tu cuenta de GitHub
4. Selecciona:
   - **Organización:** Tu organización/usuario
   - **Repositorio:** Tu repositorio
   - **Rama:** `main` o `master`
   - **Carpeta:** `backend` (importante: especifica la carpeta del backend)
5. Click en **"Guardar"**
6. Azure comenzará a desplegar automáticamente

### 3.6 Verificar despliegue

1. Ve a **"Registros"** → **"Registro de implementación"** para ver el progreso
2. Una vez completado, ve a **"Examinar"** para ver tu API
3. Deberías ver:
   ```json
   {
     "success": true,
     "message": "Sistema de Ventas Multiempresa - API",
     "version": "1.0.0"
   }
   ```

### 3.7 Configurar reglas de firewall de PostgreSQL

1. Ve a tu servidor PostgreSQL → **"Seguridad"** → **"Redes"**
2. Agrega una regla para permitir el acceso desde Azure:
   - **Nombre:** `AllowAppService`
   - **IP inicial:** `0.0.0.0`
   - **IP final:** `0.0.0.0`
   - O mejor: Obtén la IP de salida de tu App Service y agrega solo esa

---

## 🎨 Paso 4: Desplegar Frontend (Static Web App)

### 4.1 Crear Static Web App

1. En Azure Portal, busca **"Static Web Apps"**
2. Click en **"Crear"**
3. Completa el formulario:

   **Pestaña "Básico":**
   - **Suscripción:** Tu suscripción
   - **Grupo de recursos:** El mismo que usaste antes
   - **Nombre:** `frontend-sistema-ventas` (debe ser único)
   - **Tipo de plan:** Gratis
   - **Región:** La misma que los otros recursos

   **Pestaña "Detalles de implementación":**
   - **Origen:** GitHub
   - **Organización:** Tu organización/usuario
   - **Repositorio:** Tu repositorio
   - **Rama:** `main` o `master`
   - **Carpeta de compilación:** `frontend`
   - **Comando de compilación:** `npm run build`
   - **Ubicación de artefactos de compilación:** `dist`

4. Click en **"Revisar y crear"** → **"Crear"**
5. Azure creará un workflow de GitHub Actions automáticamente

### 4.2 Configurar variables de entorno del Frontend

1. Ve a tu Static Web App → **"Configuración"** → **"Configuración de aplicación"**
2. Agrega:
   ```
   VITE_API_URL = https://backend-sistema-ventas.azurewebsites.net/api
   ```
3. Click en **"Guardar"**

### 4.3 Actualizar el workflow de GitHub Actions

Azure crea un archivo `.github/workflows/azure-static-web-apps-*.yml`. Edítalo para incluir las variables de entorno:

```yaml
env:
  VITE_API_URL: https://backend-sistema-ventas.azurewebsites.net/api
```

### 4.4 Verificar despliegue

1. Ve a **"Registros"** → **"Registro de implementación"** en tu Static Web App
2. O ve a la pestaña **"Actions"** en tu repositorio de GitHub
3. Una vez completado, obtén la URL de tu Static Web App (ej: `https://frontend-sistema-ventas.azurestaticapps.net`)

### 4.5 Actualizar CORS del Backend

1. Ve a tu App Service → **"Configuración"** → **"Configuración de aplicación"**
2. Actualiza `CORS_ORIGIN` con la URL de tu Static Web App:
   ```
   CORS_ORIGIN = https://frontend-sistema-ventas.azurestaticapps.net
   ```
3. Click en **"Guardar"**

---

## 📦 Paso 5: Configurar Almacenamiento de Imágenes

### Opción A: Usar Azure Blob Storage (Recomendado)

1. Crea un **Storage Account** en Azure
2. Crea un contenedor llamado `product-images`
3. Modifica el código del backend para usar Azure Blob Storage en lugar del sistema de archivos
4. Actualiza las rutas de imágenes para usar URLs de Blob Storage

### Opción B: Usar sistema de archivos (Temporal)

⚠️ **Advertencia:** Las imágenes se perderán al reiniciar el App Service.

1. El código actual funcionará, pero las imágenes no persistirán
2. Para desarrollo/pruebas, esto es aceptable

---

## ✅ Paso 6: Verificación y Pruebas

### 6.1 Probar Backend

1. Abre: `https://backend-sistema-ventas.azurewebsites.net/`
2. Deberías ver el JSON de la API
3. Prueba: `https://backend-sistema-ventas.azurewebsites.net/api/docs`

### 6.2 Probar Frontend

1. Abre: `https://frontend-sistema-ventas.azurestaticapps.net`
2. Deberías ver la aplicación React
3. Intenta hacer login/registro

### 6.3 Verificar conexión a la base de datos

1. Ve a **"Registros"** → **"Log stream"** en tu App Service
2. Deberías ver logs de conexión exitosa a PostgreSQL

### 6.4 Probar funcionalidades principales

- [ ] Registro de usuario
- [ ] Login
- [ ] Crear producto
- [ ] Subir imagen
- [ ] Ver productos
- [ ] Búsqueda y filtros

---

## 🔧 Solución de Problemas

### Error: "Cannot find module 'tsx'"

**Solución:** Asegúrate de que `tsx` esté en `dependencies` (no `devDependencies`)

### Error: "Connection refused" a PostgreSQL

**Solución:**
1. Verifica las reglas de firewall en PostgreSQL
2. Asegúrate de que `AllowAzureServices` esté habilitado
3. Verifica que la IP de salida del App Service esté permitida

### Error: CORS bloqueado

**Solución:**
1. Verifica que `CORS_ORIGIN` en App Service tenga la URL correcta del frontend
2. Actualiza `backend/src/app.js` para incluir la URL de producción

### Error: "Module not found" en el frontend

**Solución:**
1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de GitHub Actions para ver errores de build

### Las imágenes no se cargan

**Solución:**
1. Si usas sistema de archivos, las imágenes se pierden al reiniciar
2. Considera migrar a Azure Blob Storage

### Las tareas cron no se ejecutan

**Solución:**
1. Si usas plan F1 (gratis), activa "Always On" no está disponible
2. Considera usar Azure Functions para tareas programadas
3. O actualiza a un plan de pago

---

## 📊 Resumen de URLs y Recursos

Después del despliegue, tendrás:

- **Backend API:** `https://backend-sistema-ventas.azurewebsites.net`
- **Frontend:** `https://frontend-sistema-ventas.azurestaticapps.net`
- **PostgreSQL:** `postgres-sistema-ventas.postgres.database.azure.com:5432`
- **Grupo de recursos:** `rg-sistema-ventas`

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en Azure. Si encuentras problemas, revisa los logs en:
- **App Service:** Registros → Log stream
- **Static Web App:** Registros → Registro de implementación
- **GitHub Actions:** Pestaña "Actions" en tu repositorio

