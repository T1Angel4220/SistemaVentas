-- =====================================================
-- SCRIPT PARA BORRAR DATOS DE USUARIOS, PRODUCTOS Y RELACIONADAS
-- =====================================================
-- Este script borra SOLO las filas (no las tablas) de:
-- - usuarios
-- - items (productos/servicios)
-- - apelaciones
-- - reportes
-- - servicios
-- - Y tablas relacionadas (imágenes, productos guardados, chats, etc.)
--
-- ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
-- =====================================================

-- Usar la base de datos
\c sistema_ventas_multiempresa;

-- Desactivar temporalmente las restricciones de foreign keys para evitar errores
SET session_replication_role = replica;

BEGIN;

-- =====================================================
-- PASO 1: Borrar tablas que dependen de otras (orden de dependencias)
-- =====================================================

-- Mensajes de chat (depende de chats)
DELETE FROM mensajes_chat;
SELECT '✅ Mensajes de chat eliminados' as status;

-- Valoraciones (depende de chats, items, usuarios)
DELETE FROM valoraciones;
SELECT '✅ Valoraciones eliminadas' as status;

-- Chats (depende de usuarios e items)
DELETE FROM chats;
SELECT '✅ Chats eliminados' as status;

-- Productos guardados (depende de usuarios e items)
DELETE FROM productos_guardados;
SELECT '✅ Productos guardados eliminados' as status;

-- Apelaciones (depende de reportes, items, usuarios)
DELETE FROM apelaciones;
SELECT '✅ Apelaciones eliminadas' as status;

-- Reportes (depende de items y usuarios)
DELETE FROM reportes;
SELECT '✅ Reportes eliminados' as status;

-- Imágenes de productos (depende de items)
DELETE FROM item_imagenes;
SELECT '✅ Imágenes de productos eliminadas' as status;

-- Servicios (depende de items)
DELETE FROM servicios;
SELECT '✅ Servicios eliminados' as status;

-- Acciones de moderación (depende de usuarios)
DELETE FROM acciones_moderacion;
SELECT '✅ Acciones de moderación eliminadas' as status;

-- Sesiones de usuario (depende de usuarios)
DELETE FROM sesiones_usuario;
SELECT '✅ Sesiones de usuario eliminadas' as status;

-- =====================================================
-- PASO 2: Borrar tablas principales
-- =====================================================

-- Items (productos y servicios)
DELETE FROM items;
SELECT '✅ Productos y servicios (items) eliminados' as status;

-- Usuarios
DELETE FROM usuarios;
SELECT '✅ Usuarios eliminados' as status;

-- =====================================================
-- PASO 3: Reiniciar secuencias (opcional, para que los IDs empiecen desde 1)
-- =====================================================

ALTER SEQUENCE IF EXISTS usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS item_imagenes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS servicios_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS productos_guardados_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS reportes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS apelaciones_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS chats_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS mensajes_chat_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS valoraciones_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS acciones_moderacion_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sesiones_usuario_id_seq RESTART WITH 1;

SELECT '✅ Secuencias reiniciadas' as status;

-- Reactivar las restricciones de foreign keys
SET session_replication_role = DEFAULT;

COMMIT;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
SELECT 
    '🎉 Limpieza completada exitosamente' as mensaje,
    'Todas las filas de usuarios, productos, reportes, apelaciones y servicios han sido eliminadas' as detalle;

