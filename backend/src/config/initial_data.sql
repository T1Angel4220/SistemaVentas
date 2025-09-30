-- =====================================================
-- DATOS INICIALES PARA EL SISTEMA DE VENTAS MULTIEMPRESA
-- =====================================================
-- Este archivo contiene datos iniciales para categorías, ubicaciones
-- y usuarios de prueba para el sistema

-- Usar la base de datos
\c sistema_ventas_multiempresa;

-- =====================================================
-- DATOS INICIALES DE CATEGORÍAS
-- =====================================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónicos', 'Dispositivos electrónicos, computadoras, teléfonos, etc.'),
('Hogar y Jardín', 'Artículos para el hogar, muebles, decoración, jardín'),
('Ropa y Accesorios', 'Vestimenta, calzado, accesorios de moda'),
('Deportes y Recreación', 'Equipos deportivos, actividades al aire libre'),
('Libros y Educación', 'Libros, material educativo, cursos'),
('Automotriz', 'Vehículos, repuestos, accesorios para autos'),
('Salud y Belleza', 'Productos de salud, cosméticos, cuidado personal'),
('Mascotas', 'Alimentos, accesorios y productos para mascotas'),
('Servicios', 'Servicios profesionales y personales'),
('Otros', 'Categoría general para productos diversos');

-- =====================================================
-- DATOS INICIALES DE UBICACIONES
-- =====================================================

INSERT INTO ubicaciones (nombre, provincia, canton, distrito) VALUES
('San José Centro', 'San José', 'San José', 'Carmen'),
('Escazú', 'San José', 'Escazú', 'Escazú'),
('Santa Ana', 'San José', 'Santa Ana', 'Santa Ana'),
('Cartago Centro', 'Cartago', 'Cartago', 'Oriental'),
('Alajuela Centro', 'Alajuela', 'Alajuela', 'Alajuela'),
('Heredia Centro', 'Heredia', 'Heredia', 'Heredia'),
('Puntarenas Centro', 'Puntarenas', 'Puntarenas', 'Puntarenas'),
('Limón Centro', 'Limón', 'Limón', 'Limón'),
('Guanacaste', 'Guanacaste', 'Liberia', 'Liberia'),
('Desamparados', 'San José', 'Desamparados', 'Desamparados');

-- =====================================================
-- USUARIOS DE PRUEBA PARA TESTING
-- =====================================================

-- Administrador del sistema
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('123456789', 'Admin', 'Sistema', 'admin@sistemaventas.com', '8888-8888', 'San José, Costa Rica', 'masculino', '$2b$10$l.OGwPCLxG2illHVG02npOLO1MbgqxfqT0YZ4Jj9qYMorUylK7uv6', 'administrador', 'activo',TRUE);

INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('123456789', 'Admin', 'Sistema', 'admin@sistemaventas.com', '8888-8888', 'San José, Costa Rica', 'masculino', '$2b$10$7VZ0SqSl4GbpgcnWaiTaXOv8SGZZMc5M/JkWP8i6fwnkPVK.dz1vy', 'administrador', 'activo', TRUE);


