# Configuración de Jenkins

Esta guía explica cómo configurar Jenkins para automatizar el despliegue de la aplicación usando pipelines CI/CD.

---

## 📋 Objetivos

- Configurar Jenkins para CI/CD
- Crear un pipeline que construya y despliegue la aplicación
- Integrar Jenkins con Docker
- Automatizar el proceso de despliegue

---

## 1. Configuración Inicial de Jenkins

### Acceso a Jenkins

1. Abrir navegador en: `http://localhost:8080`
2. Si es la primera vez, seguir el asistente de configuración
3. Instalar plugins sugeridos o personalizados

### Plugins Necesarios

Instalar los siguientes plugins desde **Manage Jenkins > Manage Plugins**:

1. **Pipeline** - Para usar Jenkinsfile
2. **Docker Pipeline** - Integración con Docker
3. **Docker** - Para construir imágenes Docker
4. **Git** - Integración con Git
5. **Blue Ocean** - Interfaz moderna (opcional)
6. **Kubernetes** - NO necesario (solo investigación teórica)

---

## 2. Configuración de Credenciales

### Configurar Docker Hub (si se usará)

1. Ir a **Manage Jenkins > Manage Credentials**
2. Click en **Global** > **Add Credentials**
3. Tipo: **Username with password**
4. Username: Tu usuario de Docker Hub
5. Password: Tu contraseña o token de Docker Hub
6. ID: `docker-hub-credentials`
7. Guardar

### Configurar Git (si es necesario)

1. Si el repositorio es privado, añadir credenciales SSH o HTTPS
2. Tipo: **SSH Username with private key** o **Username with password**
3. ID: `git-credentials`

---

## 3. Configuración de Docker en Jenkins

### Verificar que Docker está disponible

1. Ir a **Manage Jenkins > Configure System**
2. Verificar que Docker está instalado en el sistema
3. Si Jenkins corre en un contenedor, asegurar que tiene acceso al socket de Docker

### Configurar Docker Agent (si se usa)

1. **Manage Jenkins > Manage Nodes and Clouds**
2. **New Node** > Nombre: `docker-agent`
3. Tipo: **Permanent Agent**
4. Configurar:
   - Remote root directory: `/home/jenkins`
   - Labels: `docker`
   - Usage: **Only build jobs with label expressions matching this node**

---

## 4. Crear Jenkinsfile

