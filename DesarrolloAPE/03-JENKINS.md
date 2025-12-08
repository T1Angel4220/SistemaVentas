# Configuración de Jenkins en Contenedor Docker

Esta guía explica cómo configurar y usar Jenkins ejecutándose en un contenedor Docker para automatizar el despliegue de la aplicación usando pipelines CI/CD.

**IMPORTANTE:** Jenkins se ejecuta en un contenedor Docker, NO está instalado directamente en Windows.

---

## 📋 Objetivos

- Configurar Jenkins en contenedor Docker
- Crear un pipeline que construya y despliegue la aplicación
- Integrar Jenkins con Docker (Docker-in-Docker)
- Automatizar el proceso de despliegue

---

## 1. Iniciar Jenkins en Contenedor Docker

### Paso 1: Verificar Docker está Funcionando

Abrir PowerShell y ejecutar:

```powershell
# Verificar Docker está corriendo
docker ps

# Navegar a la carpeta del proyecto
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
```

### Paso 2: Iniciar Jenkins

```powershell
# Iniciar Jenkins en contenedor
docker-compose up -d jenkins

# Verificar que está corriendo
docker ps
```

Deberías ver el contenedor `sistema-ventas-jenkins` en estado "Up".

### Paso 3: Acceder a Jenkins

1. Abrir navegador en: **http://localhost:8080**
2. Esperar 1-2 minutos a que Jenkins termine de inicializar
3. Verás una pantalla pidiendo la contraseña inicial

### Paso 4: Obtener Contraseña Inicial

En PowerShell:

```powershell
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copiar la contraseña y pegarla en la pantalla de Jenkins.

### Paso 5: Configuración Inicial

1. **Instalar plugins sugeridos:**
   - Seleccionar **"Install suggested plugins"**
   - Esperar a que se instalen (puede tardar varios minutos)

2. **Crear usuario administrador:**
   - Completar el formulario con tus datos
   - Click en **Save and Continue**

3. **Configurar URL:**
   - Dejar por defecto: `http://localhost:8080/`
   - Click en **Save and Finish**

4. **Click en "Start using Jenkins"**

---

## 2. Instalación de Plugins Necesarios

### Plugins Requeridos

Instalar los siguientes plugins desde **Manage Jenkins > Manage Plugins > Available**:

1. **Pipeline** - Para usar Jenkinsfile
2. **Docker Pipeline** - Integración con Docker
3. **Docker** - Para construir imágenes Docker
4. **Git** - Integración con Git
5. **Blue Ocean** - Interfaz moderna (opcional pero recomendado)

### Pasos para Instalar Plugins

1. En Jenkins Dashboard, click en **Manage Jenkins**
2. Click en **Manage Plugins**
3. Ir a la pestaña **Available**
4. Buscar cada plugin en la barra de búsqueda
5. Marcar los plugins deseados
6. Click en **Install without restart**
7. Esperar a que se instalen
8. Si se solicita, click en **Restart Jenkins when installation is complete**

---

## 3. Configuración de Docker en Jenkins

### Verificar Acceso a Docker

El contenedor de Jenkins ya está configurado para acceder al socket de Docker del host a través del volumen montado en `docker-compose.yml`.

**Verificar que Docker funciona desde Jenkins:**

1. En Jenkins, click en **New Item**
2. Nombre: `test-docker`
3. Tipo: **Freestyle project**
4. Click en **OK**
5. En **Build**, agregar paso **Execute shell**:
   ```bash
   docker --version
   docker ps
   docker images
   ```
6. Click en **Save**
7. Click en **Build Now**
8. Verificar que el build es exitoso

Si el build es exitoso, Jenkins puede ejecutar comandos Docker correctamente.

---

## 4. Configuración de Credenciales

### Configurar Docker Hub (Opcional - si se usará)

Si planeas subir imágenes a Docker Hub:

1. Ir a **Manage Jenkins > Manage Credentials**
2. Click en **Global** > **Add Credentials**
3. Tipo: **Username with password**
4. Username: Tu usuario de Docker Hub
5. Password: Tu contraseña o token de Docker Hub
6. ID: `docker-hub-credentials`
7. Description: `Credenciales de Docker Hub`
8. Click en **OK**

### Configurar Git (si el repositorio es privado)

Si tu repositorio de GitHub es privado:

1. Ir a **Manage Jenkins > Manage Credentials**
2. Click en **Global** > **Add Credentials**
3. Tipo: **Username with password**
4. Username: Tu usuario de GitHub
5. Password: Tu token de acceso personal de GitHub
6. ID: `git-credentials`
7. Description: `Credenciales de GitHub`
8. Click en **OK**

**Nota:** Para repositorios públicos, no se necesitan credenciales.

---

## 5. Crear Jenkinsfile

El `Jenkinsfile` define el pipeline de CI/CD. Ya está creado en `DesarrolloAPE/Jenkinsfile`.

