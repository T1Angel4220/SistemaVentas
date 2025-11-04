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
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Esmeraldas', 'Esmeraldas', 'Esmeraldas'),
    ('Atacames', 'Esmeraldas', 'Atacames'),
    ('Eloy Alfaro', 'Esmeraldas', 'Eloy Alfaro'),
    ('Muisne', 'Esmeraldas', 'Muisne'),
    ('Quinindé', 'Esmeraldas', 'Quinindé'),
    ('Rioverde', 'Esmeraldas', 'Rioverde'),
    ('San Lorenzo', 'Esmeraldas', 'San Lorenzo');

-- 2. MANABÍ
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Portoviejo', 'Manabí', 'Portoviejo'),
    ('Manta', 'Manabí', 'Manta'),
    ('Chone', 'Manabí', 'Chone'),
    ('Bahía de Caráquez', 'Manabí', 'Sucre'),
    ('Jipijapa', 'Manabí', 'Jipijapa'),
    ('El Carmen', 'Manabí', 'El Carmen'),
    ('Rocafuerte', 'Manabí', 'Rocafuerte'),
    ('Tosagua', 'Manabí', 'Tosagua'),
    ('Pedernales', 'Manabí', 'Pedernales'),
    ('Paján', 'Manabí', 'Paján'),
    ('Santa Ana', 'Manabí', 'Santa Ana'),
    ('Bolívar', 'Manabí', 'Bolívar'),
    ('Montecristi', 'Manabí', 'Montecristi'),
    ('Junín', 'Manabí', 'Junín'),
    ('Flavio Alfaro', 'Manabí', 'Flavio Alfaro'),
    ('24 de Mayo', 'Manabí', '24 de Mayo'),
    ('Olmedo', 'Manabí', 'Olmedo'),
    ('Puerto López', 'Manabí', 'Puerto López'),
    ('Pichincha', 'Manabí', 'Pichincha'),
    ('Jama', 'Manabí', 'Jama'),
    ('San Vicente', 'Manabí', 'San Vicente');

-- 3. LOS RÍOS
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Babahoyo', 'Los Ríos', 'Babahoyo'),
    ('Quevedo', 'Los Ríos', 'Quevedo'),
    ('Ventanas', 'Los Ríos', 'Ventanas'),
    ('Vinces', 'Los Ríos', 'Vinces'),
    ('Montalvo', 'Los Ríos', 'Montalvo'),
    ('Urdaneta', 'Los Ríos', 'Urdaneta'),
    ('Palenque', 'Los Ríos', 'Palenque'),
    ('Pueblo Viejo', 'Los Ríos', 'Pueblo Viejo'),
    ('Buena Fe', 'Los Ríos', 'Buena Fe'),
    ('Quinsaloma', 'Los Ríos', 'Quinsaloma'),
    ('Valencia', 'Los Ríos', 'Valencia');

-- 4. GUAYAS
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Guayaquil', 'Guayas', 'Guayaquil'),
    ('Daule', 'Guayas', 'Daule'),
    ('Milagro', 'Guayas', 'Milagro'),
    ('Durán', 'Guayas', 'Durán'),
    ('Samborondón', 'Guayas', 'Samborondón'),
    ('Naranjal', 'Guayas', 'Naranjal'),
    ('Playas', 'Guayas', 'Playas'),
    ('El Triunfo', 'Guayas', 'El Triunfo'),
    ('Salitre', 'Guayas', 'Salitre'),
    ('Balzar', 'Guayas', 'Balzar'),
    ('Santa Lucía', 'Guayas', 'Santa Lucía'),
    ('Palestina', 'Guayas', 'Palestina'),
    ('Colimes', 'Guayas', 'Colimes'),
    ('Yaguachi', 'Guayas', 'Yaguachi'),
    ('Naranjito', 'Guayas', 'Naranjito'),
    (
        'Marcelino Maridueña',
        'Guayas',
        'Marcelino Maridueña'),
    (
        'Alfredo Baquerizo Moreno',
        'Guayas',
        'Alfredo Baquerizo Moreno'),
    ('Simón Bolívar', 'Guayas', 'Simón Bolívar'),
    ('Isidro Ayora', 'Guayas', 'Isidro Ayora'),
    (
        'Lomas de Sargentillo',
        'Guayas',
        'Lomas de Sargentillo'),
    ('Pedro Carbo', 'Guayas', 'Pedro Carbo');

