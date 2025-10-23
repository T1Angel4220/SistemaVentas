-- =====================================================
-- ACTUALIZACIÓN DE UBICACIONES: ECUADOR
-- =====================================================
-- Este script reemplaza las ubicaciones de Costa Rica con las de Ecuador
-- Incluye 24 provincias y 209 cantones organizados por regiones
-- Configurar encoding UTF-8
SET
    client_encoding = 'UTF8';

-- Limpiar ubicaciones existentes
TRUNCATE TABLE ubicaciones CASCADE;

-- Reiniciar secuencia
ALTER SEQUENCE ubicaciones_id_seq RESTART WITH 1;

-- =====================================================
-- REGIÓN COSTA (7 provincias, 79 cantones)
-- =====================================================
-- 1. ESMERALDAS
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Esmeraldas', 'Esmeraldas', 'Esmeraldas', NULL),
    ('Atacames', 'Esmeraldas', 'Atacames', NULL),
    ('Eloy Alfaro', 'Esmeraldas', 'Eloy Alfaro', NULL),
    ('Muisne', 'Esmeraldas', 'Muisne', NULL),
    ('Quinindé', 'Esmeraldas', 'Quinindé', NULL),
    ('Rioverde', 'Esmeraldas', 'Rioverde', NULL),
    ('San Lorenzo', 'Esmeraldas', 'San Lorenzo', NULL);

-- 2. MANABÍ
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Portoviejo', 'Manabí', 'Portoviejo', NULL),
    ('Manta', 'Manabí', 'Manta', NULL),
    ('Chone', 'Manabí', 'Chone', NULL),
    ('Bahía de Caráquez', 'Manabí', 'Sucre', NULL),
    ('Jipijapa', 'Manabí', 'Jipijapa', NULL),
    ('El Carmen', 'Manabí', 'El Carmen', NULL),
    ('Rocafuerte', 'Manabí', 'Rocafuerte', NULL),
    ('Tosagua', 'Manabí', 'Tosagua', NULL),
    ('Pedernales', 'Manabí', 'Pedernales', NULL),
    ('Paján', 'Manabí', 'Paján', NULL),
    ('Santa Ana', 'Manabí', 'Santa Ana', NULL),
    ('Bolívar', 'Manabí', 'Bolívar', NULL),
    ('Montecristi', 'Manabí', 'Montecristi', NULL),
    ('Junín', 'Manabí', 'Junín', NULL),
    ('Flavio Alfaro', 'Manabí', 'Flavio Alfaro', NULL),
    ('24 de Mayo', 'Manabí', '24 de Mayo', NULL),
    ('Olmedo', 'Manabí', 'Olmedo', NULL),
    ('Puerto López', 'Manabí', 'Puerto López', NULL),
    ('Pichincha', 'Manabí', 'Pichincha', NULL),
    ('Jama', 'Manabí', 'Jama', NULL),
    ('San Vicente', 'Manabí', 'San Vicente', NULL);

-- 3. LOS RÍOS
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Babahoyo', 'Los Ríos', 'Babahoyo', NULL),
    ('Quevedo', 'Los Ríos', 'Quevedo', NULL),
    ('Ventanas', 'Los Ríos', 'Ventanas', NULL),
    ('Vinces', 'Los Ríos', 'Vinces', NULL),
    ('Montalvo', 'Los Ríos', 'Montalvo', NULL),
    ('Urdaneta', 'Los Ríos', 'Urdaneta', NULL),
    ('Palenque', 'Los Ríos', 'Palenque', NULL),
    ('Pueblo Viejo', 'Los Ríos', 'Pueblo Viejo', NULL),
    ('Buena Fe', 'Los Ríos', 'Buena Fe', NULL),
    ('Quinsaloma', 'Los Ríos', 'Quinsaloma', NULL),
    ('Valencia', 'Los Ríos', 'Valencia', NULL);