### Estructura del Jenkinsfile

El Jenkinsfile actual incluye las siguientes etapas:

1. **Checkout**: Clona el repositorio desde GitHub
2. **Build Backend**: Construye imagen Docker del backend
3. **Build Frontend**: Construye imagen Docker del frontend
4. **Test**: Ejecuta pruebas (opcional)
5. **Stop Old Containers**: Detiene contenedores anteriores
6. **Deploy**: Despliega con docker-compose
7. **Health Check**: Verifica que la aplicación funciona

### Configurar URL del Repositorio

Si necesitas cambiar la URL del repositorio, edita el `Jenkinsfile`:

```groovy
environment {
    GITHUB_REPO_URL = 'https://github.com/T1Angel4220/SistemaVentas.git'
    GITHUB_BRANCH = 'Jenkins/Johan'
    // ...
}
```

---

## 6. Crear Job en Jenkins

### Método 1: Pipeline Script Directo (Recomendado)

1. En Jenkins Dashboard, click en **New Item**
2. Nombre: `Sistema-Ventas-CI-CD`
3. Tipo: **Pipeline**
4. Click en **OK**

5. En la configuración del Pipeline:
   - **Pipeline Definition**: Seleccionar **Pipeline script**
   - Abrir el archivo `DesarrolloAPE/Jenkinsfile` en tu editor
   - Copiar TODO el contenido del Jenkinsfile
   - Pegar en el campo **Script**
   - **Asegúrate de cambiar `GITHUB_REPO_URL` por tu URL real si es diferente**

6. Click en **Save**

### Método 2: Pipeline desde SCM (Alternativa)

1. En Jenkins Dashboard, click en **New Item**
2. Nombre: `Sistema-Ventas-CI-CD`
3. Tipo: **Pipeline**
4. Click en **OK**

5. En la configuración del Pipeline:
   - **Pipeline Definition**: Seleccionar **Pipeline script from SCM**
   - **SCM**: Seleccionar **Git**
   - **Repository URL**: `https://github.com/T1Angel4220/SistemaVentas.git`
   - **Credentials**: (dejar vacío si es público, o seleccionar credenciales si es privado)
   - **Branch**: `*/Jenkins/Johan`
   - **Script Path**: `DesarrolloAPE/Jenkinsfile`

6. Click en **Save**

---

## 7. Ejecutar el Pipeline

### Ejecución Manual

1. Ir al job creado: `Sistema-Ventas-CI-CD`
2. Click en **Build Now**
3. Ver el progreso en **Build History**
4. Click en el build para ver detalles
5. Click en **Console Output** para ver logs en tiempo real

### Ejecución Automática (Webhook - Opcional)

Para ejecutar automáticamente al hacer push a GitHub:

1. **En GitHub:**
   - Ir a tu repositorio
   - Settings > Webhooks
   - Add webhook
   - Payload URL: `http://tu-ip-publica:8080/github-webhook/`
   - Content type: `application/json`
   - Click en **Add webhook**

2. **En Jenkins:**
   - Ir al job `Sistema-Ventas-CI-CD`
   - Click en **Configure**
   - En **Build Triggers**, marcar **GitHub hook trigger for GITScm polling**
   - Click en **Save**

**Nota:** Para webhooks, necesitas que Jenkins sea accesible desde internet o usar un servicio como ngrok.

---

## 8. Blue Ocean (Interfaz Moderna)

### Acceder a Blue Ocean

1. En Jenkins Dashboard, click en **Open Blue Ocean** en el sidebar
2. O visitar directamente: **http://localhost:8080/blue**

### Ventajas de Blue Ocean

- Interfaz visual más moderna
- Visualización de pipelines en tiempo real
- Mejor visualización de logs
- Facilita la depuración
- Visualización de etapas en paralelo

---

## 9. Configuración Avanzada

### Variables de Entorno

Añadir variables de entorno en el pipeline:

```groovy
environment {
    NODE_ENV = 'production'
    DB_HOST = 'postgres'
    JWT_SECRET = credentials('jwt-secret')
}
```

### Credenciales en Pipeline

```groovy
stage('Deploy') {
    steps {
        withCredentials([
            usernamePassword(
                credentialsId: 'docker-hub-credentials',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )
        ]) {
            sh '''
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker push ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}
            '''
        }
    }
}
```

### Notificaciones por Email (Opcional)

Instalar plugin **Email Extension Plugin** y configurar:

```groovy
post {
    success {
        emailext (
            subject: "Pipeline Exitoso: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "El pipeline se ejecutó correctamente.",
            to: "tu-email@ejemplo.com"
        )
    }
    failure {
        emailext (
            subject: "Pipeline Falló: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "El pipeline falló. Revisar logs.",
            to: "tu-email@ejemplo.com"
        )
    }
}
```

---

## 10. Troubleshooting

### Problema: Jenkins no puede ejecutar comandos Docker

