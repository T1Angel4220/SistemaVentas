-- =====================================================
-- SCRIPT DE INSTALACIÓN Y CONFIGURACIÓN DE BASE DE DATOS
-- =====================================================
-- Este script debe ejecutarse como superusuario de PostgreSQL
-- para crear la base de datos y configurar permisos

-- Crear usuario para la aplicación (opcional, si no usas postgres)
-- CREATE USER sistema_ventas_user WITH PASSWORD 'sistema_ventas_password';

-- Crear la base de datos
DROP DATABASE IF EXISTS sistema_ventas_multiempresa;
CREATE DATABASE sistema_ventas_multiempresa;

-- Conceder permisos al usuario (si creaste uno específico)
-- GRANT ALL PRIVILEGES ON DATABASE sistema_ventas_multiempresa TO sistema_ventas_user;

-- Conectar a la nueva base de datos
\c sistema_ventas_multiempresa;

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'America/Costa_Rica';

-- Mostrar información de la base de datos creada
SELECT 
    'Base de datos creada exitosamente' as status,
    current_database() as database_name,
    current_user as current_user,
    version() as postgresql_version;
