-- =====================================================
-- Eliminar columna moderador_asignado_id de reportes
-- =====================================================
-- Esta columna no se usa en el sistema ya que cualquier
-- moderador puede resolver reportes sin asignación previa
-- Solo se registra quién lo resolvió en moderador_resolutor_id
-- Paso 1: Eliminar el índice asociado
DROP INDEX IF EXISTS idx_reportes_moderador;

-- Paso 2: Eliminar el trigger que depende de esta columna
DROP TRIGGER IF EXISTS trigger_registrar_asignacion_reporte ON reportes;

-- Paso 3: Eliminar la función asociada al trigger
DROP FUNCTION IF EXISTS registrar_accion_moderacion();

-- Paso 4: Eliminar la vista que depende de esta columna
DROP VIEW IF EXISTS vista_reportes_pendientes;

-- Paso 5: Ahora sí podemos eliminar la columna
ALTER TABLE
    reportes DROP COLUMN IF EXISTS moderador_asignado_id;

-- Paso 6: Recrear la vista sin la columna moderador_asignado_id
CREATE VIEW vista_reportes_pendientes AS
SELECT
    r.id,
    r.tipo_reporte,
    r.descripcion,
    r.fecha_reporte,
    i.nombre as producto_reportado,
    u.nombre || ' ' || u.apellido as usuario_reportador
FROM
    reportes r
    JOIN items i ON r.item_id = i.id
    JOIN usuarios u ON r.usuario_reportador_id = u.id
WHERE
    r.estado = 'pendiente';

-- Verificar que se eliminó correctamente
\ d reportes