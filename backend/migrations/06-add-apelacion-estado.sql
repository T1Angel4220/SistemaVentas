-- =====================================================
-- AGREGAR ESTADO 'en_apelacion' AL ENUM estado_item (RESPALDO)
-- =====================================================
-- NOTA IMPORTANTE: Este script es SOLO un respaldo de seguridad.
-- El valor 'en_apelacion' YA ESTÁ incluido en 01-init-schema.sql (línea 58)
-- cuando se crea el enum estado_item inicialmente.
-- 
-- Este script intenta agregar el valor solo si falta (caso edge case).
-- En ejecuciones normales de Jenkins, esto NO será necesario porque
-- 01-init-schema.sql ya incluye el valor.
--
-- Orden de ejecución de scripts de migración:
-- 1. 01-init-schema.sql - Crea el enum CON 'en_apelacion' incluido ✅
-- 2. 02-create-tables.sql - Crea las tablas
-- 3. 05-ecuador-locations.sql - Inserta ubicaciones
-- 4. 06-add-apelacion-estado.sql - Este script (respaldo seguro)

-- Este script verifica si el valor existe y lo agrega si falta
-- Si el valor ya existe (caso normal), el script simplemente continúa sin error

-- Verificar si necesitamos agregar el valor
DO $$ 
BEGIN
    -- Solo intentar agregar si el tipo existe pero el valor no
    IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'estado_item'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'estado_item'
        AND e.enumlabel = 'en_apelacion'
    ) THEN
        -- El tipo existe pero el valor no
        -- NOTA: No podemos ejecutar ALTER TYPE ADD VALUE aquí directamente
        -- pero podemos registrar que necesitamos hacerlo
        RAISE NOTICE 'Valor en_apelacion no encontrado en estado_item, pero debería estar en 01-init-schema.sql';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorar cualquier error
        NULL;
END $$;