**Solución:**

1. Verificar que el contenedor tiene acceso al socket de Docker:
   ```powershell
   docker exec sistema-ventas-jenkins ls -la /var/run/docker.sock
   ```

2. Verificar la configuración en `docker-compose.yml`:
   ```yaml
   volumes:
     - /var/run/docker.sock:/var/run/docker.sock
   ```

3. Reiniciar el contenedor:
   ```powershell
   docker-compose restart jenkins
   ```

### Problema: Pipeline falla en Checkout

**Solución:**

1. Verificar que la URL del repositorio es correcta
2. Verificar que la rama existe en GitHub
3. Si el repositorio es privado, configurar credenciales de Git
4. Verificar conectividad desde el contenedor:
   ```powershell
   docker exec sistema-ventas-jenkins ping github.com
   ```

### Problema: Pipeline falla en Build

**Solución:**

1. Verificar que Docker está disponible:
   ```powershell
   docker exec sistema-ventas-jenkins docker --version
   ```

2. Verificar que los Dockerfiles existen en el repositorio
3. Revisar logs del pipeline en Jenkins

### Problema: Puerto 8080 en uso

**Solución:**

1. Verificar qué está usando el puerto:
   ```powershell
   netstat -ano | findstr :8080
   ```

2. Cambiar el puerto en `docker-compose.yml`:
   ```yaml
   ports:
     - "8081:8080"  # Cambiar 8080 por 8081
   ```

3. Reiniciar Jenkins:
   ```powershell
   docker-compose restart jenkins
   ```

4. Acceder a Jenkins en: `http://localhost:8081`

### Problema: Contenedor de Jenkins se detiene

**Solución:**

1. Ver logs del contenedor:
   ```powershell
   docker logs sistema-ventas-jenkins
   ```

2. Verificar permisos del volumen:
   ```powershell
   docker volume inspect sistema-ventas_jenkins_home
   ```

3. Recrear el contenedor:
   ```powershell
   docker-compose down jenkins
   docker-compose up -d jenkins
   ```

---

## 11. Monitoreo y Logs

### Ver Logs del Pipeline

1. En Jenkins, click en el build
2. Click en **Console Output**
3. Ver logs en tiempo real

### Ver Logs del Contenedor de Jenkins

```powershell
# Ver logs en tiempo real
docker logs -f sistema-ventas-jenkins

# Ver últimas 100 líneas
docker logs --tail 100 sistema-ventas-jenkins
```

### Ver Logs de Contenedores desde Pipeline

El pipeline ya incluye comandos para ver logs:

```groovy
stage('View Logs') {
    steps {
        sh '''
            docker-compose logs --tail=50 backend
            docker-compose logs --tail=50 frontend
        '''
    }
}
```

---

## 12. Comandos Útiles para Jenkins en Docker

### Iniciar Jenkins

```powershell
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
docker-compose up -d jenkins
```

### Detener Jenkins

```powershell
docker-compose stop jenkins
```

### Reiniciar Jenkins

```powershell
docker-compose restart jenkins
```

### Ver Estado de Jenkins

```powershell
docker ps | Select-String "jenkins"
```

### Acceder al Shell de Jenkins

```powershell
docker exec -it sistema-ventas-jenkins bash
```

### Backup de Datos de Jenkins

```powershell
# Crear backup
docker run --rm -v sistema-ventas_jenkins_home:/data -v ${PWD}:/backup alpine tar czf /backup/jenkins-backup-$(Get-Date -Format "yyyyMMdd-HHmmss").tar.gz /data
```

### Restaurar Backup

```powershell
# Detener Jenkins
docker-compose stop jenkins

# Restaurar backup
docker run --rm -v sistema-ventas_jenkins_home:/data -v ${PWD}:/backup alpine tar xzf /backup/jenkins-backup-YYYYMMDD-HHMMSS.tar.gz -C /

# Iniciar Jenkins
docker-compose start jenkins
```

---

## 📝 Capturas de Pantalla Necesarias

1. Contenedor de Jenkins corriendo (`docker ps`)
2. Interfaz de Jenkins (Dashboard)
3. Configuración del Pipeline
4. Ejecución del Pipeline (Blue Ocean o clásico)
5. Logs de ejecución
6. Estado de los builds
7. Contenedores desplegados después del pipeline
8. Aplicación funcionando después del despliegue

---

## 🔗 Comandos de Referencia Rápida

```powershell
# Jenkins en Docker
docker-compose up -d jenkins          # Iniciar Jenkins
docker-compose stop jenkins           # Detener Jenkins
docker-compose restart jenkins        # Reiniciar Jenkins
docker logs -f sistema-ventas-jenkins # Ver logs

# Acceder a Jenkins
# http://localhost:8080

# Obtener contraseña inicial
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

**Nota:** Kubernetes no se implementa en esta APE, solo se investiga teóricamente.
