-- Script para truncar las tablas usuarios y sesiones_usuario
-- IMPORTANTE: Esto eliminará TODOS los datos de estas tablas

-- Deshabilitar verificación de claves foráneas temporalmente
SET session_replication_role = replica;

-- Truncar las tablas en el orden correcto (primero las dependientes)
TRUNCATE TABLE sesiones_usuario CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- Rehabilitar verificación de claves foráneas
SET session_replication_role = DEFAULT;

-- Verificar que las tablas están vacías
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'sesiones_usuario' as tabla, COUNT(*) as registros FROM sesiones_usuario;

-- Mensaje de confirmación
SELECT 'Tablas truncadas exitosamente' as mensaje;