-- 4. GUAYAS
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Guayaquil', 'Guayas', 'Guayaquil', NULL),
    ('Daule', 'Guayas', 'Daule', NULL),
    ('Milagro', 'Guayas', 'Milagro', NULL),
    ('Durán', 'Guayas', 'Durán', NULL),
    ('Samborondón', 'Guayas', 'Samborondón', NULL),
    ('Naranjal', 'Guayas', 'Naranjal', NULL),
    ('Playas', 'Guayas', 'Playas', NULL),
    ('El Triunfo', 'Guayas', 'El Triunfo', NULL),
    ('Salitre', 'Guayas', 'Salitre', NULL),
    ('Balzar', 'Guayas', 'Balzar', NULL),
    ('Santa Lucía', 'Guayas', 'Santa Lucía', NULL),
    ('Palestina', 'Guayas', 'Palestina', NULL),
    ('Colimes', 'Guayas', 'Colimes', NULL),
    ('Yaguachi', 'Guayas', 'Yaguachi', NULL),
    ('Naranjito', 'Guayas', 'Naranjito', NULL),
    (
        'Marcelino Maridueña',
        'Guayas',
        'Marcelino Maridueña',
        NULL
    ),
    (
        'Alfredo Baquerizo Moreno',
        'Guayas',
        'Alfredo Baquerizo Moreno',
        NULL
    ),
    ('Simón Bolívar', 'Guayas', 'Simón Bolívar', NULL),
    ('Isidro Ayora', 'Guayas', 'Isidro Ayora', NULL),
    (
        'Lomas de Sargentillo',
        'Guayas',
        'Lomas de Sargentillo',
        NULL
    ),
    ('Pedro Carbo', 'Guayas', 'Pedro Carbo', NULL);

-- 5. SANTA ELENA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    (
        'Santa Elena',
        'Santa Elena',
        'Santa Elena',
        NULL
    ),
    (
        'La Libertad',
        'Santa Elena',
        'La Libertad',
        NULL
    ),
    ('Salinas', 'Santa Elena', 'Salinas', NULL);

-- 6. EL ORO
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Machala', 'El Oro', 'Machala', NULL),
    ('Pasaje', 'El Oro', 'Pasaje', NULL),
    ('Santa Rosa', 'El Oro', 'Santa Rosa', NULL),
    ('Zaruma', 'El Oro', 'Zaruma', NULL),
    ('Piñas', 'El Oro', 'Piñas', NULL),
    ('Arenillas', 'El Oro', 'Arenillas', NULL),
    ('Huaquillas', 'El Oro', 'Huaquillas', NULL),
    ('Portovelo', 'El Oro', 'Portovelo', NULL),
    ('Balsas', 'El Oro', 'Balsas', NULL),
    ('Chilla', 'El Oro', 'Chilla', NULL),
    ('Las Lajas', 'El Oro', 'Las Lajas', NULL),
    ('Atahualpa', 'El Oro', 'Atahualpa', NULL),
    ('Marcabelí', 'El Oro', 'Marcabelí', NULL),
    ('El Guabo', 'El Oro', 'El Guabo', NULL);

-- 7. SANTO DOMINGO DE LOS TSÁCHILAS
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    (
        'Santo Domingo',
        'Santo Domingo de los Tsáchilas',
        'Santo Domingo',
        NULL
    ),
    (
        'La Concordia',
        'Santo Domingo de los Tsáchilas',
        'La Concordia',
        NULL
    );

-- =====================================================
-- REGIÓN SIERRA (10 provincias, 88 cantones)
-- =====================================================
-- 1. CARCHI
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Tulcán', 'Carchi', 'Tulcán', NULL),
    ('Bolívar', 'Carchi', 'Bolívar', NULL),
    ('Espejo', 'Carchi', 'Espejo', NULL),
    ('Mira', 'Carchi', 'Mira', NULL),
    ('Montúfar', 'Carchi', 'Montúfar', NULL),
    (
        'San Pedro de Huaca',
        'Carchi',
        'San Pedro de Huaca',
        NULL
    );