-- 5. SANTA ELENA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    (
        'Santa Elena',
        'Santa Elena',
        'Santa Elena'),
    (
        'La Libertad',
        'Santa Elena',
        'La Libertad'),
    ('Salinas', 'Santa Elena', 'Salinas');

-- 6. EL ORO
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Machala', 'El Oro', 'Machala'),
    ('Pasaje', 'El Oro', 'Pasaje'),
    ('Santa Rosa', 'El Oro', 'Santa Rosa'),
    ('Zaruma', 'El Oro', 'Zaruma'),
    ('Piñas', 'El Oro', 'Piñas'),
    ('Arenillas', 'El Oro', 'Arenillas'),
    ('Huaquillas', 'El Oro', 'Huaquillas'),
    ('Portovelo', 'El Oro', 'Portovelo'),
    ('Balsas', 'El Oro', 'Balsas'),
    ('Chilla', 'El Oro', 'Chilla'),
    ('Las Lajas', 'El Oro', 'Las Lajas'),
    ('Atahualpa', 'El Oro', 'Atahualpa'),
    ('Marcabelí', 'El Oro', 'Marcabelí'),
    ('El Guabo', 'El Oro', 'El Guabo');

-- 7. SANTO DOMINGO DE LOS TSÁCHILAS
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    (
        'Santo Domingo',
        'Santo Domingo de los Tsáchilas',
        'Santo Domingo'),
    (
        'La Concordia',
        'Santo Domingo de los Tsáchilas',
        'La Concordia');

-- =====================================================
-- REGIÓN SIERRA (10 provincias, 88 cantones)
-- =====================================================
-- 1. CARCHI
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Tulcán', 'Carchi', 'Tulcán'),
    ('Bolívar', 'Carchi', 'Bolívar'),
    ('Espejo', 'Carchi', 'Espejo'),
    ('Mira', 'Carchi', 'Mira'),
    ('Montúfar', 'Carchi', 'Montúfar'),
    (
        'San Pedro de Huaca',
        'Carchi',
        'San Pedro de Huaca');

-- 2. IMBABURA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Ibarra', 'Imbabura', 'Ibarra'),
    ('Otavalo', 'Imbabura', 'Otavalo'),
    ('Cotacachi', 'Imbabura', 'Cotacachi'),
    ('Antonio Ante', 'Imbabura', 'Antonio Ante'),
    ('Pimampiro', 'Imbabura', 'Pimampiro'),
    ('Urcuquí', 'Imbabura', 'Urcuquí');

-- 3. PICHINCHA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Quito', 'Pichincha', 'Quito'),
    ('Cayambe', 'Pichincha', 'Cayambe'),
    ('Mejía', 'Pichincha', 'Mejía'),
    (
        'Pedro Moncayo',
        'Pichincha',
        'Pedro Moncayo'),
    ('Rumiñahui', 'Pichincha', 'Rumiñahui'),
    (
        'San Miguel de los Bancos',
        'Pichincha',
        'San Miguel de los Bancos'),
    (
        'Pedro Vicente Maldonado',
        'Pichincha',
        'Pedro Vicente Maldonado'),
    (
        'Puerto Quito',
        'Pichincha',
        'Puerto Quito');

-- 4. COTOPAXI
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Latacunga', 'Cotopaxi', 'Latacunga'),
    ('La Maná', 'Cotopaxi', 'La Maná'),
    ('Pangua', 'Cotopaxi', 'Pangua'),
    ('Pujilí', 'Cotopaxi', 'Pujilí'),
    ('Salcedo', 'Cotopaxi', 'Salcedo'),
    ('Saquisilí', 'Cotopaxi', 'Saquisilí'),
    ('Sigchos', 'Cotopaxi', 'Sigchos');

