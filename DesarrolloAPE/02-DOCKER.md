# Configuración de Docker

Esta guía explica cómo containerizar la aplicación Sistema de Ventas Multiempresa usando Docker.

---

## 📋 Objetivos

- Crear imágenes Docker para el backend y frontend
- Configurar docker-compose para orquestar los servicios
- Ejecutar la aplicación completa en contenedores

---

## 1. Estructura de Archivos Docker

Los archivos necesarios están en la raíz del proyecto:

```
SistemaVentas/
├── Dockerfile.backend          # Imagen del backend
├── Dockerfile.frontend         # Imagen del frontend
├── docker-compose.yml          # Orquestación de servicios
└── .dockerignore              # Archivos excluidos
```

---

## 2. Dockerfile del Backend

El archivo `Dockerfile.backend` contiene:

```dockerfile
# Usar imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY backend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY backend/ ./

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]
```

**Explicación:**
- `FROM node:18-alpine`: Imagen base ligera con Node.js 18
- `WORKDIR /app`: Establece el directorio de trabajo
- `COPY package*.json`: Copia archivos de dependencias primero (cache de Docker)
- `RUN npm ci`: Instala dependencias de producción
- `COPY backend/`: Copia el código fuente
- `EXPOSE 3001`: Expone el puerto 3001
- `CMD`: Comando por defecto al ejecutar el contenedor

---

## 3. Dockerfile del Frontend

El archivo `Dockerfile.frontend` contiene:

```dockerfile
# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY frontend/ ./

# Construir la aplicación
RUN npm run build

# Etapa 2: Producción
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Nginx inicia automáticamente
```

**Explicación:**
- **Multi-stage build**: Primera etapa construye la app, segunda sirve con nginx
- `AS builder`: Nombre de la etapa de construcción
- `npm run build`: Construye la aplicación React
- `FROM nginx:alpine`: Imagen ligera de nginx para servir archivos estáticos
- `COPY --from=builder`: Copia archivos de la etapa anterior

---

## 4. Docker Compose

El archivo `docker-compose.yml` orquesta todos los servicios:

```yaml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: sistema-ventas-db
    environment:
      POSTGRES_DB: sistema_ventas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: sistema-ventas-backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: sistema_ventas
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: tu-jwt-secret-aqui
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - app-network
    restart: unless-stopped

  # Frontend React
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: sistema-ventas-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

**Explicación de Servicios:**

1. **postgres**: Base de datos PostgreSQL
   - Volumen persistente para datos
   - Healthcheck para verificar disponibilidad

2. **backend**: API Node.js
   - Depende de postgres
   - Volumen para uploads de imágenes
   - Variables de entorno para configuración

3. **frontend**: Aplicación React
   - Servida por nginx
   - Depende de backend

---

## 5. .dockerignore

Archivo para excluir archivos innecesarios de la imagen:

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
*.md
.vscode
.idea
dist
build
coverage
.DS_Store
```

---

## 6. Construcción de Imágenes

### Construir todas las imágenes:

```bash
docker-compose build
```

### Construir una imagen específica:

```bash
# Backend
docker build -f Dockerfile.backend -t sistema-ventas-backend .

# Frontend
docker build -f Dockerfile.frontend -t sistema-ventas-frontend .
```

---

## 7. Ejecución con Docker Compose

### Iniciar todos los servicios:

```bash
docker-compose up -d
```

### Ver logs:

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Detener servicios:

```bash
docker-compose down
```

### Detener y eliminar volúmenes:

```bash
docker-compose down -v
```

---

## 8. Verificación

### Verificar contenedores en ejecución:

```bash
docker-compose ps
```

### Acceder a los servicios:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### Verificar logs del backend:

```bash
docker-compose logs backend
```

### Ejecutar comandos dentro de un contenedor:

```bash
# Acceder al contenedor del backend
docker-compose exec backend sh

# Ejecutar migraciones (si es necesario)
docker-compose exec backend npm run migrate
```

---

## 9. Configuración de Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sistema_ventas
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=tu-secret-key-muy-segura-aqui

# Email (configurar según tu proveedor)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password

# Frontend
VITE_API_URL=http://localhost:3001
```

Modificar `docker-compose.yml` para usar variables de entorno:

```yaml
backend:
  environment:
    DB_HOST: ${DB_HOST}
    DB_PASSWORD: ${DB_PASSWORD}
    # ... otras variables
```

---

## 10. Optimización de Imágenes

### Reducir tamaño de imagen:

1. **Usar imágenes Alpine** (ya implementado)
2. **Multi-stage builds** (ya implementado en frontend)
3. **Limpiar cache de npm**:

```dockerfile
RUN npm ci --only=production && \
    npm cache clean --force
```

4. **Eliminar archivos innecesarios**:

```dockerfile
RUN rm -rf /tmp/* /var/tmp/*
```

---

## 11. Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar configuración
docker-compose config
```

### Problema: Error de conexión a base de datos

- Verificar que postgres esté saludable: `docker-compose ps`
- Verificar variables de entorno
- Verificar red Docker: `docker network ls`

### Problema: Puerto ya en uso

```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3002:3001"  # Usar puerto 3002 en lugar de 3001
```

---

## 📝 Capturas de Pantalla Necesarias

1. Construcción de imágenes Docker
2. Contenedores en ejecución (`docker-compose ps`)
3. Logs de los servicios
4. Aplicación funcionando en el navegador
5. Verificación de imágenes creadas (`docker images`)

---

## 🔗 Comandos Útiles

```bash
# Listar imágenes
docker images

# Listar contenedores
docker ps -a

# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune -a

# Ver uso de recursos
docker stats

# Inspeccionar contenedor
docker inspect sistema-ventas-backend
```

---

**Próximo Paso:** [Configuración de Jenkins](./03-JENKINS.md)