-- 2. IMBABURA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Ibarra', 'Imbabura', 'Ibarra', NULL),
    ('Otavalo', 'Imbabura', 'Otavalo', NULL),
    ('Cotacachi', 'Imbabura', 'Cotacachi', NULL),
    ('Antonio Ante', 'Imbabura', 'Antonio Ante', NULL),
    ('Pimampiro', 'Imbabura', 'Pimampiro', NULL),
    ('Urcuquí', 'Imbabura', 'Urcuquí', NULL);

-- 3. PICHINCHA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Quito', 'Pichincha', 'Quito', NULL),
    ('Cayambe', 'Pichincha', 'Cayambe', NULL),
    ('Mejía', 'Pichincha', 'Mejía', NULL),
    (
        'Pedro Moncayo',
        'Pichincha',
        'Pedro Moncayo',
        NULL
    ),
    ('Rumiñahui', 'Pichincha', 'Rumiñahui', NULL),
    (
        'San Miguel de los Bancos',
        'Pichincha',
        'San Miguel de los Bancos',
        NULL
    ),
    (
        'Pedro Vicente Maldonado',
        'Pichincha',
        'Pedro Vicente Maldonado',
        NULL
    ),
    (
        'Puerto Quito',
        'Pichincha',
        'Puerto Quito',
        NULL
    );

-- 4. COTOPAXI
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Latacunga', 'Cotopaxi', 'Latacunga', NULL),
    ('La Maná', 'Cotopaxi', 'La Maná', NULL),
    ('Pangua', 'Cotopaxi', 'Pangua', NULL),
    ('Pujilí', 'Cotopaxi', 'Pujilí', NULL),
    ('Salcedo', 'Cotopaxi', 'Salcedo', NULL),
    ('Saquisilí', 'Cotopaxi', 'Saquisilí', NULL),
    ('Sigchos', 'Cotopaxi', 'Sigchos', NULL);

-- 5. TUNGURAHUA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Ambato', 'Tungurahua', 'Ambato', NULL),
    (
        'Baños de Agua Santa',
        'Tungurahua',
        'Baños de Agua Santa',
        NULL
    ),
    ('Cevallos', 'Tungurahua', 'Cevallos', NULL),
    ('Mocha', 'Tungurahua', 'Mocha', NULL),
    ('Patate', 'Tungurahua', 'Patate', NULL),
    ('Quero', 'Tungurahua', 'Quero', NULL),
    ('Pelileo', 'Tungurahua', 'Pelileo', NULL),
    ('Tisaleo', 'Tungurahua', 'Tisaleo', NULL);

-- 6. BOLÍVAR
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Guaranda', 'Bolívar', 'Guaranda', NULL),
    ('Caluma', 'Bolívar', 'Caluma', NULL),
    ('Chillanes', 'Bolívar', 'Chillanes', NULL),
    ('Chimbo', 'Bolívar', 'Chimbo', NULL),
    ('Echeandía', 'Bolívar', 'Echeandía', NULL),
    ('Las Naves', 'Bolívar', 'Las Naves', NULL),
    ('San Miguel', 'Bolívar', 'San Miguel', NULL);

-- 7. CHIMBORAZO
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Riobamba', 'Chimborazo', 'Riobamba', NULL),
    ('Alausí', 'Chimborazo', 'Alausí', NULL),
    ('Colta', 'Chimborazo', 'Colta', NULL),
    ('Chambo', 'Chimborazo', 'Chambo', NULL),
    ('Guano', 'Chimborazo', 'Guano', NULL),
    ('Guamote', 'Chimborazo', 'Guamote', NULL),
    ('Pallatanga', 'Chimborazo', 'Pallatanga', NULL),
    ('Penipe', 'Chimborazo', 'Penipe', NULL),
    ('Cumandá', 'Chimborazo', 'Cumandá', NULL);

