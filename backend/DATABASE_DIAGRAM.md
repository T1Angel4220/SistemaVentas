# Diagrama de Base de Datos - Sistema de Ventas Multiempresa

## 📊 Relaciones Principales

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USUARIOS    │    │    CATEGORIAS    │    │   UBICACIONES    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ cedula (UNIQUE) │    │ nombre          │    │ nombre          │
│ nombre          │    │ descripcion     │    │ provincia       │
│ apellido        │    │ activa          │    │ canton          │
│ correo (UNIQUE) │    └─────────────────┘    │ distrito        │
│ telefono        │                          │ coordenadas     │
│ direccion       │                          │ activa          │
│ genero          │                          └─────────────────┘
│ password_hash   │                                    │
│ tipo_usuario    │                                    │
│ estado          │                                    │
│ email_verificado│                                    │
└─────────────────┘                                    │
         │                                              │
         │                                              │
         │ 1:N                                          │ 1:N
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│      ITEMS      │                          │      ITEMS      │
├─────────────────┤                          ├─────────────────┤
│ id (PK)         │◄─────────────────────────┤ id (PK)         │
│ codigo (UNIQUE) │                          │ codigo (UNIQUE) │
│ nombre          │                          │ nombre          │
│ descripcion     │                          │ descripcion     │
│ precio          │                          │ precio          │
│ ubicacion_id(FK)│                          │ ubicacion_id(FK)│
│ disponibilidad  │                          │ disponibilidad  │
│ tipo            │                          │ tipo            │
│ estado          │                          │ estado          │
│ categoria_id(FK)│                          │ categoria_id(FK)│
│ vendedor_id(FK) │                          │ vendedor_id(FK) │
│ fecha_publicacion│                         │ fecha_publicacion│
└─────────────────┘                          └─────────────────┘
         │                                              │
         │ 1:N                                          │ 1:N
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│ ITEM_IMAGENES   │                          │    SERVICIOS    │
├─────────────────┤                          ├─────────────────┤
│ id (PK)         │                          │ id (PK)         │
│ item_id (FK)    │                          │ item_id (FK)    │
│ url_imagen      │                          │ horario_atencion│
│ orden           │                          │ dias_disponibles│
│ es_principal    │                          │ duracion_estimada│
└─────────────────┘                          └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    REPORTES     │    │   APELACIONES   │    │ PRODUCTOS_GUARDADOS│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ item_id (FK)    │    │ reporte_id (FK) │    │ usuario_id (FK) │
│ usuario_reportador_id(FK)│ item_id (FK)    │    │ item_id (FK)    │
│ tipo_reporte    │    │ usuario_apelante_id(FK)│ fecha_guardado │
│ descripcion     │    │ motivo_apelacion│    └─────────────────┘
│ comentario_opcional│  │ informacion_adicional│
│ estado          │    │ estado          │
│ fecha_reporte   │    │ fecha_apelacion │
│ moderador_asignado_id(FK)│ fecha_revision_apelacion│
│ moderador_resolutor_id(FK)│ moderador_revisor_id(FK)│
│ decision_final  │    │ decision_apelacion│
│ fecha_resolucion│    │ fecha_resolucion_apelacion│
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      CHATS      │    │ MENSAJES_CHAT   │    │   VALORACIONES  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ comprador_id(FK)│    │ chat_id (FK)    │    │ evaluador_id(FK)│
│ vendedor_id (FK)│    │ remitente_id(FK)│    │ evaluado_id (FK)│
│ item_id (FK)    │    │ mensaje         │    │ item_id (FK)    │
│ estado          │    │ fecha_envio     │    │ chat_id (FK)    │
│ fecha_inicio    │    │ leido           │    │ calificacion    │
│ fecha_cierre    │    │ fecha_lectura   │    │ comentario      │
└─────────────────┘    └─────────────────┘    │ fecha_valoracion│
         │                                      └─────────────────┘
         │ 1:N
         │
         ▼
┌─────────────────┐
│ MENSAJES_CHAT   │
├─────────────────┤
│ id (PK)         │
│ chat_id (FK)    │
│ remitente_id(FK)│
│ mensaje         │
│ fecha_envio     │
│ leido           │
│ fecha_lectura   │
└─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ACCIONES_MODERACION│   │SESIONES_USUARIO│
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ moderador_id(FK)│    │ usuario_id (FK) │
│ accion          │    │ token_sesion    │
│ tabla_afectada  │    │ fecha_inicio    │
│ registro_id     │    │ fecha_expiracion│
│ detalles        │    │ ip_address      │
│ fecha_accion    │    │ user_agent      │
└─────────────────┘    │ activa          │
                       └─────────────────┘
