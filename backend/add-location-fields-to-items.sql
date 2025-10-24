-- =====================================================
-- AGREGAR CAMPOS DE UBICACIÓN A LA TABLA ITEMS
-- =====================================================
-- Este script agrega columnas para guardar ubicación detallada
-- directamente en cada producto (provincia, cantón, distrito, dirección)
-- Configurar encoding UTF-8
SET
    client_encoding = 'UTF8';

-- Agregar columnas si no existen
ALTER TABLE
    items
ADD
    COLUMN IF NOT EXISTS ubicacion_provincia VARCHAR(100),
ADD
    COLUMN IF NOT EXISTS ubicacion_canton VARCHAR(100),
ADD
    COLUMN IF NOT EXISTS ubicacion_distrito VARCHAR(100),
ADD
    COLUMN IF NOT EXISTS ubicacion_direccion VARCHAR(255);

-- Crear índices para mejorar búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_items_provincia ON items(ubicacion_provincia);

CREATE INDEX IF NOT EXISTS idx_items_canton ON items(ubicacion_canton);

-- Verificar las columnas agregadas
\ d items