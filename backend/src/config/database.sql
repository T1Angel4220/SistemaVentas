-- =====================================================
-- SISTEMA DE VENTAS MULTIEMPRESA - ESQUEMA DE BASE DE DATOS
-- =====================================================
-- Este archivo contiene el esquema completo para el sistema
-- Incluye todas las tablas, relaciones, índices y datos iniciales
-- Diseñado para pruebas de software y gestión de implementación
-- Crear la base de datos
CREATE DATABASE sistema_ventas_multiempresa;

-- Usar la base de datos
\ c sistema_ventas_multiempresa;

-- =====================================================
-- ENUMS (Tipos de datos personalizados)
-- =====================================================
-- Tipos de usuario
CREATE TYPE tipo_usuario AS ENUM (
    'comprador',
    'vendedor',
    'moderador',
    'administrador'
);

-- Estados de usuario
CREATE TYPE estado_usuario AS ENUM (
    'activo',
    'inactivo',
    'suspendido',
    'pendiente_verificacion'
);

-- Tipos de producto/servicio
CREATE TYPE tipo_item AS ENUM ('producto', 'servicio');

-- Estados de producto/servicio
CREATE TYPE estado_item AS ENUM (
    'activo',
    'inactivo',
    'pendiente_revision',
    'rechazado',
    'peligroso',
    'suspendido',
    'en_apelacion'
);

-- Estados de reporte/incidencia
CREATE TYPE estado_reporte AS ENUM (
    'pendiente',
    'en_revision',
    'resuelto',
    'rechazado',
    'en_apelacion'
);

-- Tipos de reporte
CREATE TYPE tipo_reporte AS ENUM (
    'contenido_inapropiado',
    'producto_prohibido',
    'informacion_falsa',
    'spam',
    'otro'
);

-- Estados de chat
CREATE TYPE estado_chat AS ENUM ('activo', 'cerrado', 'archivado');

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================
-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    genero VARCHAR(10) CHECK (genero IN ('masculino', 'femenino', 'otro')),
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario tipo_usuario NOT NULL DEFAULT 'comprador',
    estado estado_usuario NOT NULL DEFAULT 'pendiente_verificacion',
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_recuperacion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_padre_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
    nivel INTEGER DEFAULT 0,
    -- 0: categoría principal, 1: subcategoría, etc.
    orden INTEGER DEFAULT 0,
    -- Para ordenar las categorías
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nombre, categoria_padre_id) -- Evitar nombres duplicados en el mismo nivel
);

-- Tabla de ubicaciones
CREATE TABLE ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    provincia VARCHAR(100),
    canton VARCHAR(100),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos/servicios
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    ubicacion_id INTEGER REFERENCES ubicaciones(id),
    disponibilidad BOOLEAN DEFAULT TRUE,
    tipo tipo_item NOT NULL,
    estado estado_item NOT NULL DEFAULT 'pendiente_revision',
    categoria_id INTEGER REFERENCES categorias(id),
    vendedor_id INTEGER REFERENCES usuarios(id) NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    moderador_revision_id INTEGER REFERENCES usuarios(id),
    motivo_rechazo TEXT,
    es_peligroso BOOLEAN DEFAULT FALSE,
    fecha_deteccion_peligroso TIMESTAMP,
    ubicacion_provincia VARCHAR(100),
    ubicacion_canton VARCHAR(100),
    ubicacion_distrito VARCHAR(100),
    ubicacion_direccion VARCHAR(255),
    coordenadas VARCHAR(50)
);

-- Tabla de imágenes de productos/servicios
CREATE TABLE item_imagenes (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    url_imagen VARCHAR(500) NOT NULL,
    orden INTEGER DEFAULT 1,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios (extiende items)
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    horario_atencion TEXT NOT NULL,
    dias_disponibles VARCHAR(100),
    -- ej: "Lunes-Viernes"
    duracion_estimada VARCHAR(50),
    -- ej: "2 horas"
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos guardados (favoritos)
CREATE TABLE productos_guardados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, item_id)
);

-- Tabla de reportes/incidencias
CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id),
    usuario_reportador_id INTEGER REFERENCES usuarios(id),
    tipo_reporte tipo_reporte NOT NULL,
    descripcion TEXT,
    comentario_opcional TEXT,
    estado estado_reporte NOT NULL DEFAULT 'pendiente',
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    moderador_resolutor_id INTEGER REFERENCES usuarios(id),
    decision_final TEXT,
    fecha_resolucion TIMESTAMP
);

