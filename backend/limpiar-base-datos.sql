-- =====================================================
-- SCRIPT DE LIMPIEZA DE BASE DE DATOS
-- =====================================================
-- Este script elimina todos los datos excepto el usuario administrador
-- Ejecutar con precaución - Esta acción NO se puede deshacer
-- =====================================================

-- Mostrar usuario administrador antes de eliminar
SELECT 'Usuario Administrador que se mantendrá:' as mensaje;
SELECT id, cedula, nombre, apellido, correo, tipo_usuario 
FROM usuarios 
WHERE tipo_usuario = 'administrador';

-- =====================================================
-- PASO 1: Eliminar todas las sesiones (incluyendo admin, se pueden recrear)
-- =====================================================
DELETE FROM sesiones_usuario;
SELECT 'Todas las sesiones eliminadas' as mensaje;

-- =====================================================
-- PASO 2: Eliminar todos los mensajes de chat
-- =====================================================
DELETE FROM mensajes_chat;
SELECT 'Todos los mensajes eliminados' as mensaje;

-- =====================================================
-- PASO 3: Eliminar todos los chats
-- =====================================================
DELETE FROM chats;
SELECT 'Todos los chats eliminados' as mensaje;

-- =====================================================
-- PASO 4: Eliminar todos los productos guardados
-- =====================================================
DELETE FROM productos_guardados;
SELECT 'Todos los productos guardados eliminados' as mensaje;

-- =====================================================
-- PASO 5: Eliminar todas las valoraciones
-- =====================================================
DELETE FROM valoraciones;
SELECT 'Todas las valoraciones eliminadas' as mensaje;

-- =====================================================
-- PASO 6: Eliminar todas las apelaciones
-- =====================================================
DELETE FROM apelaciones;
SELECT 'Todas las apelaciones eliminadas' as mensaje;

-- =====================================================
-- PASO 7: Eliminar todos los reportes
-- =====================================================
DELETE FROM reportes;
SELECT 'Todos los reportes eliminados' as mensaje;

-- =====================================================
-- PASO 8: Eliminar todas las imágenes de productos
-- =====================================================
DELETE FROM item_imagenes;
SELECT 'Todas las imágenes de productos eliminadas' as mensaje;

-- =====================================================
-- PASO 9: Eliminar todos los productos/servicios
-- =====================================================
DELETE FROM items;
SELECT 'Todos los productos/servicios eliminados' as mensaje;

-- =====================================================
-- PASO 10: Eliminar solo compradores y vendedores (NO moderadores)
-- =====================================================
-- Primero mostrar qué usuarios se van a eliminar
SELECT 'Usuarios que serán eliminados (solo compradores y vendedores):' as mensaje;
SELECT id, cedula, nombre, apellido, correo, tipo_usuario 
FROM usuarios 
WHERE tipo_usuario IN ('comprador', 'vendedor');

-- Eliminar solo compradores y vendedores (NO moderadores)
DELETE FROM usuarios 
WHERE tipo_usuario IN ('comprador', 'vendedor');

SELECT 'Usuarios no administradores eliminados' as mensaje;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT '========================================' as mensaje;
SELECT 'LIMPIEZA COMPLETADA - VERIFICACIÓN FINAL' as mensaje;
SELECT '========================================' as mensaje;

-- Mostrar conteo de registros restantes
SELECT 'Usuarios restantes:' as mensaje;
SELECT tipo_usuario, COUNT(*) as total 
FROM usuarios 
GROUP BY tipo_usuario;

SELECT 'Productos restantes:' as mensaje;
SELECT COUNT(*) as total FROM items;

SELECT 'Sesiones restantes:' as mensaje;
SELECT COUNT(*) as total FROM sesiones_usuario;

SELECT 'Chats restantes:' as mensaje;
SELECT COUNT(*) as total FROM chats;

SELECT 'Mensajes restantes:' as mensaje;
SELECT COUNT(*) as total FROM mensajes_chat;

SELECT 'Reportes restantes:' as mensaje;
SELECT COUNT(*) as total FROM reportes;

SELECT 'Productos guardados restantes:' as mensaje;
SELECT COUNT(*) as total FROM productos_guardados;

SELECT 'Imágenes restantes:' as mensaje;
SELECT COUNT(*) as total FROM item_imagenes;

-- Mostrar usuarios preservados
SELECT '========================================' as mensaje;
SELECT 'USUARIOS PRESERVADOS:' as mensaje;
SELECT '========================================' as mensaje;
SELECT id, cedula, nombre, apellido, correo, tipo_usuario, estado, email_verificado 
FROM usuarios 
WHERE tipo_usuario IN ('administrador', 'moderador')
ORDER BY tipo_usuario, id;

SELECT '========================================' as mensaje;
SELECT '¡LIMPIEZA COMPLETADA EXITOSAMENTE!' as mensaje;
SELECT 'Usuarios preservados: Administradores y Moderadores' as mensaje;
SELECT 'Usuarios eliminados: Compradores y Vendedores' as mensaje;
SELECT '========================================' as mensaje;

