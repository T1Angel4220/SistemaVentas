-- Script SQL para crear usuarios de prueba E2E
-- Estos usuarios deben coincidir exactamente con las variables en frontend/.env
-- Contraseña para todos: password123
-- Hash bcrypt: $2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C

-- NOTA: Si usas PostgreSQL, ajusta la sintaxis según sea necesario
-- Este script usa sintaxis compatible con PostgreSQL

-- Usuario Comprador
-- Primero eliminar si existe
DELETE FROM usuarios WHERE correo = 'comprador@test.com';

INSERT INTO usuarios (
  cedula, nombre, apellido, correo, telefono, direccion, genero,
  password_hash, tipo_usuario, estado, email_verificado, token_verificacion,
  fecha_registro, fecha_creacion, fecha_actualizacion
) VALUES (
  '1000000001',
  'Test',
  'Comprador',
  'comprador@test.com',
  '0999000001',
  'Dirección de Prueba',
  'masculino',
  '$2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C',
  'comprador',
  'activo',
  true,
  NULL,
  NOW(),
  NOW(),
  NOW()
);

-- Usuario Vendedor
DELETE FROM usuarios WHERE correo = 'vendedor@test.com';

INSERT INTO usuarios (
  cedula, nombre, apellido, correo, telefono, direccion, genero,
  password_hash, tipo_usuario, estado, email_verificado, token_verificacion,
  fecha_registro, fecha_creacion, fecha_actualizacion
) VALUES (
  '1000000002',
  'Test',
  'Vendedor',
  'vendedor@test.com',
  '0999000002',
  'Dirección de Prueba',
  'masculino',
  '$2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C',
  'vendedor',
  'activo',
  true,
  NULL,
  NOW(),
  NOW(),
  NOW()
);

-- Usuario Moderador
DELETE FROM usuarios WHERE correo = 'moderador@test.com';

INSERT INTO usuarios (
  cedula, nombre, apellido, correo, telefono, direccion, genero,
  password_hash, tipo_usuario, estado, email_verificado, token_verificacion,
  fecha_registro, fecha_creacion, fecha_actualizacion
) VALUES (
  '1000000003',
  'Test',
  'Moderador',
  'moderador@test.com',
  '0999000003',
  'Dirección de Prueba',
  'masculino',
  '$2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C',
  'moderador',
  'activo',
  true,
  NULL,
  NOW(),
  NOW(),
  NOW()
);

-- Usuario Administrador
DELETE FROM usuarios WHERE correo = 'admin@test.com';

INSERT INTO usuarios (
  cedula, nombre, apellido, correo, telefono, direccion, genero,
  password_hash, tipo_usuario, estado, email_verificado, token_verificacion,
  fecha_registro, fecha_creacion, fecha_actualizacion
) VALUES (
  '1000000004',
  'Test',
  'Admin',
  'admin@test.com',
  '0999000004',
  'Dirección de Prueba',
  'masculino',
  '$2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C',
  'administrador',
  'activo',
  true,
  NULL,
  NOW(),
  NOW(),
  NOW()
);

-- Usuario Suspendido (para tests de suspensión)
DELETE FROM usuarios WHERE correo = 'suspended@test.com';

INSERT INTO usuarios (
  cedula, nombre, apellido, correo, telefono, direccion, genero,
  password_hash, tipo_usuario, estado, email_verificado, token_verificacion,
  fecha_registro, fecha_creacion, fecha_actualizacion
) VALUES (
  '1000000005',
  'Test',
  'Suspendido',
  'suspended@test.com',
  '0999000005',
  'Dirección de Prueba',
  'masculino',
  '$2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C',
  'comprador',
  'suspendido',
  true,
  NULL,
  NOW(),
  NOW(),
  NOW()
);

-- Verificar usuarios creados
SELECT 
  id, 
  cedula, 
  nombre, 
  apellido, 
  correo, 
  tipo_usuario, 
  estado, 
  email_verificado 
FROM usuarios 
WHERE correo IN (
  'comprador@test.com',
  'vendedor@test.com',
  'moderador@test.com',
  'admin@test.com',
  'suspended@test.com'
)
ORDER BY correo;

