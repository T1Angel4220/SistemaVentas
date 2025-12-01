-- =====================================================
-- SCRIPT DE LIMPIEZA COMPLETA DE BASE DE DATOS
-- =====================================================
-- Este script elimina TODOS los datos de TODAS las tablas
-- pero MANTIENE la estructura de las tablas intacta
-- 
-- ⚠️ ADVERTENCIA: Esta acción NO se puede deshacer
-- ⚠️ Se eliminarán TODOS los datos: usuarios, productos, chats, reportes, etc.
-- =====================================================
-- 
-- CONFIGURACIÓN DE CONEXIÓN:
-- PGHOST=postgres-sistema-ventas.postgres.database.azure.com
-- PGUSER=azureuser
-- PGPORT=5432
-- PGDATABASE=sistema_ventas_multiempresa
-- PGPASSWORD=Angel_4220
-- =====================================================

-- Mostrar información antes de limpiar
SELECT '========================================' as mensaje;
SELECT 'INICIANDO LIMPIEZA DE BASE DE DATOS' as mensaje;
SELECT '========================================' as mensaje;
SELECT CURRENT_TIMESTAMP as fecha_hora;

-- Mostrar conteo de registros antes de limpiar
SELECT 'REGISTROS ANTES DE LIMPIAR:' as mensaje;
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'items' as tabla, COUNT(*) as registros FROM items
UNION ALL
SELECT 'chats' as tabla, COUNT(*) as registros FROM chats
UNION ALL
SELECT 'mensajes_chat' as tabla, COUNT(*) as registros FROM mensajes_chat
UNION ALL
SELECT 'reportes' as tabla, COUNT(*) as registros FROM reportes
UNION ALL
SELECT 'apelaciones' as tabla, COUNT(*) as registros FROM apelaciones
UNION ALL
SELECT 'productos_guardados' as tabla, COUNT(*) as registros FROM productos_guardados
UNION ALL
SELECT 'valoraciones' as tabla, COUNT(*) as registros FROM valoraciones
UNION ALL
SELECT 'item_imagenes' as tabla, COUNT(*) as registros FROM item_imagenes
UNION ALL
SELECT 'servicios' as tabla, COUNT(*) as registros FROM servicios
UNION ALL
SELECT 'acciones_moderacion' as tabla, COUNT(*) as registros FROM acciones_moderacion
UNION ALL
SELECT 'sesiones_usuario' as tabla, COUNT(*) as registros FROM sesiones_usuario;

-- =====================================================
-- PASO 1: Deshabilitar temporalmente las restricciones de claves foráneas
-- =====================================================
SET session_replication_role = replica;

-- =====================================================
-- PASO 2: Limpiar tablas en orden (de dependientes a principales)
-- Usando TRUNCATE CASCADE para respetar relaciones automáticamente
-- =====================================================

-- Tablas más dependientes primero
TRUNCATE TABLE mensajes_chat CASCADE;
SELECT '✓ mensajes_chat limpiada' as mensaje;

TRUNCATE TABLE chats CASCADE;
SELECT '✓ chats limpiada' as mensaje;

TRUNCATE TABLE valoraciones CASCADE;
SELECT '✓ valoraciones limpiada' as mensaje;

TRUNCATE TABLE productos_guardados CASCADE;
SELECT '✓ productos_guardados limpiada' as mensaje;

TRUNCATE TABLE apelaciones CASCADE;
SELECT '✓ apelaciones limpiada' as mensaje;

TRUNCATE TABLE reportes CASCADE;
SELECT '✓ reportes limpiada' as mensaje;

TRUNCATE TABLE acciones_moderacion CASCADE;
SELECT '✓ acciones_moderacion limpiada' as mensaje;

TRUNCATE TABLE sesiones_usuario CASCADE;
SELECT '✓ sesiones_usuario limpiada' as mensaje;

-- Tablas de productos/servicios
TRUNCATE TABLE item_imagenes CASCADE;
SELECT '✓ item_imagenes limpiada' as mensaje;

TRUNCATE TABLE servicios CASCADE;
SELECT '✓ servicios limpiada' as mensaje;

TRUNCATE TABLE items CASCADE;
SELECT '✓ items limpiada' as mensaje;

-- Tabla de usuarios (última porque otras dependen de ella)
TRUNCATE TABLE usuarios CASCADE;
SELECT '✓ usuarios limpiada' as mensaje;

-- =====================================================
-- PASO 3: Reiniciar secuencias (para que los IDs empiecen desde 1)
-- =====================================================
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
SELECT '✓ Secuencia usuarios_id_seq reiniciada' as mensaje;

