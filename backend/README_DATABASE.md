# Base de Datos - Sistema de Ventas Multiempresa

## 📋 Descripción General

Esta base de datos está diseñada específicamente para el Sistema de Ventas Multiempresa y está optimizada para pruebas de software. Incluye todas las funcionalidades requeridas según los documentos de especificación.

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### 👥 Gestión de Usuarios
- **`usuarios`**: Almacena información de todos los usuarios del sistema
  - Roles: `comprador`, `vendedor`, `moderador`, `administrador`
  - Estados: `activo`, `inactivo`, `suspendido`, `pendiente_verificacion`
  - Campos: cédula, nombre, apellido, correo, teléfono, dirección, género

#### 🛍️ Gestión de Productos/Servicios
- **`items`**: Productos y servicios publicados
  - Tipos: `producto`, `servicio`
  - Estados: `activo`, `inactivo`, `pendiente_revision`, `rechazado`, `peligroso`, `suspendido`
- **`item_imagenes`**: Múltiples imágenes por producto (1-5 como especifica)
- **`servicios`**: Información específica de servicios (horarios, duración)
- **`categorias`**: Categorización de productos
- **`ubicaciones`**: Ubicaciones geográficas para filtrado

#### 📊 Gestión de Reportes y Moderación
- **`reportes`**: Reportes e incidencias sobre productos
  - Tipos: `contenido_inapropiado`, `producto_prohibido`, `informacion_falsa`, `spam`, `otro`
  - Estados: `pendiente`, `en_revision`, `resuelto`, `rechazado`, `en_apelacion`
- **`apelaciones`**: Apelaciones de vendedores sobre decisiones
- **`acciones_moderacion`**: Auditoría de acciones de moderadores

#### 💬 Sistema de Chat y Valoraciones
- **`chats`**: Conversaciones entre compradores y vendedores
- **`mensajes_chat`**: Mensajes individuales del chat
- **`valoraciones`**: Calificaciones y comentarios entre usuarios

#### 🔐 Seguridad y Sesiones
- **`sesiones_usuario`**: Gestión de sesiones activas
- **`productos_guardados`**: Productos marcados como favoritos

## 🚀 Instalación y Configuración

### Prerrequisitos
- PostgreSQL 12 o superior
- Node.js 18 o superior
- npm o yarn

### Instalación Automática (Windows)
```bash
# Ejecutar el script de instalación
cd backend
scripts/install_database.bat
```

### Instalación Manual
```bash
# 1. Crear la base de datos
psql -U postgres -f src/config/setup_database.sql

# 2. Crear tablas y estructura
psql -U postgres -d sistema_ventas_multiempresa -f src/config/database.sql

# 3. Insertar datos iniciales
psql -U postgres -d sistema_ventas_multiempresa -f src/config/initial_data.sql

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

## 🧪 Datos de Prueba Incluidos

### Usuarios de Prueba
- **Administrador**: `admin@sistemaventas.com`
- **Moderadores**: `maria.moderador@sistemaventas.com`, `carlos.moderador@sistemaventas.com`
- **Vendedores**: `ana.vendedor@sistemaventas.com`, `luis.vendedor@sistemaventas.com`, etc.
- **Compradores**: `sofia.comprador@sistemaventas.com`, `diego.comprador@sistemaventas.com`, etc.

### Productos de Prueba
- **Electrónicos**: iPhone 13 Pro Max, MacBook Air M1, Samsung Galaxy S21, iPad Pro
- **Hogar**: Sofá, Mesa de comedor, Refrigeradora Samsung
- **Ropa**: Vestido de noche, Traje de hombre, Zapatos deportivos Nike
- **Deportes**: Bicicleta de montaña, Set de pesas, Raqueta de tenis
- **Libros**: Libros de programación, novelas, libros de cocina

### Servicios de Prueba
- Clases de guitarra
- Servicio de limpieza
- Reparación de computadoras
- Clases de inglés

## 🔍 Funcionalidades Implementadas

### ✅ Gestión de Usuarios
- [x] Registro con validación de email
- [x] Recuperación de contraseñas
- [x] Roles diferenciados (comprador, vendedor, moderador, administrador)
- [x] Estados de usuario (activo, inactivo, suspendido, pendiente_verificacion)
- [x] Activación/desactivación de cuentas por moderadores

### ✅ Gestión de Productos/Servicios
- [x] CRUD completo de productos y servicios
- [x] Múltiples imágenes por producto (1-5)
- [x] Categorización y filtrado por categoría
- [x] Filtrado por precio y ubicación
- [x] Estados de visualización
- [x] Detección automática de productos peligrosos
- [x] Productos marcados como "interesados" (favoritos)

### ✅ Sistema de Moderación
- [x] Detección automática de productos prohibidos
- [x] Reportes por parte de compradores y moderadores
- [x] Revisión manual por moderadores
- [x] Sistema de apelaciones
- [x] Auditoría de acciones de moderación
- [x] Suspensión de productos peligrosos (no eliminables)

### ✅ Sistema de Chat y Valoraciones
- [x] Chat entre compradores y vendedores
- [x] Sistema de valoraciones (1-5 estrellas)
- [x] Comentarios en valoraciones
- [x] Estados de chat (activo, cerrado, archivado)

### ✅ Funcionalidades Adicionales
- [x] Definición de ubicación de productos
- [x] Filtrado por ubicación
- [x] Gestión de sesiones de usuario
- [x] Triggers para auditoría automática
- [x] Vistas útiles para reportes

## 🧪 Pruebas de Software

### Ejecutar Pruebas de Base de Datos
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas de base de datos
node src/tests/database.test.js
```

