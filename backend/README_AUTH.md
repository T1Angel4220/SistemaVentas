# Sistema de Autenticación y Gestión de Usuarios

## 📋 Descripción

Este módulo implementa el **Sistema de Autenticación y Gestión de Usuarios** según los requerimientos de la PERSONA 1. Incluye todas las funcionalidades especificadas para el manejo completo de usuarios, autenticación, autorización y gestión de sesiones.

## 🚀 Funcionalidades Implementadas

### 1.1 Sistema de Login/Registro

#### ✅ Registro de Usuarios
- **Compradores y vendedores** pueden registrarse
- **Validación de email** existente y válido
- **Verificación de cuenta** por email automática
- **Encriptación de contraseñas** con bcrypt
- **Validación completa** de datos de entrada

#### ✅ Sistema de Login
- **Login con email y contraseña**
- **Verificación de credenciales** segura
- **Generación de tokens JWT** para sesiones
- **Validación de estado** de cuenta (activo/inactivo)
- **Verificación de email** confirmado

#### ✅ Recuperación de Contraseña
- **Solicitud de recuperación** por email
- **Tokens seguros** con expiración de 1 hora
- **Reset de contraseña** con validación
- **Invalidación de sesiones** al cambiar contraseña

### 1.2 Gestión de Roles

#### ✅ Registro de Moderadores
- **Solo administradores** pueden registrar moderadores
- **Validación de permisos** por rol
- **Registro seguro** con verificación de email

#### ✅ Activación/Desactivación de Cuentas
- **Moderadores y administradores** pueden activar/desactivar cuentas
- **Notificaciones por email** automáticas
- **Auditoría completa** de acciones
- **Protección de administradores** (no pueden ser desactivados)

#### ✅ Suspensión de Cuentas
- **Suspensión temporal** por moderadores
- **Invalidación automática** de sesiones
- **Notificaciones de estado** por email
- **Registro de motivos** de suspensión

#### ✅ Gestión de Sesiones Activas
- **Múltiples sesiones** por usuario
- **Control de sesiones activas** en base de datos
- **Invalidación selectiva** de sesiones
- **Notificaciones de nuevas sesiones** por email

### 1.3 Base de Datos

#### ✅ Tabla `usuarios`
```sql
- id (PK)
- cedula (UNIQUE)
- nombre, apellido
- correo (UNIQUE)
- telefono, direccion, genero
- password_hash (bcrypt)
- tipo_usuario (ENUM)
- estado (ENUM)
- email_verificado (BOOLEAN)
- token_verificacion, token_recuperacion
- fechas de registro y acceso
```

#### ✅ Tabla `sesiones_usuario`
```sql
- id (PK)
- usuario_id (FK)
- token_sesion (UNIQUE)
- fecha_inicio, fecha_expiracion
- ip_address, user_agent
- activa (BOOLEAN)
```

#### ✅ ENUMs Implementados
- `tipo_usuario`: comprador, vendedor, moderador, administrador
- `estado_usuario`: activo, inactivo, suspendido, pendiente_verificacion

#### ✅ Índices Optimizados
- `idx_usuarios_correo` - Búsqueda por email
- `idx_usuarios_tipo` - Filtrado por tipo
- `idx_usuarios_estado` - Filtrado por estado
- `idx_usuarios_cedula` - Búsqueda por cédula

#### ✅ Triggers de Auditoría
- **Actualización automática** de fechas de modificación
- **Registro de acciones** de moderación
- **Auditoría completa** de cambios

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Servidor
PORT=3001
NODE_ENV=development
HOST=localhost

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_app
```

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Configurar base de datos
npm run setup:db

# 4. Ejecutar pruebas
npm test
```

## 📚 API Endpoints

### Rutas Públicas

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "cedula": "123456789",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@ejemplo.com",
  "telefono": "8888-8888",
  "direccion": "San José, Costa Rica",
  "genero": "masculino",
  "password": "password123",
  "tipo_usuario": "comprador"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "juan@ejemplo.com",
  "password": "password123"
}
```

#### Verificación de Email
```http
GET /api/auth/verify-email?token=verification_token
```

#### Recuperación de Contraseña
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "correo": "juan@ejemplo.com"
}
```

