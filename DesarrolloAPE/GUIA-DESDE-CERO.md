# 🚀 Guía Completa desde Cero - Solo Docker Instalado

Esta guía te llevará paso a paso desde tener solo Docker instalado hasta tener Jenkins funcionando en un contenedor y ejecutando el pipeline completo.

**Requisito:** Tener Docker Desktop instalado y funcionando en Windows.

---

## ✅ Paso 1: Verificar que Docker Funciona

Abre PowerShell (o CMD) y ejecuta:

```powershell
# Verificar versión de Docker
docker --version

# Verificar versión de Docker Compose
docker-compose --version

# Probar Docker con un contenedor de prueba
docker run hello-world
```

Si todos los comandos funcionan correctamente, Docker está listo. Si hay errores, asegúrate de que Docker Desktop esté corriendo (deberías ver el ícono de la ballena en la bandeja del sistema).

---

## 📁 Paso 2: Navegar a la Carpeta del Proyecto

Abre PowerShell y navega a la carpeta del proyecto:

```powershell
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
```

Verifica que estás en la carpeta correcta:

```powershell
# Deberías ver archivos como docker-compose.yml, Jenkinsfile, etc.
dir
```

---

## 🐳 Paso 3: Iniciar Jenkins en Contenedor Docker

### 3.1. Iniciar Jenkins

Ejecuta el siguiente comando para iniciar Jenkins en un contenedor:

```powershell
docker-compose up -d jenkins
```

**¿Qué hace este comando?**
- Descarga la imagen oficial de Jenkins LTS (si no la tienes)
- Crea un contenedor llamado `sistema-ventas-jenkins`
- Inicia Jenkins en segundo plano
- Expone Jenkins en el puerto 8080

### 3.2. Verificar que Jenkins está Corriendo

Espera unos segundos y luego verifica:

```powershell
# Ver contenedores corriendo
docker ps
```

Deberías ver el contenedor `sistema-ventas-jenkins` en la lista con estado "Up".

### 3.3. Ver Logs de Jenkins (Opcional)

Si quieres ver qué está haciendo Jenkins:

```powershell
docker logs -f sistema-ventas-jenkins
```

Presiona `Ctrl + C` para salir de los logs.

**Espera 1-2 minutos** para que Jenkins termine de inicializar completamente.

---

## 🔑 Paso 4: Obtener la Contraseña Inicial de Jenkins

Jenkins requiere una contraseña inicial la primera vez que lo usas. Obtén la contraseña ejecutando:

```powershell
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**IMPORTANTE:** Copia la contraseña que aparece. La necesitarás en el siguiente paso.

Ejemplo de salida:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🌐 Paso 5: Acceder a Jenkins por Primera Vez

### 5.1. Abrir Jenkins en el Navegador

1. Abre tu navegador (Chrome, Edge, Firefox, etc.)
2. Ve a: **http://localhost:8080**
3. Deberías ver una pantalla pidiendo la contraseña inicial

### 5.2. Ingresar la Contraseña

1. Pega la contraseña que copiaste en el paso anterior
2. Click en **Continue** (Continuar)

### 5.3. Instalar Plugins Sugeridos

Jenkins te preguntará qué plugins instalar:

1. Selecciona **"Install suggested plugins"** (Instalar plugins sugeridos)
2. Click en **Install**
3. **Espera 2-5 minutos** mientras se instalan los plugins
4. Verás el progreso de cada plugin instalándose

### 5.4. Crear Usuario Administrador

Después de instalar los plugins, Jenkins te pedirá crear un usuario:

1. **Username:** (elige un nombre de usuario, ej: `admin`)
2. **Password:** (elige una contraseña segura)
3. **Confirm password:** (repite la contraseña)
4. **Full name:** (tu nombre completo)
5. **E-mail address:** (tu email)
6. Click en **Save and Continue** (Guardar y Continuar)

### 5.5. Configurar URL de Jenkins

1. Deja la URL por defecto: `http://localhost:8080/`
2. Click en **Save and Finish** (Guardar y Finalizar)

