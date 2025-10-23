-- Script para agregar el estado 'en_apelacion' al enum estado_item
-- Este script debe ejecutarse en la base de datos sistema_ventas_multiempresa
-- Agregar el nuevo valor al ENUM estado_item
ALTER TYPE estado_item
ADD
    VALUE IF NOT EXISTS 'en_apelacion';

-- Verificar que se agregó correctamente
SELECT
    enumlabel
FROM
    pg_enum
WHERE
    enumtypid = 'estado_item' :: regtype
ORDER BY
    enumlabel;