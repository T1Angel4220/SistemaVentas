#!/bin/bash

# =====================================================
# SCRIPT DE INICIALIZACIÓN DE DATOS PARA DOCKER
# =====================================================
# Este script se ejecuta después de crear el esquema
# para poblar la base de datos con datos iniciales

set -e

echo "🔄 Iniciando proceso de inicialización de datos..."

# Esperar a que PostgreSQL esté completamente listo
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do
  echo "⏳ Esperando a que PostgreSQL esté listo..."
  sleep 1
done

echo "✅ PostgreSQL está listo"

# Variables de entorno
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sistema_ventas_multiempresa}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

export PGPASSWORD="$DB_PASSWORD"

# Directorio de scripts
SCRIPTS_DIR="/docker-entrypoint-initdb.d/scripts"
BACKEND_DIR="/app"

# Función para ejecutar script SQL
run_sql_file() {
    local file=$1
    echo "📄 Ejecutando: $file"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" || echo "⚠️ Advertencia al ejecutar $file"
}

# Función para ejecutar script Node.js
run_node_script() {
    local script=$1
    echo "📄 Ejecutando script Node.js: $script"
    
    # Si el script está en el contenedor del backend, necesitamos ejecutarlo desde ahí
    # Por ahora, lo ejecutamos directamente si node está disponible
    if command -v node &> /dev/null; then
        node "$script" || echo "⚠️ Advertencia al ejecutar $script"
    else
        echo "⚠️ Node.js no está disponible en este contenedor. El script se ejecutará desde el backend."
    fi
}

# 1. Crear ubicaciones de Ecuador (si existe el archivo SQL)
if [ -f "/docker-entrypoint-initdb.d/05-ecuador-locations.sql" ]; then
    echo ""
    echo "🌎 Insertando ubicaciones de Ecuador..."
    run_sql_file "/docker-entrypoint-initdb.d/05-ecuador-locations.sql"
    echo "✅ Ubicaciones de Ecuador insertadas"
fi

echo ""
echo "✅ Proceso de inicialización de datos completado"
echo ""
echo "💡 Nota: Los scripts de Node.js (categorías, usuarios de prueba, productos)"
echo "   se ejecutarán automáticamente cuando el backend inicie."

