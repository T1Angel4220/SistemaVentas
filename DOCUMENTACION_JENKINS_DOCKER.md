# Documentación: Pipeline de CI/CD con Jenkins y Docker

## 📋 Índice

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación de Herramientas](#instalación-de-herramientas)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Docker](#docker)
6. [Jenkins Pipeline](#jenkins-pipeline)
7. [Despliegue](#despliegue)
8. [Troubleshooting](#troubleshooting)
9. [Conclusiones](#conclusiones)

---

## 1. Introducción

Este documento describe el proceso completo de implementación de un pipeline de CI/CD (Continuous Integration/Continuous Deployment) utilizando Jenkins y Docker para el Sistema de Ventas Multiempresa.

### 1.1 Objetivos

- Automatizar el proceso de construcción y despliegue de la aplicación
- Utilizar Docker para containerizar los servicios (Backend, Frontend y Base de Datos)
- Crear un pipeline de Jenkins que ejecute automáticamente el despliegue
- Documentar todo el proceso de instalación y configuración

### 1.2 Arquitectura

La aplicación está compuesta por:
- **Backend**: API REST desarrollada en Node.js con TypeScript y Express
- **Frontend**: Aplicación React con Vite y TypeScript
- **Base de Datos**: PostgreSQL 15

---

## 2. Requisitos Previos

### 2.1 Software Necesario

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Jenkins** (versión 2.400 o superior)
- **Git** (para control de versiones)
- **Node.js** (opcional, solo si se ejecuta fuera de Docker)

### 2.2 Recursos del Sistema

- **CPU**: Mínimo 2 cores
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Espacio en disco**: Mínimo 10GB libres
- **Sistema Operativo**: Linux, macOS o Windows con WSL2

---

## 3. Instalación de Herramientas

### 3.1 Instalación de Docker

#### Windows (con WSL2)

1. Instalar WSL2:
   ```powershell
   wsl --install
   ```

2. Descargar Docker Desktop desde: https://www.docker.com/products/docker-desktop

3. Instalar Docker Desktop y seguir las instrucciones del instalador

4. Verificar la instalación:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux (Ubuntu/Debian)

```bash
# Actualizar paquetes
sudo apt update

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg lsb-release

# Agregar la clave GPG oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar el repositorio de Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER

# Verificar instalación
docker --version
docker compose version
```

### 3.2 Instalación de Jenkins

#### Usando Docker (Recomendado)

```bash
# Crear volumen para persistencia
docker volume create jenkins-data

# Ejecutar Jenkins
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Obtener la contraseña inicial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

#### Instalación en Linux

```bash
# Agregar clave GPG
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Agregar repositorio
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Instalar Jenkins
sudo apt update
sudo apt install -y jenkins

# Iniciar Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Verificar estado
sudo systemctl status jenkins

# Obtener contraseña inicial
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 3.3 Configuración Inicial de Jenkins

1. Acceder a Jenkins en el navegador: `http://localhost:8080`

2. Ingresar la contraseña inicial obtenida anteriormente

3. Instalar plugins sugeridos (o seleccionar plugins personalizados)

4. Crear usuario administrador

5. Configurar URL de Jenkins

6. Instalar plugins adicionales necesarios:
   - **Pipeline** (ya incluido en instalación sugerida)
   - **Docker Pipeline** (si no está incluido)
   - **Credentials Binding** (si no está incluido)

7. Configurar Docker en Jenkins:
   - Si Jenkins está en Docker, asegurar que tenga acceso al socket de Docker
   - Si Jenkins está instalado directamente, verificar permisos del grupo docker

---

## 4. Configuración del Proyecto

### 4.1 Estructura de Archivos Docker

El proyecto incluye los siguientes archivos Docker:

```
SistemaVentas/
├── backend/
│   ├── Dockerfile              # Imagen Docker del backend
│   ├── .dockerignore          # Archivos excluidos del build
│   └── migrations/            # Scripts SQL de inicialización
├── frontend/
│   ├── Dockerfile             # Imagen Docker del frontend
│   ├── .dockerignore          # Archivos excluidos del build
│   └── nginx.conf             # Configuración de Nginx
├── docker-compose.yml         # Orquestación de servicios
├── Jenkinsfile                # Pipeline de Jenkins
└── .dockerignore              # Archivos excluidos globales
```

### 4.2 Variables de Entorno

Crear un archivo `.env.docker` en la raíz del proyecto:

```env
# Base de Datos
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=Angel_4220
DB_PORT=5432

# Backend
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eventconnect90@gmail.com
EMAIL_PASSWORD=oshzkgssiwxfdiqr
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>

# URLs
CORS_ORIGIN=http://localhost:80,http://localhost:5173
FRONTEND_URL=http://localhost:80
BACKEND_PORT=3001
FRONTEND_PORT=80

# Otros
BCRYPT_SALT_ROUNDS=10
```

**Nota**: Puedes usar el archivo `.env.docker.example` como plantilla y copiarlo como `.env.docker`:
```bash
cp .env.docker.example .env.docker
```

### 4.3 Configurar Credenciales en Jenkins

1. En Jenkins, ir a **Manage Jenkins** > **Manage Credentials**

2. Agregar credenciales:
   - **db-user**: Usuario de base de datos (opcional, puede usar variables de entorno)
   - **db-password**: Contraseña de base de datos
   - **jwt-secret**: Clave secreta para JWT
   - **email-user**: Usuario de email (opcional)
   - **email-password**: Contraseña de email (opcional)

---

## 5. Docker

### 5.1 Dockerfile del Backend

El `Dockerfile` del backend:
- Utiliza Node.js 18 Alpine (imagen ligera)
- Instala dependencias de producción
- Expone el puerto 3001
- Configura el directorio de trabajo

### 5.2 Dockerfile del Frontend

El `Dockerfile` del frontend utiliza multi-stage build:
- **Etapa 1 (builder)**: Construye la aplicación React
- **Etapa 2 (production)**: Sirve los archivos estáticos con Nginx

### 5.3 Docker Compose

El archivo `docker-compose.yml` define tres servicios:

1. **postgres**: Base de datos PostgreSQL
2. **backend**: API REST de Node.js
3. **frontend**: Aplicación React servida con Nginx

Características:
- Red interna para comunicación entre servicios
- Volúmenes persistentes para la base de datos
- Health checks para verificar estado de servicios
- Dependencias entre servicios

### 5.4 Construcción Manual de Imágenes

```bash
# Construir imagen del backend
cd backend
docker build -t sistema-ventas-backend:latest .

# Construir imagen del frontend
cd ../frontend
docker build -t sistema-ventas-frontend:latest .

# Volver a la raíz y ejecutar con docker-compose
cd ..
docker-compose up -d
```

### 5.5 Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir imágenes y reiniciar
docker-compose up -d --build

# Ver estado de los contenedores
docker-compose ps

# Ejecutar comandos en un contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d sistema_ventas_multiempresa
```

---

## 6. Jenkins Pipeline

### 6.1 Estructura del Pipeline

El `Jenkinsfile` define las siguientes etapas:

1. **Limpiar Workspace**: Elimina archivos previos y detiene contenedores
2. **Checkout Código**: Obtiene el código fuente del repositorio
3. **Verificar Herramientas**: Valida que Docker esté disponible
4. **Build Backend**: Construye la imagen Docker del backend
5. **Build Frontend**: Construye la imagen Docker del frontend
6. **Test Backend**: Ejecuta pruebas (opcional)
7. **Desplegar con Docker Compose**: Despliega todos los servicios
8. **Health Check**: Verifica que los servicios estén funcionando
9. **Generar Reporte**: Crea un reporte del despliegue

### 6.2 Configurar Pipeline en Jenkins

1. En Jenkins, hacer clic en **New Item**

2. Ingresar nombre del proyecto (ej: `SistemaVentas-Pipeline`)

3. Seleccionar **Pipeline** y hacer clic en **OK**

4. En la configuración:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: URL de tu repositorio
   - **Credentials**: (opcional) Si el repo es privado
   - **Branch Specifier**: `*/main` o `*/master` o la rama que uses
   - **Script Path**: `Jenkinsfile`

5. Guardar y hacer clic en **Build Now**

### 6.3 Variables de Entorno del Pipeline

El pipeline utiliza las siguientes variables de entorno:

- `DOCKER_REGISTRY`: Registro Docker (opcional)
- `BACKEND_IMAGE`: Nombre de la imagen del backend
- `FRONTEND_IMAGE`: Nombre de la imagen del frontend
- `IMAGE_TAG`: Tag de la imagen (usando BUILD_NUMBER)
- Credenciales configuradas en Jenkins

### 6.4 Ejecución del Pipeline

Una vez configurado, el pipeline se ejecutará automáticamente cuando:
- Se haga un push al repositorio (si se configura webhook)
- Se ejecute manualmente desde Jenkins
- Se programe con un trigger (cron)

---

## 7. Despliegue

### 7.1 Proceso de Despliegue

El despliegue se realiza en los siguientes pasos:

1. **Construcción**: Se construyen las imágenes Docker
2. **Pruebas**: Se ejecutan pruebas (si están configuradas)
3. **Despliegue**: Se levantan los servicios con docker-compose
4. **Verificación**: Se verifica que los servicios estén saludables

### 7.2 Acceso a la Aplicación

Una vez desplegado:

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001/api
- **Base de Datos**: localhost:5432

### 7.3 Verificación del Despliegue

```bash
# Verificar estado de contenedores
docker-compose ps

# Verificar logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Verificar salud del backend
curl http://localhost:3001/api/health

# Verificar frontend
curl http://localhost:80
```

---

## 8. Troubleshooting

### 8.1 Problemas Comunes

#### Error: "Cannot connect to Docker daemon"

**Solución**: Verificar que Docker esté ejecutándose:
```bash
sudo systemctl status docker
sudo systemctl start docker
```

#### Error: "Permission denied while trying to connect to Docker"

**Solución**: Agregar usuario al grupo docker:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Error: "Port already in use"

**Solución**: Cambiar puertos en `docker-compose.yml` o detener el servicio que usa el puerto:
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

#### Error: "Database connection failed"

**Solución**: Verificar que PostgreSQL esté iniciado y las credenciales sean correctas:
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U postgres
```

#### Error: "Build failed in Jenkins"

**Solución**: 
- Verificar logs del build en Jenkins
- Verificar que Docker esté disponible para Jenkins
- Verificar permisos de archivos

### 8.2 Limpieza de Recursos

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no utilizadas
docker image prune -a

# Eliminar volúmenes no utilizados
docker volume prune

# Limpieza completa (¡cuidado!)
docker system prune -a --volumes
```

---

## 9. Conclusiones

### 9.1 Beneficios Obtenidos

- **Automatización**: El proceso de despliegue está completamente automatizado
- **Reproducibilidad**: Cada despliegue es idéntico gracias a Docker
- **Escalabilidad**: Fácil escalar servicios individuales
- **Aislamiento**: Cada servicio está aislado en su propio contenedor
- **Versionado**: Las imágenes Docker pueden versionarse

### 9.2 Próximos Pasos (Opcional)

- Configurar Kubernetes para orquestación avanzada
- Implementar monitoreo con Prometheus y Grafana
- Configurar CI/CD con GitHub Actions o GitLab CI
- Implementar blue-green deployment
- Configurar load balancing

### 9.3 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Documentación oficial de Jenkins](https://www.jenkins.io/doc/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [Jenkins Pipeline syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)

---

## Anexos

### A. Capturas de Pantalla

**Nota**: Debes incluir las siguientes capturas de pantalla en tu informe PDF:

1. **Instalación de Docker**:
   - Verificación de instalación (`docker --version`)
   - Estado de Docker Desktop (si usas Windows)

2. **Instalación de Jenkins**:
   - Página inicial de Jenkins en `http://localhost:8080`
   - Pantalla de instalación de plugins
   - Panel principal de Jenkins

3. **Configuración del Pipeline**:
   - Creación del nuevo item (Pipeline)
   - Configuración del SCM (Git)
   - Configuración de variables de entorno

4. **Ejecución del Pipeline**:
   - Vista del pipeline ejecutándose (Blue Ocean o vista clásica)
   - Etapas del pipeline mostrando éxito (stages con ✓)
   - Logs de construcción de imágenes Docker
   - Logs de despliegue con docker-compose
   - Resultado final exitoso del pipeline

5. **Verificación del Despliegue**:
   - Estado de contenedores (`docker-compose ps`)
   - Acceso al frontend en navegador (`http://localhost:80`)
   - Acceso al backend API (`http://localhost:3001/api/health`)
   - Listado de imágenes Docker creadas (`docker images`)

### B. Ejemplos de Logs

#### B.1 Logs de Ejecución Exitosa del Pipeline

```bash
# Ejemplo de logs del stage "Build Backend"
[Pipeline] stage
[Pipeline] { (Build Backend)
[Pipeline] dir
Running in /var/jenkins_home/workspace/SistemaVentas-Pipeline/backend
[Pipeline] sh
+ docker build -t sistemaventas-backend:1 .
Sending build context to Docker daemon  15.2MB
Step 1/8 : FROM node:18-alpine
 ---> a1b2c3d4e5f6
Step 2/8 : RUN apk add --no-cache python3 make g++
 ---> Using cache
...
Step 8/8 : CMD ["npm", "start"]
 ---> Running in xyz123
Successfully built abc123def456
Successfully tagged sistemaventas-backend:1
Successfully tagged sistemaventas-backend:latest

# Ejemplo de logs del stage "Desplegar con Docker Compose"
[Pipeline] stage
[Pipeline] { (Desplegar con Docker Compose)
[Pipeline] sh
+ docker-compose --env-file .env.docker up -d --build
Creating network "sistema-ventas-pipeline_sistema-ventas-network" ... done
Creating volume "sistema-ventas-pipeline_postgres_data" ... done
Building backend...
Building frontend...
Creating sistema-ventas-db ... done
Creating sistema-ventas-backend ... done
Creating sistema-ventas-frontend ... done

# Ejemplo de logs del stage "Health Check"
[Pipeline] stage
[Pipeline] { (Health Check)
[Pipeline] sh
+ curl -f http://localhost:3001/api/health
OK: Backend esta respondiendo
+ curl -f http://localhost:80
OK: Frontend esta respondiendo
```

#### B.2 Ejemplo de Logs de Verificación de Servicios

```bash
# Verificar estado de contenedores
$ docker-compose ps

NAME                    STATUS              PORTS
sistema-ventas-db       Up 2 minutes        0.0.0.0:5432->5432/tcp
sistema-ventas-backend  Up 2 minutes (healthy)  0.0.0.0:3001->3001/tcp
sistema-ventas-frontend Up 2 minutes        0.0.0.0:80->80/tcp

# Verificar imágenes creadas
$ docker images | grep sistemaventas

REPOSITORY                TAG       IMAGE ID       CREATED          SIZE
sistemaventas-backend     latest    abc123def456   5 minutes ago    250MB
sistemaventas-backend     1         abc123def456   5 minutes ago    250MB
sistemaventas-frontend    latest    xyz789ghi012   5 minutes ago    50MB
sistemaventas-frontend    1         xyz789ghi012   5 minutes ago    50MB

# Verificar logs del backend
$ docker-compose logs backend | tail -20

backend  | 🚀 Iniciando Sistema de Ventas Multiempresa...
backend  | ✅ Conexión a la base de datos exitosa (Codificación: UTF8)
backend  | ✅ Estructura de la base de datos verificada
backend  | ✅ El valor "en_apelacion" ya existe en estado_item
backend  | Server running on port 3001
backend  | 📊 Query ejecutada { text: 'SELECT NOW()', duration: '5ms' }
```

#### B.3 Ejemplo de Respuesta del Health Check

```json
// GET http://localhost:3001/api/health
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "database": "connected"
}
```

#### B.4 Ejemplo de Errores Comunes y Soluciones

**Error**: `Cannot connect to Docker daemon`

```bash
# Solución:
sudo systemctl start docker
# Verificar:
sudo systemctl status docker
```

**Error**: `Port 3001 already in use`

```bash
# Solución:
docker-compose down
# O cambiar el puerto en docker-compose.yml
```

**Error**: `Build failed: npm install error`

```bash
# Solución: Verificar que el Dockerfile copie correctamente los archivos
# Verificar logs:
docker-compose logs backend
```

### C. Scripts de Utilidad

#### C.1 Script para Ejecutar Pipeline Manualmente

```bash
#!/bin/bash
# script-ejecutar-pipeline.sh

echo "=== Ejecutando Pipeline Manualmente ==="
echo "1. Limpiando recursos anteriores..."
docker-compose down -v 2>/dev/null || true
docker volume prune -f 2>/dev/null || true

echo "2. Construyendo imágenes..."
docker build -t sistemaventas-backend:latest ./backend
docker build -t sistemaventas-frontend:latest ./frontend

echo "3. Desplegando servicios..."
docker-compose up -d --build

echo "4. Esperando a que los servicios estén listos..."
sleep 30

echo "5. Verificando salud de los servicios..."
curl -f http://localhost:3001/api/health && echo "✅ Backend OK"
curl -f http://localhost:80 && echo "✅ Frontend OK"

echo "=== Pipeline Completado ==="
```

#### C.2 Script para Limpiar Recursos

```bash
#!/bin/bash
# script-limpiar-recursos.sh

echo "Limpiando recursos Docker..."
docker-compose down -v
docker image prune -a -f
docker volume prune -f
docker system prune -f
echo "✅ Limpieza completada"
```

#### C.3 Script para Verificar Estado

```bash
#!/bin/bash
# script-verificar-estado.sh

echo "=== Estado de Contenedores ==="
docker-compose ps

echo -e "\n=== Estado de Imágenes ==="
docker images | grep sistemaventas

echo -e "\n=== Health Checks ==="
curl -s http://localhost:3001/api/health | jq . || echo "Backend no responde"
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:80

echo -e "\n=== Logs Recientes (Backend) ==="
docker-compose logs --tail=10 backend
```

---

**Autor**: [Tu Nombre]  
**Fecha**: [Fecha de creación]  
**Versión**: 1.0

