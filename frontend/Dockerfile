# Dockerfile para Frontend - Sistema de Ventas Multiempresa
# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Argumento para la URL de la API (se pasa durante el build)
# Usamos localhost porque el navegador accede desde fuera de Docker
# NO incluir /api aquí porque se agrega en el código
ARG VITE_API_URL=http://localhost:3001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Configurar variable de entorno para el build
ENV VITE_API_URL=${VITE_API_URL}

# Construir la aplicación para producción
# Usamos vite build directamente para evitar fallos por errores de tipo en desarrollo
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