-- 8. CAÑAR
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Azogues', 'Cañar', 'Azogues', NULL),
    ('Biblián', 'Cañar', 'Biblián', NULL),
    ('Cañar', 'Cañar', 'Cañar', NULL),
    ('Déleg', 'Cañar', 'Déleg', NULL),
    ('El Tambo', 'Cañar', 'El Tambo', NULL),
    ('La Troncal', 'Cañar', 'La Troncal', NULL),
    ('Suscal', 'Cañar', 'Suscal', NULL);

-- 9. AZUAY
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Cuenca', 'Azuay', 'Cuenca', NULL),
    ('Gualaceo', 'Azuay', 'Gualaceo', NULL),
    ('Paute', 'Azuay', 'Paute', NULL),
    ('Santa Isabel', 'Azuay', 'Santa Isabel', NULL),
    ('Sígsig', 'Azuay', 'Sígsig', NULL),
    ('Nabón', 'Azuay', 'Nabón', NULL),
    ('Oña', 'Azuay', 'Oña', NULL),
    ('Chordeleg', 'Azuay', 'Chordeleg', NULL),
    ('Girón', 'Azuay', 'Girón', NULL),
    ('San Fernando', 'Azuay', 'San Fernando', NULL),
    (
        'Sevilla de Oro',
        'Azuay',
        'Sevilla de Oro',
        NULL
    ),
    ('Pucará', 'Azuay', 'Pucará', NULL),
    (
        'Camilo Ponce Enríquez',
        'Azuay',
        'Camilo Ponce Enríquez',
        NULL
    );

-- 10. LOJA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Loja', 'Loja', 'Loja', NULL),
    ('Calvas', 'Loja', 'Calvas', NULL),
    ('Catamayo', 'Loja', 'Catamayo', NULL),
    ('Celica', 'Loja', 'Celica', NULL),
    ('Chaguarpamba', 'Loja', 'Chaguarpamba', NULL),
    ('Espindola', 'Loja', 'Espindola', NULL),
    ('Gonzanamá', 'Loja', 'Gonzanamá', NULL),
    ('Macará', 'Loja', 'Macará', NULL),
    ('Olmedo', 'Loja', 'Olmedo', NULL),
    ('Paltas', 'Loja', 'Paltas', NULL),
    ('Pindal', 'Loja', 'Pindal', NULL),
    ('Puyango', 'Loja', 'Puyango', NULL),
    ('Quilanga', 'Loja', 'Quilanga', NULL),
    ('Saraguro', 'Loja', 'Saraguro', NULL),
    ('Sozoranga', 'Loja', 'Sozoranga', NULL),
    ('Zapotillo', 'Loja', 'Zapotillo', NULL);

-- =====================================================
-- REGIÓN AMAZONÍA (6 provincias, 39 cantones)
-- =====================================================
-- 1. SUCUMBÍOS
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Nueva Loja', 'Sucumbíos', 'Lago Agrio', NULL),
    ('Cuyabeno', 'Sucumbíos', 'Cuyabeno', NULL),
    (
        'Gonzalo Pizarro',
        'Sucumbíos',
        'Gonzalo Pizarro',
        NULL
    ),
    ('Putumayo', 'Sucumbíos', 'Putumayo', NULL),
    ('Shushufindi', 'Sucumbíos', 'Shushufindi', NULL),
    ('Cascales', 'Sucumbíos', 'Cascales', NULL),
    ('Sucumbíos', 'Sucumbíos', 'Sucumbíos', NULL);

-- 2. NAPO
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Tena', 'Napo', 'Tena', NULL),
    ('Archidona', 'Napo', 'Archidona', NULL),
    ('El Chaco', 'Napo', 'El Chaco', NULL),
    ('Quijos', 'Napo', 'Quijos', NULL),
    (
        'Carlos Julio Arosemena Tola',
        'Napo',
        'Carlos Julio Arosemena Tola',
        NULL
    );

