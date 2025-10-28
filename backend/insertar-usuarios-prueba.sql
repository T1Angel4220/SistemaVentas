-- =====================================================
-- SCRIPT PARA INSERTAR USUARIOS DE PRUEBA
-- =====================================================
-- Contraseña para todos: Angel_4220
-- Hash (10 rounds): $2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS
-- Configurar encoding para manejar correctamente caracteres especiales y tildes
SET
    CLIENT_ENCODING TO 'UTF8';

-- =====================================================
-- USUARIOS ESPECÍFICOS
-- =====================================================
-- Vendedor Principal
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
        '0123456789',
        'Angel',
        'Ayuquina',
        'ayuquinaangel4220@gmail.com',
        '0987654321',
        'Quito, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'vendedor',
        'activo',
        TRUE
    );

-- Comprador Principal
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
        '0123456788',
        'Israel',
        'Ayuquina',
        'ayuquinaangel123@gmail.com',
        '0987654322',
        'Quito, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'comprador',
        'activo',
        TRUE
    );

-- Moderador Principal
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
        '0123456787',
        'Diego',
        'Hallo',
        'diehalloman@gmail.com',
        '0987654323',
        'Guayaquil, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'moderador',
        'activo',
        TRUE
    );

-- Administrador Principal
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
        '0123456786',
        'Admin',
        'Sistema',
        'ingenieria664@gmail.com',
        '0987654324',
        'Cuenca, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'administrador',
        'activo',
        TRUE
    );

-- =====================================================
-- COMPRADORES ADICIONALES (3)
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
        '0123456785',
        'María',
        'González',
        'maria.gonzalez123@gmail.com',
        '0987654325',
        'Quito, Ecuador',
        'femenino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'comprador',
        'activo',
        TRUE
    );

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
        '0123456784',
        'Carlos',
        'Ramírez',
        'carlos.ramirez456@gmail.com',
        '0987654326',
        'Guayaquil, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'comprador',
        'activo',
        TRUE
    );

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
        '0123456783',
        'Sofía',
        'Morales',
        'sofia.morales789@gmail.com',
        '0987654327',
        'Cuenca, Ecuador',
        'femenino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'comprador',
        'activo',
        TRUE
    );

-- =====================================================
-- VENDEDORES ADICIONALES (3)
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
        '0123456782',
        'Luis',
        'Fernández',
        'luis.fernandez321@gmail.com',
        '0987654328',
        'Quito, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'vendedor',
        'activo',
        TRUE
    );

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
        '0123456781',
        'Ana',
        'Torres',
        'ana.torres654@gmail.com',
        '0987654329',
        'Guayaquil, Ecuador',
        'femenino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'vendedor',
        'activo',
        TRUE
    );

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
        '0123456780',
        'Roberto',
        'Vargas',
        'roberto.vargas987@gmail.com',
        '0987654330',
        'Cuenca, Ecuador',
        'masculino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'vendedor',
        'activo',
        TRUE
    );

-- =====================================================
-- MODERADOR ADICIONAL (1)
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
        '0123456779',
        'Patricia',
        'Mendoza',
        'patricia.mendoza111@gmail.com',
        '0987654331',
        'Quito, Ecuador',
        'femenino',
        '$2a$10$YiSMq4dF919h3du6RbZICercDHmgniYDT0LjbyjEyirYcKOL2QsgS',
        'moderador',
        'activo',
        TRUE
    );

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Mostrar resumen de usuarios creados por tipo
SELECT
    tipo_usuario,
    COUNT(*) as total,
    STRING_AGG(
        correo,
        ', '
        ORDER BY
            correo
    ) as correos
FROM
    usuarios
WHERE
    email_verificado = TRUE
GROUP BY
    tipo_usuario
ORDER BY
    CASE
        tipo_usuario
        WHEN 'administrador' THEN 1
        WHEN 'moderador' THEN 2
        WHEN 'vendedor' THEN 3
        WHEN 'comprador' THEN 4
    END;

-- Mostrar todos los usuarios creados
SELECT
    id,
    cedula,
    nombre,
    apellido,
    correo,
    tipo_usuario,
    estado,
    email_verificado
FROM
    usuarios
ORDER BY
    tipo_usuario,
    id;