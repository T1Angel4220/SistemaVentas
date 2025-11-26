-- =====================================================
-- AGREGAR ESTADO 'en_apelacion' AL ENUM estado_item
-- =====================================================
-- Este script agrega el estado 'en_apelacion' si no existe
-- para permitir apelaciones de productos rechazados

DO $$ 
BEGIN
    -- Verificar si el valor ya existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'en_apelacion' 
        AND enumtypid = 'estado_item'::regtype
    ) THEN
        -- Agregar el valor al enum
        ALTER TYPE estado_item ADD VALUE 'en_apelacion';
    END IF;
END $$;