-- 5. TUNGURAHUA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Ambato', 'Tungurahua', 'Ambato'),
    (
        'Baños de Agua Santa',
        'Tungurahua',
        'Baños de Agua Santa'),
    ('Cevallos', 'Tungurahua', 'Cevallos'),
    ('Mocha', 'Tungurahua', 'Mocha'),
    ('Patate', 'Tungurahua', 'Patate'),
    ('Quero', 'Tungurahua', 'Quero'),
    ('Pelileo', 'Tungurahua', 'Pelileo'),
    ('Tisaleo', 'Tungurahua', 'Tisaleo');

-- 6. BOLÍVAR
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Guaranda', 'Bolívar', 'Guaranda'),
    ('Caluma', 'Bolívar', 'Caluma'),
    ('Chillanes', 'Bolívar', 'Chillanes'),
    ('Chimbo', 'Bolívar', 'Chimbo'),
    ('Echeandía', 'Bolívar', 'Echeandía'),
    ('Las Naves', 'Bolívar', 'Las Naves'),
    ('San Miguel', 'Bolívar', 'San Miguel');

-- 7. CHIMBORAZO
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Riobamba', 'Chimborazo', 'Riobamba'),
    ('Alausí', 'Chimborazo', 'Alausí'),
    ('Colta', 'Chimborazo', 'Colta'),
    ('Chambo', 'Chimborazo', 'Chambo'),
    ('Guano', 'Chimborazo', 'Guano'),
    ('Guamote', 'Chimborazo', 'Guamote'),
    ('Pallatanga', 'Chimborazo', 'Pallatanga'),
    ('Penipe', 'Chimborazo', 'Penipe'),
    ('Cumandá', 'Chimborazo', 'Cumandá');

-- 8. CAÑAR
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Azogues', 'Cañar', 'Azogues'),
    ('Biblián', 'Cañar', 'Biblián'),
    ('Cañar', 'Cañar', 'Cañar'),
    ('Déleg', 'Cañar', 'Déleg'),
    ('El Tambo', 'Cañar', 'El Tambo'),
    ('La Troncal', 'Cañar', 'La Troncal'),
    ('Suscal', 'Cañar', 'Suscal');

-- 9. AZUAY
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Cuenca', 'Azuay', 'Cuenca'),
    ('Gualaceo', 'Azuay', 'Gualaceo'),
    ('Paute', 'Azuay', 'Paute'),
    ('Santa Isabel', 'Azuay', 'Santa Isabel'),
    ('Sígsig', 'Azuay', 'Sígsig'),
    ('Nabón', 'Azuay', 'Nabón'),
    ('Oña', 'Azuay', 'Oña'),
    ('Chordeleg', 'Azuay', 'Chordeleg'),
    ('Girón', 'Azuay', 'Girón'),
    ('San Fernando', 'Azuay', 'San Fernando'),
    (
        'Sevilla de Oro',
        'Azuay',
        'Sevilla de Oro'),
    ('Pucará', 'Azuay', 'Pucará'),
    (
        'Camilo Ponce Enríquez',
        'Azuay',
        'Camilo Ponce Enríquez');

-- 10. LOJA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Loja', 'Loja', 'Loja'),
    ('Calvas', 'Loja', 'Calvas'),
    ('Catamayo', 'Loja', 'Catamayo'),
    ('Celica', 'Loja', 'Celica'),
    ('Chaguarpamba', 'Loja', 'Chaguarpamba'),
    ('Espindola', 'Loja', 'Espindola'),
    ('Gonzanamá', 'Loja', 'Gonzanamá'),
    ('Macará', 'Loja', 'Macará'),
    ('Olmedo', 'Loja', 'Olmedo'),
    ('Paltas', 'Loja', 'Paltas'),
    ('Pindal', 'Loja', 'Pindal'),
    ('Puyango', 'Loja', 'Puyango'),
    ('Quilanga', 'Loja', 'Quilanga'),
    ('Saraguro', 'Loja', 'Saraguro'),
    ('Sozoranga', 'Loja', 'Sozoranga'),
    ('Zapotillo', 'Loja', 'Zapotillo');

