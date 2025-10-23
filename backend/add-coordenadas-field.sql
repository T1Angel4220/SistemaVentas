-- Agregar campo de coordenadas a la tabla items
-- Formato: "lat,lng" o "lat, lng"
ALTER TABLE
    items
ADD
    COLUMN IF NOT EXISTS coordenadas VARCHAR(50);

-- Crear índice para búsquedas espaciales (opcional)
CREATE INDEX IF NOT EXISTS idx_items_coordenadas ON items(coordenadas);

-- Verificar
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM
    information_schema.columns
WHERE
    table_name = 'items'
    AND column_name = 'coordenadas';