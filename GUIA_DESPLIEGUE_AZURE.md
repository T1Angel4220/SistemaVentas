<img width="1389" height="248" alt="image" src="https://github.com/user-attachments/assets/9b4d35ed-a675-4e93-b441-53ee3cd82478" />![Imagen de WhatsApp 2025-11-10 a las 21 44 09_8782449a](https://github.com/user-attachments/assets/dee362b2-b00c-4563-a244-6f11e61f02b1)![Imagen de WhatsApp 2025-11-10 a las 15 25 15_520eb31f](https://github.com/user-attachments/assets/1639f2f6-c21c-4446-8eec-d63bf70c04be) 🚀 Guía de Despliegue en Azure - Sistema de Ventas Multiempresa

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
![Imagen de WhatsApp 2025-11-10 a las 15 09 15_cb132ce5](https://github.com/user-attachments/assets/46aedc50-2a2c-4053-9ed2-e3ef2280ed47)

### 2.3 Obtener la cadena de conexión

1. Ve a **"Configuración"** → **"Cadenas de conexión"**
2. Copia la cadena de tipo **"psql"** o **"Node.js"**
3. Ejemplo:
   ```
   postgres://azureuser:TU_PASSWORD@postgres-sistema-ventas.postgres.database.azure.com:5432/sistema_ventas_multiempresa?sslmode=require
   ```
   ![Imagen de WhatsApp 2025-11-10 a las 15 15 36_1fec1a56](https://github.com/user-attachments/assets/423b9093-4dc5-4790-8506-3e6f4a4a5e93)

### 2.4 Ejecutar scripts de inicialización

**Opción A: Desde tu máquina local (temporalmente)**

1. Conecta tu IP en las reglas de firewall de PostgreSQL
2. Ejecuta los scripts SQL desde tu máquina:
   ```bash
   psql "postgres://azureuser:PASSWORD@postgres-sistema-ventas.postgres.database.azure.com:5432/sistema_ventas_multiempresa?sslmode=require" -f backend/src/config/database.sql
   ```

   ![Imagen de WhatsApp 2025-11-10 a las 15 19 44_0d941b81](https://github.com/user-attachments/assets/2244a96e-e973-4e0c-a45f-0ee7e46b1580)
![Imagen de WhatsApp 2025-11-10 a las 15 21 25_499077fe](https://github.com/user-attachments/assets/829edc90-1d59-4fb4-b8de-b6fa6663f4f0)



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
![Imagen de WhatsApp 2025-11-10 a las 15 25 15_520eb31f](https://github.com/user-attachments/assets/24ae60be-4bc2-4a19-bc59-58d1b814aacb)


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
![Imagen de WhatsApp 2025-11-10 a las 15 38 37_bd6f8a40](https://github.com/user-attachments/assets/bc11141f-b331-4ebe-85be-265808f746ce)


### 3.3 Configurar comando de inicio

1. Ve a **"Configuración"** → **"Configuración general"**
2. En **"Comando de inicio"**, agrega:
   ```
   tsx index.ts
   ```
3. Click en **"Guardar"**
   ![Imagen de WhatsApp 2025-11-10 a las 15 41 29_052c2997](https://github.com/user-attachments/assets/a8acaeeb-066d-4091-9b4c-6ec7a14df3d1)


### 3.4 Habilitar "Always On" (para cron jobs)

1. Ve a **"Configuración"** → **"Configuración general"**
2. Activa **"Always On"** (solo disponible en planes de pago)
   - ⚠️ Si usas plan F1 (gratis), las tareas cron pueden no ejecutarse siempre
   ![Imagen de WhatsApp 2025-11-10 a las 15 43 20_b2e3a292](https://github.com/user-attachments/assets/a3a2265b-8035-4343-b252-479a94d265dc)


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

![Imagen de WhatsApp 2025-11-10 a las 15 46 15_3b3b3fca](https://github.com/user-attachments/assets/6be0c890-2c2f-4d00-a8bc-6b51a8516b0a)

![Imagen de WhatsApp 2025-11-10 a las 19 36 13_707a88d5](https://github.com/user-attachments/assets/ba479f75-e11f-4185-97b4-bbb8fb1f9a35)


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

   ![Imagen de WhatsApp 2025-11-10 a las 19 36 20_bfda678a](https://github.com/user-attachments/assets/c81900d7-dc3f-4fea-a12c-3d478c21c9a9)


### 3.7 Configurar reglas de firewall de PostgreSQL

1. Ve a tu servidor PostgreSQL → **"Seguridad"** → **"Redes"**
2. Agrega una regla para permitir el acceso desde Azure:
   - **Nombre:** `AllowAppService`
   - **IP inicial:** `0.0.0.0`
   - **IP final:** `0.0.0.0`
   - O mejor: Obtén la IP de salida de tu App Service y agrega solo esa

---
<img width="1644" height="404" alt="image" src="https://github.com/user-attachments/assets/d4d2821e-b208-42f2-8a7e-593a6af10292" />


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
![Imagen de WhatsApp 2025-11-10 a las 19 43 47_9700f0c1](https://github.com/user-attachments/assets/9a39009b-6335-4375-a885-a3288ac6ce03)


### 4.2 Configurar variables de entorno del Frontend

1. Ve a tu Static Web App → **"Configuración"** → **"Configuración de aplicación"**
2. Agrega:
   ```
   VITE_API_URL = https://backend-sistema-ventas.azurewebsites.net/api
   ```
3. Click en **"Guardar"**
   ![Imagen de WhatsApp 2025-11-10 a las 21 44 09_8782449a](https://github.com/user-attachments/assets/94c7a69f-4121-4a4b-aed7-3441fcf3d201)


### 4.3 Actualizar el workflow de GitHub Actions

Azure crea un archivo `.github/workflows/azure-static-web-apps-*.yml`. Edítalo para incluir las variables de entorno:

```yaml
env:
  VITE_API_URL: https://backend-sistema-ventas.azurewebsites.net/api
```
<img width="1333" height="277" alt="image" src="https://github.com/user-attachments/assets/477a5d36-0e92-4dd7-872a-3eb04d58a6b0" />


### 4.4 Verificar despliegue

1. Ve a **"Registros"** → **"Registro de implementación"** en tu Static Web App
2. O ve a la pestaña **"Actions"** en tu repositorio de GitHub
3. Una vez completado, obtén la URL de tu Static Web App (ej: `https://frontend-sistema-ventas.azurestaticapps.net`)

<img width="1156" height="563" alt="image" src="https://github.com/user-attachments/assets/508de009-0fee-4a65-9ec3-097952ed6aab" />


### 4.5 Actualizar CORS del Backend

1. Ve a tu App Service → **"Configuración"** → **"Configuración de aplicación"**
2. Actualiza `CORS_ORIGIN` con la URL de tu Static Web App:
   ```
   CORS_ORIGIN = https://frontend-sistema-ventas.azurestaticapps.net
   ```
3. Click en **"Guardar"**
<img width="738" height="69" alt="image" src="https://github.com/user-attachments/assets/db9adb7d-b174-4a11-96ea-31e5d8ae9e45" />

---

## 📦 Paso 5: Configurar Almacenamiento de Imágenes

### Opción A: Usar Azure Blob Storage (Recomendado)

1. Crea un **Storage Account** en Azure
2. Crea un contenedor llamado `product-images`
3. Modifica el código del backend para usar Azure Blob Storage en lugar del sistema de archivos
4. Actualiza las rutas de imágenes para usar URLs de Blob Storage
![Imagen de WhatsApp 2025-11-10 a las 21 55 06_2ab69083](https://github.com/user-attachments/assets/137c443c-55fc-4d01-9bfe-40ec3c7f9d8e)
![Imagen de WhatsApp 2025-11-10 a las 22 00 56_5636384b](https://github.com/user-attachments/assets/b2010a17-dbee-4e68-9f38-f8b9c7ae8da5)

<img width="913" height="696" alt="image" src="https://github.com/user-attachments/assets/ca19483e-8e78-46dc-b95f-86fefb3273a7" />
<img width="1272" height="867" alt="image" src="https://github.com/user-attachments/assets/16dc2c10-86fe-4f3d-ac66-d8d7ad3cac44" />

Imagenes guardadas:
<img width="1714" height="484" alt="image" src="https://github.com/user-attachments/assets/50d9bfa5-3954-4b8f-8553-df1ed2a7db28" />

<img width="1694" height="933" alt="image" src="https://github.com/user-attachments/assets/24e3382f-119d-45b8-9afb-449318e0f560" />



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

## 🔧 Problemas encontrados

### Error: "Cannot find module 'tsx'"

**Solución:** Asegúrate de que `tsx` esté en `dependencies` (no `devDependencies`)

la solucion fue cambiar a node dist/index.js
<img width="906" height="511" alt="image" src="https://github.com/user-attachments/assets/503a0de9-f1e0-4c01-86d1-54fc770c1020" />


### Error: "Connection refused" a PostgreSQL

**Solución:**
1. Verifica las reglas de firewall en PostgreSQL
2. Asegúrate de que `AllowAzureServices` esté habilitado
3. Verifica que la IP de salida del App Service esté permitida
<img width="1389" height="248" alt="image" src="https://github.com/user-attachments/assets/b43fefc4-4b39-48cb-920f-f24bbeb826ae" />


### Error: CORS bloqueado

**Solución:**
1. Verifica que `CORS_ORIGIN` en App Service tenga la URL correcta del frontend
2. Actualiza `backend/src/app.js` para incluir la URL de producción
<img width="790" height="74" alt="image" src="https://github.com/user-attachments/assets/ad6550c6-5f1d-4e6d-89ba-26400b408799" />

### Error: "Module not found" en el frontend

**Solución:**
1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de GitHub Actions para ver errores de build

### Las imágenes no se cargan y pues tuviste que usar una cuenta de almacenamiento para guardar las imagenes

**Solución:**
1. Si usas sistema de archivos, las imágenes se pierden al reiniciar
2. Considera migrar a Azure Blob Storage

---
## Los CRUD no funcionaban por estar localmente
**Solucion**
Modificar todo el backend y frontend para que hagan referencia a sus URLS correctas de Azure (Frontend y Backend)

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

