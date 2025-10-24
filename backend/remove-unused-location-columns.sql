-- =====================================================
-- ELIMINAR COLUMNAS NO USADAS DE UBICACIONES
-- =====================================================
-- Este script elimina las columnas 'distrito' y 'coordenadas'
-- de la tabla ubicaciones ya que no se utilizan

SET client_encoding = 'UTF8';

-- Eliminar columna distrito (no se usa, cada producto tiene su propio distrito)
ALTER TABLE ubicaciones 
DROP COLUMN IF EXISTS distrito;

-- Eliminar columna coordenadas (no se usa en esta tabla, se usará en items)
ALTER TABLE ubicaciones 
DROP COLUMN IF EXISTS coordenadas;

-- Verificar la estructura actualizada
\d ubicaciones

-- Mostrar algunas ubicaciones para confirmar
SELECT id, nombre, provincia, canton, activa 
FROM ubicaciones 
LIMIT 10;