### Tipos de Pruebas Incluidas
1. **Conexión a la base de datos**
2. **Verificación de tablas principales**
3. **Validación de datos iniciales**
4. **Verificación de usuarios de prueba**
5. **Validación de productos y servicios**
6. **Integridad referencial**
7. **Verificación de índices**
8. **Validación de vistas**
9. **Verificación de triggers**
10. **Estado general del sistema**

### Datos para Pruebas Externas
La base de datos incluye datos específicamente diseñados para pruebas con software externo:

- **Usuarios con diferentes roles y estados**
- **Productos en diferentes estados de moderación**
- **Reportes en diferentes fases de resolución**
- **Chats activos y cerrados**
- **Valoraciones existentes**
- **Productos marcados como peligrosos**
- **Apelaciones pendientes**

## 📊 Vistas Útiles para Reportes

### `vista_productos_activos`
Muestra todos los productos activos con información completa del vendedor y ubicación.

### `vista_reportes_pendientes`
Lista todos los reportes que requieren atención de moderadores.

### `vista_estadisticas_usuarios`
Estadísticas por tipo de usuario y estado.

## 🔧 Mantenimiento

### Limpiar Datos de Prueba
```javascript
const { cleanTestData } = require('./src/config/database');
await cleanTestData();
```

### Restaurar Datos de Prueba
```javascript
const { restoreTestData } = require('./src/config/database');
await restoreTestData();
```

### Verificar Estado de la Base de Datos
```javascript
const { getDatabaseStatus } = require('./src/config/database');
const status = await getDatabaseStatus();
console.log(status);
```

## 📝 Notas para Pruebas de Software

1. **Datos Consistentes**: Todos los datos de prueba están relacionados correctamente
2. **Estados Variados**: Incluye productos en todos los estados posibles
3. **Casos Edge**: Incluye productos peligrosos, reportes en apelación, etc.
4. **Integridad**: Todas las relaciones foreign key están validadas
5. **Performance**: Índices optimizados para consultas frecuentes
6. **Auditoría**: Triggers automáticos para rastrear cambios
7. **Escalabilidad**: Estructura preparada para múltiples empresas

## 🚨 Consideraciones de Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens de verificación y recuperación
- Auditoría de acciones de moderación
- Validación de tipos de datos con ENUMs
- Constraints de integridad referencial
- Índices optimizados para consultas seguras

## 📞 Soporte

Para problemas con la base de datos:
1. Verificar que PostgreSQL esté ejecutándose
2. Revisar las credenciales en `.env`
3. Ejecutar las pruebas de base de datos
4. Consultar los logs del servidor

---

**Desarrollado para la materia de Gestión e Implementación de Pruebas en el Software**
