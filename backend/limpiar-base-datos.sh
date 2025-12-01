#!/bin/bash
# =====================================================
# SCRIPT DE LIMPIEZA DE BASE DE DATOS - LINUX/MAC
# =====================================================
# Este script ejecuta el SQL de limpieza usando psql
# =====================================================

echo "================================================"
echo "SCRIPT DE LIMPIEZA DE BASE DE DATOS"
echo "================================================"
echo ""
echo "ADVERTENCIA: Este script eliminará TODOS los datos"
echo "de TODAS las tablas excepto categorias y ubicaciones"
echo ""
echo "Esta acción NO se puede deshacer!"
echo ""
read -p "¿Estás seguro de continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operación cancelada."
    exit 1
fi

# Configurar variables de entorno de PostgreSQL
export PGHOST=postgres-sistema-ventas.postgres.database.azure.com
export PGUSER=azureuser
export PGPORT=5432
export PGDATABASE=sistema_ventas_multiempresa
export PGPASSWORD=Angel_4220

echo ""
echo "Conectando a la base de datos..."
echo "Host: $PGHOST"
echo "Database: $PGDATABASE"
echo "User: $PGUSER"
echo ""

# Ejecutar el script SQL
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -f limpiar-base-datos-completo.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "LIMPIEZA COMPLETADA EXITOSAMENTE"
    echo "================================================"
else
    echo ""
    echo "================================================"
    echo "ERROR AL EJECUTAR EL SCRIPT"
    echo "================================================"
    echo "Verifica que:"
    echo "1. psql esté instalado"
    echo "2. Las credenciales sean correctas"
    echo "3. Tengas permisos para ejecutar TRUNCATE"
    echo "================================================"
    exit 1
fi