ALTER SEQUENCE items_id_seq RESTART WITH 1;
SELECT '✓ Secuencia items_id_seq reiniciada' as mensaje;

ALTER SEQUENCE chats_id_seq RESTART WITH 1;
SELECT '✓ Secuencia chats_id_seq reiniciada' as mensaje;

ALTER SEQUENCE mensajes_chat_id_seq RESTART WITH 1;
SELECT '✓ Secuencia mensajes_chat_id_seq reiniciada' as mensaje;

ALTER SEQUENCE reportes_id_seq RESTART WITH 1;
SELECT '✓ Secuencia reportes_id_seq reiniciada' as mensaje;

ALTER SEQUENCE apelaciones_id_seq RESTART WITH 1;
SELECT '✓ Secuencia apelaciones_id_seq reiniciada' as mensaje;

ALTER SEQUENCE productos_guardados_id_seq RESTART WITH 1;
SELECT '✓ Secuencia productos_guardados_id_seq reiniciada' as mensaje;

ALTER SEQUENCE valoraciones_id_seq RESTART WITH 1;
SELECT '✓ Secuencia valoraciones_id_seq reiniciada' as mensaje;

ALTER SEQUENCE item_imagenes_id_seq RESTART WITH 1;
SELECT '✓ Secuencia item_imagenes_id_seq reiniciada' as mensaje;

ALTER SEQUENCE servicios_id_seq RESTART WITH 1;
SELECT '✓ Secuencia servicios_id_seq reiniciada' as mensaje;

ALTER SEQUENCE acciones_moderacion_id_seq RESTART WITH 1;
SELECT '✓ Secuencia acciones_moderacion_id_seq reiniciada' as mensaje;

ALTER SEQUENCE sesiones_usuario_id_seq RESTART WITH 1;
SELECT '✓ Secuencia sesiones_usuario_id_seq reiniciada' as mensaje;

-- =====================================================
-- PASO 4: Rehabilitar restricciones de claves foráneas
-- =====================================================
SET session_replication_role = DEFAULT;
SELECT '✓ Restricciones de claves foráneas rehabilitadas' as mensaje;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT '========================================' as mensaje;
SELECT 'LIMPIEZA COMPLETADA - VERIFICACIÓN FINAL' as mensaje;
SELECT '========================================' as mensaje;
SELECT CURRENT_TIMESTAMP as fecha_hora;

-- Mostrar conteo de registros después de limpiar (debe ser 0 en todas)
SELECT 'REGISTROS DESPUÉS DE LIMPIAR (debe ser 0 en todas):' as mensaje;
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'items' as tabla, COUNT(*) as registros FROM items
UNION ALL
SELECT 'chats' as tabla, COUNT(*) as registros FROM chats
UNION ALL
SELECT 'mensajes_chat' as tabla, COUNT(*) as registros FROM mensajes_chat
UNION ALL
SELECT 'reportes' as tabla, COUNT(*) as registros FROM reportes
UNION ALL
SELECT 'apelaciones' as tabla, COUNT(*) as registros FROM apelaciones
UNION ALL
SELECT 'productos_guardados' as tabla, COUNT(*) as registros FROM productos_guardados
UNION ALL
SELECT 'valoraciones' as tabla, COUNT(*) as registros FROM valoraciones
UNION ALL
SELECT 'item_imagenes' as tabla, COUNT(*) as registros FROM item_imagenes
UNION ALL
SELECT 'servicios' as tabla, COUNT(*) as registros FROM servicios
UNION ALL
SELECT 'acciones_moderacion' as tabla, COUNT(*) as registros FROM acciones_moderacion
UNION ALL
SELECT 'sesiones_usuario' as tabla, COUNT(*) as registros FROM sesiones_usuario;

-- Verificar que las tablas de referencia (categorias, ubicaciones) siguen existiendo
SELECT 'TABLAS DE REFERENCIA (deben mantenerse con sus datos):' as mensaje;
SELECT 'categorias' as tabla, COUNT(*) as registros FROM categorias
UNION ALL
SELECT 'ubicaciones' as tabla, COUNT(*) as registros FROM ubicaciones;

-- Mensaje final
SELECT '========================================' as mensaje;
SELECT '¡LIMPIEZA COMPLETADA EXITOSAMENTE!' as mensaje;
SELECT 'Todas las tablas están vacías pero la estructura se mantiene' as mensaje;
SELECT 'Las secuencias han sido reiniciadas' as mensaje;
SELECT 'Las tablas categorias y ubicaciones mantienen sus datos' as mensaje;
SELECT '========================================' as mensaje;

