-- =====================================================
-- ELIMINAR UBICACIONES INCORRECTAS
-- =====================================================
-- Este script elimina las ubicaciones creadas por error
-- (id > 210) y mantiene solo las 210 ubicaciones de Ecuador
SET
    client_encoding = 'UTF8';

-- Eliminar ubicaciones con id > 210 (creadas por error)
DELETE FROM
    ubicaciones
WHERE
    id > 210;

-- Reiniciar la secuencia para que el próximo id sea 211
-- (aunque ya no deberíamos crear más ubicaciones)
SELECT
    setval('ubicaciones_id_seq', 210);

-- Verificar que solo quedan 210 ubicaciones
SELECT
    COUNT(*) as total_ubicaciones
FROM
    ubicaciones;

-- Mostrar las primeras y últimas ubicaciones
(
    SELECT
        id,
        nombre,
        provincia,
        canton
    FROM
        ubicaciones
    ORDER BY
        id ASC
    LIMIT
        5
)
UNION
ALL (
    SELECT
        id,
        nombre,
        provincia,
        canton
    FROM
        ubicaciones
    ORDER BY
        id DESC
    LIMIT
        5
);