-- =====================================================
-- REGIÓN AMAZONÍA (6 provincias, 39 cantones)
-- =====================================================
-- 1. SUCUMBÍOS
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Nueva Loja', 'Sucumbíos', 'Lago Agrio'),
    ('Cuyabeno', 'Sucumbíos', 'Cuyabeno'),
    (
        'Gonzalo Pizarro',
        'Sucumbíos',
        'Gonzalo Pizarro'),
    ('Putumayo', 'Sucumbíos', 'Putumayo'),
    ('Shushufindi', 'Sucumbíos', 'Shushufindi'),
    ('Cascales', 'Sucumbíos', 'Cascales'),
    ('Sucumbíos', 'Sucumbíos', 'Sucumbíos');

-- 2. NAPO
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Tena', 'Napo', 'Tena'),
    ('Archidona', 'Napo', 'Archidona'),
    ('El Chaco', 'Napo', 'El Chaco'),
    ('Quijos', 'Napo', 'Quijos'),
    (
        'Carlos Julio Arosemena Tola',
        'Napo',
        'Carlos Julio Arosemena Tola');

-- 3. ORELLANA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    (
        'Francisco de Orellana',
        'Orellana',
        'Francisco de Orellana'),
    ('Aguarico', 'Orellana', 'Aguarico'),
    (
        'La Joya de los Sachas',
        'Orellana',
        'La Joya de los Sachas'),
    ('Loreto', 'Orellana', 'Loreto');

-- 4. PASTAZA
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Puyo', 'Pastaza', 'Pastaza'),
    ('Mera', 'Pastaza', 'Mera'),
    ('Santa Clara', 'Pastaza', 'Santa Clara'),
    ('Arajuno', 'Pastaza', 'Arajuno');

-- 5. MORONA SANTIAGO
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Macas', 'Morona Santiago', 'Morona'),
    (
        'Gualaquiza',
        'Morona Santiago',
        'Gualaquiza'),
    (
        'Limón Indanza',
        'Morona Santiago',
        'Limón Indanza'),
    ('Palora', 'Morona Santiago', 'Palora'),
    ('Santiago', 'Morona Santiago', 'Santiago'),
    ('Sucúa', 'Morona Santiago', 'Sucúa'),
    ('Huamboya', 'Morona Santiago', 'Huamboya'),
    (
        'San Juan Bosco',
        'Morona Santiago',
        'San Juan Bosco'),
    ('Taisha', 'Morona Santiago', 'Taisha'),
    ('Logroño', 'Morona Santiago', 'Logroño'),
    (
        'Pablo Sexto',
        'Morona Santiago',
        'Pablo Sexto'),
    ('Tiwintza', 'Morona Santiago', 'Tiwintza');

-- 6. ZAMORA CHINCHIPE
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    ('Zamora', 'Zamora Chinchipe', 'Zamora'),
    (
        'Chinchipe',
        'Zamora Chinchipe',
        'Chinchipe'),
    (
        'Nangaritza',
        'Zamora Chinchipe',
        'Nangaritza'),
    ('Yacuambi', 'Zamora Chinchipe', 'Yacuambi'),
    ('Yantzaza', 'Zamora Chinchipe', 'Yantzaza'),
    (
        'El Pangui',
        'Zamora Chinchipe',
        'El Pangui'),
    (
        'Centinela del Cóndor',
        'Zamora Chinchipe',
        'Centinela del Cóndor'),
    ('Palanda', 'Zamora Chinchipe', 'Palanda'),
    ('Paquisha', 'Zamora Chinchipe', 'Paquisha');

-- =====================================================
-- REGIÓN INSULAR - GALÁPAGOS (1 provincia, 3 cantones)
-- =====================================================
-- 1. GALÁPAGOS
INSERT INTO
    ubicaciones (nombre, provincia, canton)
VALUES
    (
        'San Cristóbal',
        'Galápagos',
        'San Cristóbal'),
    ('Santa Cruz', 'Galápagos', 'Santa Cruz'),
    ('Isabela', 'Galápagos', 'Isabela');

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



