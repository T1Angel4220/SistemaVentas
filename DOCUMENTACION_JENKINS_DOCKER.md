# Documentación: Pipeline de Automatización de Despliegue con Jenkins y Docker

## 📋 Índice

1. [Introducción](#1-introducción)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Instalación y Configuración de Herramientas](#3-instalación-y-configuración-de-herramientas)
4. [Configuración del Proyecto con Docker](#4-configuración-del-proyecto-con-docker)
5. [Creación de Imágenes Docker](#5-creación-de-imágenes-docker)
6. [Configuración de Jenkins](#6-configuración-de-jenkins)
7. [Pipeline de Automatización de Despliegue](#7-pipeline-de-automatización-de-despliegue)
8. [Ejecución del Pipeline y Resultados](#8-ejecución-del-pipeline-y-resultados)
9. [Despliegue Opcional en Kubernetes](#9-despliegue-opcional-en-kubernetes)
10. [Troubleshooting](#10-troubleshooting)
11. [Conclusiones](#11-conclusiones)
12. [Anexos](#12-anexos)

---

## 1. Introducción

Este documento describe el proceso completo de implementación de un pipeline de automatización de despliegue utilizando Jenkins y Docker para el Sistema de Ventas Multiempresa. El objetivo principal es automatizar el proceso de construcción, empaquetado y despliegue de la aplicación en un entorno controlado mediante contenedores Docker.

### 1.1 Objetivos del Proyecto

- **Automatizar el despliegue**: Crear un pipeline que automatice completamente el proceso de construcción y despliegue de la aplicación
- **Containerización con Docker**: Utilizar Docker para crear imágenes de la aplicación y ejecutarla en contenedores
- **Integración con Jenkins**: Configurar Jenkins para ejecutar el pipeline de forma automatizada
- **Documentación completa**: Documentar todo el proceso desde la instalación hasta la ejecución del pipeline

### 1.2 Arquitectura de la Aplicación

La aplicación está compuesta por tres servicios principales:

- **Backend**: API REST desarrollada en Node.js con TypeScript y Express
  - Puerto: 3001
  - Base de datos: PostgreSQL
  - Funcionalidades: Autenticación, gestión de productos, usuarios, etc.

- **Frontend**: Aplicación React con Vite y TypeScript
  - Puerto: 80
  - Servidor web: Nginx (en producción)
  - Interfaz de usuario para gestión de ventas

- **Base de Datos**: PostgreSQL 15
  - Puerto: 5432
  - Almacenamiento persistente mediante volúmenes Docker

### 1.3 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Jenkins Pipeline                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Build   │→ │   Test   │→ │  Deploy  │→ │  Health  ││
│  │  Images  │  │          │  │  Docker  │  │   Check  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Docker Compose - Orquestación              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │    Backend   │  │  PostgreSQL  │ │
│  │  (Nginx)     │  │  (Node.js)   │  │   (DB)       │ │
│  │  Port: 80    │  │  Port: 3001  │  │  Port: 5432  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Requisitos Previos

### 2.1 Software Necesario

Antes de comenzar, es necesario tener instalado el siguiente software:

| Herramienta | Versión Mínima | Descripción |
|------------|----------------|-------------|
| **Docker** | 20.10+ | Motor de contenedores para crear y ejecutar imágenes |
| **Docker Compose** | 2.0+ | Herramienta para orquestar múltiples contenedores |
| **Jenkins** | 2.400+ | Servidor de automatización para CI/CD |
| **Git** | 2.30+ | Control de versiones (para clonar el repositorio) |
| **Node.js** | 18+ | Opcional, solo si se ejecuta fuera de Docker |

### 2.2 Recursos del Sistema

Para ejecutar correctamente la aplicación y el pipeline, se recomienda:

- **CPU**: Mínimo 2 cores (recomendado 4 cores)
- **RAM**: Mínimo 4GB (recomendado 8GB o más)
- **Espacio en disco**: Mínimo 10GB libres (recomendado 20GB)
- **Sistema Operativo**: 
  - Linux (Ubuntu 20.04+, Debian 11+)
  - macOS 10.15+
  - Windows 10/11 con WSL2

### 2.3 Conocimientos Previos

Se recomienda tener conocimientos básicos en:
- Conceptos de contenedores Docker
- Uso básico de línea de comandos (bash/PowerShell)
- Conceptos de CI/CD
- Git y control de versiones

---

## 3. Instalación y Configuración de Herramientas

En esta sección se detalla el proceso paso a paso para instalar y configurar todas las herramientas necesarias para el pipeline de automatización.

### 3.1 Instalación de Docker

Docker es la herramienta principal que permite crear, empaquetar y ejecutar la aplicación en contenedores. A continuación se detalla el proceso de instalación según el sistema operativo.

#### 3.1.1 Windows (con WSL2)

**Paso 1: Instalar WSL2**

WSL2 (Windows Subsystem for Linux) es necesario para ejecutar Docker en Windows:

```powershell
# Ejecutar en PowerShell como Administrador
wsl --install
```

Después de la instalación, reiniciar el equipo.

**Paso 2: Descargar Docker Desktop**

1. Acceder a: https://www.docker.com/products/docker-desktop
2. Descargar Docker Desktop para Windows
3. Ejecutar el instalador y seguir las instrucciones

**Paso 3: Configurar Docker Desktop**

1. Abrir Docker Desktop
2. Aceptar los términos de servicio
3. Configurar recursos (recomendado: 4GB RAM, 2 CPUs)
4. Habilitar WSL2 integration

**Paso 4: Verificar la Instalación**

Abrir PowerShell o WSL y ejecutar:

```bash
docker --version
docker-compose --version
```

**Resultado esperado:**
```
Docker version 24.0.0, build abc123
Docker Compose version v2.20.0
```

> **📸 Captura de pantalla requerida**: Mostrar la salida de `docker --version` y `docker-compose --version`

#### 3.1.2 Linux (Ubuntu/Debian)

**Paso 1: Actualizar paquetes del sistema**

```bash
sudo apt update
sudo apt upgrade -y
```

**Paso 2: Instalar dependencias necesarias**

```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
```

**Paso 3: Agregar clave GPG oficial de Docker**

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

**Paso 4: Agregar repositorio de Docker**

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

**Paso 5: Instalar Docker Engine y Docker Compose**

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**Paso 6: Configurar permisos para el usuario**

```bash
# Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (cerrar sesión y volver a entrar, o ejecutar)
newgrp docker
```

**Paso 7: Iniciar y habilitar Docker**

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

**Paso 8: Verificar instalación**

```bash
docker --version
docker compose version
docker run hello-world
```

**Resultado esperado del hello-world:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

> **📸 Captura de pantalla requerida**: Mostrar la salida de `docker run hello-world` exitosa

### 3.2 Instalación de Jenkins

Jenkins es el servidor de automatización que ejecutará nuestro pipeline. Se recomienda instalarlo usando Docker para facilitar la gestión y el aislamiento.

#### 3.2.1 Instalación de Jenkins con Docker (Recomendado)

**Paso 1: Crear volumen para persistencia de datos**

```bash
docker volume create jenkins-data
```

Este volumen almacenará toda la configuración de Jenkins, incluyendo plugins, jobs y credenciales.

**Paso 2: Ejecutar contenedor de Jenkins**

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

**Explicación de parámetros:**
- `-d`: Ejecutar en modo detached (segundo plano)
- `--name jenkins`: Nombre del contenedor
- `-p 8080:8080`: Puerto web de Jenkins
- `-p 50000:50000`: Puerto para agentes de Jenkins
- `-v jenkins-data:/var/jenkins_home`: Montar volumen para persistencia
- `-v /var/run/docker.sock:/var/run/docker.sock`: Acceso al socket de Docker (permite a Jenkins ejecutar comandos Docker)

**Paso 3: Obtener contraseña inicial**

Esperar unos segundos y luego ejecutar:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Resultado esperado:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

> **⚠️ Importante**: Guardar esta contraseña, será necesaria en el siguiente paso.

> **📸 Captura de pantalla requerida**: Mostrar la contraseña inicial obtenida

#### 3.2.2 Instalación de Jenkins en Linux (Alternativa)

Si prefieres instalar Jenkins directamente en el sistema (sin Docker):

**Paso 1: Agregar clave GPG de Jenkins**

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
```

**Paso 2: Agregar repositorio de Jenkins**

```bash
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```

**Paso 3: Instalar Jenkins**

```bash
sudo apt update
sudo apt install -y jenkins
```

**Paso 4: Iniciar y habilitar Jenkins**

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

**Paso 5: Verificar estado**

```bash
sudo systemctl status jenkins
```

**Paso 6: Obtener contraseña inicial**

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Paso 7: Configurar permisos de Docker (si Jenkins necesita ejecutar Docker)**

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 3.3 Configuración Inicial de Jenkins

Una vez instalado Jenkins, es necesario realizar la configuración inicial a través de la interfaz web.

**Paso 1: Acceder a Jenkins**

1. Abrir el navegador web
2. Navegar a: `http://localhost:8080`
3. Esperar a que cargue la página de bienvenida

> **📸 Captura de pantalla requerida**: Página inicial de Jenkins pidiendo la contraseña

**Paso 2: Desbloquear Jenkins**

1. Ingresar la contraseña inicial obtenida en el paso anterior
2. Hacer clic en "Continue"

**Paso 3: Instalar Plugins**

1. Seleccionar "Install suggested plugins" (recomendado)
2. Esperar a que se instalen todos los plugins (puede tardar varios minutos)

> **📸 Captura de pantalla requerida**: Pantalla de instalación de plugins

**Plugins esenciales que se instalarán:**
- **Pipeline**: Para ejecutar pipelines declarativos
- **Docker Pipeline**: Integración con Docker
- **Credentials Binding**: Gestión de credenciales
- **Git**: Integración con Git

**Paso 4: Crear Usuario Administrador**

1. Completar el formulario con:
   - Username: (tu nombre de usuario)
   - Password: (contraseña segura)
   - Confirm password: (repetir contraseña)
   - Full name: (nombre completo)
   - Email address: (correo electrónico)
2. Hacer clic en "Save and Continue"

> **📸 Captura de pantalla requerida**: Formulario de creación de usuario

**Paso 5: Configurar URL de Jenkins**

1. Verificar que la URL sea correcta (generalmente `http://localhost:8080`)
2. Hacer clic en "Save and Finish"

**Paso 6: Verificar Instalación**

1. Hacer clic en "Start using Jenkins"
2. Deberías ver el dashboard principal de Jenkins

> **📸 Captura de pantalla requerida**: Dashboard principal de Jenkins

**Paso 7: Verificar Acceso a Docker (si Jenkins está en Docker)**

Si Jenkins está ejecutándose en Docker, verificar que tenga acceso al socket de Docker:

```bash
docker exec jenkins docker --version
```

Si el comando anterior falla, el contenedor ya debería tener acceso mediante el volumen montado (`-v /var/run/docker.sock:/var/run/docker.sock`).

---

## 4. Configuración del Proyecto con Docker

En esta sección se detalla la configuración de Docker para cada componente de la aplicación: Backend, Frontend y Base de Datos.

### 4.1 Estructura del Proyecto

El proyecto tiene la siguiente estructura de archivos relacionados con Docker:

```
SistemaVentas/
├── backend/
│   ├── Dockerfile              # Imagen Docker del backend
│   ├── .dockerignore          # Archivos excluidos del build
│   ├── package.json           # Dependencias Node.js
│   └── migrations/            # Scripts SQL de inicialización
│       ├── 01-init-schema.sql
│       ├── 02-create-tables.sql
│       └── 05-ecuador-locations.sql
├── frontend/
│   ├── Dockerfile             # Imagen Docker del frontend
│   ├── .dockerignore          # Archivos excluidos del build
│   ├── package.json           # Dependencias Node.js
│   ├── nginx.conf             # Configuración de Nginx
│   └── vite.config.ts         # Configuración de Vite
├── docker-compose.yml         # Orquestación de servicios
├── Jenkinsfile                # Pipeline de Jenkins
├── .env.docker                # Variables de entorno para Docker
└── .dockerignore              # Archivos excluidos globales
```

### 4.2 Configuración de la Base de Datos (PostgreSQL)

La base de datos se configura en el archivo `docker-compose.yml`:

**Configuración del servicio PostgreSQL:**

```yaml
postgres:
  image: postgres:15-alpine
  container_name: sistema-ventas-db
  environment:
    POSTGRES_USER: ${DB_USER:-postgres}
    POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    POSTGRES_DB: ${DB_NAME:-sistema_ventas_multiempresa}
    PGDATA: /var/lib/postgresql/data/pgdata
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./backend/migrations:/docker-entrypoint-initdb.d
  ports:
    - "${DB_PORT:-5432}:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - sistema-ventas-network
  restart: unless-stopped
```

**Características:**
- **Imagen**: PostgreSQL 15 Alpine (ligera)
- **Volumen persistente**: `postgres_data` para mantener los datos
- **Migraciones automáticas**: Los scripts SQL en `backend/migrations/` se ejecutan automáticamente al iniciar
- **Health check**: Verifica que la base de datos esté lista antes de que otros servicios la usen
- **Puerto**: 5432 (configurable mediante variable de entorno)

**Rutas y volúmenes:**
- Datos persistentes: `/var/lib/postgresql/data` (dentro del contenedor)
- Scripts de inicialización: `./backend/migrations` → `/docker-entrypoint-initdb.d` (montado como volumen)

### 4.3 Configuración del Backend

El backend es una API REST desarrollada en Node.js. Su configuración Docker se encuentra en `backend/Dockerfile`.

**Dockerfile del Backend:**

```dockerfile
# Dockerfile para Backend - Sistema de Ventas Multiempresa
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer el puerto de la aplicación
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
```

**Configuración en docker-compose.yml:**

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: sistema-ventas-backend
  environment:
    NODE_ENV: production
    PORT: 3001
    HOST: 0.0.0.0
    DB_HOST: postgres
    DB_PORT: 5432
    DB_NAME: ${DB_NAME:-sistema_ventas_multiempresa}
    DB_USER: ${DB_USER:-postgres}
    DB_PASSWORD: ${DB_PASSWORD:-postgres}
    JWT_SECRET: ${JWT_SECRET:-supersecretkey}
    JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-24h}
    JWT_REFRESH_EXPIRES_IN: ${JWT_REFRESH_EXPIRES_IN:-7d}
    EMAIL_HOST: ${EMAIL_HOST:-smtp.gmail.com}
    EMAIL_PORT: ${EMAIL_PORT:-587}
    EMAIL_SECURE: ${EMAIL_SECURE:-false}
    EMAIL_USER: ${EMAIL_USER:-eventconnect90@gmail.com}
    EMAIL_PASSWORD: ${EMAIL_PASSWORD:-oshzkgssiwxfdiqr}
    EMAIL_FROM: ${EMAIL_FROM:-Sistema de Ventas <eventconnect90@gmail.com>}
    CORS_ORIGIN: http://localhost,http://localhost:80,http://localhost:5173
    FRONTEND_URL: http://localhost:80
    BCRYPT_SALT_ROUNDS: ${BCRYPT_SALT_ROUNDS:-10}
  ports:
    - "${BACKEND_PORT:-3001}:3001"
  volumes:
    - ./backend/uploads:/app/uploads
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - sistema-ventas-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

**Características:**
- **Puerto**: 3001 (expuesto al host)
- **Dependencia**: Espera a que PostgreSQL esté saludable antes de iniciar
- **Volumen**: `./backend/uploads` para almacenar archivos subidos
- **Health check**: Verifica que el endpoint `/api/health` responda correctamente
- **Rutas de conexión**: 
  - Base de datos: `postgres:5432` (nombre del servicio en la red Docker)
  - API disponible en: `http://localhost:3001`

### 4.4 Configuración del Frontend

El frontend es una aplicación React servida con Nginx en producción. Utiliza un build multi-stage para optimizar el tamaño de la imagen.

**Dockerfile del Frontend:**

```dockerfile
# Dockerfile para Frontend - Sistema de Ventas Multiempresa
# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Argumento para la URL de la API
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci && npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
RUN npx vite build || (echo "Build continuó con advertencias" && npx vite build --mode production)

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Configuración en docker-compose.yml:**

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      - VITE_API_URL=http://localhost:3001
  container_name: sistema-ventas-frontend
  ports:
    - "${FRONTEND_PORT:-80}:80"
  depends_on:
    backend:
      condition: service_healthy
  networks:
    - sistema-ventas-network
  restart: unless-stopped
```

**Características:**
- **Build multi-stage**: Reduce el tamaño final de la imagen
- **Puerto**: 80 (expuesto al host)
- **Dependencia**: Espera a que el backend esté saludable
- **Rutas**:
  - Frontend accesible en: `http://localhost:80`
  - API del backend: `http://localhost:3001` (desde el navegador)

### 4.5 Variables de Entorno

Las variables de entorno se configuran en el archivo `.env.docker` en la raíz del proyecto.

**Crear archivo `.env.docker`:**

```bash
# En la raíz del proyecto
cp .env.docker .env.docker.backup  # Backup si ya existe
```

**Contenido del archivo `.env.docker`:**

```env
# =====================================================
# CONFIGURACIÓN PARA DOCKER COMPOSE
# =====================================================

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

**Explicación de variables importantes:**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_NAME` | Nombre de la base de datos | `sistema_ventas_multiempresa` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `tu_contraseña_segura` |
| `JWT_SECRET` | Clave secreta para tokens JWT | `clave_secreta_muy_larga` |
| `CORS_ORIGIN` | Orígenes permitidos para CORS | `http://localhost:80` |
| `BACKEND_PORT` | Puerto del backend | `3001` |
| `FRONTEND_PORT` | Puerto del frontend | `80` |

> **⚠️ Importante**: 
> - Nunca subir el archivo `.env.docker` al repositorio (debe estar en `.gitignore`)
> - Cambiar las contraseñas por defecto en producción
> - Usar variables de entorno seguras para credenciales

### 4.6 Red Docker

Todos los servicios se comunican a través de una red Docker interna:

```yaml
networks:
  sistema-ventas-network:
    driver: bridge
```

**Ventajas:**
- Aislamiento de otros contenedores
- Comunicación por nombre de servicio (ej: `postgres`, `backend`)
- No requiere exponer puertos internos al host

### 4.7 Verificación de la Configuración

Antes de continuar con el pipeline, verificar que la configuración esté correcta:

**Paso 1: Verificar archivos Docker**

```bash
# Verificar que existen los Dockerfiles
ls -la backend/Dockerfile
ls -la frontend/Dockerfile
ls -la docker-compose.yml
ls -la .env.docker
```

**Paso 2: Verificar sintaxis de docker-compose**

```bash
docker-compose config
```

Este comando valida la sintaxis del archivo `docker-compose.yml` sin ejecutar los contenedores.

**Paso 3: Construcción manual de imágenes (opcional)**

Para verificar que los Dockerfiles funcionan correctamente:

```bash
# Construir imagen del backend
cd backend
docker build -t sistema-ventas-backend-test .
cd ..

# Construir imagen del frontend
cd frontend
docker build -t sistema-ventas-frontend-test .
cd ..
```

Si ambos comandos se ejecutan sin errores, la configuración está correcta.

---

## 5. Creación de Imágenes Docker

En esta sección se detalla el proceso de creación de imágenes Docker para cada componente de la aplicación.

### 5.1 Conceptos Básicos de Docker

**¿Qué es una imagen Docker?**
Una imagen Docker es un paquete que contiene todo lo necesario para ejecutar una aplicación: código, runtime, dependencias y configuración.

**¿Qué es un contenedor?**
Un contenedor es una instancia en ejecución de una imagen Docker.

### 5.2 Creación de la Imagen del Backend

**Paso 1: Navegar al directorio del backend**

```bash
cd backend
```

**Paso 2: Construir la imagen**

```bash
docker build -t sistema-ventas-backend:latest .
```

**Explicación del comando:**
- `docker build`: Comando para construir una imagen
- `-t sistema-ventas-backend:latest`: Etiqueta (tag) de la imagen
- `.`: Contexto de construcción (directorio actual)

**Proceso de construcción:**

1. **Descarga de imagen base**: `FROM node:18-alpine`
   ```
   Step 1/8 : FROM node:18-alpine
    ---> a1b2c3d4e5f6
   ```

2. **Instalación de dependencias del sistema**:
   ```
   Step 2/8 : RUN apk add --no-cache python3 make g++
    ---> Using cache
   ```

3. **Copia de archivos de dependencias**:
   ```
   Step 3/8 : COPY package*.json ./
    ---> abc123def456
   ```

4. **Instalación de dependencias Node.js**:
   ```
   Step 4/8 : RUN npm ci --only=production
    ---> xyz789ghi012
   ```

5. **Copia del código fuente**:
   ```
   Step 5/8 : COPY . .
    ---> mno345pqr678
   ```

6. **Creación de directorios**:
   ```
   Step 6/8 : RUN mkdir -p uploads
    ---> stu901vwx234
   ```

**Resultado esperado:**
```
Successfully built abc123def456
Successfully tagged sistema-ventas-backend:latest
```

> **📸 Captura de pantalla requerida**: Mostrar la salida completa del build del backend

**Paso 3: Verificar la imagen creada**

```bash
docker images | grep sistema-ventas-backend
```

**Resultado esperado:**
```
REPOSITORY                  TAG       IMAGE ID       CREATED          SIZE
sistema-ventas-backend      latest    abc123def456   2 minutes ago    250MB
```

### 5.3 Creación de la Imagen del Frontend

**Paso 1: Navegar al directorio del frontend**

```bash
cd frontend
```

**Paso 2: Construir la imagen**

```bash
docker build --build-arg VITE_API_URL=http://localhost:3001 -t sistema-ventas-frontend:latest .
```

**Explicación del comando:**
- `--build-arg VITE_API_URL=http://localhost:3001`: Pasa la URL de la API como argumento de construcción
- `-t sistema-ventas-frontend:latest`: Etiqueta de la imagen

**Proceso de construcción (multi-stage):**

**Etapa 1 - Builder:**
```
Step 1/10 : FROM node:18-alpine AS builder
 ---> a1b2c3d4e5f6
Step 2/10 : ARG VITE_API_URL=http://localhost:3001
 ---> Running in xyz123
Step 3/10 : WORKDIR /app
 ---> abc456
Step 4/10 : COPY package*.json ./
 ---> def789
Step 5/10 : RUN npm ci
 ---> ghi012
Step 6/10 : COPY . .
 ---> jkl345
Step 7/10 : RUN npx vite build
 ---> mno678
```

**Etapa 2 - Production:**
```
Step 8/10 : FROM nginx:alpine
 ---> pqr901
Step 9/10 : COPY --from=builder /app/dist /usr/share/nginx/html
 ---> stu234
Step 10/10 : COPY nginx.conf /etc/nginx/conf.d/default.conf
 ---> vwx567
Successfully built vwx567
Successfully tagged sistema-ventas-frontend:latest
```

> **📸 Captura de pantalla requerida**: Mostrar la salida completa del build del frontend

**Paso 3: Verificar la imagen creada**

```bash
docker images | grep sistema-ventas-frontend
```

**Resultado esperado:**
```
REPOSITORY                  TAG       IMAGE ID       CREATED          SIZE
sistema-ventas-frontend     latest    vwx567        2 minutes ago    50MB
```

**Nota**: La imagen del frontend es más pequeña porque solo contiene Nginx y los archivos estáticos, no Node.js ni las dependencias de desarrollo.

### 5.4 Construcción con Docker Compose

Docker Compose permite construir todas las imágenes y levantar los servicios en un solo comando.

**Paso 1: Navegar a la raíz del proyecto**

```bash
cd ..  # Volver a la raíz
```

**Paso 2: Construir y levantar todos los servicios**

```bash
docker-compose --env-file .env.docker up -d --build
```

**Explicación del comando:**
- `--env-file .env.docker`: Usa el archivo de variables de entorno
- `up -d`: Levanta los servicios en modo detached (segundo plano)
- `--build`: Reconstruye las imágenes antes de levantar

**Proceso:**
```
Creating network "sistema-ventas_sistema-ventas-network" ... done
Creating volume "sistema-ventas_postgres_data" ... done
Building backend...
Step 1/8 : FROM node:18-alpine
...
Successfully built abc123def456
Successfully tagged sistema-ventas-backend:latest
Building frontend...
...
Successfully built vwx567
Successfully tagged sistema-ventas-frontend:latest
Creating sistema-ventas-db ... done
Creating sistema-ventas-backend ... done
Creating sistema-ventas-frontend ... done
```

> **📸 Captura de pantalla requerida**: Mostrar la salida de `docker-compose up -d --build`

**Paso 3: Verificar contenedores en ejecución**

```bash
docker-compose ps
```

**Resultado esperado:**
```
NAME                    STATUS              PORTS
sistema-ventas-db       Up 2 minutes        0.0.0.0:5432->5432/tcp
sistema-ventas-backend  Up 2 minutes (healthy)  0.0.0.0:3001->3001/tcp
sistema-ventas-frontend Up 2 minutes        0.0.0.0:80->80/tcp
```

> **📸 Captura de pantalla requerida**: Mostrar el estado de los contenedores

### 5.5 Verificación de Imágenes Creadas

**Listar todas las imágenes del proyecto:**

```bash
docker images | grep -E "sistema-ventas|postgres"
```

**Resultado esperado:**
```
REPOSITORY                  TAG       IMAGE ID       CREATED          SIZE
sistema-ventas-backend      latest    abc123def456   5 minutes ago    250MB
sistema-ventas-frontend     latest    vwx567         5 minutes ago    50MB
postgres                    15-alpine def789         2 hours ago      200MB
```

> **📸 Captura de pantalla requerida**: Mostrar todas las imágenes Docker creadas

### 5.6 Comandos Útiles para Gestión de Imágenes

```bash
# Ver detalles de una imagen
docker inspect sistema-ventas-backend:latest

# Ver historial de construcción
docker history sistema-ventas-backend:latest

# Eliminar una imagen
docker rmi sistema-ventas-backend:latest

# Eliminar imágenes no utilizadas
docker image prune -a

# Ver tamaño de imágenes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### 5.7 Ejecución de Contenedores

Una vez creadas las imágenes, se pueden ejecutar los contenedores:

**Ejecutar contenedor del backend manualmente:**

```bash
docker run -d \
  --name sistema-ventas-backend-test \
  -p 3001:3001 \
  -e DB_HOST=postgres \
  -e DB_NAME=sistema_ventas_multiempresa \
  -e DB_USER=postgres \
  -e DB_PASSWORD=Angel_4220 \
  sistema-ventas-backend:latest
```

**Ejecutar contenedor del frontend manualmente:**

```bash
docker run -d \
  --name sistema-ventas-frontend-test \
  -p 80:80 \
  sistema-ventas-frontend:latest
```

**Nota**: En producción, se recomienda usar `docker-compose` para orquestar todos los servicios juntos.

---

## 6. Configuración de Jenkins

Antes de crear el pipeline, es necesario configurar Jenkins para que pueda acceder al repositorio y ejecutar comandos Docker.

### 6.1 Configurar Acceso a Git (si el repositorio es privado)

Si el repositorio es privado, es necesario configurar credenciales:

**Paso 1: Crear credenciales en Jenkins**

1. En Jenkins, ir a **Manage Jenkins** > **Manage Credentials**
2. Seleccionar el dominio global
3. Hacer clic en **Add Credentials**
4. Configurar:
   - **Kind**: Username with password (o SSH Username with private key)
   - **Username**: Tu usuario de Git
   - **Password**: Tu token de acceso personal (o contraseña)
   - **ID**: `git-credentials` (opcional, pero recomendado)
   - **Description**: Credenciales de Git
5. Hacer clic en **OK**

> **📸 Captura de pantalla requerida**: Mostrar la creación de credenciales en Jenkins

### 6.2 Verificar Acceso a Docker

**Paso 1: Verificar que Jenkins puede ejecutar Docker**

Si Jenkins está en Docker, ya debería tener acceso. Verificar:

```bash
docker exec jenkins docker --version
```

**Resultado esperado:**
```
Docker version 24.0.0, build abc123
```

Si el comando falla, verificar que el contenedor de Jenkins tenga el volumen montado:
```bash
docker inspect jenkins | grep -A 5 "Mounts"
```

Debería mostrar:
```
"/var/run/docker.sock": {
    "Source": "/var/run/docker.sock",
    "Destination": "/var/run/docker.sock"
}
```

### 6.3 Configurar Variables Globales (Opcional)

Para facilitar la gestión, se pueden configurar variables globales:

1. Ir a **Manage Jenkins** > **Configure System**
2. Buscar la sección **Global properties**
3. Marcar **Environment variables**
4. Agregar variables si es necesario
5. Guardar

## 7. Pipeline de Automatización de Despliegue

### 7.1 Estructura del Pipeline

El `Jenkinsfile` define un pipeline declarativo con las siguientes etapas:

```
┌─────────────────────────────────────────────────────────┐
│                    Jenkins Pipeline                     │
├─────────────────────────────────────────────────────────┤
│ 1. Limpiar Workspace                                    │
│    └─ Detener contenedores previos                      │
│    └─ Limpiar volúmenes y recursos                     │
├─────────────────────────────────────────────────────────┤
│ 2. Checkout Código                                      │
│    └─ Obtener código fuente del repositorio Git        │
├─────────────────────────────────────────────────────────┤
│ 3. Verificar Herramientas                               │
│    └─ Verificar Docker y Docker Compose                  │
├─────────────────────────────────────────────────────────┤
│ 4. Build Backend                                        │
│    └─ Construir imagen Docker del backend               │
│    └─ Etiquetar con BUILD_NUMBER y latest               │
├─────────────────────────────────────────────────────────┤
│ 5. Build Frontend                                       │
│    └─ Construir imagen Docker del frontend              │
│    └─ Etiquetar con BUILD_NUMBER y latest               │
├─────────────────────────────────────────────────────────┤
│ 6. Test Backend (Opcional)                              │
│    └─ Ejecutar pruebas del backend                      │
├─────────────────────────────────────────────────────────┤
│ 7. Desplegar con Docker Compose                         │
│    └─ Crear archivo .env.docker                         │
│    └─ Levantar servicios con docker-compose             │
│    └─ Esperar a que servicios estén listos              │
├─────────────────────────────────────────────────────────┤
│ 8. Health Check                                         │
│    └─ Verificar backend (http://localhost:3001/api/health)│
│    └─ Verificar frontend (http://localhost:80)          │
│    └─ Verificar base de datos                          │
├─────────────────────────────────────────────────────────┤
│ 9. Generar Reporte                                      │
│    └─ Crear reporte de despliegue                      │
│    └─ Archivar artefactos                               │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Análisis del Jenkinsfile

El `Jenkinsfile` está ubicado en la raíz del proyecto y contiene:

**Variables de entorno del pipeline:**

```groovy
environment {
    BACKEND_IMAGE = 'sistemaventas-backend'
    FRONTEND_IMAGE = 'sistemaventas-frontend'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    DB_NAME = 'sistema_ventas_multiempresa'
    DB_USER = 'postgres'
    DB_PASSWORD = 'Angel_4220'
    // ... más variables
}
```

**Etapas principales:**

1. **Limpiar Workspace**: Elimina contenedores y volúmenes previos
2. **Checkout Código**: Obtiene el código desde Git
3. **Verificar Herramientas**: Valida Docker
4. **Build Backend/Frontend**: Construye imágenes Docker
5. **Desplegar**: Usa docker-compose para levantar servicios
6. **Health Check**: Verifica que todo funcione
7. **Generar Reporte**: Crea documentación del despliegue

### 7.3 Configurar Pipeline en Jenkins

**Paso 1: Crear nuevo item de Pipeline**

1. En el dashboard de Jenkins, hacer clic en **New Item**
2. Ingresar nombre del proyecto: `SistemaVentas-Pipeline`
3. Seleccionar **Pipeline**
4. Hacer clic en **OK**

> **📸 Captura de pantalla requerida**: Mostrar la creación del nuevo item

**Paso 2: Configurar el Pipeline**

En la página de configuración:

1. **General**:
   - Descripción: "Pipeline de automatización de despliegue para Sistema de Ventas"

2. **Pipeline**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/T1Angel4220/SistemaVentas.git` (o tu URL)
   - **Credentials**: Seleccionar credenciales si el repo es privado
   - **Branch Specifier**: `*/Jankins/Angel` o `*/main` (según tu rama)
   - **Script Path**: `Jenkinsfile`

> **📸 Captura de pantalla requerida**: Mostrar la configuración del SCM

**Paso 3: Guardar y ejecutar**

1. Hacer clic en **Save**
2. En la página del proyecto, hacer clic en **Build Now**

> **📸 Captura de pantalla requerida**: Mostrar el botón "Build Now" y el inicio del build

### 7.4 Variables de Entorno del Pipeline

El pipeline utiliza las siguientes variables:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `BACKEND_IMAGE` | Nombre de la imagen del backend | `sistemaventas-backend` |
| `FRONTEND_IMAGE` | Nombre de la imagen del frontend | `sistemaventas-frontend` |
| `IMAGE_TAG` | Tag de la imagen | `${BUILD_NUMBER}` |
| `DB_NAME` | Nombre de la base de datos | `sistema_ventas_multiempresa` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `Angel_4220` |
| `BACKEND_PORT` | Puerto del backend | `3001` |
| `FRONTEND_PORT` | Puerto del frontend | `80` |

Estas variables se pueden modificar en el `Jenkinsfile` o configurarse como parámetros del pipeline.

### 7.5 Configurar Webhook (Opcional)

Para que el pipeline se ejecute automáticamente al hacer push:

1. En GitHub/GitLab, ir a **Settings** > **Webhooks**
2. Agregar webhook:
   - **Payload URL**: `http://tu-servidor-jenkins:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Push events
3. Guardar

En Jenkins:
1. En la configuración del pipeline, marcar **GitHub hook trigger for GITScm polling**
2. Guardar

---

## 8. Ejecución del Pipeline y Resultados

En esta sección se detalla el proceso de ejecución del pipeline y cómo interpretar los resultados.

### 8.1 Ejecutar el Pipeline

**Método 1: Ejecución Manual**

1. En Jenkins, ir al proyecto `SistemaVentas-Pipeline`
2. Hacer clic en **Build Now**
3. El pipeline comenzará a ejecutarse

> **📸 Captura de pantalla requerida**: Mostrar el pipeline iniciándose

**Método 2: Ejecución Automática (con webhook)**

Si se configuró el webhook, el pipeline se ejecutará automáticamente al hacer push al repositorio.

### 8.2 Monitoreo de la Ejecución

**Vista del Pipeline en Ejecución:**

1. Hacer clic en el número del build (ej: #1)
2. Hacer clic en **Console Output** para ver los logs en tiempo real

> **📸 Captura de pantalla requerida**: Mostrar la vista del pipeline ejecutándose (Blue Ocean o vista clásica)

**Etapas del Pipeline:**

Cada etapa mostrará su estado:
- ⏳ **En progreso**: Etapa ejecutándose
- ✅ **Éxito**: Etapa completada correctamente
- ❌ **Fallido**: Etapa falló

> **📸 Captura de pantalla requerida**: Mostrar todas las etapas del pipeline con estado de éxito

### 8.3 Logs de Ejecución

**Ejemplo de logs exitosos:**

```
Started by user Admin
Running in Durability level: MAX_SURVIVABILITY
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/jenkins_home/workspace/SistemaVentas-Pipeline
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Limpiar Workspace)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
Limpiando workspace...
[Pipeline] sh
+ echo "Deteniendo contenedores existentes..."
Deteniendo contenedores existentes...
...
[Pipeline] stage
[Pipeline] { (Checkout Código)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
Obteniendo codigo fuente...
[Pipeline] checkout
...
[Pipeline] stage
[Pipeline] { (Build Backend)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
Construyendo imagen Docker del Backend...
[Pipeline] dir
Running in /var/jenkins_home/workspace/SistemaVentas-Pipeline/backend
[Pipeline] sh
+ docker build -t sistemaventas-backend:1 .
Sending build context to Docker daemon  15.2MB
Step 1/8 : FROM node:18-alpine
 ---> a1b2c3d4e5f6
...
Successfully built abc123def456
Successfully tagged sistemaventas-backend:1
Successfully tagged sistemaventas-backend:latest
...
[Pipeline] stage
[Pipeline] { (Desplegar con Docker Compose)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
Desplegando aplicacion con Docker Compose...
[Pipeline] writeFile
[Pipeline] sh
+ docker-compose --env-file .env.docker up -d --build
Creating network "sistema-ventas-pipeline_sistema-ventas-network" ... done
Creating volume "sistema-ventas-pipeline_postgres_data" ... done
Building backend...
Building frontend...
Creating sistema-ventas-db ... done
Creating sistema-ventas-backend ... done
Creating sistema-ventas-frontend ... done
...
[Pipeline] stage
[Pipeline] { (Health Check)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
Verificando salud de los servicios...
[Pipeline] sh
+ curl -f http://localhost:3001/api/health
OK: Backend esta respondiendo
+ curl -f http://localhost:80
OK: Frontend esta respondiendo
...
[Pipeline] stage
[Pipeline] { (Generar Reporte)
[Pipeline] script
[Pipeline] {
[Pipeline] echo
Generando reporte de despliegue...
...
[Pipeline] }
[Pipeline] // node
[Pipeline] End of Pipeline
Finished: SUCCESS
```

> **📸 Captura de pantalla requerida**: Mostrar los logs completos del pipeline exitoso

### 8.4 Verificación de Resultados

**Paso 1: Verificar Estado de Contenedores**

En la terminal o desde Jenkins:

```bash
docker-compose ps
```

**Resultado esperado:**
```
NAME                    STATUS              PORTS
sistema-ventas-db       Up 5 minutes        0.0.0.0:5432->5432/tcp
sistema-ventas-backend  Up 5 minutes (healthy)  0.0.0.0:3001->3001/tcp
sistema-ventas-frontend Up 5 minutes        0.0.0.0:80->80/tcp
```

> **📸 Captura de pantalla requerida**: Mostrar el estado de los contenedores

**Paso 2: Verificar Imágenes Creadas**

```bash
docker images | grep sistemaventas
```

**Resultado esperado:**
```
REPOSITORY                TAG       IMAGE ID       CREATED          SIZE
sistemaventas-backend     latest    abc123def456   5 minutes ago    250MB
sistemaventas-backend     1         abc123def456   5 minutes ago    250MB
sistemaventas-frontend    latest    xyz789ghi012   5 minutes ago    50MB
sistemaventas-frontend    1         xyz789ghi012   5 minutes ago    50MB
```

> **📸 Captura de pantalla requerida**: Mostrar las imágenes Docker creadas

**Paso 3: Verificar Acceso al Frontend**

1. Abrir navegador
2. Navegar a: `http://localhost:80`
3. Verificar que la aplicación carga correctamente

> **📸 Captura de pantalla requerida**: Mostrar el frontend funcionando en el navegador

**Paso 4: Verificar Acceso al Backend**

```bash
curl http://localhost:3001/api/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "database": "connected"
}
```

O desde el navegador: `http://localhost:3001/api/health`

> **📸 Captura de pantalla requerida**: Mostrar la respuesta del health check del backend

**Paso 5: Verificar Logs de los Servicios**

```bash
# Logs del backend
docker-compose logs backend | tail -20

# Logs del frontend
docker-compose logs frontend | tail -20

# Logs de la base de datos
docker-compose logs postgres | tail -20
```

**Ejemplo de logs del backend:**
```
backend  | 🚀 Iniciando Sistema de Ventas Multiempresa...
backend  | ✅ Conexión a la base de datos exitosa (Codificación: UTF8)
backend  | ✅ Estructura de la base de datos verificada
backend  | Server running on port 3001
```

> **📸 Captura de pantalla requerida**: Mostrar logs recientes de los servicios

### 8.5 Reporte de Despliegue

El pipeline genera un archivo `deployment-report.txt` que contiene:

- Fecha y hora del despliegue
- Número de build
- Commit de Git
- Estado de contenedores
- Imágenes Docker creadas
- Logs recientes

**Acceder al reporte:**

1. En Jenkins, ir al build
2. Hacer clic en **Build Artifacts**
3. Descargar `deployment-report.txt`

> **📸 Captura de pantalla requerida**: Mostrar el contenido del reporte de despliegue

### 8.6 Métricas de Tiempo de Ejecución

El pipeline típicamente tarda:

- **Limpiar Workspace**: 10-30 segundos
- **Checkout Código**: 5-15 segundos
- **Verificar Herramientas**: 2-5 segundos
- **Build Backend**: 2-5 minutos
- **Build Frontend**: 3-7 minutos
- **Test Backend**: 30-60 segundos (si está habilitado)
- **Desplegar**: 1-2 minutos
- **Health Check**: 30-60 segundos
- **Generar Reporte**: 5-10 segundos

**Tiempo total estimado**: 8-15 minutos

> **📸 Captura de pantalla requerida**: Mostrar el tiempo total de ejecución del pipeline

---

## 9. Despliegue Opcional en Kubernetes

Esta sección es opcional y describe cómo desplegar la aplicación en Kubernetes para probar la escalabilidad y orquestación avanzada de contenedores.

### 9.1 Introducción a Kubernetes

**¿Qué es Kubernetes?**
Kubernetes (K8s) es una plataforma de orquestación de contenedores que automatiza el despliegue, escalado y gestión de aplicaciones containerizadas.

**Ventajas sobre Docker Compose:**
- **Escalabilidad automática**: Escala pods según la carga
- **Auto-recuperación**: Reinicia contenedores que fallen
- **Balanceo de carga**: Distribuye tráfico entre múltiples instancias
- **Gestión de secretos**: Manejo seguro de credenciales
- **Rolling updates**: Actualizaciones sin downtime

### 9.2 Requisitos para Kubernetes

- **kubectl**: Cliente de línea de comandos de Kubernetes
- **Minikube** o **Kind**: Para clúster local (opcional)
- **Docker**: Para construir las imágenes
- **kubectl** configurado para acceder al clúster

### 9.3 Instalación de Minikube (Clúster Local)

**Paso 1: Instalar Minikube**

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**Windows:**
```powershell
# Descargar desde: https://minikube.sigs.k8s.io/docs/start/
# O usar Chocolatey:
choco install minikube
```

**Paso 2: Iniciar Minikube**

```bash
minikube start
```

**Paso 3: Verificar instalación**

```bash
kubectl get nodes
```

> **📸 Captura de pantalla requerida**: Mostrar `kubectl get nodes` funcionando

### 9.4 Crear Manifiestos de Kubernetes

Crear archivos YAML para desplegar la aplicación en Kubernetes.

**9.4.1 ConfigMap para Variables de Entorno**

Crear `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: sistema-ventas-config
data:
  DB_NAME: "sistema_ventas_multiempresa"
  DB_USER: "postgres"
  DB_PORT: "5432"
  BACKEND_PORT: "3001"
  FRONTEND_PORT: "80"
```

**9.4.2 Secret para Credenciales**

Crear `k8s/secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sistema-ventas-secret
type: Opaque
stringData:
  DB_PASSWORD: "Angel_4220"
  JWT_SECRET: "supersecretkey"
  EMAIL_PASSWORD: "oshzkgssiwxfdiqr"
```

**9.4.3 Deployment de PostgreSQL**

Crear `k8s/postgres-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: sistema-ventas-config
              key: DB_NAME
        - name: POSTGRES_USER
          valueFrom:
            configMapKeyRef:
              name: sistema-ventas-config
              key: DB_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sistema-ventas-secret
              key: DB_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

**9.4.4 Deployment del Backend**

Crear `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2  # Escalar a 2 réplicas
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: sistemaventas-backend:latest
        env:
        - name: DB_HOST
          value: "postgres"
        - name: DB_NAME
          valueFrom:
            configMapKeyRef:
              name: sistema-ventas-config
              key: DB_NAME
        - name: DB_USER
          valueFrom:
            configMapKeyRef:
              name: sistema-ventas-config
              key: DB_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sistema-ventas-secret
              key: DB_PASSWORD
        ports:
        - containerPort: 3001
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

**9.4.5 Deployment del Frontend**

Crear `k8s/frontend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2  # Escalar a 2 réplicas
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: sistemaventas-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 9.5 Desplegar en Kubernetes

**Paso 1: Construir y cargar imágenes en Minikube**

```bash
# Configurar Docker para usar el daemon de Minikube
eval $(minikube docker-env)

# Construir imágenes
docker build -t sistemaventas-backend:latest ./backend
docker build -t sistemaventas-frontend:latest ./frontend
```

**Paso 2: Crear PersistentVolumeClaim para PostgreSQL**

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF
```

**Paso 3: Aplicar ConfigMap y Secret**

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

**Paso 4: Desplegar servicios**

```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

**Paso 5: Verificar despliegue**

```bash
kubectl get pods
kubectl get services
```

> **📸 Captura de pantalla requerida**: Mostrar `kubectl get pods` y `kubectl get services`

### 9.6 Probar Escalabilidad

**Escalar el backend a 3 réplicas:**

```bash
kubectl scale deployment backend --replicas=3
```

**Verificar escalado:**

```bash
kubectl get pods -l app=backend
```

**Escalar el frontend a 3 réplicas:**

```bash
kubectl scale deployment frontend --replicas=3
```

**Verificar todas las réplicas:**

```bash
kubectl get pods
```

> **📸 Captura de pantalla requerida**: Mostrar múltiples réplicas ejecutándose

### 9.7 Acceder a la Aplicación

**Obtener URL del servicio:**

```bash
# En Minikube
minikube service frontend --url
minikube service backend --url
```

O usar port-forward:

```bash
kubectl port-forward service/frontend 80:80
kubectl port-forward service/backend 3001:3001
```

> **📸 Captura de pantalla requerida**: Mostrar la aplicación funcionando en Kubernetes

### 9.8 Monitoreo y Logs

**Ver logs de un pod:**

```bash
kubectl logs -l app=backend
kubectl logs -l app=frontend
```

**Ver estado de los pods:**

```bash
kubectl describe pod <pod-name>
```

**Ver métricas de recursos:**

```bash
kubectl top pods
```

> **📸 Captura de pantalla requerida**: Mostrar logs y métricas de Kubernetes

---

## 10. Troubleshooting

### 10.1 Problemas Comunes

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

### 10.2 Limpieza de Recursos

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

## 11. Conclusiones

### 11.1 Objetivos Cumplidos

A lo largo de este proyecto se han cumplido los siguientes objetivos:

✅ **Pipeline de automatización de despliegue en Jenkins**
- Se creó un pipeline completo que automatiza todo el proceso de construcción y despliegue
- El pipeline integra Docker para containerizar la aplicación
- Se configuró Jenkins para ejecutar el pipeline de forma automatizada

✅ **Containerización con Docker**
- Se crearon imágenes Docker para el backend, frontend y base de datos
- Se configuró Docker Compose para orquestar los servicios
- Se documentó todo el proceso de creación de imágenes

✅ **Despliegue automatizado**
- El pipeline realiza el despliegue completo sin intervención manual
- Se implementaron health checks para verificar el estado de los servicios
- Se generan reportes automáticos de cada despliegue

✅ **Documentación completa**
- Se documentó todo el proceso desde la instalación hasta la ejecución
- Se incluyeron ejemplos de resultados y capturas de pantalla
- Se proporcionó troubleshooting para problemas comunes

### 11.2 Beneficios Obtenidos

**Automatización:**
- El proceso de despliegue está completamente automatizado
- Reducción de errores humanos en el proceso de despliegue
- Tiempo de despliegue reducido de horas a minutos

**Reproducibilidad:**
- Cada despliegue es idéntico gracias a Docker
- Mismo entorno en desarrollo, pruebas y producción
- Facilita la depuración de problemas

**Escalabilidad:**
- Fácil escalar servicios individuales
- Posibilidad de desplegar en Kubernetes para escalabilidad avanzada
- Aislamiento de recursos por servicio

**Versionado:**
- Las imágenes Docker pueden versionarse con BUILD_NUMBER
- Historial completo de despliegues en Jenkins
- Facilidad para hacer rollback si es necesario

**Aislamiento:**
- Cada servicio está aislado en su propio contenedor
- No hay conflictos de dependencias entre servicios
- Facilita el mantenimiento y actualización

### 11.3 Aprendizajes y Experiencias

Durante la implementación de este proyecto se aprendió:

1. **Docker y Containerización:**
   - Cómo crear imágenes Docker eficientes
   - Uso de multi-stage builds para optimizar tamaños
   - Gestión de volúmenes y redes Docker

2. **Jenkins y CI/CD:**
   - Creación de pipelines declarativos
   - Integración de Docker en pipelines
   - Gestión de variables de entorno y credenciales

3. **Orquestación:**
   - Uso de Docker Compose para servicios múltiples
   - Configuración de health checks
   - Gestión de dependencias entre servicios

4. **DevOps:**
   - Automatización de procesos de despliegue
   - Mejores prácticas de CI/CD
   - Documentación técnica

### 11.4 Desafíos Encontrados y Soluciones

**Desafío 1: Configuración de Docker en Jenkins**
- **Problema**: Jenkins no podía ejecutar comandos Docker
- **Solución**: Montar el socket de Docker en el contenedor de Jenkins

**Desafío 2: Variables de entorno en el pipeline**
- **Problema**: Gestión de credenciales sensibles
- **Solución**: Uso de variables de entorno y archivos .env.docker

**Desafío 3: Health checks**
- **Problema**: Servicios iniciando antes de que la BD esté lista
- **Solución**: Implementar health checks y dependencias en docker-compose

### 11.5 Mejoras Futuras

Para mejorar aún más el pipeline, se pueden implementar:

1. **Testing automatizado:**
   - Ejecutar pruebas unitarias en el pipeline
   - Pruebas de integración automatizadas
   - Análisis de código estático

2. **Notificaciones:**
   - Envío de emails al completar despliegues
   - Integración con Slack/Teams
   - Notificaciones de fallos

3. **Monitoreo:**
   - Integración con Prometheus y Grafana
   - Alertas automáticas
   - Dashboards de métricas

4. **Seguridad:**
   - Escaneo de vulnerabilidades en imágenes
   - Análisis de dependencias
   - Gestión segura de secretos

5. **Despliegue en múltiples entornos:**
   - Desarrollo, Staging, Producción
   - Promoción automática entre entornos
   - Blue-green deployments

### 11.6 Recursos Adicionales

**Documentación Oficial:**
- [Documentación oficial de Docker](https://docs.docker.com/)
- [Documentación oficial de Jenkins](https://www.jenkins.io/doc/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [Jenkins Pipeline syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

**Tutoriales y Guías:**
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Jenkins Pipeline Examples](https://www.jenkins.io/doc/pipeline/examples/)
- [Kubernetes Tutorials](https://kubernetes.io/docs/tutorials/)

### 11.7 Conclusiones Finales

Este proyecto demuestra la implementación exitosa de un pipeline de automatización de despliegue utilizando Jenkins y Docker. La solución implementada:

- ✅ Automatiza completamente el proceso de despliegue
- ✅ Utiliza Docker para containerizar la aplicación
- ✅ Integra Jenkins para ejecutar el pipeline
- ✅ Documenta todo el proceso de forma clara y completa

La aplicación ahora puede desplegarse de forma consistente y reproducible en cualquier entorno que tenga Docker instalado, facilitando el desarrollo, las pruebas y el despliegue en producción.

**El pipeline está listo para ser utilizado en un entorno de producción con las configuraciones de seguridad apropiadas.**

---

## 12. Anexos

### A. Lista de Capturas de Pantalla Requeridas

**Nota**: Debes incluir las siguientes capturas de pantalla en tu informe PDF. Cada captura debe tener un título descriptivo y una breve explicación.

#### A.1 Instalación de Docker

1. **Verificación de instalación de Docker**
   - Comando: `docker --version`
   - Descripción: Mostrar la versión de Docker instalada

2. **Verificación de Docker Compose**
   - Comando: `docker-compose --version` o `docker compose version`
   - Descripción: Mostrar la versión de Docker Compose

3. **Estado de Docker Desktop** (si usas Windows)
   - Descripción: Mostrar Docker Desktop funcionando con estado "Running"

4. **Prueba de Docker**
   - Comando: `docker run hello-world`
   - Descripción: Mostrar la salida exitosa del contenedor hello-world

#### A.2 Instalación de Jenkins

5. **Página inicial de Jenkins**
   - URL: `http://localhost:8080`
   - Descripción: Pantalla de desbloqueo de Jenkins pidiendo la contraseña inicial

6. **Instalación de plugins**
   - Descripción: Pantalla mostrando la instalación de plugins sugeridos

7. **Creación de usuario administrador**
   - Descripción: Formulario de creación del primer usuario

8. **Dashboard principal de Jenkins**
   - Descripción: Panel principal de Jenkins después de la configuración inicial

#### A.3 Configuración del Proyecto

9. **Estructura de archivos Docker**
   - Comando: `tree -L 2` o `ls -la`
   - Descripción: Mostrar los Dockerfiles y docker-compose.yml

10. **Verificación de sintaxis docker-compose**
   - Comando: `docker-compose config`
   - Descripción: Mostrar la validación exitosa del archivo

#### A.4 Creación de Imágenes Docker

11. **Construcción de imagen del backend**
   - Comando: `docker build -t sistema-ventas-backend:latest ./backend`
   - Descripción: Mostrar el proceso completo de construcción

12. **Construcción de imagen del frontend**
   - Comando: `docker build -t sistema-ventas-frontend:latest ./frontend`
   - Descripción: Mostrar el proceso completo de construcción

13. **Listado de imágenes creadas**
   - Comando: `docker images | grep sistema-ventas`
   - Descripción: Mostrar todas las imágenes Docker del proyecto

#### A.5 Configuración del Pipeline en Jenkins

14. **Creación del nuevo item**
   - Descripción: Pantalla de creación de nuevo Pipeline en Jenkins

15. **Configuración del SCM (Git)**
   - Descripción: Configuración del repositorio Git en el pipeline

16. **Configuración del Script Path**
   - Descripción: Mostrar que el Script Path apunta a `Jenkinsfile`

#### A.6 Ejecución del Pipeline

17. **Inicio del pipeline**
   - Descripción: Vista del pipeline iniciándose (botón Build Now o ejecución automática)

18. **Vista del pipeline ejecutándose**
   - Descripción: Blue Ocean o vista clásica mostrando las etapas en progreso

19. **Etapas del pipeline con éxito**
   - Descripción: Todas las etapas mostrando estado de éxito (✓)

20. **Logs de construcción del backend**
   - Descripción: Logs detallados del stage "Build Backend"

21. **Logs de construcción del frontend**
   - Descripción: Logs detallados del stage "Build Frontend"

22. **Logs de despliegue con docker-compose**
   - Descripción: Logs del stage "Desplegar con Docker Compose"

23. **Logs de health check**
   - Descripción: Logs del stage "Health Check" mostrando servicios saludables

24. **Resultado final exitoso**
   - Descripción: Mensaje "Finished: SUCCESS" al final del pipeline

25. **Tiempo total de ejecución**
   - Descripción: Mostrar el tiempo total que tardó el pipeline

#### A.7 Verificación del Despliegue

26. **Estado de contenedores**
   - Comando: `docker-compose ps`
   - Descripción: Mostrar todos los contenedores en estado "Up"

27. **Acceso al frontend en navegador**
   - URL: `http://localhost:80`
   - Descripción: Captura de la aplicación funcionando en el navegador

28. **Acceso al backend API (health check)**
   - URL: `http://localhost:3001/api/health`
   - Descripción: Respuesta JSON del endpoint de health

29. **Logs del backend**
   - Comando: `docker-compose logs backend | tail -20`
   - Descripción: Logs recientes mostrando que el backend está funcionando

30. **Logs del frontend**
   - Comando: `docker-compose logs frontend | tail -20`
   - Descripción: Logs recientes del frontend

31. **Reporte de despliegue**
   - Descripción: Contenido del archivo `deployment-report.txt` generado

#### A.8 Kubernetes (Opcional)

32. **Nodos de Kubernetes**
   - Comando: `kubectl get nodes`
   - Descripción: Mostrar los nodos del clúster

33. **Pods en ejecución**
   - Comando: `kubectl get pods`
   - Descripción: Mostrar todos los pods desplegados

34. **Servicios de Kubernetes**
   - Comando: `kubectl get services`
   - Descripción: Mostrar los servicios expuestos

35. **Escalado de réplicas**
   - Comando: `kubectl get pods -l app=backend`
   - Descripción: Mostrar múltiples réplicas del backend ejecutándose

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