-- 3. ORELLANA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    (
        'Francisco de Orellana',
        'Orellana',
        'Francisco de Orellana',
        NULL
    ),
    ('Aguarico', 'Orellana', 'Aguarico', NULL),
    (
        'La Joya de los Sachas',
        'Orellana',
        'La Joya de los Sachas',
        NULL
    ),
    ('Loreto', 'Orellana', 'Loreto', NULL);

-- 4. PASTAZA
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Puyo', 'Pastaza', 'Pastaza', NULL),
    ('Mera', 'Pastaza', 'Mera', NULL),
    ('Santa Clara', 'Pastaza', 'Santa Clara', NULL),
    ('Arajuno', 'Pastaza', 'Arajuno', NULL);

-- 5. MORONA SANTIAGO
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Macas', 'Morona Santiago', 'Morona', NULL),
    (
        'Gualaquiza',
        'Morona Santiago',
        'Gualaquiza',
        NULL
    ),
    (
        'Limón Indanza',
        'Morona Santiago',
        'Limón Indanza',
        NULL
    ),
    ('Palora', 'Morona Santiago', 'Palora', NULL),
    ('Santiago', 'Morona Santiago', 'Santiago', NULL),
    ('Sucúa', 'Morona Santiago', 'Sucúa', NULL),
    ('Huamboya', 'Morona Santiago', 'Huamboya', NULL),
    (
        'San Juan Bosco',
        'Morona Santiago',
        'San Juan Bosco',
        NULL
    ),
    ('Taisha', 'Morona Santiago', 'Taisha', NULL),
    ('Logroño', 'Morona Santiago', 'Logroño', NULL),
    (
        'Pablo Sexto',
        'Morona Santiago',
        'Pablo Sexto',
        NULL
    ),
    ('Tiwintza', 'Morona Santiago', 'Tiwintza', NULL);

-- 6. ZAMORA CHINCHIPE
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    ('Zamora', 'Zamora Chinchipe', 'Zamora', NULL),
    (
        'Chinchipe',
        'Zamora Chinchipe',
        'Chinchipe',
        NULL
    ),
    (
        'Nangaritza',
        'Zamora Chinchipe',
        'Nangaritza',
        NULL
    ),
    ('Yacuambi', 'Zamora Chinchipe', 'Yacuambi', NULL),
    ('Yantzaza', 'Zamora Chinchipe', 'Yantzaza', NULL),
    (
        'El Pangui',
        'Zamora Chinchipe',
        'El Pangui',
        NULL
    ),
    (
        'Centinela del Cóndor',
        'Zamora Chinchipe',
        'Centinela del Cóndor',
        NULL
    ),
    ('Palanda', 'Zamora Chinchipe', 'Palanda', NULL),
    ('Paquisha', 'Zamora Chinchipe', 'Paquisha', NULL);

-- =====================================================
-- REGIÓN INSULAR - GALÁPAGOS (1 provincia, 3 cantones)
-- =====================================================
-- 1. GALÁPAGOS
INSERT INTO
    ubicaciones (nombre, provincia, canton, distrito)
VALUES
    (
        'San Cristóbal',
        'Galápagos',
        'San Cristóbal',
        NULL
    ),
    ('Santa Cruz', 'Galápagos', 'Santa Cruz', NULL),
    ('Isabela', 'Galápagos', 'Isabela', NULL);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Contar ubicaciones insertadas
SELECT
    'Total de ubicaciones' as descripcion,
    COUNT(*) :: text as cantidad
FROM
    ubicaciones
UNION
ALL
SELECT
    'Total de provincias' as descripcion,
    COUNT(DISTINCT provincia) :: text as cantidad
FROM
    ubicaciones
UNION
ALL
SELECT
    provincia as descripcion,
    COUNT(*) :: text as cantidad
FROM
    ubicaciones
GROUP BY
    provincia
ORDER BY
    descripcion;