-- Moderadores
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('234567890', 'María', 'González', 'maria.moderador@sistemaventas.com', '8888-8889', 'Escazú, Costa Rica', 'femenino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'moderador', 'activo', TRUE),
('345678901', 'Carlos', 'Rodríguez', 'carlos.moderador@sistemaventas.com', '8888-8890', 'Cartago, Costa Rica', 'masculino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'moderador', 'activo', TRUE);

-- Vendedores
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('456789012', 'Ana', 'Martínez', 'ana.vendedor@sistemaventas.com', '8888-8891', 'Santa Ana, Costa Rica', 'femenino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'vendedor', 'activo', TRUE),
('567890123', 'Luis', 'Hernández', 'luis.vendedor@sistemaventas.com', '8888-8892', 'Alajuela, Costa Rica', 'masculino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'vendedor', 'activo', TRUE),
('678901234', 'Carmen', 'López', 'carmen.vendedor@sistemaventas.com', '8888-8893', 'Heredia, Costa Rica', 'femenino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'vendedor', 'activo', TRUE),
('789012345', 'Roberto', 'Sánchez', 'roberto.vendedor@sistemaventas.com', '8888-8894', 'Puntarenas, Costa Rica', 'masculino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'vendedor', 'activo', TRUE);

-- Compradores
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('890123456', 'Sofia', 'Ramírez', 'sofia.comprador@sistemaventas.com', '8888-8895', 'San José, Costa Rica', 'femenino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'comprador', 'activo', TRUE),
('901234567', 'Diego', 'Castro', 'diego.comprador@sistemaventas.com', '8888-8896', 'Cartago, Costa Rica', 'masculino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'comprador', 'activo', TRUE),
('012345678', 'Valeria', 'Morales', 'valeria.comprador@sistemaventas.com', '8888-8897', 'Alajuela, Costa Rica', 'femenino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'comprador', 'activo', TRUE),
('123450987', 'Andrés', 'Vargas', 'andres.comprador@sistemaventas.com', '8888-8898', 'Heredia, Costa Rica', 'masculino', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'comprador', 'activo', TRUE);

-- =====================================================
-- PRODUCTOS DE PRUEBA
-- =====================================================

-- Productos electrónicos
INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
('ELEC001', 'iPhone 13 Pro Max', 'iPhone 13 Pro Max 256GB en excelente estado, incluye cargador y funda protectora', 850000.00, 1, 'producto', 1, 4, 'activo'),
('ELEC002', 'MacBook Air M1', 'MacBook Air con chip M1, 8GB RAM, 256GB SSD, prácticamente nueva', 1200000.00, 2, 'producto', 1, 4, 'activo'),
('ELEC003', 'Samsung Galaxy S21', 'Samsung Galaxy S21 128GB, color negro, con accesorios originales', 450000.00, 1, 'producto', 1, 5, 'activo'),
('ELEC004', 'iPad Pro 11"', 'iPad Pro 11 pulgadas, 128GB, WiFi, incluye Apple Pencil', 650000.00, 3, 'producto', 1, 5, 'activo');

-- Productos del hogar
INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
('HOG001', 'Sofá de 3 plazas', 'Sofá moderno de 3 plazas, color gris, excelente estado', 180000.00, 1, 'producto', 2, 6, 'activo'),
('HOG002', 'Mesa de comedor', 'Mesa de comedor para 6 personas, madera de teca', 120000.00, 2, 'producto', 2, 6, 'activo'),
('HOG003', 'Refrigeradora Samsung', 'Refrigeradora Samsung 2 puertas, 300L, color plateado', 350000.00, 4, 'producto', 2, 7, 'activo');

-- Productos de ropa
INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
('ROP001', 'Vestido de noche', 'Vestido elegante de noche, talla M, color negro', 45000.00, 1, 'producto', 3, 6, 'activo'),
('ROP002', 'Traje de hombre', 'Traje formal para hombre, talla 40, color azul marino', 80000.00, 2, 'producto', 3, 5, 'activo'),
('ROP003', 'Zapatos deportivos Nike', 'Zapatos deportivos Nike Air Max, talla 42, color blanco', 65000.00, 3, 'producto', 3, 7, 'activo');

-- Productos deportivos
INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
('DEP001', 'Bicicleta de montaña', 'Bicicleta de montaña Trek, 21 velocidades, excelente estado', 180000.00, 5, 'producto', 4, 4, 'activo'),
('DEP002', 'Set de pesas', 'Set completo de pesas para gimnasio casero, hasta 50kg', 95000.00, 1, 'producto', 4, 5, 'activo'),
('DEP003', 'Raqueta de tenis', 'Raqueta de tenis Wilson Pro Staff, incluye cordaje', 120000.00, 2, 'producto', 4, 6, 'activo');

-- Productos de libros
INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
('LIB001', 'Libro de Programación', 'Clean Code: A Handbook of Agile Software Craftsmanship', 25000.00, 1, 'producto', 5, 7, 'activo'),
('LIB002', 'Novela clásica', 'Cien años de soledad - Gabriel García Márquez', 15000.00, 3, 'producto', 5, 4, 'activo'),
('LIB003', 'Libro de cocina', 'Recetas tradicionales costarricenses', 20000.00, 4, 'producto', 5, 5, 'activo');

-- =====================================================
-- SERVICIOS DE PRUEBA
-- =====================================================

-- Servicios profesionales
INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
('SER001', 'Clases de guitarra', 'Clases particulares de guitarra acústica y eléctrica', 15000.00, 1, 'servicio', 9, 4, 'activo'),
('SER002', 'Servicio de limpieza', 'Servicio de limpieza residencial y comercial', 25000.00, 2, 'servicio', 9, 5, 'activo'),
('SER003', 'Reparación de computadoras', 'Servicio técnico para computadoras y laptops', 20000.00, 3, 'servicio', 9, 6, 'activo'),
('SER004', 'Clases de inglés', 'Clases particulares de inglés conversacional', 18000.00, 4, 'servicio', 9, 7, 'activo');

-- Insertar datos específicos de servicios
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
(13, '8:00 AM - 6:00 PM', 'Lunes a Viernes', '1 hora por clase'),
(14, '7:00 AM - 5:00 PM', 'Lunes a Sábado', '2-4 horas'),
(15, '9:00 AM - 7:00 PM', 'Lunes a Viernes', '1-3 horas'),
(16, '2:00 PM - 8:00 PM', 'Martes y Jueves', '1 hora por clase');

-- =====================================================
-- IMÁGENES DE PRUEBA PARA PRODUCTOS
-- =====================================================

-- Imágenes para iPhone
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
(1, 'https://example.com/images/iphone13_1.jpg', 1, TRUE),
(1, 'https://example.com/images/iphone13_2.jpg', 2, FALSE),
(1, 'https://example.com/images/iphone13_3.jpg', 3, FALSE);

-- Imágenes para MacBook
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
(2, 'https://example.com/images/macbook_1.jpg', 1, TRUE),
(2, 'https://example.com/images/macbook_2.jpg', 2, FALSE);

-- Imágenes para Samsung Galaxy
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
(3, 'https://example.com/images/galaxy_1.jpg', 1, TRUE),
(3, 'https://example.com/images/galaxy_2.jpg', 2, FALSE),
(3, 'https://example.com/images/galaxy_3.jpg', 3, FALSE);

-- =====================================================
-- REPORTES DE PRUEBA
-- =====================================================

-- Reporte pendiente
INSERT INTO reportes (item_id, usuario_reportador_id, tipo_reporte, descripcion, comentario_opcional, estado) VALUES
(1, 8, 'informacion_falsa', 'El precio parece demasiado bajo para un iPhone 13 Pro Max', 'Debería verificar si es original', 'pendiente');

-- Reporte en revisión
INSERT INTO reportes (item_id, usuario_reportador_id, tipo_reporte, descripcion, estado, moderador_asignado_id) VALUES
(2, 9, 'contenido_inapropiado', 'La descripción contiene información engañosa', 'en_revision', 2);

-- Reporte resuelto
INSERT INTO reportes (item_id, usuario_reportador_id, tipo_reporte, descripcion, estado, moderador_asignado_id, moderador_resolutor_id, decision_final, fecha_resolucion) VALUES
(3, 10, 'producto_prohibido', 'Sospecho que el teléfono podría ser robado', 'resuelto', 2, 2, 'Producto verificado como legítimo, reporte rechazado', '2024-01-15 10:30:00');

-- =====================================================
-- PRODUCTOS GUARDADOS (FAVORITOS)
-- =====================================================

INSERT INTO productos_guardados (usuario_id, item_id) VALUES
(8, 1),  -- Sofia guarda iPhone
(8, 2),  -- Sofia guarda MacBook
(9, 3),  -- Diego guarda Samsung Galaxy
(10, 4), -- Valeria guarda iPad
(11, 5), -- Andrés guarda Sofá
(8, 6);  -- Sofia guarda Mesa

-- =====================================================
-- CHATS DE PRUEBA
-- =====================================================

INSERT INTO chats (comprador_id, vendedor_id, item_id, estado) VALUES
(8, 4, 1, 'activo'),   -- Sofia chatea con Ana sobre iPhone
(9, 5, 3, 'activo'),   -- Diego chatea con Luis sobre Samsung Galaxy
(10, 4, 2, 'activo');  -- Valeria chatea con Ana sobre MacBook

-- Mensajes de chat
INSERT INTO mensajes_chat (chat_id, remitente_id, mensaje, leido) VALUES
(1, 8, 'Hola, ¿el iPhone está disponible?', TRUE),
(1, 4, 'Hola! Sí, está disponible. ¿Te interesa?', TRUE),
(1, 8, 'Sí, ¿podrías hacer un descuento?', FALSE),
(2, 9, '¿El Samsung Galaxy es original?', TRUE),
(2, 5, 'Sí, es completamente original con garantía', TRUE),
(3, 10, '¿La MacBook tiene algún detalle?', TRUE),
(3, 4, 'No, está prácticamente nueva, solo tiene 3 meses de uso', FALSE);

-- =====================================================
-- VALORACIONES DE PRUEBA
-- =====================================================

INSERT INTO valoraciones (evaluador_id, evaluado_id, item_id, chat_id, calificacion, comentario) VALUES
(8, 4, 1, 1, 5, 'Excelente vendedora, muy atenta y el producto está perfecto'),
(9, 5, 3, 2, 4, 'Buen vendedor, producto como se describe'),
(10, 4, 2, 3, 5, 'Muy profesional, recomiendo totalmente');

-- =====================================================
-- ACCIONES DE MODERACIÓN DE PRUEBA
-- =====================================================

INSERT INTO acciones_moderacion (moderador_id, accion, tabla_afectada, registro_id, detalles) VALUES
(2, 'asignacion_reporte', 'reportes', 1, 'Reporte asignado para revisión'),
(2, 'resolucion_reporte', 'reportes', 3, 'Reporte resuelto: producto verificado como legítimo'),
(3, 'revision_producto', 'items', 1, 'Producto revisado y aprobado');

-- =====================================================
-- PRODUCTOS PELIGROSOS DE PRUEBA (Para testing de moderación)
-- =====================================================

INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado, es_peligroso, fecha_deteccion_peligroso) VALUES
('PEL001', 'Producto Prohibido Test', 'Este es un producto de prueba marcado como peligroso', 100000.00, 1, 'producto', 10, 4, 'peligroso', TRUE, '2024-01-10 15:30:00'),
('PEL002', 'Servicio Inapropiado Test', 'Servicio de prueba marcado como inapropiado', 50000.00, 2, 'servicio', 9, 5, 'peligroso', TRUE, '2024-01-12 09:15:00');

-- =====================================================
-- APELACIONES DE PRUEBA
-- =====================================================

INSERT INTO apelaciones (reporte_id, item_id, usuario_apelante_id, motivo_apelacion, informacion_adicional, estado) VALUES
(2, 2, 4, 'El producto no tiene información engañosa', 'Puedo proporcionar documentación adicional que respalde la descripción', 'en_apelacion');

-- =====================================================
-- SESIONES DE USUARIO DE PRUEBA
-- =====================================================

INSERT INTO sesiones_usuario (usuario_id, token_sesion, fecha_expiracion, ip_address, user_agent) VALUES
(1, 'admin_token_12345', '2024-12-31 23:59:59', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'moderador_token_67890', '2024-12-31 23:59:59', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(4, 'vendedor_token_11111', '2024-12-31 23:59:59', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(8, 'comprador_token_22222', '2024-12-31 23:59:59', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Verificar que los datos se insertaron correctamente
SELECT 'Datos iniciales insertados correctamente' as status;

-- Mostrar resumen de datos insertados
SELECT 
    'Usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Ubicaciones', COUNT(*) FROM ubicaciones
UNION ALL
SELECT 'Productos/Servicios', COUNT(*) FROM items
UNION ALL
SELECT 'Imágenes', COUNT(*) FROM item_imagenes
UNION ALL
SELECT 'Reportes', COUNT(*) FROM reportes
UNION ALL
SELECT 'Chats', COUNT(*) FROM chats
UNION ALL
SELECT 'Valoraciones', COUNT(*) FROM valoraciones;