```

## 🔗 Relaciones Detalladas

### Usuarios → Items (1:N)
- Un usuario puede ser vendedor de múltiples productos/servicios
- Un producto/servicio pertenece a un solo vendedor

### Items → Categorías (N:1)
- Un producto/servicio pertenece a una categoría
- Una categoría puede tener múltiples productos/servicios

### Items → Ubicaciones (N:1)
- Un producto/servicio tiene una ubicación
- Una ubicación puede tener múltiples productos/servicios

### Items → Item_Imágenes (1:N)
- Un producto/servicio puede tener múltiples imágenes (1-5)
- Una imagen pertenece a un solo producto/servicio

### Items → Servicios (1:1)
- Un item de tipo "servicio" puede tener información adicional
- Un servicio pertenece a un solo item

### Usuarios → Reportes (1:N)
- Un usuario puede reportar múltiples productos/servicios
- Un reporte es hecho por un solo usuario

### Items → Reportes (1:N)
- Un producto/servicio puede tener múltiples reportes
- Un reporte se refiere a un solo producto/servicio

### Reportes → Apelaciones (1:N)
- Un reporte puede tener múltiples apelaciones
- Una apelación se refiere a un solo reporte

### Usuarios → Chats (1:N)
- Un usuario puede participar en múltiples chats
- Un chat involucra múltiples usuarios (comprador y vendedor)

### Chats → Mensajes (1:N)
- Un chat puede tener múltiples mensajes
- Un mensaje pertenece a un solo chat

### Usuarios → Valoraciones (1:N)
- Un usuario puede hacer múltiples valoraciones
- Una valoración es hecha por un solo usuario

### Usuarios → Productos_Guardados (1:N)
- Un usuario puede guardar múltiples productos
- Un producto puede ser guardado por múltiples usuarios

### Usuarios → Sesiones (1:N)
- Un usuario puede tener múltiples sesiones activas
- Una sesión pertenece a un solo usuario

### Usuarios → Acciones_Moderación (1:N)
- Un moderador puede realizar múltiples acciones
- Una acción es realizada por un solo moderador

## 📋 Tipos de Datos Personalizados (ENUMs)

### tipo_usuario
- `comprador`
- `vendedor`
- `moderador`
- `administrador`

### estado_usuario
- `activo`
- `inactivo`
- `suspendido`
- `pendiente_verificacion`

### tipo_item
- `producto`
- `servicio`

### estado_item
- `activo`
- `inactivo`
- `pendiente_revision`
- `rechazado`
- `peligroso`
- `suspendido`

### estado_reporte
- `pendiente`
- `en_revision`
- `resuelto`
- `rechazado`
- `en_apelacion`

### tipo_reporte
- `contenido_inapropiado`
- `producto_prohibido`
- `informacion_falsa`
- `spam`
- `otro`

### estado_chat
- `activo`
- `cerrado`
- `archivado`

## 🎯 Casos de Uso Principales

### 1. Registro y Autenticación
- Usuarios se registran con email único
- Verificación de email requerida
- Recuperación de contraseñas

### 2. Gestión de Productos
- Vendedores publican productos/servicios
- Múltiples imágenes por producto
- Categorización automática
- Estados de moderación

### 3. Sistema de Moderación
- Detección automática de productos peligrosos
- Reportes manuales por usuarios
- Revisión por moderadores
- Sistema de apelaciones

### 4. Comunicación
- Chat entre compradores y vendedores
- Sistema de valoraciones
- Comentarios en valoraciones

### 5. Gestión de Usuarios
- Diferentes roles y permisos
- Activación/desactivación de cuentas
- Auditoría de acciones

## 🔍 Índices Optimizados

### Usuarios
- `idx_usuarios_correo` - Búsqueda por email
- `idx_usuarios_tipo` - Filtrado por tipo de usuario
- `idx_usuarios_estado` - Filtrado por estado

### Items
- `idx_items_vendedor` - Productos por vendedor
- `idx_items_categoria` - Filtrado por categoría
- `idx_items_estado` - Filtrado por estado
- `idx_items_precio` - Filtrado por precio
- `idx_items_ubicacion` - Filtrado por ubicación

### Reportes
- `idx_reportes_item` - Reportes por producto
- `idx_reportes_estado` - Filtrado por estado
- `idx_reportes_fecha` - Filtrado por fecha

### Chat
- `idx_chats_comprador` - Chats por comprador
- `idx_chats_vendedor` - Chats por vendedor
- `idx_mensajes_chat` - Mensajes por chat

## 🚀 Vistas Útiles

### vista_productos_activos
Información completa de productos activos con datos del vendedor y ubicación.

### vista_reportes_pendientes
Reportes que requieren atención de moderadores.

### vista_estadisticas_usuarios
Estadísticas por tipo de usuario y estado.

## 🔧 Triggers Automáticos

### actualizar_fecha_modificacion
Actualiza automáticamente `fecha_actualizacion` en tablas de usuarios e items.

### registrar_accion_moderacion
Registra automáticamente acciones de moderadores para auditoría.

---

**Este diagrama representa la estructura completa de la base de datos diseñada para el Sistema de Ventas Multiempresa, optimizada para pruebas de software.**
