-- =====================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS PARA DOCKER
-- =====================================================
-- Este script se ejecuta automáticamente cuando PostgreSQL
-- crea el contenedor por primera vez
-- PostgreSQL ya ha creado la base de datos desde las variables de entorno

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'America/Costa_Rica';

-- =====================================================
-- ENUMS (Tipos de datos personalizados)
-- =====================================================
-- Tipos de usuario
DO $$ BEGIN
    CREATE TYPE tipo_usuario AS ENUM (
        'comprador',
        'vendedor',
        'moderador',
        'administrador'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados de usuario
DO $$ BEGIN
    CREATE TYPE estado_usuario AS ENUM (
        'activo',
        'inactivo',
        'suspendido',
        'pendiente_verificacion'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de producto/servicio
DO $$ BEGIN
    CREATE TYPE tipo_item AS ENUM ('producto', 'servicio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados de producto/servicio
DO $$ BEGIN
    CREATE TYPE estado_item AS ENUM (
        'activo',
        'inactivo',
        'pendiente_revision',
        'rechazado',
        'peligroso',
        'suspendido',
        'en_apelacion'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados de reporte/incidencia
DO $$ BEGIN
    CREATE TYPE estado_reporte AS ENUM (
        'pendiente',
        'en_revision',
        'resuelto',
        'rechazado',
        'en_apelacion'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de reporte
DO $$ BEGIN
    CREATE TYPE tipo_reporte AS ENUM (
        'contenido_inapropiado',
        'producto_prohibido',
        'informacion_falsa',
        'spam',
        'otro'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estados de chat
DO $$ BEGIN
    CREATE TYPE estado_chat AS ENUM ('activo', 'cerrado', 'archivado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

