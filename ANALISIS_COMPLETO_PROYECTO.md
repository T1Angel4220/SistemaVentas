# 📊 ANÁLISIS COMPLETO DEL PROYECTO SISTEMA DE VENTAS MULTIEMPRESA

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura Completa de la Base de Datos](#estructura-completa-de-la-base-de-datos)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [API Endpoints](#api-endpoints)
8. [Flujos de Trabajo](#flujos-de-trabajo)

---

## 🎯 RESUMEN EJECUTIVO

**Sistema de Ventas Multiempresa** es una plataforma completa de marketplace que permite:
- Gestión de usuarios con 4 roles diferentes (Comprador, Vendedor, Moderador, Administrador)
- Publicación y gestión de productos y servicios
- Sistema de moderación de contenido
- Sistema de reportes y apelaciones
- Gestión de sesiones de usuario
- Sistema de notificaciones por email
- Interfaz moderna con React y TypeScript

**Stack Tecnológico:**
- **Backend:** Node.js + Express + TypeScript + PostgreSQL
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Autenticación:** JWT (JSON Web Tokens)
- **Base de Datos:** PostgreSQL 8.16+

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Páginas    │  │  Componentes │  │   Servicios  │    │
│  │   (Routes)    │  │     (UI)     │  │     (API)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routes     │  │ Controllers  │  │  Services    │    │
│  │  (Endpoints) │  │  (Business)  │  │  (External)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │ Middlewares  │  │   Utils      │                      │
│  │  (Auth/Val)  │  │ (Validators) │                      │
│  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                          │ SQL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Tablas     │  │   Vistas    │  │  Triggers    │    │
│  │  Principales │  │  (Reports)   │  │ (Auditoría)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Frontend** → Realiza peticiones HTTP a la API
2. **Backend Routes** → Recibe y enruta las peticiones
3. **Middlewares** → Valida autenticación y datos
4. **Controllers** → Ejecuta lógica de negocio
5. **Services** → Servicios externos (JWT, Email, Detección de contenido)
6. **Database** → Almacena y recupera datos
7. **Response** → Retorna datos al frontend

---

## 🗄️ ESTRUCTURA COMPLETA DE LA BASE DE DATOS

### 📊 DIAGRAMA DE RELACIONES

```
usuarios (1) ──────┐
                   │
                   ├───> (*) items (vendedor_id)
                   │
                   ├───> (*) productos_guardados (usuario_id)
                   │
                   ├───> (*) reportes (usuario_reportador_id)
                   │
                   ├───> (*) apelaciones (usuario_apelante_id)
                   │
                   ├───> (*) chats (comprador_id, vendedor_id)
                   │
                   ├───> (*) valoraciones (evaluador_id, evaluado_id)
                   │
                   ├───> (*) acciones_moderacion (moderador_id)
                   │
                   └───> (*) sesiones_usuario (usuario_id)

items (1) ─────────┐
                   │
                   ├───> (*) item_imagenes (item_id)
                   │
                   ├───> (1) servicios (item_id)
                   │
                   ├───> (*) productos_guardados (item_id)
                   │
                   ├───> (*) reportes (item_id)
                   │
                   ├───> (*) apelaciones (item_id)
                   │
                   ├───> (*) chats (item_id)
                   │
                   └───> (*) valoraciones (item_id)

categorias (1) ────> (*) items (categoria_id)
categorias (1) ────> (*) categorias (categoria_padre_id) [Auto-referencia]

ubicaciones (1) ───> (*) items (ubicacion_id)

reportes (1) ──────> (*) apelaciones (reporte_id)
chats (1) ─────────> (*) mensajes_chat (chat_id)
chats (1) ─────────> (*) valoraciones (chat_id)
```

---

### 📋 TABLAS DETALLADAS

#### 1. **usuarios** - Tabla Principal de Usuarios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `cedula` | VARCHAR(20) | UNIQUE, NOT NULL | Cédula de identidad |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre del usuario |
| `apellido` | VARCHAR(100) | NOT NULL | Apellido del usuario |
| `correo` | VARCHAR(255) | UNIQUE, NOT NULL | Email del usuario |
| `telefono` | VARCHAR(20) | NULL | Teléfono de contacto |
| `direccion` | TEXT | NULL | Dirección física |
| `genero` | VARCHAR(10) | CHECK IN ('masculino', 'femenino', 'otro') | Género |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash de contraseña (bcrypt) |
| `tipo_usuario` | tipo_usuario ENUM | NOT NULL, DEFAULT 'comprador' | Rol: comprador, vendedor, moderador, administrador |
| `estado` | estado_usuario ENUM | NOT NULL, DEFAULT 'pendiente_verificacion' | Estado: activo, inactivo, suspendido, pendiente_verificacion |
| `email_verificado` | BOOLEAN | DEFAULT FALSE | Si el email fue verificado |
| `token_verificacion` | VARCHAR(255) | NULL | Token para verificar email |
| `token_recuperacion` | VARCHAR(255) | NULL | Token para recuperar contraseña |
| `fecha_registro` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |
| `fecha_ultimo_acceso` | TIMESTAMP | NULL | Último acceso al sistema |
| `fecha_creacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |
| `fecha_actualizacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de última actualización |

**Índices:**
- `idx_usuarios_correo` en `correo`
- `idx_usuarios_tipo` en `tipo_usuario`
- `idx_usuarios_estado` en `estado`
- `idx_usuarios_cedula` en `cedula`

**Relaciones:**
- `items.vendedor_id` → `usuarios.id`
- `productos_guardados.usuario_id` → `usuarios.id`
- `reportes.usuario_reportador_id` → `usuarios.id`
- `apelaciones.usuario_apelante_id` → `usuarios.id`
- `chats.comprador_id` → `usuarios.id`
- `chats.vendedor_id` → `usuarios.id`
- `valoraciones.evaluador_id` → `usuarios.id`
- `valoraciones.evaluado_id` → `usuarios.id`
- `acciones_moderacion.moderador_id` → `usuarios.id`
- `sesiones_usuario.usuario_id` → `usuarios.id`
- `items.moderador_revision_id` → `usuarios.id`
- `reportes.moderador_resolutor_id` → `usuarios.id`
- `apelaciones.moderador_revisor_id` → `usuarios.id`

---

#### 2. **categorias** - Categorías Jerárquicas de Productos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre de la categoría |
| `descripcion` | TEXT | NULL | Descripción de la categoría |
| `categoria_padre_id` | INTEGER | FOREIGN KEY → categorias.id | ID de categoría padre (NULL = raíz) |
| `nivel` | INTEGER | DEFAULT 0 | Nivel jerárquico (0 = raíz, 1 = subcategoría, etc.) |
| `orden` | INTEGER | DEFAULT 0 | Orden de visualización |
| `activa` | BOOLEAN | DEFAULT TRUE | Si la categoría está activa |
| `fecha_creacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Restricciones:**
- `UNIQUE(nombre, categoria_padre_id)` - Evita nombres duplicados en el mismo nivel

**Relaciones:**
- `categorias.categoria_padre_id` → `categorias.id` (Auto-referencia)
- `items.categoria_id` → `categorias.id`

---

#### 3. **ubicaciones** - Ubicaciones Geográficas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre de la ubicación |
| `provincia` | VARCHAR(100) | NULL | Provincia |
| `canton` | VARCHAR(100) | NULL | Cantón |
| `activa` | BOOLEAN | DEFAULT TRUE | Si la ubicación está activa |
| `fecha_creacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Relaciones:**
- `items.ubicacion_id` → `ubicaciones.id`

---

#### 4. **items** - Productos y Servicios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `codigo` | VARCHAR(50) | UNIQUE, NOT NULL | Código único del producto |
| `nombre` | VARCHAR(200) | NOT NULL | Nombre del producto/servicio |
| `descripcion` | TEXT | NOT NULL | Descripción detallada |
| `precio` | DECIMAL(10, 2) | NOT NULL, CHECK >= 0 | Precio del producto |
| `ubicacion_id` | INTEGER | FOREIGN KEY → ubicaciones.id | ID de ubicación base |
| `ubicacion_provincia` | VARCHAR(100) | NULL | Provincia específica del producto |
| `ubicacion_canton` | VARCHAR(100) | NULL | Cantón específico del producto |
| `ubicacion_distrito` | VARCHAR(100) | NULL | Distrito específico del producto |
| `ubicacion_direccion` | VARCHAR(255) | NULL | Dirección específica |
| `coordenadas` | VARCHAR(50) | NULL | Coordenadas GPS (formato: "lat,lng") |
| `disponibilidad` | BOOLEAN | DEFAULT TRUE | Si está disponible para venta |
| `tipo` | tipo_item ENUM | NOT NULL | Tipo: 'producto' o 'servicio' |
| `estado` | estado_item ENUM | NOT NULL, DEFAULT 'pendiente_revision' | Estado: activo, inactivo, pendiente_revision, rechazado, peligroso, suspendido, en_apelacion |
| `categoria_id` | INTEGER | FOREIGN KEY → categorias.id | ID de categoría |
| `vendedor_id` | INTEGER | FOREIGN KEY → usuarios.id, NOT NULL | ID del vendedor |
| `fecha_publicacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de publicación |
| `fecha_actualizacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de última actualización |
| `fecha_revision` | TIMESTAMP | NULL | Fecha de última revisión por moderador |
| `moderador_revision_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del moderador que revisó |
| `motivo_rechazo` | TEXT | NULL | Motivo de rechazo o suspensión |
| `es_peligroso` | BOOLEAN | DEFAULT FALSE | Si fue detectado como peligroso |
| `fecha_deteccion_peligroso` | TIMESTAMP | NULL | Fecha de detección como peligroso |

**Índices:**
- `idx_items_vendedor` en `vendedor_id`
- `idx_items_categoria` en `categoria_id`
- `idx_items_estado` en `estado`
- `idx_items_tipo` en `tipo`
- `idx_items_precio` en `precio`
- `idx_items_fecha_publicacion` en `fecha_publicacion`
- `idx_items_ubicacion` en `ubicacion_id`
- `idx_items_peligroso` en `es_peligroso`
- `idx_items_provincia` en `ubicacion_provincia`
- `idx_items_canton` en `ubicacion_canton`
- `idx_items_coordenadas` en `coordenadas`

**Relaciones:**
- `items.vendedor_id` → `usuarios.id`
- `items.categoria_id` → `categorias.id`
- `items.ubicacion_id` → `ubicaciones.id`
- `items.moderador_revision_id` → `usuarios.id`
- `item_imagenes.item_id` → `items.id`
- `servicios.item_id` → `items.id`
- `productos_guardados.item_id` → `items.id`
- `reportes.item_id` → `items.id`
- `apelaciones.item_id` → `items.id`
- `chats.item_id` → `items.id`
- `valoraciones.item_id` → `items.id`

---

#### 5. **item_imagenes** - Imágenes de Productos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `item_id` | INTEGER | FOREIGN KEY → items.id, ON DELETE CASCADE | ID del producto |
| `url_imagen` | VARCHAR(500) | NOT NULL | URL o ruta de la imagen |
| `orden` | INTEGER | DEFAULT 1 | Orden de visualización |
| `es_principal` | BOOLEAN | DEFAULT FALSE | Si es la imagen principal |
| `fecha_subida` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de subida |

**Relaciones:**
- `item_imagenes.item_id` → `items.id` (CASCADE DELETE)

---

#### 6. **servicios** - Información Adicional de Servicios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `item_id` | INTEGER | FOREIGN KEY → items.id, ON DELETE CASCADE | ID del item (debe ser tipo 'servicio') |
| `horario_atencion` | TEXT | NOT NULL | Horario de atención (ej: "8:00 AM - 6:00 PM") |
| `dias_disponibles` | VARCHAR(100) | NULL | Días disponibles (ej: "Lunes-Viernes") |
| `duracion_estimada` | VARCHAR(50) | NULL | Duración estimada (ej: "2 horas") |
| `fecha_creacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Relaciones:**
- `servicios.item_id` → `items.id` (CASCADE DELETE)

---

#### 7. **productos_guardados** - Productos Favoritos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `usuario_id` | INTEGER | FOREIGN KEY → usuarios.id, ON DELETE CASCADE | ID del usuario |
| `item_id` | INTEGER | FOREIGN KEY → items.id, ON DELETE CASCADE | ID del producto |
| `fecha_guardado` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha en que se guardó |

**Restricciones:**
- `UNIQUE(usuario_id, item_id)` - Un usuario no puede guardar el mismo producto dos veces

**Relaciones:**
- `productos_guardados.usuario_id` → `usuarios.id` (CASCADE DELETE)
- `productos_guardados.item_id` → `items.id` (CASCADE DELETE)

---

#### 8. **reportes** - Reportes de Productos

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `item_id` | INTEGER | FOREIGN KEY → items.id | ID del producto reportado |
| `usuario_reportador_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del usuario que reporta |
| `tipo_reporte` | tipo_reporte ENUM | NOT NULL | Tipo: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro |
| `descripcion` | TEXT | NULL | Descripción del reporte |
| `comentario_opcional` | TEXT | NULL | Comentario adicional |
| `estado` | estado_reporte ENUM | NOT NULL, DEFAULT 'pendiente' | Estado: pendiente, en_revision, resuelto, rechazado, en_apelacion |
| `fecha_reporte` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha del reporte |
| `fecha_revision` | TIMESTAMP | NULL | Fecha de inicio de revisión |
| `moderador_resolutor_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del moderador que resolvió |
| `decision_final` | TEXT | NULL | Decisión final del moderador |
| `fecha_resolucion` | TIMESTAMP | NULL | Fecha de resolución |

**Índices:**
- `idx_reportes_item` en `item_id`
- `idx_reportes_usuario_reportador` en `usuario_reportador_id`
- `idx_reportes_estado` en `estado`
- `idx_reportes_fecha` en `fecha_reporte`

**Relaciones:**
- `reportes.item_id` → `items.id`
- `reportes.usuario_reportador_id` → `usuarios.id`
- `reportes.moderador_resolutor_id` → `usuarios.id`
- `apelaciones.reporte_id` → `reportes.id`

---

#### 9. **apelaciones** - Apelaciones de Reportes

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `reporte_id` | INTEGER | FOREIGN KEY → reportes.id | ID del reporte apelado |
| `item_id` | INTEGER | FOREIGN KEY → items.id | ID del producto relacionado |
| `usuario_apelante_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del usuario que apela |
| `motivo_apelacion` | TEXT | NOT NULL | Motivo de la apelación |
| `informacion_adicional` | TEXT | NULL | Información adicional |
| `estado` | estado_reporte ENUM | NOT NULL, DEFAULT 'en_apelacion' | Estado: pendiente, en_revision, resuelto, rechazado, en_apelacion |
| `fecha_apelacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de la apelación |
| `fecha_revision_apelacion` | TIMESTAMP | NULL | Fecha de inicio de revisión |
| `moderador_revisor_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del moderador que revisa |
| `decision_apelacion` | TEXT | NULL | Decisión de la apelación |
| `fecha_resolucion_apelacion` | TIMESTAMP | NULL | Fecha de resolución |

**Relaciones:**
- `apelaciones.reporte_id` → `reportes.id`
- `apelaciones.item_id` → `items.id`
- `apelaciones.usuario_apelante_id` → `usuarios.id`
- `apelaciones.moderador_revisor_id` → `usuarios.id`

---

#### 10. **chats** - Conversaciones entre Compradores y Vendedores

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `comprador_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del comprador |
| `vendedor_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del vendedor |
| `item_id` | INTEGER | FOREIGN KEY → items.id | ID del producto sobre el que se conversa |
| `estado` | estado_chat ENUM | DEFAULT 'activo' | Estado: activo, cerrado, archivado |
| `fecha_inicio` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de inicio del chat |
| `fecha_cierre` | TIMESTAMP | NULL | Fecha de cierre del chat |

**Restricciones:**
- `UNIQUE(comprador_id, vendedor_id, item_id)` - Un chat único por comprador-vendedor-producto

**Índices:**
- `idx_chats_comprador` en `comprador_id`
- `idx_chats_vendedor` en `vendedor_id`
- `idx_chats_item` en `item_id`
- `idx_chats_estado` en `estado`

**Relaciones:**
- `chats.comprador_id` → `usuarios.id`
- `chats.vendedor_id` → `usuarios.id`
- `chats.item_id` → `items.id`
- `mensajes_chat.chat_id` → `chats.id`
- `valoraciones.chat_id` → `chats.id`

---

#### 11. **mensajes_chat** - Mensajes del Chat

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `chat_id` | INTEGER | FOREIGN KEY → chats.id, ON DELETE CASCADE | ID del chat |
| `remitente_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del usuario que envía |
| `mensaje` | TEXT | NOT NULL | Contenido del mensaje |
| `fecha_envio` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de envío |
| `leido` | BOOLEAN | DEFAULT FALSE | Si el mensaje fue leído |
| `fecha_lectura` | TIMESTAMP | NULL | Fecha de lectura |

**Índices:**
- `idx_mensajes_chat` en `chat_id`
- `idx_mensajes_fecha` en `fecha_envio`
- `idx_mensajes_leido` en `leido`

**Relaciones:**
- `mensajes_chat.chat_id` → `chats.id` (CASCADE DELETE)
- `mensajes_chat.remitente_id` → `usuarios.id`

---

#### 12. **valoraciones** - Calificaciones y Comentarios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `evaluador_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del usuario que evalúa |
| `evaluado_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del usuario evaluado |
| `item_id` | INTEGER | FOREIGN KEY → items.id | ID del producto relacionado |
| `chat_id` | INTEGER | FOREIGN KEY → chats.id | ID del chat relacionado |
| `calificacion` | INTEGER | CHECK (1 <= calificacion <= 5) | Calificación de 1 a 5 estrellas |
| `comentario` | TEXT | NULL | Comentario de la valoración |
| `fecha_valoracion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de la valoración |

**Índices:**
- `idx_valoraciones_evaluado` en `evaluado_id`
- `idx_valoraciones_item` en `item_id`
- `idx_valoraciones_calificacion` en `calificacion`

**Relaciones:**
- `valoraciones.evaluador_id` → `usuarios.id`
- `valoraciones.evaluado_id` → `usuarios.id`
- `valoraciones.item_id` → `items.id`
- `valoraciones.chat_id` → `chats.id`

---

#### 13. **acciones_moderacion** - Auditoría de Acciones de Moderadores

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `moderador_id` | INTEGER | FOREIGN KEY → usuarios.id | ID del moderador |
| `accion` | VARCHAR(100) | NOT NULL | Tipo de acción (ej: "suspender_usuario", "aprobar_producto") |
| `tabla_afectada` | VARCHAR(50) | NULL | Tabla afectada (ej: "usuarios", "items", "reportes") |
| `registro_id` | INTEGER | NULL | ID del registro afectado |
| `detalles` | TEXT | NULL | Detalles adicionales de la acción |
| `fecha_accion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de la acción |

**Relaciones:**
- `acciones_moderacion.moderador_id` → `usuarios.id`

---

#### 14. **sesiones_usuario** - Sesiones Activas de Usuarios

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Identificador único |
| `usuario_id` | INTEGER | FOREIGN KEY → usuarios.id, ON DELETE CASCADE | ID del usuario |
| `token_sesion` | TEXT | UNIQUE, NOT NULL | Token de sesión (JWT) |
| `fecha_inicio` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de inicio de sesión |
| `fecha_expiracion` | TIMESTAMP | NOT NULL | Fecha de expiración del token |
| `ip_address` | INET | NULL | Dirección IP del cliente |
| `user_agent` | TEXT | NULL | User agent del navegador |
| `activa` | BOOLEAN | DEFAULT TRUE | Si la sesión está activa |

**Relaciones:**
- `sesiones_usuario.usuario_id` → `usuarios.id` (CASCADE DELETE)

---

### 📊 ENUMS (Tipos Personalizados)

#### **tipo_usuario**
- `'comprador'` - Usuario que solo compra
- `'vendedor'` - Usuario que vende productos
- `'moderador'` - Usuario que modera contenido
- `'administrador'` - Usuario con permisos completos

#### **estado_usuario**
- `'activo'` - Usuario activo y puede usar el sistema
- `'inactivo'` - Usuario desactivado
- `'suspendido'` - Usuario suspendido por incumplimiento
- `'pendiente_verificacion'` - Esperando verificación de email

#### **tipo_item**
- `'producto'` - Producto físico
- `'servicio'` - Servicio

#### **estado_item**
- `'activo'` - Producto aprobado y visible
- `'inactivo'` - Producto oculto por el vendedor
- `'pendiente_revision'` - Esperando aprobación
- `'rechazado'` - Rechazado por moderador
- `'peligroso'` - Marcado como peligroso automáticamente
- `'suspendido'` - Suspendido por moderador
- `'en_apelacion'` - En proceso de apelación

#### **estado_reporte**
- `'pendiente'` - Esperando revisión
- `'en_revision'` - En proceso de revisión
- `'resuelto'` - Resuelto por moderador
- `'rechazado'` - Rechazado
- `'en_apelacion'` - En proceso de apelación

#### **tipo_reporte**
- `'contenido_inapropiado'` - Contenido inapropiado
- `'producto_prohibido'` - Producto prohibido
- `'informacion_falsa'` - Información falsa
- `'spam'` - Spam
- `'otro'` - Otro tipo

#### **estado_chat**
- `'activo'` - Chat activo
- `'cerrado'` - Chat cerrado
- `'archivado'` - Chat archivado

---

### 🔍 VISTAS (Views)

#### **vista_productos_activos**
Vista que muestra productos activos con información completa:
- Información del producto
- Categoría
- Vendedor (nombre y email)
- Ubicación
- Total de imágenes

#### **vista_reportes_pendientes**
Vista que muestra reportes pendientes con:
- Tipo de reporte
- Producto reportado
- Usuario que reportó

#### **vista_estadisticas_usuarios**
Vista con estadísticas de usuarios agrupadas por:
- Tipo de usuario
- Estado
- Total de usuarios
- Usuarios verificados

---

### ⚙️ TRIGGERS

#### **trigger_usuarios_actualizacion**
Actualiza automáticamente `fecha_actualizacion` en la tabla `usuarios` cuando se modifica un registro.

#### **trigger_items_actualizacion**
Actualiza automáticamente `fecha_actualizacion` en la tabla `items` cuando se modifica un registro.

---

## 📁 ESTRUCTURA DEL PROYECTO

### Backend (`/backend`)

```
backend/
├── src/
│   ├── app.js                    # Configuración de Express
│   ├── config/
│   │   ├── config.js             # Configuración centralizada
│   │   ├── database.js           # Conexión a PostgreSQL
│   │   ├── database.sql          # Schema completo de BD
│   │   ├── initial_data.sql      # Datos iniciales
│   │   └── setup_database.sql    # Script de instalación
│   ├── controllers/
│   │   ├── authController.js      # Autenticación y usuarios
│   │   ├── productsController.js # Gestión de productos
│   │   ├── categoriesController.js
│   │   ├── locationsController.js
│   │   ├── imageController.js
│   │   ├── savedProductsController.js
│   │   ├── reportsController.js
│   │   └── appealsController.js
│   ├── middlewares/
│   │   ├── auth.js               # Middleware de autenticación
│   │   ├── upload.js             # Manejo de archivos (Multer)
│   │   └── productValidation.js # Validación de productos
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── locations.js
│   │   ├── images.js
│   │   ├── savedProducts.js
│   │   ├── reports.js
│   │   └── appeals.js
│   ├── services/
│   │   ├── jwt.js                # Generación y verificación JWT
│   │   ├── email.js              # Envío de emails (Nodemailer)
│   │   └── contentDetection.js   # Detección de contenido prohibido
│   ├── utils/
│   │   ├── validators.js         # Validadores Joi
│   │   └── geoLocation.js        # Utilidades de geolocalización
│   └── tests/
│       ├── database.test.js
│       ├── testDb.ts
│       └── testMail.ts
├── uploads/                      # Imágenes subidas
├── test/                         # Tests de integración
├── index.ts                      # Punto de entrada
├── package.json
└── .env                          # Variables de entorno
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── App.tsx                   # Componente principal
│   ├── main.tsx                  # Punto de entrada
│   ├── pages/                    # Páginas/Vistas
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductsCatalogPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CreateProductPage.tsx
│   │   ├── MyProductsPage.tsx
│   │   ├── ProductModerationPage.tsx
│   │   ├── UserManagementPage.tsx
│   │   ├── SessionManagementPage.tsx
│   │   ├── ReportsManagementPage.tsx
│   │   ├── AppealsManagementPage.tsx
│   │   └── ...
│   ├── components/
│   │   ├── auth/                 # Componentes de autenticación
│   │   ├── layout/               # Componentes de layout
│   │   ├── products/             # Componentes de productos
│   │   ├── ui/                   # Componentes UI base (shadcn/ui)
│   │   └── modals/               # Modales
│   ├── contexts/
│   │   └── AuthContext.tsx       # Contexto de autenticación
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAlert.ts
│   │   ├── useApiData.ts
│   │   └── usePermissions.ts
│   ├── services/
│   │   ├── api.ts                # Cliente API principal
│   │   └── productsService.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   └── location.types.ts
│   ├── config/
│   │   └── api.ts                # Configuración de endpoints
│   └── utils/
│       ├── sessionAlert.ts
│       └── suspendedAccountAlert.ts
├── e2e/                          # Tests end-to-end (Playwright)
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env
```

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Entorno de ejecución |
| **Express** | 5.1.0 | Framework web |
| **TypeScript** | 5.9.2 | Tipado estático |
| **PostgreSQL** | 8.16+ | Base de datos relacional |
| **pg** | 8.16.3 | Cliente PostgreSQL |
| **JWT** | 9.0.2 | Autenticación |
| **bcrypt** | 6.0.0 | Hash de contraseñas |
| **Joi** | 18.0.1 | Validación de datos |
| **Multer** | 2.0.2 | Manejo de archivos |
| **Nodemailer** | 6.10.1 | Envío de emails |
| **Helmet** | 7.1.0 | Seguridad HTTP headers |
| **CORS** | 2.8.5 | Control de acceso |
| **express-rate-limit** | 7.1.5 | Rate limiting |
| **node-cron** | 4.2.1 | Tareas programadas |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.1 | Biblioteca UI |
| **TypeScript** | 5.8.3 | Tipado estático |
| **Vite** | 7.1.2 | Build tool |
| **Tailwind CSS** | 4.1.13 | Framework CSS |
| **React Router** | 7.8.2 | Enrutamiento |
| **Lucide React** | 0.544.0 | Iconos |
| **Chart.js** | 4.5.0 | Gráficos |
| **jsPDF** | 3.0.3 | Generación de PDFs |
| **Radix UI** | - | Componentes accesibles |
| **Playwright** | 1.56.1 | Tests E2E |

---

## ⚙️ FUNCIONALIDADES PRINCIPALES

### 🔐 Autenticación y Seguridad

1. **Registro de Usuarios**
   - Registro con verificación de email (código de 6 dígitos)
   - Validación de cédula y email únicos
   - Hash de contraseñas con bcrypt (10 rounds)
   - Estados: pendiente_verificacion → activo

2. **Login**
   - Autenticación con email y contraseña
   - Generación de tokens JWT (access + refresh)
   - Validación de estado de cuenta
   - Validación de email verificado
   - Gestión de sesiones múltiples

3. **Recuperación de Contraseña**
   - Solicitud de código de recuperación
   - Validación de código
   - Validación de que la nueva contraseña sea diferente
   - Cierre automático de sesiones al cambiar contraseña

4. **Gestión de Sesiones**
   - Múltiples sesiones por usuario
   - Registro de IP y User Agent
   - Cierre de sesiones individuales o todas
   - Notificación por email de nuevas sesiones

### 👥 Gestión de Usuarios

1. **Roles y Permisos**
   - **Comprador**: Ver productos, guardar favoritos
   - **Vendedor**: + Crear/editar/eliminar productos propios
   - **Moderador**: + Moderar productos, ver reportes
   - **Administrador**: + Gestionar usuarios, todas las funciones

2. **Estados de Usuario**
   - `activo`: Puede usar el sistema
   - `inactivo`: Desactivado
   - `suspendido`: Suspendido por incumplimiento
   - `pendiente_verificacion`: Esperando verificación

3. **Gestión de Usuarios (Admin)**
   - Activar/desactivar usuarios
   - Suspender usuarios
   - Cambiar roles
   - Ver todas las sesiones

### 📦 Gestión de Productos

1. **CRUD de Productos**
   - Crear productos/servicios
   - Editar productos propios
   - Eliminar productos propios
   - Ver catálogo público

2. **Estados de Producto**
   - `pendiente_revision`: Recién creado, esperando aprobación
   - `activo`: Aprobado y visible
   - `inactivo`: Oculto por el vendedor
   - `rechazado`: Rechazado por moderador
   - `peligroso`: Detectado automáticamente como peligroso
   - `suspendido`: Suspendido por moderador
   - `en_apelacion`: En proceso de apelación

3. **Características**
   - Múltiples imágenes (hasta 5)
   - Categorización jerárquica
   - Ubicación geográfica (Provincia, Cantón, Distrito, Dirección, Coordenadas)
   - Precio y disponibilidad
   - Detección automática de contenido prohibido

### 🛡️ Moderación de Contenido

1. **Detección Automática**
   - Detección de palabras prohibidas (armas, drogas, etc.)
   - Clasificación por nivel de riesgo (alto, medio, bajo)
   - Marcado automático como "peligroso" si es alto riesgo
   - Bloqueo automático de cuenta si tiene 3+ productos peligrosos

2. **Panel de Moderación**
   - Ver productos pendientes de revisión
   - Aprobar/rechazar productos
   - Suspender productos
   - Ver historial de moderación
   - Paginación inteligente

3. **Sistema de Reportes**
   - Usuarios pueden reportar productos
   - Tipos: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro
   - Estados: pendiente, en_revision, resuelto, rechazado, en_apelacion
   - Moderadores pueden resolver reportes

4. **Sistema de Apelaciones**
   - Vendedores pueden apelar reportes
   - Moderadores revisan apelaciones
   - Decisión final sobre apelación

### 📧 Sistema de Notificaciones

1. **Emails Enviados**
   - Verificación de email (código de 6 dígitos)
   - Recuperación de contraseña (código)
   - Notificación de nueva sesión
   - Cambio de estado de producto
   - Suspensión de cuenta
   - Reactivación de cuenta
   - Bloqueo por productos peligrosos

### 🗺️ Geolocalización

1. **Ubicaciones**
   - Provincias, Cantones, Distritos
   - Direcciones específicas
   - Coordenadas GPS (lat, lng)
   - Filtrado por proximidad

---

## 🔌 API ENDPOINTS

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/logout` | Cerrar sesión | Sí |
| POST | `/verify-email` | Verificar email con código | No |
| POST | `/resend-verification-code` | Reenviar código | No |
| POST | `/forgot-password` | Solicitar recuperación | No |
| POST | `/reset-password` | Restablecer contraseña | No |
| GET | `/profile` | Obtener perfil | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |
| GET | `/users` | Listar usuarios (Admin) | Sí |
| POST | `/register-moderator` | Registrar moderador (Admin) | Sí |
| PUT | `/activate-user/:userId` | Activar usuario | Sí (Mod/Admin) |
| PUT | `/suspend-user/:userId` | Suspender usuario | Sí (Mod/Admin) |
| GET | `/sessions` | Obtener sesiones | Sí |
| DELETE | `/sessions/:sessionId` | Cerrar sesión | Sí |

### Productos (`/api/products`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar productos | No |
| GET | `/:id` | Obtener producto | No |
| GET | `/view/:id` | Vista pública | No |
| GET | `/my-products` | Mis productos | Sí (Vendedor) |
| POST | `/` | Crear producto | Sí (Vendedor) |
| PUT | `/:id` | Actualizar producto | Sí (Vendedor) |
| DELETE | `/:id` | Eliminar producto | Sí (Vendedor) |
| PUT | `/:id/status` | Cambiar estado | Sí (Moderador) |
| GET | `/pending-moderation` | Pendientes | Sí (Moderador) |

### Reportes (`/api/reports`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/products/:id/report` | Reportar producto | Sí |
| GET | `/` | Listar reportes | Sí (Moderador) |
| PUT | `/:id/resolve` | Resolver reporte | Sí (Moderador) |

### Apelaciones (`/api/appeals`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/products/:id/appeal` | Apelar reporte | Sí (Vendedor) |
| GET | `/` | Listar apelaciones | Sí (Moderador) |
| PUT | `/:id/resolve` | Resolver apelación | Sí (Moderador) |

---

## 🔄 FLUJOS DE TRABAJO

### Flujo de Registro

1. Usuario completa formulario de registro
2. Backend valida datos (Joi)
3. Verifica que email y cédula no existan
4. Hash de contraseña (bcrypt)
5. Genera token de verificación (JWT)
6. Inserta usuario con estado `pendiente_verificacion`
7. Envía email con código de 6 dígitos
8. Usuario ingresa código
9. Backend verifica código
10. Actualiza estado a `activo` y `email_verificado = true`

### Flujo de Creación de Producto

1. Vendedor completa formulario
2. Backend valida datos
3. Detecta contenido inadecuado
4. Si es peligroso → estado `peligroso`
5. Si no → estado `pendiente_revision`
6. Crea producto en BD
7. Si es servicio → crea registro en `servicios`
8. Sube imágenes → crea registros en `item_imagenes`
9. Si es peligroso → verifica si debe bloquear cuenta (3+ peligrosos)
10. Retorna respuesta con estado

### Flujo de Moderación

1. Moderador ve productos pendientes
2. Selecciona producto para revisar
3. Puede:
   - Aprobar → estado `activo`
   - Rechazar → estado `rechazado` + motivo
   - Suspender → estado `suspendido` + motivo
4. Se registra acción en `acciones_moderacion`
5. Se envía email al vendedor con el cambio de estado

### Flujo de Reporte

1. Usuario reporta producto
2. Se crea registro en `reportes` con estado `pendiente`
3. Moderador ve reporte
4. Puede:
   - Resolver → estado `resuelto` + decisión
   - Rechazar → estado `rechazado`
5. Vendedor puede apelar → crea registro en `apelaciones`
6. Moderador revisa apelación y toma decisión final

---

## 📝 NOTAS IMPORTANTES

### Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con expiración (1h access, 7d refresh)
- Validación de datos con Joi
- Rate limiting (temporalmente deshabilitado)
- CORS configurado
- Headers de seguridad con Helmet

### Base de Datos

- Nombres de tablas y columnas en español
- Uso de snake_case para columnas
- Triggers para auditoría automática
- Vistas para reportes
- Índices para optimización

### Código

- Backend: JavaScript/TypeScript con Express
- Frontend: TypeScript con React
- Validación en backend y frontend
- Manejo de errores centralizado
- Logging de operaciones importantes

---

## 🎯 CONCLUSIÓN

Este proyecto es un sistema completo y robusto de marketplace con:
- ✅ Arquitectura bien estructurada
- ✅ Base de datos normalizada y optimizada
- ✅ Sistema de autenticación seguro
- ✅ Moderación de contenido automatizada
- ✅ Interfaz moderna y responsive
- ✅ Sistema de notificaciones por email
- ✅ Gestión completa de sesiones
- ✅ Sistema de reportes y apelaciones

El sistema está listo para pruebas de software y desarrollo continuo.

---

**Fecha de Análisis:** 2024
**Versión del Sistema:** 1.0.0

