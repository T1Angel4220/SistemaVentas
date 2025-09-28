#!/bin/bash

echo "====================================================="
echo "INSTALACION DE BASE DE DATOS - SISTEMA DE VENTAS"
echo "====================================================="
echo

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL no está instalado"
    echo "Por favor instala PostgreSQL desde: https://www.postgresql.org/download/"
    exit 1
fi

echo "PostgreSQL encontrado. Continuando con la instalación..."
echo

# Solicitar información de conexión
read -p "Host de la base de datos (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Puerto de la base de datos (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Usuario de PostgreSQL (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Contraseña de PostgreSQL: " DB_PASSWORD
echo

echo
echo "Configurando base de datos..."
echo "Host: $DB_HOST"
echo "Puerto: $DB_PORT"
echo "Usuario: $DB_USER"
echo

# Crear archivo .env
cat > .env << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=sistema_ventas_multiempresa
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

PORT=3000
NODE_ENV=development

JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_email

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
EOF

# Ejecutar script de configuración de base de datos
echo "Ejecutando script de configuración..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -f src/config/setup_database.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al ejecutar el script de configuración"
    rm -f .env
    exit 1
fi

# Ejecutar script de creación de tablas
echo "Ejecutando script de creación de tablas..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d sistema_ventas_multiempresa -f src/config/database.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al ejecutar el script de creación de tablas"
    rm -f .env
    exit 1
fi

# Ejecutar script de datos iniciales
echo "Ejecutando script de datos iniciales..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d sistema_ventas_multiempresa -f src/config/initial_data.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al ejecutar el script de datos iniciales"
    rm -f .env
    exit 1
fi

echo
echo "====================================================="
echo "INSTALACION COMPLETADA EXITOSAMENTE"
echo "====================================================="
echo
echo "La base de datos ha sido creada con los siguientes datos:"
echo "- Base de datos: sistema_ventas_multiempresa"
echo "- Usuario administrador: admin@sistemaventas.com"
echo "- Contraseña: (ver archivo .env)"
echo
echo "Para iniciar el servidor:"
echo "  npm start"
echo
echo "Para probar la conexión:"
echo "  npm test"
echo
