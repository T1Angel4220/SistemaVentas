# Estructura Final del Backend - Sistema de Ventas Multiempresa

## 📁 Organización de Archivos

### **Raíz del Backend**
```
backend/
├── index.ts                    # Punto de entrada del servidor
├── package.json                # Dependencias y scripts
├── package-lock.json          # Lock de dependencias
├── .env                       # Variables de entorno
├── ESTRUCTURA_FINAL.md        # Este archivo
└── scripts/                   # Scripts de instalación
    ├── install_database.bat   # Instalación Windows
    └── install_database.sh    # Instalación Linux/Mac
```

### **Carpeta `src/` - Código Fuente**
```
src/
├── app.js                     # Configuración de Express
├── config/                    # Configuración del sistema
│   ├── config.js             # Configuración centralizada
│   ├── database.js           # Configuración de BD
│   ├── jwt.js                # Configuración de JWT
│   ├── email.js              # Configuración de email
│   ├── database.sql          # Esquema de BD
│   ├── initial_data.sql      # Datos iniciales
│   ├── setup_database.sql    # Script de instalación
│   ├── README_DATABASE.md    # Documentación de BD
│   ├── README_CONFIG.md      # Documentación de configuración
│   └── DATABASE_DIAGRAM.md   # Diagrama de BD
├── controllers/              # Controladores de lógica de negocio
│   └── authController.js     # Controlador de autenticación
├── middlewares/              # Middlewares de Express
│   └── auth.js               # Middlewares de autenticación
├── models/                   # Modelos de datos (vacío - usando SQL directo)
├── routes/                   # Rutas de la API
│   └── auth.js               # Rutas de autenticación
├── services/                 # Servicios de negocio (vacío)
├── utils/                    # Utilidades y helpers
│   └── validators.js         # Esquemas de validación
└── tests/                    # Pruebas del sistema
    ├── testDb.ts             # Pruebas de base de datos
    ├── testMail.ts           # Pruebas de email
    └── database.test.js      # Pruebas completas de BD
```

## 🔧 Configuración Centralizada

### **Consumo del `.env`**
Todas las variables de entorno se consumen a través de `src/config/config.js`:

```javascript
const { config } = require('./config');

// Servidor
const PORT = config.server.port;           // 3001
const NODE_ENV = config.server.nodeEnv;    // development

// Base de datos
const dbHost = config.database.host;       // localhost
const dbPort = config.database.port;       // 5432
const dbName = config.database.name;       // sistema_ventas_multiempresa
const dbUser = config.database.user;       // postgres
const dbPassword = config.database.password; // Angel_4220

// JWT
const jwtSecret = config.jwt.secret;       // supersecretkey
const jwtExpires = config.jwt.expiresIn;   // 1h

// Email
const emailHost = config.email.host;       // smtp.gmail.com
const emailUser = config.email.user;       // eventconnect90@gmail.com
const emailPass = config.email.password;   // oshzkgssiwxfdiqr
```

## 🚀 Funcionalidades Implementadas

### **Autenticación Completa**
- ✅ Registro de usuarios con validación de email
- ✅ Login con JWT tokens
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Middlewares de autenticación y autorización
- ✅ Validación de roles (comprador, vendedor, moderador, administrador)

### **Base de Datos**
- ✅ Esquema completo con 15 tablas
- ✅ Datos de prueba para testing
- ✅ Índices optimizados
- ✅ Triggers de auditoría
- ✅ Vistas útiles para reportes
- ✅ Integridad referencial

### **Email**
- ✅ Configuración SMTP con Gmail
- ✅ Templates de email profesionales
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Notificaciones de moderación

### **Validaciones**
- ✅ Esquemas Joi para todos los endpoints
- ✅ Validación de entrada y parámetros
- ✅ Mensajes de error personalizados

## 📊 Scripts Disponibles

```bash
# Pruebas
npm test                    # Todas las pruebas
npm run test:db           # Solo pruebas de BD
npm run test:mail         # Solo pruebas de email
npm run test:full         # Pruebas completas de BD

# Servidor
npm start                 # Iniciar servidor
npm run dev              # Modo desarrollo
```

## 🔍 Endpoints Disponibles

### **Autenticación (`/api/auth`)**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/verify-email` - Verificar email
- `POST /api/auth/request-password-reset` - Solicitar recuperación
- `POST /api/auth/reset-password` - Resetear contraseña
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `GET /api/auth/test` - Probar autenticación

### **Documentación**
- `GET /` - Información básica de la API
- `GET /api/docs` - Documentación completa

## 🧪 Datos de Prueba

### **Usuarios**
- **Administrador**: `admin@sistemaventas.com`
- **Moderadores**: `maria.moderador@sistemaventas.com`, `carlos.moderador@sistemaventas.com`
- **Vendedores**: `ana.vendedor@sistemaventas.com`, `luis.vendedor@sistemaventas.com`, etc.
- **Compradores**: `sofia.comprador@sistemaventas.com`, `diego.comprador@sistemaventas.com`, etc.

### **Productos y Servicios**
- 16 productos en diferentes categorías
- 4 servicios profesionales
- Estados variados para testing
- Reportes y apelaciones de prueba

## 🔒 Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT tokens seguros
- ✅ Validación de entrada
- ✅ Rate limiting básico
- ✅ CORS configurado
- ✅ Headers de seguridad
- ✅ Auditoría de acciones

## 📈 Próximos Pasos

### **Controladores Pendientes**
- `productController.js` - CRUD de productos/servicios
- `reportController.js` - Gestión de reportes
- `chatController.js` - Sistema de chat
- `moderationController.js` - Panel de moderación

### **Servicios Pendientes**
- `productService.js` - Lógica de productos
- `emailService.js` - Servicios de email
- `moderationService.js` - Servicios de moderación
- `notificationService.js` - Sistema de notificaciones

### **Rutas Pendientes**
- `/api/products` - Gestión de productos
- `/api/reports` - Sistema de reportes
- `/api/chat` - Chat entre usuarios
- `/api/moderation` - Panel de moderación

## 🎯 Para Pruebas de Software

El sistema está completamente preparado para pruebas de software con:

1. **Datos consistentes** y relacionados correctamente
2. **Estados variados** para probar diferentes escenarios
3. **Casos edge** como productos peligrosos y apelaciones
4. **Integridad referencial** validada
5. **Performance optimizada** con índices
6. **Auditoría completa** para rastrear cambios
7. **API REST** completa y documentada
8. **Autenticación robusta** con JWT
9. **Validaciones exhaustivas** con Joi
10. **Configuración centralizada** y segura

---

**El backend está completamente organizado y listo para desarrollo y pruebas de software.**
