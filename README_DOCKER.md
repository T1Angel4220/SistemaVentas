# Guía Rápida: Despliegue con Docker

## 🚀 Inicio Rápido

### 1. Prerrequisitos

- Docker instalado
- Docker Compose instalado

### 2. Configuración

1. Copiar el archivo de ejemplo de variables de entorno:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Editar `backend/.env` con tus credenciales de base de datos y email.

3. Crear archivo `.env.docker` en la raíz del proyecto:
   ```bash
   cp .env.docker.example .env.docker
   ```
   Editar `.env.docker` y ajustar las credenciales según tu configuración.

### 3. Despliegue

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### 4. Acceso

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### 5. Detener Servicios

```bash
docker-compose down
```

Para más información, consulta `DOCUMENTACION_JENKINS_DOCKER.md`.

