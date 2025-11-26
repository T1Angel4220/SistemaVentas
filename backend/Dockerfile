# Dockerfile para Backend - Sistema de Ventas Multiempresa
# Usa Node.js 18 como imagen base
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

