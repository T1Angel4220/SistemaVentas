-- =====================================================
-- AGREGAR ESTADO 'en_apelacion' AL ENUM estado_item
-- =====================================================
-- Este script garantiza que el valor 'en_apelacion' exista en el enum
-- Se ejecuta después de 01-init-schema.sql como respaldo de seguridad
-- NOTA: PostgreSQL no soporta IF NOT EXISTS en ALTER TYPE ADD VALUE
-- La función ensureApelacionEstadoExists() en database.js verifica antes de agregar

-- Verificar si el valor existe antes de agregarlo (evita errores)
DO $$ 
BEGIN
    -- Solo agregar si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_item'
        AND e.enumlabel = 'en_apelacion'
    ) THEN
        -- Agregar el valor al enum
        EXECUTE 'ALTER TYPE estado_item ADD VALUE ''en_apelacion''';
        RAISE NOTICE 'Valor "en_apelacion" agregado al enum estado_item';
    ELSE
        RAISE NOTICE 'Valor "en_apelacion" ya existe en estado_item';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- El valor ya existe, no hacer nada
        NULL;
    WHEN OTHERS THEN
        RAISE WARNING 'Error al agregar "en_apelacion" al enum estado_item: %', SQLERRM;
END $$;