-- Tabla de apelaciones
CREATE TABLE apelaciones (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER REFERENCES reportes(id),
    item_id INTEGER REFERENCES items(id),
    usuario_apelante_id INTEGER REFERENCES usuarios(id),
    motivo_apelacion TEXT NOT NULL,
    informacion_adicional TEXT,
    estado estado_reporte NOT NULL DEFAULT 'en_apelacion',
    fecha_apelacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision_apelacion TIMESTAMP,
    moderador_revisor_id INTEGER REFERENCES usuarios(id),
    decision_apelacion TEXT,
    fecha_resolucion_apelacion TIMESTAMP
);

-- Tabla de chat entre compradores y vendedores
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    comprador_id INTEGER REFERENCES usuarios(id),
    vendedor_id INTEGER REFERENCES usuarios(id),
    item_id INTEGER REFERENCES items(id),
    estado estado_chat DEFAULT 'activo',
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    UNIQUE(comprador_id, vendedor_id, item_id)
);

-- Tabla de mensajes del chat
CREATE TABLE mensajes_chat (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    remitente_id INTEGER REFERENCES usuarios(id),
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP
);

-- Tabla de valoraciones
CREATE TABLE valoraciones (
    id SERIAL PRIMARY KEY,
    evaluador_id INTEGER REFERENCES usuarios(id),
    evaluado_id INTEGER REFERENCES usuarios(id),
    item_id INTEGER REFERENCES items(id),
    chat_id INTEGER REFERENCES chats(id),
    calificacion INTEGER CHECK (
        calificacion >= 1
        AND calificacion <= 5
    ),
    comentario TEXT,
    fecha_valoracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de acciones de moderadores (auditoría)
CREATE TABLE acciones_moderacion (
    id SERIAL PRIMARY KEY,
    moderador_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    -- ej: "suspender_usuario", "aprobar_producto", "rechazar_producto"
    tabla_afectada VARCHAR(50),
    -- ej: "usuarios", "items", "reportes"
    registro_id INTEGER,
    -- ID del registro afectado
    detalles TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones de usuario
CREATE TABLE sesiones_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token_sesion TEXT UNIQUE NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    activa BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
-- Índices para usuarios
CREATE INDEX idx_usuarios_correo ON usuarios(correo);

CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);

CREATE INDEX idx_usuarios_estado ON usuarios(estado);

CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);

-- Índices para items (productos/servicios)
CREATE INDEX idx_items_vendedor ON items(vendedor_id);

CREATE INDEX idx_items_categoria ON items(categoria_id);

CREATE INDEX idx_items_estado ON items(estado);

CREATE INDEX idx_items_tipo ON items(tipo);

CREATE INDEX idx_items_precio ON items(precio);

CREATE INDEX idx_items_fecha_publicacion ON items(fecha_publicacion);

CREATE INDEX idx_items_ubicacion ON items(ubicacion_id);

CREATE INDEX idx_items_peligroso ON items(es_peligroso);

CREATE INDEX idx_items_provincia ON items(ubicacion_provincia);

CREATE INDEX idx_items_canton ON items(ubicacion_canton);

CREATE INDEX idx_items_coordenadas ON items(coordenadas);

-- Índices para reportes
CREATE INDEX idx_reportes_item ON reportes(item_id);

CREATE INDEX idx_reportes_usuario_reportador ON reportes(usuario_reportador_id);

CREATE INDEX idx_reportes_estado ON reportes(estado);

CREATE INDEX idx_reportes_fecha ON reportes(fecha_reporte);

-- Índices para chat
CREATE INDEX idx_chats_comprador ON chats(comprador_id);

CREATE INDEX idx_chats_vendedor ON chats(vendedor_id);

CREATE INDEX idx_chats_item ON chats(item_id);

CREATE INDEX idx_chats_estado ON chats(estado);

-- Índices para mensajes
CREATE INDEX idx_mensajes_chat ON mensajes_chat(chat_id);

CREATE INDEX idx_mensajes_fecha ON mensajes_chat(fecha_envio);

CREATE INDEX idx_mensajes_leido ON mensajes_chat(leido);

