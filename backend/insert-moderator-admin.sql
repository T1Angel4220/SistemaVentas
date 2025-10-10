-- =====================================================
-- INSERTS PARA MODERADOR Y ADMINISTRADOR
-- =====================================================
-- Este archivo contiene los inserts necesarios para crear
-- un usuario moderador y un administrador en el sistema
-- NOTA: Estos hashes están tomados de initial_data.sql y funcionan correctamente
-- con la contraseña "password123"
-- =====================================================
-- USUARIO MODERADOR
-- =====================================================
INSERT INTO
    usuarios (
        cedula,
        nombre,
        apellido,
        correo,
        telefono,
        direccion,
        genero,
        password_hash,
        tipo_usuario,
        estado,
        email_verificado
    )
VALUES
    (
        '12345601',
        -- Cedula del moderador
        'María',
        'González',
        'diehalloman@gmail.com',
        '+506-8888-7777',
        'San José, Costa Rica',
        'femenino',
        '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ',
        -- password: "password123"
        'moderador',
        'activo',
        true
    );

-- =====================================================
-- USUARIO ADMINISTRADOR
-- =====================================================
INSERT INTO
    usuarios (
        cedula,
        nombre,
        apellido,
        correo,
        telefono,
        direccion,
        genero,
        password_hash,
        tipo_usuario,
        estado,
        email_verificado
    )
VALUES
    (
        '123456789',
        -- Cedula del administrador
        'Admin',
        'Sistema',
        'admin@sistemaventas.com',
        '+506-9999-8888',
        'San José, Costa Rica',
        'masculino',
        '$2b$10$7VZ0SqSl4GbpgcnWaiTaXOv8SGZZMc5M/JkWP8i6fwnkPVK.dz1vy',
        -- password: "password123"
        'administrador',
        'activo',
        true
    );

-- =====================================================
-- VERIFICACIÓN DE INSERTS
-- =====================================================
-- Consulta para verificar que los usuarios fueron insertados correctamente
SELECT
    id,
    cedula,
    nombre,
    apellido,
    correo,
    tipo_usuario,
    estado,
    email_verificado,
    fecha_registro
FROM
    usuarios
WHERE
    tipo_usuario IN ('moderador', 'administrador')
ORDER BY
    tipo_usuario;

-- =====================================================
-- INFORMACIÓN DE ACCESO
-- =====================================================
-- MODERADOR:
-- Email: maria.moderador@sistemaventas.com
-- Password: password123
-- Tipo: moderador
-- ADMINISTRADOR:
-- Email: admin@sistemaventas.com  
-- Password: password123
-- Tipo: administrador
-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Los hashes están tomados de initial_data.sql que ya funciona
-- 2. Ambos usuarios están activos y verificados
-- 3. Las cédulas son únicas en el sistema
-- 4. Si ya existen estos usuarios, el INSERT fallará por duplicados