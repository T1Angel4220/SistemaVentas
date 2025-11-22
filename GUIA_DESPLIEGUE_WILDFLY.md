# 🚀 Guía Completa de Despliegue del Sistema de Ventas en WildFly

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Configuración Inicial de WildFly](#paso-1-configuración-inicial-de-wildfly)
3. [Paso 2: Build del Frontend](#paso-2-build-del-frontend)
4. [Paso 3: Preparación del Frontend para WildFly](#paso-3-preparación-del-frontend-para-wildfly)
5. [Paso 4: Despliegue del Frontend en WildFly](#paso-4-despliegue-del-frontend-en-wildfly)
6. [Paso 5: Configuración del Backend Node.js](#paso-5-configuración-del-backend-nodejs)
7. [Paso 6: Configuración de Base de Datos](#paso-6-configuración-de-base-de-datos)
8. [Paso 7: Configuración de Variables de Entorno](#paso-7-configuración-de-variables-de-entorno)
9. [Paso 8: Validación del Sistema](#paso-8-validación-del-sistema)
10. [Paso 9: Documentación para el Informe](#paso-9-documentación-para-el-informe)
11. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **WildFly** (versión 26.x o superior) - Descargado y descomprimido
- ✅ **Java JDK** (versión 11 o superior) - Instalado y configurado
- ✅ **Node.js** (versión 18 o superior) - Para el backend
- ✅ **PostgreSQL** - Base de datos del sistema
- ✅ **PowerShell** (como Administrador) - Para ejecutar comandos
- ✅ **Navegador web** - Para acceder a la consola de WildFly

---

## 🔧 Paso 1: Configuración Inicial de WildFly

### 1.1 Arrancar WildFly

1. **Abrir Consola PowerShell como Administrador**

2. **Navegar al directorio bin de WildFly:**
   ```powershell
   cd C:\wildfly\bin
   ```

3. **Arrancar WildFly en modo standalone:**
   ```powershell
   .\standalone.bat
   ```

4. **Verificar que WildFly se inició correctamente:**
   - Deberías ver mensajes como:
     ```
     WFLYSRV0025: WildFly Full 26.0.0.Final started in XXXXms
     ```
   - **NO cierres esta ventana** - debe permanecer abierta mientras WildFly esté en ejecución

### 1.2 Crear Usuario de Gestión (Management User)

1. **Abrir una NUEVA Consola PowerShell (también como Administrador)**

2. **Navegar al directorio bin de WildFly:**
   ```powershell
   cd C:\wildfly\bin
   ```

3. **Ejecutar el script para agregar usuario:**
   ```powershell
   .\add-user.bat
   ```

4. **Seguir las instrucciones interactivas:**
   - Presiona `a` para crear un **Management user**
   - Ingresa un **username** (ej: `admin`)
   - Ingresa una **password** (ej: `admin123`)
   - Confirma la password
   - Presiona `Enter` para aceptar los grupos (o deja vacío)
   - Presiona `yes` para confirmar

5. **Verificar que el usuario se creó:**
   - Deberías ver: `Added user 'admin' to file '...'`

### 1.3 Acceder a la Consola de Gestión de WildFly

1. **Abrir tu navegador web**

2. **Navegar a:**
   ```
   http://localhost:9990
   ```

3. **Iniciar sesión con las credenciales creadas:**
   - Username: `admin` (o el que hayas elegido)
   - Password: `admin123` (o la que hayas elegido)

4. **Verificar que puedes acceder a la consola:**
   - Deberías ver el dashboard de WildFly con el menú lateral

---

## 🏗️ Paso 2: Build del Frontend

### 2.1 Navegar al Directorio del Frontend

```powershell
cd "E:\Gestion de Pruebas e Implantación de Software\SistemaVentasJ\SistemaVentas\frontend"
```

> **Nota:** Ajusta la ruta según tu ubicación real del proyecto.

### 2.2 Instalar Dependencias

```powershell
npm ci
```

> **Nota:** `npm ci` instala las dependencias exactas según `package-lock.json`. Si no existe, usa `npm install`.

### 2.3 Generar Build de Producción

```powershell
npm run build
```

### 2.4 Verificar que se Generó la Carpeta `dist`

```powershell
dir dist
```

Deberías ver una estructura similar a:
```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   ├── index-[hash].css
  │   └── ...
  └── ...
```

---

## 📦 Paso 3: Preparación del Frontend para WildFly

### 3.1 Crear Estructura para WAR

WildFly despliega aplicaciones web en formato WAR (Web Application Archive). Necesitamos empaquetar el contenido de `dist` en un archivo WAR.

### 3.2 Opción A: Crear WAR Manualmente (Recomendado)

1. **Crear una carpeta temporal para el WAR:**
   ```powershell
   mkdir C:\temp\sistemaventas-war
   cd C:\temp\sistemaventas-war
   ```

2. **Copiar TODO el contenido de la carpeta `dist` a esta nueva carpeta:**
   ```powershell
   # Desde el directorio del frontend
   Copy-Item -Path ".\dist\*" -Destination "C:\temp\sistemaventas-war" -Recurse -Force
   ```

3. **Navegar a la carpeta temporal y crear la carpeta WEB-INF:**
   ```powershell
   # Asegúrate de estar en C:\temp\sistemaventas-war
   cd C:\temp\sistemaventas-war
   mkdir WEB-INF
   ```
   
   > **Importante:** Este comando se ejecuta DENTRO de la carpeta `C:\temp\sistemaventas-war`

4. **Crear el archivo `WEB-INF/web.xml` con el siguiente contenido:**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
            http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
            version="4.0">
       <display-name>Sistema de Ventas</display-name>
       <welcome-file-list>
           <welcome-file>index.html</welcome-file>
       </welcome-file-list>
   </web-app>
   ```

   Puedes crear este archivo con (método que evita problemas de codificación):
   ```powershell
   # Crear web.xml con codificación UTF-8 sin BOM (más compatible)
   $webXmlContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <display-name>Sistema de Ventas</display-name>
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
    </welcome-file-list>
</web-app>
"@
   # Usar UTF8NoBOM para evitar problemas de parsing
   [System.IO.File]::WriteAllText("$PWD\WEB-INF\web.xml", $webXmlContent, [System.Text.UTF8Encoding]::new($false))
   ```
   
   > **Importante:** El método anterior usa `UTF8Encoding` sin BOM para evitar problemas de parsing en WildFly.

5. **Crear el archivo WAR:**
   ```powershell
   # Asegúrate de estar en C:\temp\sistemaventas-war
   # PowerShell solo crea ZIP, así que creamos ZIP y luego lo renombramos a WAR
   Compress-Archive -Path * -DestinationPath "C:\temp\SistemaVentas.zip" -Force
   Rename-Item -Path "C:\temp\SistemaVentas.zip" -NewName "SistemaVentas.war"
   ```
   
   > **Nota:** Un archivo WAR es esencialmente un archivo ZIP con estructura web. Por eso creamos ZIP y lo renombramos.

6. **Verificar que se creó el WAR:**
   ```powershell
   dir C:\temp\SistemaVentas.war
   ```

7. **Verificar el contenido del WAR (opcional pero recomendado):**
   ```powershell
   # Renombrar temporalmente a ZIP para poder extraerlo
   Copy-Item "C:\temp\SistemaVentas.war" "C:\temp\SistemaVentas-temp.zip" -Force
   
   # Extraer para verificar
   $tempExtract = "C:\temp\war-verify"
   if (Test-Path $tempExtract) {
       Remove-Item $tempExtract -Recurse -Force
   }
   mkdir $tempExtract
   Expand-Archive -Path "C:\temp\SistemaVentas-temp.zip" -DestinationPath $tempExtract
   
   # Verificar estructura
   Write-Host "`n=== Estructura del WAR ===" -ForegroundColor Cyan
   dir $tempExtract
   dir "$tempExtract\assets" -ErrorAction SilentlyContinue
   dir "$tempExtract\WEB-INF" -ErrorAction SilentlyContinue
   
   # Verificar archivos críticos
   $indexExists = Test-Path "$tempExtract\index.html"
   $webXmlExists = Test-Path "$tempExtract\WEB-INF\web.xml"
   $jsExists = (Get-ChildItem "$tempExtract\assets\*.js" -ErrorAction SilentlyContinue).Count -gt 0
   $cssExists = (Get-ChildItem "$tempExtract\assets\*.css" -ErrorAction SilentlyContinue).Count -gt 0
   
   Write-Host "`n=== Verificación ===" -ForegroundColor Cyan
   Write-Host "index.html: $indexExists" -ForegroundColor $(if($indexExists){"Green"}else{"Red"})
   Write-Host "WEB-INF/web.xml: $webXmlExists" -ForegroundColor $(if($webXmlExists){"Green"}else{"Red"})
   Write-Host "Archivos JS en assets: $jsExists" -ForegroundColor $(if($jsExists){"Green"}else{"Red"})
   Write-Host "Archivos CSS en assets: $cssExists" -ForegroundColor $(if($cssExists){"Green"}else{"Red"})
   
   # Limpiar
   Remove-Item $tempExtract -Recurse -Force
   Remove-Item "C:\temp\SistemaVentas-temp.zip" -Force
   
   if ($indexExists -and $webXmlExists -and $jsExists -and $cssExists) {
       Write-Host "`n✓ WAR verificado correctamente!" -ForegroundColor Green
   } else {
       Write-Host "`n✗ WAR incompleto. Revisa los archivos faltantes." -ForegroundColor Red
   }
   ```

### 3.3 Opción B: Usar Script Automatizado

Puedes crear un script PowerShell para automatizar este proceso:

```powershell
# Script: crear-war.ps1
$frontendPath = "E:\Gestion de Pruebas e Implantación de Software\SistemaVentasJ\SistemaVentas\frontend"
$tempPath = "C:\temp\sistemaventas-war"
$warPath = "C:\temp\SistemaVentas.war"

# Limpiar carpeta temporal
if (Test-Path $tempPath) {
    Remove-Item $tempPath -Recurse -Force
}
New-Item -ItemType Directory -Path $tempPath -Force | Out-Null

# Copiar archivos de dist
Copy-Item -Path "$frontendPath\dist\*" -Destination $tempPath -Recurse -Force

# Crear WEB-INF
New-Item -ItemType Directory -Path "$tempPath\WEB-INF" -Force | Out-Null

# Crear web.xml
$webXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <display-name>Sistema de Ventas</display-name>
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
    </welcome-file-list>
</web-app>
"@
$webXml | Out-File -FilePath "$tempPath\WEB-INF\web.xml" -Encoding UTF8

# Crear WAR
if (Test-Path $warPath) {
    Remove-Item $warPath -Force
}
Compress-Archive -Path "$tempPath\*" -DestinationPath $warPath -Force

Write-Host "WAR creado exitosamente en: $warPath" -ForegroundColor Green
```

Guarda este script como `crear-war.ps1` y ejecútalo:
```powershell
.\crear-war.ps1
```

---

## 🚀 Paso 4: Despliegue del Frontend en WildFly

### 4.0 Solución Alternativa: Despliegue Exploded (Recomendado si el WAR falla)

Si el despliegue del WAR falla, puedes desplegar directamente desde la carpeta (despliegue "exploded"):

1. **Copiar la carpeta a WildFly:**
   ```powershell
   # Copiar la carpeta completa a WildFly deployments
   Copy-Item -Path "C:\temp\sistemaventas-war" -Destination "C:\wildfly-38.0.0.Final\standalone\deployments\SistemaVentas.war" -Recurse -Force
   ```
   
   > **Nota:** Ajusta la ruta `C:\wildfly-38.0.0.Final` según tu instalación de WildFly.

2. **WildFly detectará automáticamente el despliegue:**
   - Ve a la consola: `http://localhost:9990`
   - Ve a "Deployments"
   - Deberías ver `SistemaVentas.war` desplegado automáticamente

3. **Si no se despliega automáticamente, crear un archivo `.dodeploy`:**
   ```powershell
   # Crear archivo marcador para forzar el despliegue
   New-Item -ItemType File -Path "C:\wildfly-38.0.0.Final\standalone\deployments\SistemaVentas.war.dodeploy" -Force
   ```

### 4.1 Desplegar el WAR desde la Consola Web

1. **Abrir la Consola de Gestión de WildFly:**
   - Navegar a: `http://localhost:9990`
   - Iniciar sesión con tus credenciales

2. **Ir a la sección "Deployments":**
   - En el menú lateral izquierdo, haz clic en **"Deployments"**

3. **Agregar el despliegue:**
   - Haz clic en el botón **"Add"** o **"Upload Deployment"**

4. **Seleccionar el archivo WAR:**
   - Haz clic en **"Browse"** o **"Choose File"**
   - Navega a `C:\temp\SistemaVentas.war`
   - Selecciona el archivo

5. **Completar el despliegue:**
   - Haz clic en **"Next"** o **"Finish"**
   - Espera a que el despliegue se complete
   - El estado debería cambiar a **"Enabled"** (verde)

### 4.2 Verificar el Despliegue

1. **Verificar en la lista de despliegues:**
   - Deberías ver `SistemaVentas.war` en la lista
   - El estado debe ser **"Enabled"**

2. **Acceder a la aplicación:**
   - Abre tu navegador
   - Navega a: `http://localhost:8080/SistemaVentas/`
   - Deberías ver la interfaz del sistema

> **Nota:** Si desplegaste como `ROOT.war`, accede a `http://localhost:8080/`

### 4.3 Configurar Context Root (Opcional)

Si quieres que la aplicación esté disponible en la raíz (`http://localhost:8080/`):

1. **Renombrar el WAR a `ROOT.war`:**
   ```powershell
   Copy-Item "C:\temp\SistemaVentas.war" "C:\temp\ROOT.war" -Force
   ```

2. **Desplegar `ROOT.war` en lugar de `SistemaVentas.war`**

---

## ⚙️ Paso 5: Configuración del Backend Node.js

Como el backend es Node.js/Express (no Java), no se despliega directamente en WildFly. Debes ejecutarlo por separado.

### 5.1 Configurar Variables de Entorno del Backend

1. **Navegar al directorio del backend:**
   ```powershell
   cd "E:\Gestion de Pruebas e Implantación de Software\SistemaVentasJ\SistemaVentas\backend"
   ```

2. **Verificar que existe el archivo `.env`:**
   ```powershell
   dir .env
   ```

3. **Si no existe, crear uno basado en la configuración necesaria:**
   ```powershell
   # Crear archivo .env
   @"
   PORT=3001
   NODE_ENV=production
   HOST=localhost

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sistemaventas
   DB_USER=postgres
   DB_PASSWORD=tu_password

   JWT_SECRET=tu_jwt_secret_muy_seguro
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_app_password
   EMAIL_FROM=noreply@sistemaventas.com
   "@ | Out-File -FilePath ".env" -Encoding UTF8
   ```

   > **Importante:** Reemplaza los valores con tus credenciales reales.

### 5.2 Instalar Dependencias del Backend

```powershell
npm install
```

### 5.3 Iniciar el Backend

```powershell
npm start
```

O si usas el script de desarrollo:
```powershell
npm run dev
```

### 5.4 Verificar que el Backend Está Corriendo

1. **Verificar en la consola:**
   - Deberías ver: `Servidor corriendo en puerto 3001` o similar

2. **Probar el endpoint:**
   - Abre tu navegador
   - Navega a: `http://localhost:3001/api/auth/test`
   - Deberías recibir una respuesta JSON

### 5.5 Configurar CORS en el Backend (si es necesario)

Si el frontend en WildFly está en un puerto diferente o dominio, asegúrate de que el backend permita las peticiones CORS. Verifica el archivo `backend/src/app.js` y asegúrate de que CORS esté configurado correctamente.

---

## 🗄️ Paso 6: Configuración de Base de Datos

### 6.1 Verificar que PostgreSQL Está Corriendo

```powershell
# Verificar servicio de PostgreSQL
Get-Service -Name postgresql*
```

O verifica manualmente que PostgreSQL esté iniciado.

### 6.2 Crear la Base de Datos (si no existe)

1. **Conectar a PostgreSQL:**
   ```powershell
   psql -U postgres
   ```

2. **Crear la base de datos:**
   ```sql
   CREATE DATABASE sistemaventas;
   ```

3. **Salir de psql:**
   ```sql
   \q
   ```

### 6.3 Ejecutar Scripts de Configuración

1. **Navegar al directorio del backend:**
   ```powershell
   cd "E:\Gestion de Pruebas e Implantación de Software\SistemaVentasJ\SistemaVentas\backend"
   ```

2. **Ejecutar el script de configuración de la base de datos:**
   ```powershell
   # Si existe un script de setup
   node scripts/setup-database.bat
   ```

   O ejecuta los scripts SQL manualmente desde `backend/src/config/`.

### 6.4 Verificar la Conexión

El backend debería conectarse automáticamente al iniciar. Verifica los logs para confirmar que la conexión fue exitosa.

---

## 🔐 Paso 7: Configuración de Variables de Entorno

### 7.1 Actualizar el Frontend para Apuntar al Backend Correcto

El frontend necesita saber dónde está el backend. Como el frontend está en WildFly (`http://localhost:8080`) y el backend en Node.js (`http://localhost:3001`), necesitas configurar la URL de la API.

**Opción A: Configurar antes del build (Recomendado)**

1. **Editar el archivo `.env` del frontend:**
   ```powershell
   cd "E:\Gestion de Pruebas e Implantación de Software\SistemaVentasJ\SistemaVentas\frontend"
   ```

2. **Abrir `.env` y verificar/actualizar:**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Regenerar el build:**
   ```powershell
   npm run build
   ```

4. **Recrear el WAR con el nuevo build:**
   - Repite el Paso 3 y Paso 4

**Opción B: Configurar en tiempo de ejecución (Avanzado)**

Puedes crear un script que inyecte la configuración en `index.html` después del despliegue, pero esto es más complejo.

### 7.2 Verificar que las Variables Están Configuradas

1. **Abrir la aplicación en el navegador:**
   - `http://localhost:8080/SistemaVentas/`

2. **Abrir las herramientas de desarrollador (F12)**

3. **Ir a la pestaña "Network"**

4. **Intentar hacer login o cualquier acción que llame al backend**

5. **Verificar que las peticiones van a:**
   - `http://localhost:3001/api/...`

---

## ✅ Paso 8: Validación del Sistema

### 8.1 Validación del Frontend

1. **Acceder a la aplicación:**
   - URL: `http://localhost:8080/SistemaVentas/`
   - Verifica que la interfaz se carga correctamente
   - Verifica que los estilos CSS se aplican
   - Verifica que no hay errores en la consola del navegador (F12)

2. **Probar navegación:**
   - Navegar entre diferentes páginas
   - Verificar que React Router funciona correctamente
   - Verificar que las rutas se cargan sin recargar la página completa

### 8.2 Validación del Backend

1. **Verificar que el backend responde:**
   ```powershell
   # Desde PowerShell
   Invoke-WebRequest -Uri "http://localhost:3001/api/auth/test" -Method GET
   ```

2. **Probar endpoints desde el frontend:**
   - Intentar hacer login
   - Intentar registrar un usuario
   - Verificar que las peticiones llegan al backend

### 8.3 Validación de Integración Frontend-Backend

1. **Probar funcionalidades completas:**
   - ✅ Registro de usuario
   - ✅ Verificación de email
   - ✅ Login
   - ✅ Navegación autenticada
   - ✅ Gestión de productos
   - ✅ Cualquier otra funcionalidad crítica

2. **Verificar en las herramientas de desarrollador:**
   - Pestaña "Network": Verificar que las peticiones son exitosas (código 200)
   - Pestaña "Console": Verificar que no hay errores JavaScript
   - Pestaña "Application": Verificar que los tokens JWT se guardan correctamente

### 8.4 Validación de Requisitos Funcionales

Según las instrucciones del docente, verifica que:

- ✅ El sistema funciona correctamente en el servidor local
- ✅ Los requisitos funcionales se cumplen (qué hace el sistema)
- ✅ Los requisitos no funcionales se cumplen (rendimiento, seguridad, usabilidad)

### 8.5 Validación de Requisitos No Funcionales

1. **Rendimiento:**
   - Las páginas cargan en menos de 3 segundos
   - Las peticiones al backend responden en menos de 1 segundo

2. **Seguridad:**
   - Las contraseñas no se envían en texto plano
   - Los tokens JWT se manejan correctamente
   - CORS está configurado correctamente

3. **Usabilidad:**
   - La interfaz es responsive
   - Los mensajes de error son claros
   - La navegación es intuitiva

---

## 📝 Paso 9: Documentación para el Informe

Según las instrucciones del docente, debes entregar un informe en PDF que incluya:

### 9.1 Proceso Completo de Implantación

**Documenta paso a paso todo lo realizado:**

1. **Configuración de WildFly:**
   - Versión de WildFly utilizada
   - Versión de Java utilizada
   - Comandos ejecutados para arrancar WildFly
   - Proceso de creación del usuario de gestión
   - Captura de pantalla de la consola de gestión accesible

2. **Build del Frontend:**
   - Comandos ejecutados (`npm ci`, `npm run build`)
   - Estructura de la carpeta `dist` generada
   - Captura de pantalla del proceso de build exitoso

3. **Creación del WAR:**
   - Proceso de empaquetado
   - Estructura del archivo WAR
   - Captura de pantalla del archivo WAR creado

4. **Despliegue en WildFly:**
   - Proceso de despliegue desde la consola web
   - Captura de pantalla de la consola mostrando el despliegue activo
   - Estado del despliegue (Enabled)

5. **Configuración del Backend:**
   - Configuración de variables de entorno
   - Proceso de inicio del backend
   - Captura de pantalla del backend corriendo

6. **Configuración de Base de Datos:**
   - Configuración de PostgreSQL
   - Scripts ejecutados
   - Verificación de conexión

### 9.2 Capturas de Pantalla del Sistema en Funcionamiento

**Toma capturas de pantalla de:**

1. **Consola de Gestión de WildFly:**
   - Dashboard principal
   - Sección "Deployments" mostrando `SistemaVentas.war` desplegado
   - Estado "Enabled" del despliegue

2. **Aplicación Web Funcionando:**
   - Página de inicio/login
   - Dashboard principal (después de login)
   - Páginas de funcionalidades clave (gestión de productos, usuarios, etc.)
   - Interfaz responsive (si aplica)

3. **Backend Funcionando:**
   - Consola del backend mostrando que está corriendo
   - Logs de peticiones recibidas

4. **Base de Datos:**
   - Conexión exitosa a PostgreSQL
   - Tablas creadas (opcional)

### 9.3 Pasos Seguidos para la Configuración

**Detalla cualquier configuración específica:**

1. **Configuraciones en WildFly:**
   - Variables de entorno configuradas (si aplica)
   - Configuraciones de seguridad (si aplica)
   - Configuraciones de recursos (si aplica)

2. **Configuraciones del Backend:**
   - Variables de entorno en `.env`
   - Configuración de CORS
   - Configuración de JWT

3. **Configuraciones del Frontend:**
   - Variables de entorno en `.env`
   - URL de la API configurada

### 9.4 Problemas Presentados y Soluciones

**Documenta cualquier problema encontrado:**

Para cada problema, incluye:

1. **Descripción del problema:**
   - ¿Qué estaba pasando?
   - ¿Cuándo ocurrió?
   - Mensajes de error (si los hubo)

2. **Causa raíz:**
   - ¿Por qué ocurrió el problema?

3. **Solución aplicada:**
   - ¿Qué pasos seguiste para resolverlo?
   - Comandos ejecutados
   - Archivos modificados

4. **Resultado:**
   - ¿Se resolvió el problema?
   - Captura de pantalla del problema y de la solución (si aplica)

**Ejemplo de formato:**

```
PROBLEMA 1: Error al desplegar el WAR
- Descripción: Al intentar desplegar SistemaVentas.war, WildFly mostraba error "Deployment failed"
- Causa: El archivo web.xml tenía un error de sintaxis XML
- Solución: Corregí el archivo web.xml y recreé el WAR
- Resultado: El despliegue se completó exitosamente
```

### 9.5 Estructura Recomendada del Informe PDF

```
1. Portada
   - Título: "APE GPIS 6: Implantación del Sistema en Servidor Local"
   - Nombre del estudiante
   - Fecha

2. Introducción
   - Descripción del proyecto
   - Objetivo de la implantación

3. Configuración del Entorno
   - Requisitos previos
   - Software utilizado y versiones

4. Proceso de Implantación
   4.1. Configuración de WildFly
   4.2. Build del Frontend
   4.3. Despliegue en WildFly
   4.4. Configuración del Backend
   4.5. Configuración de Base de Datos

5. Validación del Sistema
   - Pruebas realizadas
   - Resultados obtenidos

6. Problemas y Soluciones
   - Lista de problemas encontrados
   - Soluciones aplicadas

7. Conclusiones
   - Resumen del proceso
   - Lecciones aprendidas

8. Anexos
   - Capturas de pantalla adicionales
   - Configuraciones completas
```

---

## 🔧 Solución de Problemas Comunes

### Problema 1: WildFly no inicia

**Síntomas:**
- Error al ejecutar `standalone.bat`
- Puerto 8080 o 9990 ya en uso

**Soluciones:**
1. Verificar que Java está instalado y en el PATH:
   ```powershell
   java -version
   ```

2. Verificar que los puertos no están en uso:
   ```powershell
   netstat -ano | findstr :8080
   netstat -ano | findstr :9990
   ```

3. Si están en uso, detener el proceso o cambiar los puertos en `standalone.xml`

### Problema 2: El WAR no se despliega

**Síntomas:**
- Error "Deployment failed" en la consola de WildFly

**Soluciones:**
1. Verificar que el archivo `web.xml` es válido XML
2. Verificar que el WAR contiene `index.html` en la raíz
3. Revisar los logs de WildFly: `C:\wildfly\standalone\log\server.log`

### Problema 3: El frontend no carga

**Síntomas:**
- Página en blanco
- Error 404 al acceder a la aplicación

**Soluciones:**
1. Verificar que el despliegue está "Enabled"
2. Verificar la URL correcta: `http://localhost:8080/SistemaVentas/`
3. Verificar en las herramientas de desarrollador (F12) qué recursos fallan
4. Verificar que `index.html` está en la raíz del WAR

### Problema 4: El frontend no se conecta al backend

**Síntomas:**
- Errores CORS en la consola del navegador
- Peticiones fallan con error 404 o 500

**Soluciones:**
1. Verificar que el backend está corriendo: `http://localhost:3001/api/auth/test`
2. Verificar la variable `VITE_API_URL` en el `.env` del frontend
3. Regenerar el build si cambiaste variables de entorno
4. Verificar la configuración de CORS en el backend

### Problema 5: Errores de base de datos

**Síntomas:**
- El backend no se conecta a PostgreSQL
- Errores de autenticación

**Soluciones:**
1. Verificar que PostgreSQL está corriendo
2. Verificar las credenciales en `.env`
3. Verificar que la base de datos existe
4. Verificar que las tablas están creadas

---

## 📌 Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] WildFly está corriendo y accesible en `http://localhost:9990`
- [ ] El frontend está desplegado y accesible en `http://localhost:8080/SistemaVentas/`
- [ ] El backend está corriendo en `http://localhost:3001`
- [ ] La base de datos está configurada y accesible
- [ ] El frontend se conecta correctamente al backend
- [ ] Las funcionalidades principales funcionan (login, registro, etc.)
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs de WildFly
- [ ] No hay errores en los logs del backend
- [ ] Todas las capturas de pantalla están tomadas
- [ ] El informe está completo y listo para entregar

---

## 🎓 Notas Finales

- **Mantén WildFly corriendo** mientras trabajas con la aplicación
- **Mantén el backend corriendo** en una consola separada
- **Toma capturas de pantalla** de cada paso importante para el informe
- **Documenta cualquier problema** que encuentres y cómo lo resolviste
- **Prueba todas las funcionalidades** antes de considerar el despliegue completo

---

## 📚 Referencias Útiles

- [Documentación oficial de WildFly](https://docs.wildfly.org/)
- [Guía de despliegue de aplicaciones web en WildFly](https://docs.wildfly.org/26/Admin_Guide.html#Deployment)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React](https://react.dev/)

---

**¡Éxito con tu despliegue! 🚀**