El `Jenkinsfile` define el pipeline de CI/CD. Crear en la raíz del proyecto:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_BACKEND = 'sistema-ventas-backend'
        DOCKER_IMAGE_FRONTEND = 'sistema-ventas-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io' // o tu registro privado
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Obteniendo código del repositorio...'
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                echo 'Construyendo imagen Docker del backend...'
                script {
                    docker.build("${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}", "-f Dockerfile.backend .")
                    docker.build("${DOCKER_IMAGE_BACKEND}:latest", "-f Dockerfile.backend .")
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Construyendo imagen Docker del frontend...'
                script {
                    docker.build("${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}", "-f Dockerfile.frontend .")
                    docker.build("${DOCKER_IMAGE_FRONTEND}:latest", "-f Dockerfile.frontend .")
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Ejecutando pruebas...'
                script {
                    // Ejecutar pruebas dentro de contenedor
                    sh '''
                        docker run --rm \
                            -v $(pwd)/backend:/app \
                            -w /app \
                            node:18-alpine \
                            npm test || true
                    '''
                }
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                echo 'Deteniendo contenedores antiguos...'
                script {
                    sh '''
                        docker-compose down || true
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Desplegando aplicación...'
                script {
                    sh '''
                        docker-compose up -d --build
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Verificando salud de la aplicación...'
                script {
                    sh '''
                        sleep 10
                        curl -f http://localhost:3001/health || exit 1
                        curl -f http://localhost/ || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline ejecutado exitosamente!'
            // Opcional: Enviar notificación
        }
        failure {
            echo 'Pipeline falló!'
            // Opcional: Enviar notificación de error
        }
        always {
            echo 'Limpiando imágenes antiguas...'
            script {
                sh '''
                    docker image prune -f
                '''
            }
        }
    }
}
```

---

## 5. Pipeline Alternativo con Docker Compose

Si prefieres usar docker-compose directamente:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Deploy') {
            steps {
                script {
                    sh '''
                        # Detener contenedores existentes
                        docker-compose down || true
                        
                        # Construir y levantar servicios
                        docker-compose up -d --build
                        
                        # Esperar a que los servicios estén listos
                        sleep 15
                        
                        # Verificar que los servicios están corriendo
                        docker-compose ps
                    '''
                }
            }
        }
        
        stage('Verify') {
            steps {
                script {
                    sh '''
                        # Verificar backend
                        curl -f http://localhost:3001/health || exit 1
                        
                        # Verificar frontend
                        curl -f http://localhost/ || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'docker-compose.yml', allowEmptyArchive: true
        }
    }
}
```

---

## 6. Crear Job en Jenkins

### Configuración del Jenkinsfile

**IMPORTANTE:** El `Jenkinsfile` ya está configurado con la URL del repositorio:

```groovy
environment {
    GITHUB_REPO_URL = 'https://github.com/T1Angel4220/SistemaVentas.git'
    GITHUB_BRANCH = 'Jenkins/Johan'
    // ...
}
```

Si necesitas cambiar la URL, edita la variable `GITHUB_REPO_URL` en el Jenkinsfile.

### Método 1: Pipeline Script Directo (Recomendado para esta APE)

1. **New Item** > Nombre: `Sistema-Ventas-CI-CD`
2. Tipo: **Pipeline**
3. Click **OK**
4. En **Pipeline Definition**:
   - Definition: **Pipeline script**
   - Copiar y pegar el contenido completo del `Jenkinsfile` desde `DesarrolloAPE/Jenkinsfile`
   - **Asegúrate de cambiar `GITHUB_REPO_URL` por tu URL real**
5. Click **Save**

### Método 2: Pipeline desde SCM (Alternativa)

1. **New Item** > Nombre: `Sistema-Ventas-CI-CD`
2. Tipo: **Pipeline**
3. Click **OK**
4. En **Pipeline Definition**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: URL de tu repositorio GitHub
   - Credentials: (si es privado)
   - Branch: `Jenkins/Johan`
   - Script Path: `DesarrolloAPE/Jenkinsfile`
5. Click **Save**

**Nota:** El Jenkinsfile está configurado para clonar desde GitHub y cambiar automáticamente a la rama `Jenkins/Johan`.

---

## 7. Ejecutar el Pipeline

### Ejecución Manual

1. Ir al job creado
2. Click en **Build Now**
3. Ver el progreso en **Build History**
4. Click en el build para ver logs

### Ejecución Automática (Webhook)

Para ejecutar automáticamente al hacer push:

1. **Manage Jenkins > Configure System**
2. Configurar **GitHub** o **GitLab** plugin
3. En el job, activar **Build Triggers > GitHub hook trigger**
4. Configurar webhook en GitHub/GitLab apuntando a:
   - `http://tu-jenkins-url:8080/github-webhook/`

---

## 8. Blue Ocean (Interfaz Moderna)

### Acceder a Blue Ocean

1. Click en **Open Blue Ocean** en el sidebar
2. O visitar: `http://localhost:8080/blue`

### Ventajas de Blue Ocean

- Interfaz visual más moderna
- Visualización de pipelines en tiempo real
- Mejor visualización de logs
- Facilita la depuración

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

### Notificaciones

Añadir notificaciones por email:

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

### Problema: Docker no disponible

```groovy
// Añadir al inicio del pipeline
pipeline {
    agent {
        docker {
            image 'docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    // ...
}
```

### Problema: Permisos de Docker

```bash
# En el servidor Jenkins
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Problema: Puerto en uso

```groovy
stage('Deploy') {
    steps {
        sh '''
            # Detener contenedores que usan el puerto
            docker-compose down
            # O matar proceso específico
            lsof -ti:3001 | xargs kill -9 || true
        '''
    }
}
```

---

## 11. Monitoreo y Logs

### Ver Logs del Pipeline

1. Click en el build
2. Click en **Console Output**
3. Ver logs en tiempo real

### Ver Logs de Contenedores

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

## 📝 Capturas de Pantalla Necesarias

1. Interfaz de Jenkins (Dashboard)
2. Configuración del Pipeline
3. Ejecución del Pipeline (Blue Ocean o clásico)
4. Logs de ejecución
5. Estado de los builds
6. Contenedores desplegados después del pipeline
7. Aplicación funcionando después del despliegue

---

## 🔗 Comandos Útiles

```bash
# Reiniciar Jenkins
sudo systemctl restart jenkins

# Ver logs de Jenkins
sudo tail -f /var/log/jenkins/jenkins.log

# Verificar plugins instalados
# Manage Jenkins > Manage Plugins > Installed

# Backup de configuración
sudo tar -czf jenkins-backup.tar.gz /var/lib/jenkins
```

---

**Nota:** Kubernetes no se implementa en esta APE, solo se investiga teóricamente.