#### Reset de Contraseña
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "nueva_password123"
}
```

### Rutas Protegidas

#### Obtener Perfil
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Probar Autenticación
```http
GET /api/auth/test
Authorization: Bearer <token>
```

### Rutas de Administración

#### Registrar Moderador (Solo Admin)
```http
POST /api/auth/register-moderator
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "cedula": "987654321",
  "nombre": "María",
  "apellido": "González",
  "correo": "maria@moderador.com",
  "password": "password123",
  "tipo_usuario": "moderador"
}
```

#### Activar Usuario (Moderador/Admin)
```http
PUT /api/auth/activate-user/:userId
Authorization: Bearer <moderator_token>
Content-Type: application/json

{
  "motivo": "Usuario verificado correctamente"
}
```

#### Desactivar Usuario (Moderador/Admin)
```http
PUT /api/auth/deactivate-user/:userId
Authorization: Bearer <moderator_token>
Content-Type: application/json

{
  "motivo": "Violación de términos de servicio"
}
```

#### Suspender Usuario (Moderador/Admin)
```http
PUT /api/auth/suspend-user/:userId
Authorization: Bearer <moderator_token>
Content-Type: application/json

{
  "motivo": "Comportamiento inapropiado"
}
```

#### Gestión de Sesiones
```http
# Obtener sesiones activas
GET /api/auth/sessions
Authorization: Bearer <token>

# Cerrar sesión específica
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer <token>
```

## 🔒 Seguridad Implementada

### Autenticación
- ✅ **JWT tokens** con expiración configurable
- ✅ **Refresh tokens** para renovación de sesiones
- ✅ **Encriptación bcrypt** para contraseñas
- ✅ **Verificación de email** obligatoria
- ✅ **Tokens de recuperación** con expiración

### Autorización
- ✅ **Middleware de autenticación** en todas las rutas protegidas
- ✅ **Control de roles** (comprador, vendedor, moderador, administrador)
- ✅ **Permisos granulares** por endpoint
- ✅ **Protección de recursos** por propiedad

### Validación
- ✅ **Validación Joi** en todos los endpoints
- ✅ **Sanitización de entrada** automática
- ✅ **Mensajes de error** personalizados
- ✅ **Validación de tipos** de datos

### Rate Limiting
- ✅ **Límite general** de 100 requests por 15 minutos
- ✅ **Límite de autenticación** de 5 intentos por 15 minutos
- ✅ **Protección contra ataques** de fuerza bruta

### Auditoría
- ✅ **Registro de acciones** de moderación
- ✅ **Trazabilidad completa** de cambios
- ✅ **Logs de seguridad** automáticos
- ✅ **Notificaciones por email** de actividades

## 🧪 Pruebas

### Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Solo pruebas de base de datos
npm run test:db

# Solo pruebas de email
npm run test:mail

# Pruebas completas
npm run test:full
```

### Tipos de Pruebas
1. **Conexión a base de datos**
2. **Encriptación de contraseñas**
3. **Generación de tokens JWT**
4. **Consultas de usuarios y sesiones**
5. **Integridad referencial**
6. **Índices y triggers**
7. **Servicio de email**
8. **Endpoints de autenticación**

## 📊 Datos de Prueba

### Usuarios de Prueba
- **Administrador**: `admin@sistemaventas.com`
- **Moderadores**: `maria.moderador@sistemaventas.com`, `carlos.moderador@sistemaventas.com`
- **Vendedores**: `ana.vendedor@sistemaventas.com`, `luis.vendedor@sistemaventas.com`
- **Compradores**: `sofia.comprador@sistemaventas.com`, `diego.comprador@sistemaventas.com`

### Contraseñas de Prueba
Todas las contraseñas de prueba son: `password123`

## 🚀 Uso

### Iniciar Servidor
```bash
# Modo producción
npm start

# Modo desarrollo
npm run dev
```

### Documentación de API
- **URL**: `http://localhost:3001/api/docs`
- **Formato**: JSON
- **Autenticación**: Bearer Token

## 📝 Notas Importantes

1. **Configuración de Email**: Necesitas configurar Gmail con contraseña de aplicación
2. **Base de Datos**: Asegúrate de que PostgreSQL esté ejecutándose
3. **Variables de Entorno**: Configura todas las variables requeridas en `.env`
4. **Seguridad**: Cambia todas las contraseñas por defecto en producción
5. **Logs**: Revisa los logs para debugging y monitoreo

---

**El sistema de autenticación está completamente implementado y listo para uso en pruebas de software.**