-- Índices para valoraciones
CREATE INDEX idx_valoraciones_evaluado ON valoraciones(evaluado_id);

CREATE INDEX idx_valoraciones_item ON valoraciones(item_id);

CREATE INDEX idx_valoraciones_calificacion ON valoraciones(calificacion);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA
-- =====================================================
-- Función para actualizar fecha_actualizacion
CREATE
OR REPLACE FUNCTION actualizar_fecha_modificacion() RETURNS TRIGGER AS $ $ BEGIN NEW.fecha_actualizacion = CURRENT_TIMESTAMP;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- Triggers para actualizar fechas de modificación
CREATE TRIGGER trigger_usuarios_actualizacion BEFORE
UPDATE
    ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

CREATE TRIGGER trigger_items_actualizacion BEFORE
UPDATE
    ON items FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES Y ANÁLISIS
-- =====================================================
-- Vista de productos activos con información completa
CREATE VIEW vista_productos_activos AS
SELECT
    i.id,
    i.codigo,
    i.nombre,
    i.descripcion,
    i.precio,
    i.tipo,
    i.fecha_publicacion,
    c.nombre as categoria,
    u.nombre || ' ' || u.apellido as vendedor,
    u.correo as correo_vendedor,
    ub.nombre as ubicacion,
    COUNT(ii.id) as total_imagenes
FROM
    items i
    JOIN categorias c ON i.categoria_id = c.id
    JOIN usuarios u ON i.vendedor_id = u.id
    LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
    LEFT JOIN item_imagenes ii ON i.id = ii.item_id
WHERE
    i.estado = 'activo'
    AND i.disponibilidad = TRUE
GROUP BY
    i.id,
    i.codigo,
    i.nombre,
    i.descripcion,
    i.precio,
    i.tipo,
    i.fecha_publicacion,
    c.nombre,
    u.nombre,
    u.apellido,
    u.correo,
    ub.nombre;

-- Vista de reportes pendientes
CREATE VIEW vista_reportes_pendientes AS
SELECT
    r.id,
    r.tipo_reporte,
    r.descripcion,
    r.fecha_reporte,
    i.nombre as producto_reportado,
    u.nombre || ' ' || u.apellido as usuario_reportador
FROM
    reportes r
    JOIN items i ON r.item_id = i.id
    JOIN usuarios u ON r.usuario_reportador_id = u.id
WHERE
    r.estado = 'pendiente';

-- Vista de estadísticas de usuarios
CREATE VIEW vista_estadisticas_usuarios AS
SELECT
    tipo_usuario,
    estado,
    COUNT(*) as total_usuarios,
    COUNT(
        CASE
            WHEN email_verificado = TRUE THEN 1
        END
    ) as usuarios_verificados
FROM
    usuarios
GROUP BY
    tipo_usuario,
    estado;

-- =====================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS
-- =====================================================
COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema con diferentes roles';

COMMENT ON COLUMN usuarios.cedula IS 'Identificación única del usuario';

COMMENT ON COLUMN usuarios.tipo_usuario IS 'Rol del usuario: comprador, vendedor, moderador, administrador';

COMMENT ON COLUMN usuarios.estado IS 'Estado actual del usuario: activo, inactivo, suspendido, pendiente_verificacion';

COMMENT ON TABLE items IS 'Productos y servicios publicados en el sistema';

COMMENT ON COLUMN items.tipo IS 'Tipo de item: producto o servicio';

COMMENT ON COLUMN items.estado IS 'Estado del item: activo, inactivo, pendiente_revision, rechazado, peligroso, suspendido';

COMMENT ON COLUMN items.es_peligroso IS 'Indica si el item fue detectado como peligroso por el sistema';

COMMENT ON TABLE reportes IS 'Reportes e incidencias sobre productos/servicios';

COMMENT ON COLUMN reportes.tipo_reporte IS 'Tipo de reporte: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro';

COMMENT ON COLUMN reportes.estado IS 'Estado del reporte: pendiente, en_revision, resuelto, rechazado, en_apelacion';

COMMENT ON TABLE chats IS 'Conversaciones entre compradores y vendedores';

COMMENT ON TABLE valoraciones IS 'Calificaciones y comentarios entre usuarios';

COMMENT ON TABLE acciones_moderacion IS 'Auditoría de acciones realizadas por moderadores';