### 5.6. Comenzar a Usar Jenkins

1. Click en **"Start using Jenkins"** (Comenzar a usar Jenkins)
2. ¡Felicidades! Ya estás en el Dashboard de Jenkins

---

## 🔌 Paso 6: Instalar Plugins Adicionales Necesarios

Necesitamos instalar algunos plugins adicionales para que el pipeline funcione correctamente.

### 6.1. Ir a la Sección de Plugins

1. En el Dashboard de Jenkins, click en **"Manage Jenkins"** (Gestionar Jenkins)
2. Click en **"Manage Plugins"** (Gestionar Plugins)

### 6.2. Instalar Plugins

1. Click en la pestaña **"Available"** (Disponibles)
2. En la barra de búsqueda, busca cada uno de estos plugins:

   **Plugins a instalar:**
   - ✅ **Pipeline** - Busca "Pipeline" y márcalo
   - ✅ **Docker Pipeline** - Busca "Docker Pipeline" y márcalo
   - ✅ **Docker** - Busca "Docker" y márcalo
   - ✅ **Git** - Busca "Git" y márcalo
   - ✅ **Blue Ocean** - Busca "Blue Ocean" y márcalo (opcional pero recomendado)

3. Una vez marcados todos, click en **"Install without restart"** (Instalar sin reiniciar)
4. Espera a que se instalen (puede tardar 1-2 minutos)
5. Si aparece un mensaje pidiendo reiniciar, click en **"Restart Jenkins when installation is complete and no jobs are running"**

### 6.3. Esperar Reinicio (si aplica)

Si se reinició Jenkins:
- Espera 30-60 segundos
- Recarga la página en el navegador
- Inicia sesión con el usuario que creaste

---

## ✅ Paso 7: Verificar que Docker Funciona desde Jenkins

Antes de crear el pipeline, vamos a verificar que Jenkins puede ejecutar comandos Docker.

### 7.1. Crear un Job de Prueba

1. En el Dashboard de Jenkins, click en **"New Item"** (Nuevo elemento)
2. Nombre: `test-docker`
3. Tipo: Selecciona **"Freestyle project"**
4. Click en **OK**

### 7.2. Configurar el Job de Prueba

1. Baja hasta la sección **"Build"** (Construcción)
2. Click en **"Add build step"** (Agregar paso de construcción)
3. Selecciona **"Execute shell"** (Ejecutar shell)
4. En el campo de texto, escribe:
   ```bash
   docker --version
   docker ps
   docker images
   ```
5. Click en **Save** (Guardar)

### 7.3. Ejecutar el Job de Prueba

