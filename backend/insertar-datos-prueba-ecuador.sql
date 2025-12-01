-- =====================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA - ECUADOR
-- =====================================================
-- Este script inserta usuarios, productos y servicios de prueba
-- Todos los usuarios tienen la contraseña: Angel_4220
-- Hash: $2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO
-- =====================================================

-- Configurar encoding UTF-8
SET client_encoding = 'UTF8';

-- =====================================================
-- PASO 1: INSERTAR USUARIOS
-- =====================================================

-- Hash de contraseña para todos: Angel_4220
-- Hash: $2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO

-- Administrador
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('1000000001', 'Admin', 'Sistema', 'admin@sistemaventas.com', '0999999999', 'Quito, Pichincha, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'administrador', 'activo', TRUE);

-- Moderadores
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('1000000002', 'María', 'González', 'maria.moderador@sistemaventas.com', '0999999998', 'Guayaquil, Guayas, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'moderador', 'activo', TRUE),
('1000000003', 'Carlos', 'Rodríguez', 'carlos.moderador@sistemaventas.com', '0999999997', 'Cuenca, Azuay, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'moderador', 'activo', TRUE),
('1000000004', 'Javier', 'García', 'javier.moderador@sistemaventas.com', '0999999996', 'Ambato, Tungurahua, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'moderador', 'activo', TRUE);

-- Vendedores
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('1000000005', 'Ana', 'Martínez', 'ana.vendedor@sistemaventas.com', '0999999995', 'Quito, Pichincha, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'vendedor', 'activo', TRUE),
('1000000006', 'Luis', 'Hernández', 'luis.vendedor@sistemaventas.com', '0999999994', 'Guayaquil, Guayas, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'vendedor', 'activo', TRUE),
('1000000007', 'Carmen', 'López', 'carmen.vendedor@sistemaventas.com', '0999999993', 'Cuenca, Azuay, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'vendedor', 'activo', TRUE),
('1000000008', 'Roberto', 'Sánchez', 'roberto.vendedor@sistemaventas.com', '0999999992', 'Ambato, Tungurahua, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'vendedor', 'activo', TRUE),
('1000000009', 'Miguel', 'Lopez', 'miguel.vendedor@sistemaventas.com', '0999999991', 'Riobamba, Chimborazo, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'vendedor', 'activo', TRUE),
('1000000010', 'Patricia', 'Morales', 'patricia.vendedor@sistemaventas.com', '0999999990', 'Portoviejo, Manabí, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'vendedor', 'activo', TRUE);

-- Compradores
INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, estado, email_verificado) VALUES
('1000000011', 'Sofia', 'Ramírez', 'sofia.comprador@sistemaventas.com', '0999999989', 'Quito, Pichincha, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'comprador', 'activo', TRUE),
('1000000012', 'Diego', 'Castro', 'diego.comprador@sistemaventas.com', '0999999988', 'Guayaquil, Guayas, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'comprador', 'activo', TRUE),
('1000000013', 'Valeria', 'Morales', 'valeria.comprador@sistemaventas.com', '0999999987', 'Cuenca, Azuay, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'comprador', 'activo', TRUE),
('1000000014', 'Andrés', 'Vargas', 'andres.comprador@sistemaventas.com', '0999999986', 'Ambato, Tungurahua, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'comprador', 'activo', TRUE),
('1000000015', 'Camila', 'Torres', 'camila.comprador@sistemaventas.com', '0999999985', 'Riobamba, Chimborazo, Ecuador', 'femenino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'comprador', 'activo', TRUE),
('1000000016', 'Sebastián', 'Jiménez', 'sebastian.comprador@sistemaventas.com', '0999999984', 'Portoviejo, Manabí, Ecuador', 'masculino', '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO', 'comprador', 'activo', TRUE);

SELECT '✓ Usuarios insertados' as mensaje;

-- =====================================================
-- PASO 2: OBTENER IDs DE CATEGORÍAS Y UBICACIONES
-- =====================================================
-- Nota: Asumimos que las categorías ya existen. Si no, se deben insertar primero.
-- Las ubicaciones de Ecuador también deben existir.

-- Obtener IDs de categorías (asumiendo que existen)
-- Si no existen, se deben insertar primero usando el script de categorías

-- =====================================================
-- PASO 3: INSERTAR PRODUCTOS
-- =====================================================

-- Productos Electrónicos (asumiendo categoría_id = 1 para "Electrónicos" o "Smartphones y Accesorios")
-- Nota: Ajusta los categoria_id según las categorías que tengas en tu BD

-- Producto 1: Celular
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-001', 
    'Celular tecno 18p', 
    'Celular nuevo de paquete, funciona todo correcto. Incluye cargador original y funda protectora. Pantalla de 6.5 pulgadas, 128GB de almacenamiento.',
    158.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Tungurahua' AND canton = 'Ambato' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Smartphones%' OR nombre LIKE '%Electrónicos%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'miguel.vendedor@sistemaventas.com'),
    'pendiente_revision',
    TRUE,
    'Tungurahua',
    'Ambato',
    'Ambato',
    'Av. Cevallos y Olmedo',
    CURRENT_TIMESTAMP
);

-- Producto 2: Laptop
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-002', 
    'Laptop HP Pavilion', 
    'Laptop HP Pavilion 15.6 pulgadas, Intel Core i5, 8GB RAM, 512GB SSD. Excelente estado, poco uso. Incluye cargador original.',
    450.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Pichincha' AND canton = 'Quito' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Computadoras%' OR nombre LIKE '%Electrónicos%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'ana.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Pichincha',
    'Quito',
    'Centro Histórico',
    'Av. Amazonas y Naciones Unidas',
    CURRENT_TIMESTAMP
);

-- Producto 3: Tablet
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-003', 
    'Tablet Samsung Galaxy Tab', 
    'Tablet Samsung Galaxy Tab A8, 10.5 pulgadas, 64GB, WiFi. Perfecta para trabajo y entretenimiento. Incluye funda y stylus.',
    280.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Guayas' AND canton = 'Guayaquil' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Tablets%' OR nombre LIKE '%Electrónicos%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'luis.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Guayas',
    'Guayaquil',
    'Centro',
    'Av. 9 de Octubre y Malecón',
    CURRENT_TIMESTAMP
);

-- Producto 4: Mueble
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-004', 
    'Sofá de 3 plazas', 
    'Sofá moderno de 3 plazas, color gris, tela resistente. Excelente estado, solo 6 meses de uso. Perfecto para sala de estar.',
    320.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Azuay' AND canton = 'Cuenca' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Muebles%' OR nombre LIKE '%Hogar%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'carmen.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Azuay',
    'Cuenca',
    'Centro',
    'Calle Larga y Gran Colombia',
    CURRENT_TIMESTAMP
);

-- Producto 5: Refrigeradora
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-005', 
    'Refrigeradora Samsung', 
    'Refrigeradora Samsung 2 puertas, 300L, color plateado, tecnología No Frost. Excelente estado, 2 años de uso. Incluye garantía.',
    580.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Tungurahua' AND canton = 'Ambato' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Electrodomésticos%' OR nombre LIKE '%Hogar%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'roberto.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Tungurahua',
    'Ambato',
    'Ficoa',
    'Av. Cevallos y 12 de Noviembre',
    CURRENT_TIMESTAMP
);

-- Producto 6: Bicicleta
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-006', 
    'Bicicleta de montaña', 
    'Bicicleta de montaña Trek, 21 velocidades, suspensión delantera, frenos de disco. Perfecta para ciclismo de montaña. Incluye casco y candado.',
    420.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Pichincha' AND canton = 'Quito' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Deportes%' OR nombre LIKE '%Ciclismo%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'ana.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Pichincha',
    'Quito',
    'La Mariscal',
    'Av. Amazonas y Colón',
    CURRENT_TIMESTAMP
);

-- Producto 7: Zapatos
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-007', 
    'Zapatos deportivos Nike', 
    'Zapatos deportivos Nike Air Max, talla 42, color blanco y negro. Nuevos, sin usar. Perfectos para correr o entrenar.',
    95.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Guayas' AND canton = 'Guayaquil' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Calzado%' OR nombre LIKE '%Deportes%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'luis.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Guayas',
    'Guayaquil',
    'Samborondón',
    'Av. Samborondón y Vía a la Costa',
    CURRENT_TIMESTAMP
);

-- Producto 8: Libro
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-008', 
    'Libro de Programación', 
    'Clean Code: A Handbook of Agile Software Craftsmanship - Robert C. Martin. Libro en excelente estado, tapa dura, edición en español.',
    35.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Azuay' AND canton = 'Cuenca' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Libros%' OR nombre LIKE '%Educación%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'carmen.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Azuay',
    'Cuenca',
    'El Vecino',
    'Calle Larga y Benigno Malo',
    CURRENT_TIMESTAMP
);

-- Producto 9: Cámara
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-009', 
    'Cámara Canon EOS', 
    'Cámara Canon EOS Rebel T7, 24.1 MP, con lente 18-55mm. Perfecta para fotografía amateur. Incluye tarjeta SD, bolso y manual.',
    650.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Pichincha' AND canton = 'Quito' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Fotografía%' OR nombre LIKE '%Electrónicos%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'patricia.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Pichincha',
    'Quito',
    'Cumbayá',
    'Av. Simón Bolívar y Av. Interoceánica',
    CURRENT_TIMESTAMP
);

-- Producto 10: Mueble de oficina
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'PROD-010', 
    'Escritorio de oficina', 
    'Escritorio de oficina moderno, madera de pino, 120cm x 60cm. Incluye cajonera y estante superior. Perfecto para home office.',
    180.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Manabí' AND canton = 'Portoviejo' LIMIT 1),
    'producto',
    (SELECT id FROM categorias WHERE nombre LIKE '%Muebles%' OR nombre LIKE '%Hogar%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'patricia.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Manabí',
    'Portoviejo',
    'Portoviejo',
    'Av. Circunvalación y Av. 5 de Junio',
    CURRENT_TIMESTAMP
);

SELECT '✓ Productos insertados' as mensaje;

-- =====================================================
-- PASO 4: INSERTAR SERVICIOS
-- =====================================================

-- Servicio 1: Servicio de limpieza
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'SERV-001', 
    'Servicio de limpieza', 
    'Servicio de limpieza a domicilio. Personal altamente calificado, directo hasta donde te encuentres, disponibilidad inmediata. Incluye limpieza profunda, desinfección y organización.',
    60.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Tungurahua' AND canton = 'Ambato' LIMIT 1),
    'servicio',
    (SELECT id FROM categorias WHERE nombre LIKE '%Servicios%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'miguel.vendedor@sistemaventas.com'),
    'rechazado',
    TRUE,
    'Tungurahua',
    'Ambato',
    'Ambato',
    'Servicio a domicilio en toda la ciudad',
    CURRENT_TIMESTAMP
);

-- Servicio 2: Clases de guitarra
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'SERV-002', 
    'Clases de guitarra', 
    'Clases particulares de guitarra acústica y eléctrica. Para todos los niveles, desde principiantes hasta avanzados. Incluye material didáctico y técnicas de interpretación.',
    25.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Pichincha' AND canton = 'Quito' LIMIT 1),
    'servicio',
    (SELECT id FROM categorias WHERE nombre LIKE '%Servicios%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'ana.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Pichincha',
    'Quito',
    'La Mariscal',
    'Clases a domicilio o en estudio',
    CURRENT_TIMESTAMP
);

-- Servicio 3: Reparación de computadoras
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'SERV-003', 
    'Reparación de computadoras', 
    'Servicio técnico profesional para computadoras y laptops. Reparación de hardware, instalación de software, eliminación de virus, actualización de sistema. Garantía en todas las reparaciones.',
    40.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Guayas' AND canton = 'Guayaquil' LIMIT 1),
    'servicio',
    (SELECT id FROM categorias WHERE nombre LIKE '%Servicios Técnicos%' OR nombre LIKE '%Servicios%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'luis.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Guayas',
    'Guayaquil',
    'Centro',
    'Servicio a domicilio o en taller',
    CURRENT_TIMESTAMP
);

-- Servicio 4: Clases de inglés
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'SERV-004', 
    'Clases de inglés', 
    'Clases particulares de inglés conversacional. Profesor certificado, metodología práctica. Preparación para exámenes internacionales. Clases individuales o grupales.',
    30.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Azuay' AND canton = 'Cuenca' LIMIT 1),
    'servicio',
    (SELECT id FROM categorias WHERE nombre LIKE '%Servicios%' OR nombre LIKE '%Educación%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'carmen.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Azuay',
    'Cuenca',
    'Centro',
    'Clases presenciales o virtuales',
    CURRENT_TIMESTAMP
);

-- Servicio 5: Diseño gráfico
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'SERV-005', 
    'Diseño gráfico profesional', 
    'Servicio de diseño gráfico para logos, flyers, tarjetas de presentación, redes sociales. Diseños modernos y creativos. Incluye revisiones ilimitadas hasta quedar satisfecho.',
    80.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Pichincha' AND canton = 'Quito' LIMIT 1),
    'servicio',
    (SELECT id FROM categorias WHERE nombre LIKE '%Servicios de Diseño%' OR nombre LIKE '%Servicios%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'roberto.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Pichincha',
    'Quito',
    'La Carolina',
    'Trabajo remoto o presencial',
    CURRENT_TIMESTAMP
);

-- Servicio 6: Fotografía de eventos
INSERT INTO items (
    codigo, nombre, descripcion, precio, 
    ubicacion_id, tipo, categoria_id, vendedor_id, 
    estado, disponibilidad,
    ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
    fecha_publicacion
) VALUES (
    'SERV-006', 
    'Fotografía de eventos', 
    'Servicio profesional de fotografía para eventos: bodas, quinceañeras, cumpleaños, corporativos. Incluye edición profesional, álbum digital y entrega rápida.',
    150.00,
    (SELECT id FROM ubicaciones WHERE provincia = 'Guayas' AND canton = 'Guayaquil' LIMIT 1),
    'servicio',
    (SELECT id FROM categorias WHERE nombre LIKE '%Servicios de Entretenimiento%' OR nombre LIKE '%Servicios%' LIMIT 1),
    (SELECT id FROM usuarios WHERE correo = 'patricia.vendedor@sistemaventas.com'),
    'activo',
    TRUE,
    'Guayas',
    'Guayaquil',
    'Urdesa',
    'Cobertura en toda la ciudad',
    CURRENT_TIMESTAMP
);

SELECT '✓ Servicios insertados' as mensaje;

-- =====================================================
-- PASO 5: INSERTAR DATOS ESPECÍFICOS DE SERVICIOS
-- =====================================================

-- Servicio de limpieza
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
((SELECT id FROM items WHERE codigo = 'SERV-001'), '7:00 AM - 6:00 PM', 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado', '2-4 horas según el tamaño del lugar');

-- Clases de guitarra
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
((SELECT id FROM items WHERE codigo = 'SERV-002'), '9:00 AM - 8:00 PM', 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado', '1 hora por clase');

-- Reparación de computadoras
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
((SELECT id FROM items WHERE codigo = 'SERV-003'), '8:00 AM - 7:00 PM', 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado', '1-3 horas según la complejidad');

-- Clases de inglés
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
((SELECT id FROM items WHERE codigo = 'SERV-004'), '2:00 PM - 8:00 PM', 'Martes,Jueves,Sábado', '1 hora por clase');

-- Diseño gráfico
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
((SELECT id FROM items WHERE codigo = 'SERV-005'), '9:00 AM - 6:00 PM', 'Lunes,Martes,Miércoles,Jueves,Viernes', '2-5 días según la complejidad del proyecto');

-- Fotografía de eventos
INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
((SELECT id FROM items WHERE codigo = 'SERV-006'), 'Flexible según el evento', 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo', '4-8 horas según el tipo de evento');

SELECT '✓ Datos específicos de servicios insertados' as mensaje;

-- =====================================================
-- PASO 6: INSERTAR IMÁGENES DE PRODUCTOS
-- =====================================================

-- Imágenes para productos (usando URLs de ejemplo - reemplazar con URLs reales)
-- Nota: Ajusta las URLs según tus imágenes reales

-- Imágenes para PROD-001 (Celular)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-001'), 'https://via.placeholder.com/800x600?text=Celular+Tecno+18p', 1, TRUE),
((SELECT id FROM items WHERE codigo = 'PROD-001'), 'https://via.placeholder.com/800x600?text=Celular+2', 2, FALSE),
((SELECT id FROM items WHERE codigo = 'PROD-001'), 'https://via.placeholder.com/800x600?text=Celular+3', 3, FALSE);

-- Imágenes para PROD-002 (Laptop)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-002'), 'https://via.placeholder.com/800x600?text=Laptop+HP', 1, TRUE),
((SELECT id FROM items WHERE codigo = 'PROD-002'), 'https://via.placeholder.com/800x600?text=Laptop+2', 2, FALSE);

-- Imágenes para PROD-003 (Tablet)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-003'), 'https://via.placeholder.com/800x600?text=Tablet+Samsung', 1, TRUE);

-- Imágenes para PROD-004 (Sofá)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-004'), 'https://via.placeholder.com/800x600?text=Sofa+3+plazas', 1, TRUE),
((SELECT id FROM items WHERE codigo = 'PROD-004'), 'https://via.placeholder.com/800x600?text=Sofa+2', 2, FALSE);

-- Imágenes para PROD-005 (Refrigeradora)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-005'), 'https://via.placeholder.com/800x600?text=Refrigeradora', 1, TRUE);

-- Imágenes para PROD-006 (Bicicleta)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-006'), 'https://via.placeholder.com/800x600?text=Bicicleta', 1, TRUE),
((SELECT id FROM items WHERE codigo = 'PROD-006'), 'https://via.placeholder.com/800x600?text=Bicicleta+2', 2, FALSE);

-- Imágenes para PROD-007 (Zapatos)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-007'), 'https://via.placeholder.com/800x600?text=Zapatos+Nike', 1, TRUE);

-- Imágenes para PROD-008 (Libro)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-008'), 'https://via.placeholder.com/800x600?text=Libro', 1, TRUE);

-- Imágenes para PROD-009 (Cámara)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-009'), 'https://via.placeholder.com/800x600?text=Camara+Canon', 1, TRUE),
((SELECT id FROM items WHERE codigo = 'PROD-009'), 'https://via.placeholder.com/800x600?text=Camara+2', 2, FALSE),
((SELECT id FROM items WHERE codigo = 'PROD-009'), 'https://via.placeholder.com/800x600?text=Camara+3', 3, FALSE);

-- Imágenes para PROD-010 (Escritorio)
INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
((SELECT id FROM items WHERE codigo = 'PROD-010'), 'https://via.placeholder.com/800x600?text=Escritorio', 1, TRUE);

SELECT '✓ Imágenes de productos insertadas' as mensaje;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT '========================================' as mensaje;
SELECT 'INSERCIÓN DE DATOS COMPLETADA' as mensaje;
SELECT '========================================' as mensaje;

-- Mostrar resumen de datos insertados
SELECT 'RESUMEN DE DATOS INSERTADOS:' as mensaje;
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'productos', COUNT(*) FROM items WHERE tipo = 'producto'
UNION ALL
SELECT 'servicios', COUNT(*) FROM items WHERE tipo = 'servicio'
UNION ALL
SELECT 'imágenes', COUNT(*) FROM item_imagenes
UNION ALL
SELECT 'servicios_detalle', COUNT(*) FROM servicios;

-- Mostrar usuarios por tipo
SELECT 'USUARIOS POR TIPO:' as mensaje;
SELECT tipo_usuario, COUNT(*) as total 
FROM usuarios 
GROUP BY tipo_usuario
ORDER BY tipo_usuario;

-- Mostrar productos por estado
SELECT 'PRODUCTOS POR ESTADO:' as mensaje;
SELECT estado, COUNT(*) as total 
FROM items 
GROUP BY estado
ORDER BY estado;

-- Mostrar productos por ubicación
SELECT 'PRODUCTOS POR PROVINCIA:' as mensaje;
SELECT ubicacion_provincia, COUNT(*) as total 
FROM items 
WHERE ubicacion_provincia IS NOT NULL
GROUP BY ubicacion_provincia
ORDER BY total DESC;

SELECT '========================================' as mensaje;
SELECT '¡DATOS INSERTADOS EXITOSAMENTE!' as mensaje;
SELECT 'Contraseña para todos los usuarios: Angel_4220' as mensaje;
SELECT '========================================' as mensaje;

