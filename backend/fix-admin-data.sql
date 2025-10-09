-- Script para actualizar los datos del administrador
UPDATE usuarios 
SET 
  telefono = '8888-8888',
  direccion = 'San José, Costa Rica',
  genero = 'masculino'
WHERE correo = 'admin@sistemaventas.com';

-- Verificar que se actualizaron correctamente
SELECT id, cedula, nombre, apellido, correo, telefono, direccion, genero, 
       tipo_usuario, estado, email_verificado, fecha_registro, fecha_ultimo_acceso
FROM usuarios 
WHERE correo = 'admin@sistemaventas.com';
