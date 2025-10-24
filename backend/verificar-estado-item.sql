-- =====================================================
-- Verificar valores del ENUM estado_item
-- =====================================================

\echo '\n╔════════════════════════════════════════════════════════════════╗'
\echo '║         VALORES ACTUALES DEL ENUM estado_item                  ║'
\echo '╚════════════════════════════════════════════════════════════════╝\n'

SELECT 
    ROW_NUMBER() OVER (ORDER BY enumlabel) as "#",
    enumlabel as "Estado"
FROM pg_enum
WHERE enumtypid = 'estado_item'::regtype
ORDER BY enumlabel;

\echo '\n✅ Si ves "en_apelacion" en la lista, el estado se agregó correctamente.\n'



