-- Categorías inspiradas en Amazon para el sistema de ventas
-- Insertar categorías principales y subcategorías
-- Categorías principales
INSERT INTO
    categorias (nombre, descripcion, activa)
VALUES
    -- Electrónicos y Tecnología
    (
        'Electrónicos',
        'Dispositivos electrónicos, computadoras, smartphones y accesorios',
        true
    ),
    (
        'Computadoras y Tablets',
        'Laptops, desktops, tablets y accesorios de computación',
        true
    ),
    (
        'Smartphones y Accesorios',
        'Teléfonos inteligentes, fundas, cargadores y accesorios',
        true
    ),
    (
        'Audio y Video',
        'Auriculares, altavoces, cámaras, televisores y equipos de sonido',
        true
    ),
    (
        'Gaming',
        'Consolas, videojuegos, accesorios gaming y hardware',
        true
    ),
    -- Hogar y Jardín
    (
        'Hogar y Jardín',
        'Muebles, decoración, electrodomésticos y artículos para el hogar',
        true
    ),
    (
        'Muebles',
        'Muebles para sala, dormitorio, oficina y exterior',
        true
    ),
    (
        'Decoración',
        'Arte, espejos, iluminación y accesorios decorativos',
        true
    ),
    (
        'Electrodomésticos',
        'Refrigeradores, lavadoras, microondas y pequeños electrodomésticos',
        true
    ),
    (
        'Jardín y Exterior',
        'Plantas, herramientas de jardín, muebles de exterior',
        true
    ),
    -- Moda y Accesorios
    (
        'Ropa y Accesorios',
        'Ropa para hombres, mujeres y niños',
        true
    ),
    (
        'Ropa de Mujer',
        'Vestidos, blusas, pantalones, faldas y accesorios femeninos',
        true
    ),
    (
        'Ropa de Hombre',
        'Camisas, pantalones, chaquetas y accesorios masculinos',
        true
    ),
    (
        'Ropa de Niños',
        'Ropa para bebés, niños y adolescentes',
        true
    ),
    (
        'Zapatos',
        'Zapatos para hombres, mujeres y niños',
        true
    ),
    (
        'Relojes y Joyería',
        'Relojes, anillos, collares, pulseras y accesorios',
        true
    ),
    -- Deportes y Recreación
    (
        'Deportes y Recreación',
        'Equipos deportivos, fitness y actividades al aire libre',
        true
    ),
    (
        'Fitness y Ejercicio',
        'Pesas, equipos de cardio, yoga y fitness en casa',
        true
    ),
    (
        'Deportes al Aire Libre',
        'Camping, senderismo, ciclismo y deportes acuáticos',
        true
    ),
    (
        'Deportes de Equipo',
        'Fútbol, baloncesto, tenis y deportes de equipo',
        true
    ),
    (
        'Deportes de Invierno',
        'Esquí, snowboard y deportes de nieve',
        true
    ),
    -- Automotriz
    (
        'Automotriz',
        'Repuestos, accesorios y productos para vehículos',
        true
    ),
    (
        'Repuestos de Auto',
        'Filtros, frenos, baterías y repuestos automotrices',
        true
    ),
    (
        'Accesorios de Auto',
        'Fundas para asientos, organizadores y accesorios interiores',
        true
    ),
    (
        'Herramientas Automotrices',
        'Herramientas para mantenimiento y reparación',
        true
    ),
    (
        'Motocicletas',
        'Repuestos y accesorios para motocicletas',
        true
    ),
    -- Salud y Belleza
    (
        'Salud y Belleza',
        'Productos de cuidado personal, cosméticos y salud',
        true
    ),
    (
        'Cuidado Personal',
        'Shampoo, jabón, desodorante y productos de higiene',
        true
    ),
    (
        'Cosméticos',
        'Maquillaje, perfumes y productos de belleza',
        true
    ),
    (
        'Cuidado de la Piel',
        'Cremas, lociones y productos para el cuidado facial',
        true
    ),
    (
        'Salud y Bienestar',
        'Vitaminas, suplementos y productos de salud',
        true
    ),
    -- Libros y Educación
    (
        'Libros y Educación',
        'Libros, material educativo y productos de oficina',
        true
    ),
    (
        'Libros',
        'Ficción, no ficción, libros técnicos y educativos',
        true
    ),
    (
        'Material de Oficina',
        'Papelería, cuadernos, bolígrafos y suministros',
        true
    ),
    (
        'Educación',
        'Libros de texto, material educativo y recursos de aprendizaje',
        true
    ),
    -- Mascotas
    (
        'Mascotas',
        'Alimento, juguetes y accesorios para mascotas',
        true
    ),
    (
        'Alimento para Mascotas',
        'Comida para perros, gatos y otras mascotas',
        true
    ),
    (
        'Juguetes para Mascotas',
        'Juguetes, rascadores y entretenimiento',
        true
    ),
    (
        'Accesorios para Mascotas',
        'Correas, collares, camas y accesorios',
        true
    ),
    -- Bebés y Niños
    (
        'Bebés y Niños',
        'Productos para bebés, juguetes y artículos infantiles',
        true
    ),
    (
        'Cuidado del Bebé',
        'Pañales, biberones, carriolas y productos de cuidado',
        true
    ),
    (
        'Juguetes',
        'Juguetes educativos, muñecas, juegos y entretenimiento',
        true
    ),
    (
        'Ropa de Bebé',
        'Ropa para recién nacidos y bebés',
        true
    ),
    -- Alimentación y Bebidas
    (
        'Alimentación y Bebidas',
        'Comida, bebidas y productos gourmet',
        true
    ),
    (
        'Comida Gourmet',
        'Alimentos especiales, especias y productos premium',
        true
    ),
    (
        'Bebidas',
        'Café, té, vinos y bebidas especiales',
        true
    ),
    (
        'Snacks',
        'Dulces, galletas, frutos secos y snacks',
        true
    ),
    -- Servicios
    (
        'Servicios',
        'Servicios profesionales y de consultoría',
        true
    ),
    (
        'Servicios Técnicos',
        'Reparación de computadoras, instalación y soporte técnico',
        true
    ),
    (
        'Servicios de Diseño',
        'Diseño gráfico, web, interior y servicios creativos',
        true
    ),
    (
        'Servicios de Consultoría',
        'Consultoría empresarial, legal y financiera',
        true
    ),
    (
        'Servicios de Entretenimiento',
        'Fotografía, eventos, música y entretenimiento',
        true
    ),
    -- Herramientas y Mejoras del Hogar
    (
        'Herramientas y Mejoras del Hogar',
        'Herramientas, materiales de construcción y mejoras',
        true
    ),
    (
        'Herramientas',
        'Herramientas manuales, eléctricas y de medición',
        true
    ),
    (
        'Materiales de Construcción',
        'Pintura, madera, cemento y materiales de construcción',
        true
    ),
    (
        'Plomería',
        'Tuberías, grifos, accesorios de baño y plomería',
        true
    ),
    (
        'Electricidad',
        'Cables, interruptores, iluminación y accesorios eléctricos',
        true
    ),
    -- Categoría general
    (
        'Otros',
        'Productos que no encajan en otras categorías específicas',
        true
    );

-- Actualizar fechas de creación
UPDATE
    categorias
SET
    fecha_creacion = CURRENT_TIMESTAMP
WHERE
    fecha_creacion IS NULL;