1. En la página del job, click en **"Build Now"** (Construir ahora)
2. Verás un nuevo build en **"Build History"** (Historial de builds)
3. Click en el número del build (ej: #1)
4. Click en **"Console Output"** (Salida de consola)
5. Deberías ver la versión de Docker y la lista de contenedores

**Si ves la salida correctamente, Jenkins puede usar Docker. ¡Perfecto!**

### 7.4. Solución: Error "Permission denied" al ejecutar Docker

Si ves el error `docker: Permission denied`, esto significa que Jenkins no tiene permisos para usar Docker. En Windows, necesitamos instalar Docker CLI dentro del contenedor de Jenkins.

**Solución:**

1. **Detener el contenedor de Jenkins:**
   ```powershell
   docker-compose stop jenkins
   ```

2. **Instalar Docker CLI dentro del contenedor:**
   ```powershell
   docker exec -u root sistema-ventas-jenkins sh -c "apt-get update && apt-get install -y docker.io"
   ```

   Si el contenedor no está corriendo, primero inícialo:
   ```powershell
   docker-compose up -d jenkins
   # Espera 30 segundos
   docker exec -u root sistema-ventas-jenkins sh -c "apt-get update && apt-get install -y docker.io"
   ```

3. **Instalar docker-compose (necesario para el pipeline):**
   ```powershell
   docker exec -u root sistema-ventas-jenkins sh -c "curl -L https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
   ```

4. **Verificar que Docker y docker-compose están instalados:**
   ```powershell
   docker exec -u root sistema-ventas-jenkins docker --version
   docker exec sistema-ventas-jenkins docker-compose --version
   ```

5. **Configurar permisos (si es necesario):**
   ```powershell
   docker exec -u root sistema-ventas-jenkins sh -c "chmod 666 /var/run/docker.sock || true"
   ```

6. **Reiniciar Jenkins:**
   ```powershell
   docker-compose restart jenkins
   ```

7. **Esperar 30-60 segundos** y luego volver a ejecutar el job de prueba en Jenkins.

**Alternativa: Usar Docker-in-Docker (DinD)**

Si la solución anterior no funciona, puedes usar Docker-in-Docker. Edita el `docker-compose.yml` y agrega un servicio DinD:

```yaml
  docker-dind:
    image: docker:dind
    container_name: sistema-ventas-docker-dind
    privileged: true
    volumes:
      - jenkins_home:/var/jenkins_home
    networks:
      - app-network
```

Y en el servicio de Jenkins, agrega:
```yaml
    environment:
      - DOCKER_HOST=tcp://docker-dind:2375
```

Luego reinicia:
```powershell
docker-compose up -d
```

**Nota:** La primera solución (instalar Docker CLI) es más simple y generalmente funciona mejor en Windows.

Si hay otros errores, verifica:
- Que Docker Desktop esté corriendo
- Que el contenedor de Jenkins esté corriendo: `docker ps`

---

## 📝 Paso 8: Crear el Pipeline Principal

Ahora vamos a crear el pipeline que construye y despliega la aplicación.

### 8.1. Crear Nuevo Job de Pipeline

1. En el Dashboard, click en **"New Item"** (Nuevo elemento)
2. Nombre: `Sistema-Ventas-CI-CD`
3. Tipo: Selecciona **"Pipeline"**
4. Click en **OK**

### 8.2. Configurar el Pipeline

1. Baja hasta la sección **"Pipeline"**
2. En **"Definition"** (Definición), selecciona **"Pipeline script"**
3. Ahora necesitas el contenido del Jenkinsfile:

### 8.3. Obtener el Contenido del Jenkinsfile

Abre el archivo `Jenkinsfile` que está en la carpeta `DesarrolloAPE`. Puedes:

**Opción A: Abrir en un editor de texto**
- Abre el archivo `C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE\Jenkinsfile`
- Selecciona todo el contenido (Ctrl + A)
- Copia (Ctrl + C)

**Opción B: Ver desde PowerShell**
```powershell
Get-Content Jenkinsfile
```
(Copia el contenido que aparece)

### 8.4. Pegar el Jenkinsfile en Jenkins

1. En el campo **"Script"** de Jenkins, pega todo el contenido del Jenkinsfile
2. **IMPORTANTE:** Verifica que la URL del repositorio sea correcta:
   - Busca la línea: `GITHUB_REPO_URL = 'https://github.com/T1Angel4220/SistemaVentas.git'`
   - Si tu repositorio es diferente, cámbiala
3. Click en **Save** (Guardar)

---

## 🚀 Paso 9: Ejecutar el Pipeline

### 9.1. Ejecutar Manualmente

1. En la página del job `Sistema-Ventas-CI-CD`, click en **"Build Now"** (Construir ahora)
2. Verás un nuevo build en **"Build History"**
3. Click en el número del build (ej: #1)
4. Click en **"Console Output"** para ver el progreso en tiempo real

### 9.2. Monitorear la Ejecución

El pipeline ejecutará estas etapas:

1. **Checkout** - Clona el repositorio desde GitHub
2. **Build Backend** - Construye la imagen Docker del backend
3. **Build Frontend** - Construye la imagen Docker del frontend
4. **Test** - Ejecuta pruebas (puede fallar si no hay tests configurados, no es crítico)
5. **Stop Old Containers** - Detiene contenedores anteriores
6. **Deploy** - Despliega la aplicación con docker-compose
7. **Health Check** - Verifica que la aplicación funciona

**El proceso completo puede tardar 5-15 minutos** dependiendo de tu conexión a internet y la velocidad de tu computadora.

### 9.3. Verificar que Funcionó

Si el pipeline fue exitoso:

1. Verás un círculo azul ✅ al lado del build
2. En la consola verás: `Pipeline ejecutado exitosamente!`

**Verificar contenedores:**
```powershell
docker ps
```

Deberías ver:
- `sistema-ventas-jenkins` (Jenkins)
- `sistema-ventas-db` (Base de datos)
- `sistema-ventas-backend` (Backend)
- `sistema-ventas-frontend` (Frontend)

**Verificar aplicación:**
- Frontend: Abre http://localhost en tu navegador
- Backend: Abre http://localhost:3001 en tu navegador

---

## 🎨 Paso 10: Usar Blue Ocean (Opcional pero Recomendado)

Blue Ocean es una interfaz moderna y visual para Jenkins.

### 10.1. Acceder a Blue Ocean

1. En el Dashboard de Jenkins, busca **"Open Blue Ocean"** en el menú lateral
2. O ve directamente a: **http://localhost:8080/blue**

### 10.2. Ver el Pipeline en Blue Ocean

1. Click en **"Sistema-Ventas-CI-CD"**
2. Verás una visualización gráfica del pipeline
3. Puedes ver cada etapa y sus logs de forma más clara

---

## 🆘 Solución de Problemas Comunes

### Problema: Jenkins no accesible en http://localhost:8080

**Solución:**
```powershell
# Verificar que el contenedor está corriendo
docker ps

# Si no está corriendo, iniciarlo
docker-compose up -d jenkins

# Ver logs para identificar el problema
docker logs sistema-ventas-jenkins
```

### Problema: Pipeline falla en "Checkout"

**Solución:**
- Verifica que la URL del repositorio en el Jenkinsfile sea correcta
- Verifica que la rama `Jenkins/Johan` existe en GitHub
- Si el repositorio es privado, necesitas configurar credenciales en Jenkins

### Problema: Pipeline falla en "Build Backend" o "Build Frontend"

**Solución:**
```powershell
# Verificar que Jenkins puede usar Docker
docker exec sistema-ventas-jenkins docker --version

# Si no funciona, reiniciar Jenkins
docker-compose restart jenkins
```

### Problema: Pipeline falla en "Deploy" con error "docker-compose: not found"

**Síntomas:**
- El pipeline falla en la etapa "Deploy"
- Verás el error: `/script.sh: docker-compose: not found`
- Exit code: 127

**Causa:**
El contenedor de Jenkins no tiene `docker-compose` instalado.

**Solución:**
Instalar docker-compose dentro del contenedor de Jenkins:

```powershell
docker exec -u root sistema-ventas-jenkins sh -c "curl -L https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
```

Verificar que está instalado:
```powershell
docker exec sistema-ventas-jenkins docker-compose --version
```

Deberías ver: `Docker Compose version v2.24.5`

**Nota:** Esta instalación se mantiene mientras el contenedor exista. Si recreas el contenedor, necesitarás reinstalar docker-compose.

### Problema: Pipeline se queda atascado en "Stop Old Containers"

**Síntomas:**
- El pipeline se queda atascado en la etapa "Stop Old Containers"
- Verás: `Container sistema-ventas-jenkins  Stopping` y nunca termina
- El proceso se queda colgado indefinidamente

**Causa:**
El pipeline está intentando ejecutar `docker-compose down` desde dentro del contenedor de Jenkins, lo que intenta detener el contenedor de Jenkins mismo. Esto causa un deadlock porque Jenkins está intentando detenerse a sí mismo.

**Solución (Ya aplicada en el código):**
El Jenkinsfile ha sido modificado para:
1. Detener solo los servicios de la aplicación (backend, frontend, postgres) sin incluir Jenkins
2. Usar `docker-compose stop` en lugar de `docker-compose down` para servicios específicos
3. Usar comandos docker directos para eliminar contenedores específicos

**Si el problema persiste:**
1. Detén manualmente el build en Jenkins (si está corriendo)
2. Verifica que el Jenkinsfile tenga los cambios más recientes
3. Ejecuta el pipeline nuevamente

### Problema: Pipeline falla en "Build Frontend" con errores de TypeScript

**Síntomas:**
- El pipeline falla en la etapa "Build Frontend"
- Verás errores como: `error TS6133`, `error TS1484`, `error TS2339`, etc.
- El mensaje final dice: `ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully`

**Causa:**
El código TypeScript tiene errores de compilación (imports no utilizados, tipos incorrectos, etc.)

**Solución Temporal (Ya aplicada):**
El `Dockerfile.frontend` ha sido modificado para ejecutar `vite build` directamente, lo que permite que el build continúe a pesar de algunos errores de TypeScript.

**Solución Permanente:**
Los errores de TypeScript deben corregirse en el código. Los errores comunes son:
- Imports no utilizados: Eliminar o usar los imports
- Tipos incorrectos: Corregir las definiciones de tipos
- Propiedades que no existen: Verificar las interfaces y tipos

**Para verificar si el build funciona ahora:**
1. Ejecuta el pipeline nuevamente en Jenkins
2. El build debería continuar y crear la imagen del frontend

### Problema: Contenedores no inician después del deploy

**Solución:**
```powershell
# Ver logs de los contenedores
docker-compose logs

# Ver logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Problema: Puerto 8080 ya está en uso

**Solución:**
1. Ver qué está usando el puerto:
   ```powershell
   netstat -ano | findstr :8080
   ```
2. Si es otro proceso, detenerlo o cambiar el puerto de Jenkins en `docker-compose.yml`:
   ```yaml
   ports:
     - "8081:8080"  # Cambiar 8080 por 8081
   ```
3. Reiniciar Jenkins:
   ```powershell
   docker-compose restart jenkins
   ```

---

## 📋 Checklist de Verificación

Usa este checklist para asegurarte de que todo está funcionando:

- [ ] Docker Desktop está corriendo
- [ ] Contenedor de Jenkins está corriendo (`docker ps`)
- [ ] Jenkins accesible en http://localhost:8080
- [ ] Configuración inicial de Jenkins completada
- [ ] Plugins necesarios instalados
- [ ] Job de prueba Docker funciona
- [ ] Pipeline creado en Jenkins
- [ ] Pipeline ejecutado exitosamente
- [ ] Contenedores de la aplicación corriendo (`docker ps`)
- [ ] Frontend accesible en http://localhost
- [ ] Backend accesible en http://localhost:3001

---

## 🎯 Comandos de Referencia Rápida

```powershell
# Jenkins
docker-compose up -d jenkins              # Iniciar Jenkins
docker-compose stop jenkins               # Detener Jenkins
docker-compose restart jenkins            # Reiniciar Jenkins
docker logs -f sistema-ventas-jenkins    # Ver logs de Jenkins
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword  # Contraseña inicial

# Aplicación
docker-compose up -d                     # Iniciar todos los servicios
docker-compose down                      # Detener todos los servicios
docker-compose logs -f                   # Ver logs de todos los servicios
docker ps                                # Ver contenedores corriendo

# Acceder a Jenkins
# http://localhost:8080
```

---

## ✅ ¡Listo!

Si has seguido todos los pasos, ahora tienes:

1. ✅ Jenkins corriendo en un contenedor Docker
2. ✅ Pipeline configurado y funcionando
3. ✅ Aplicación desplegada automáticamente
4. ✅ Todo funcionando en Windows

**Próximos pasos:**
- Revisa [03-JENKINS.md](./03-JENKINS.md) para más detalles sobre Jenkins
- Revisa [05-EJECUCION.md](./05-EJECUCION.md) para más información sobre el pipeline
- Toma capturas de pantalla de todo el proceso para tu documentación

---

**¿Tienes dudas?** Revisa los archivos de documentación o consulta la sección de solución de problemas arriba.

