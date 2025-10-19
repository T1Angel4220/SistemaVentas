# 🛒 Sistema de Ventas Multiempresa

<div align="center">

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-ISC-green)

Sistema completo de gestión de productos y marketplace con autenticación, moderación de contenido y roles de usuario.

[Características](#-características-principales) • [Instalación](#-instalación) • [Configuración](#-configuración) • [Documentación](#-documentación)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Roles y Permisos](#-roles-y-permisos)
- [API Endpoints](#-api-endpoints)
- [Estructura de la Base de Datos](#-estructura-de-la-base-de-datos)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 📖 Descripción

Sistema de ventas multiempresa diseñado para gestionar un marketplace completo donde vendedores pueden publicar productos y servicios, compradores pueden buscar y contactar vendedores, y moderadores/administradores pueden gestionar el contenido de la plataforma.

### 🎯 Objetivo del Proyecto

Proporcionar una plataforma robusta y escalable para la gestión de productos con:
- Sistema de autenticación y autorización basado en roles
- Moderación de contenido para garantizar productos seguros
- Gestión completa de productos e imágenes
- Sistema de notificaciones por email
- Interfaz moderna y responsive

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- ✅ Registro de usuarios con verificación de email (código de 6 dígitos)
- ✅ Login con JWT (JSON Web Tokens)
- ✅ Recuperación de contraseña con código de verificación
- ✅ Validación de contraseña nueva (no puede ser igual a la anterior)
- ✅ Hash de contraseñas con bcrypt
- ✅ Protección contra ataques de fuerza bruta (rate limiting)
- ✅ Gestión de sesiones de usuario
- ✅ Cierre de sesión automático al cambiar contraseña

### 👥 Gestión de Usuarios
- ✅ 4 roles de usuario: Comprador, Vendedor, Moderador, Administrador
- ✅ Sistema de permisos basado en roles
- ✅ Perfil de usuario editable
- ✅ Estados de cuenta: Activo, Inactivo, Suspendido, Pendiente de Verificación
- ✅ Panel de gestión de usuarios (solo admin)
- ✅ Gestión de sesiones activas

### 📦 Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Soporte para productos físicos y servicios
- ✅ Múltiples imágenes por producto (hasta 5)
- ✅ Categorización jerárquica de productos
- ✅ Ubicaciones geográficas (Provincia, Cantón, Distrito)
- ✅ Estados de producto: Activo, Inactivo, Pendiente Revisión, Rechazado, Peligroso, Suspendido
- ✅ Búsqueda y filtrado avanzado
- ✅ Sistema de productos guardados/favoritos
- ✅ Validación de contenido prohibido (armas, drogas, etc.)

### 🛡️ Moderación de Contenido
- ✅ Panel de moderación para revisar productos
- ✅ Aprobación/rechazo de productos
- ✅ Detección automática de contenido peligroso
- ✅ Historial de moderación
- ✅ Notificaciones a vendedores sobre el estado de sus productos
- ✅ Paginación inteligente de productos a moderar

### 📧 Sistema de Notificaciones
- ✅ Envío de emails para verificación de cuenta
- ✅ Emails de recuperación de contraseña
- ✅ Notificaciones de cambio de estado de productos
- ✅ Reenvío de códigos de verificación

### 🎨 Interfaz de Usuario
- ✅ Diseño moderno y responsive con Tailwind CSS
- ✅ Componentes reutilizables con shadcn/ui
- ✅ Navegación intuitiva con React Router
- ✅ Formularios con validación en tiempo real
- ✅ Alertas y notificaciones visuales
- ✅ Carga de imágenes con preview
- ✅ Galerías de imágenes interactivas
- ✅ Paginación visual mejorada

---

## 🚀 Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 18+ | Entorno de ejecución |
| **Express** | 5.1.0 | Framework web |
| **TypeScript** | 5.9.2 | Tipado estático |
| **PostgreSQL** | 8.16+ | Base de datos relacional |
| **JWT** | 9.0.2 | Autenticación y autorización |
| **bcrypt** | 6.0.0 | Hash de contraseñas |
| **Joi** | 18.0.1 | Validación de datos |
| **Multer** | 2.0.2 | Manejo de archivos/imágenes |
| **Nodemailer** | 6.10.1 | Envío de emails |
| **Helmet** | 7.1.0 | Seguridad HTTP headers |
| **CORS** | 2.8.5 | Control de acceso entre dominios |
| **Rate Limit** | 7.1.5 | Protección contra ataques |

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 19.1.1 | Biblioteca UI |
| **TypeScript** | 5.8.3 | Tipado estático |
| **Vite** | 7.1.2 | Build tool y dev server |
| **Tailwind CSS** | 4.1.13 | Framework CSS |
| **React Router** | 7.8.2 | Enrutamiento |
| **Lucide React** | 0.544.0 | Iconos |
| **Chart.js** | 4.5.0 | Gráficos y estadísticas |
| **jsPDF** | 3.0.3 | Generación de reportes PDF |
| **Radix UI** | - | Componentes accesibles |

---

## 🏗️ Arquitectura del Proyecto

```
SistemaVentas/
│
├── backend/                          # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/                   # Configuración (DB, JWT, email)
│   │   │   ├── config.js             # Configuración centralizada
│   │   │   ├── database.js           # Conexión a PostgreSQL
│   │   │   ├── database.sql          # Schema de la base de datos
│   │   │   └── initial_data.sql      # Datos iniciales (categorías, ubicaciones)
│   │   │
│   │   ├── controllers/              # Lógica de negocio
│   │   │   ├── authController.js     # Autenticación y usuarios
│   │   │   ├── productsController.js # Gestión de productos
│   │   │   ├── categoriesController.js
│   │   │   ├── locationsController.js
│   │   │   ├── imageController.js
│   │   │   └── savedProductsController.js
│   │   │
│   │   ├── middlewares/              # Middleware de Express
│   │   │   ├── auth.js               # Autenticación y autorización
│   │   │   ├── upload.js             # Manejo de archivos con Multer
│   │   │   └── productValidation.js  # Validaciones de productos
│   │   │
│   │   ├── routes/                   # Definición de rutas
│   │   │   ├── auth.js               # Rutas de autenticación
│   │   │   ├── products.js           # Rutas de productos
│   │   │   ├── categories.js         # Rutas de categorías
│   │   │   ├── locations.js          # Rutas de ubicaciones
│   │   │   ├── images.js             # Rutas de imágenes
│   │   │   └── savedProducts.js      # Rutas de favoritos
│   │   │
│   │   ├── services/                 # Servicios externos
│   │   │   ├── jwt.js                # Generación y verificación JWT
│   │   │   ├── email.js              # Envío de emails
│   │   │   └── contentDetection.js   # Detección de contenido prohibido
│   │   │
│   │   ├── utils/                    # Utilidades
│   │   │   └── validators.js         # Validadores Joi
│   │   │
│   │   ├── tests/                    # Tests
│   │   │   ├── database.test.js
│   │   │   ├── testDb.ts
│   │   │   └── testMail.ts
│   │   │
│   │   └── app.js                    # Configuración de Express
│   │
│   ├── uploads/                      # Imágenes subidas
│   ├── scripts/                      # Scripts de utilidad
│   │   └── setup-database.bat        # Script de configuración DB
│   │
│   ├── index.ts                      # Punto de entrada
│   ├── package.json                  # Dependencias backend
│   ├── .env                          # Variables de entorno
│   ├── .env.example                  # Plantilla de variables
│   ├── reiniciar-backend.bat         # Script para reiniciar servidor
│   ├── insert-products.bat           # Script para insertar productos de prueba
│   ├── delete-products.bat           # Script para eliminar productos de prueba
│   └── [otros scripts de utilidad]
│
├── frontend/                         # Aplicación React
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── auth/                 # Componentes de autenticación
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   │
│   │   │   ├── layout/               # Componentes de layout
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── products/             # Componentes de productos
│   │   │   │   └── ProductCard.tsx
│   │   │   │
│   │   │   └── ui/                   # Componentes UI base
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Card.tsx
│   │   │       └── [+15 componentes más]
│   │   │
│   │   ├── pages/                    # Páginas/Vistas
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductsCatalogPage.tsx
│   │   │   ├── ProductViewPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CreateProductPage.tsx
│   │   │   ├── MyProductsPage.tsx
│   │   │   ├── SavedProductsPage.tsx
│   │   │   ├── ProductModerationPage.tsx
│   │   │   ├── ContactVendorPage.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── SessionManagementPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ResetPasswordCodePage.tsx
│   │   │   ├── VerifyCodePage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── contexts/                 # Context API
│   │   │   └── AuthContext.tsx       # Contexto de autenticación
│   │   │
│   │   ├── hooks/                    # Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useAlert.ts
│   │   │   ├── useApiData.ts
│   │   │   └── usePermissions.ts
│   │   │
│   │   ├── services/                 # Servicios de API
│   │   │   ├── api.ts                # Cliente API principal
│   │   │   └── productsService.ts    # Servicio de productos
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── product.types.ts
│   │   │   ├── category.types.ts
│   │   │   └── location.types.ts
│   │   │
│   │   ├── config/                   # Configuración
│   │   │   └── api.ts                # Configuración de endpoints
│   │   │
│   │   ├── lib/                      # Librerías y utilidades
│   │   │   └── utils.ts
│   │   │
│   │   ├── App.tsx                   # Componente principal
│   │   ├── main.tsx                  # Punto de entrada
│   │   ├── App.css                   # Estilos globales
│   │   └── index.css                 # Estilos Tailwind
│   │
│   ├── public/                       # Archivos estáticos
│   ├── scripts/                      # Scripts de utilidad
│   │   └── setup.bat
│   │
│   ├── package.json                  # Dependencias frontend
│   ├── vite.config.ts                # Configuración Vite
│   ├── tsconfig.json                 # Configuración TypeScript
│   ├── tailwind.config.js            # Configuración Tailwind
│   ├── .env.example                  # Plantilla de variables
│   └── reiniciar-frontend.bat        # Script para reiniciar dev server
│
├── .gitignore                        # Archivos ignorados por Git
└── README.md                         # Este archivo
```

---

## 📋 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **PostgreSQL** (versión 12 o superior) - [Descargar](https://www.postgresql.org/download/)
- **npm** (incluido con Node.js) o **yarn**
- **Git** - [Descargar](https://git-scm.com/)

---

## 💻 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/SistemaVentas.git
cd SistemaVentas
```

### 2️⃣ Configurar la Base de Datos

1. **Crear la base de datos en PostgreSQL:**

```sql
CREATE DATABASE sistema_ventas_multiempresa;
```

2. **Ejecutar el script de creación de tablas:**

```bash
cd backend/src/config
psql -U postgres -d sistema_ventas_multiempresa -f database.sql
```

3. **Cargar datos iniciales (categorías, ubicaciones):**

```bash
psql -U postgres -d sistema_ventas_multiempresa -f initial_data.sql
```

4. **Crear usuarios de prueba (opcional):**

```bash
cd ../..
psql -U postgres -d sistema_ventas_multiempresa -f insert-moderator-admin.sql
```

### 3️⃣ Configurar el Backend

```bash
cd backend
npm install

# Copiar el archivo de variables de entorno
copy .env.example .env

# Editar .env con tu configuración
notepad .env
```

### 4️⃣ Configurar el Frontend

```bash
cd ../frontend
npm install

# Copiar el archivo de variables de entorno (opcional)
copy .env.example .env
```

### 5️⃣ Iniciar el Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
El backend se ejecutará en: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend se ejecutará en: `http://localhost:5173`

---

## ⚙️ Configuración

### Variables de Entorno del Backend

Edita el archivo `backend/.env` con tu configuración:

```env
# Servidor
PORT=3001
NODE_ENV=development
HOST=localhost

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
EMAIL_FROM=Sistema de Ventas <tu_email@gmail.com>

# Seguridad
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Configuración de Gmail para Emails

1. Habilita la **verificación en dos pasos** en tu cuenta de Google
2. Genera una **contraseña de aplicación**:
   - Ve a: https://myaccount.google.com/security
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva para "Otra (nombre personalizado)"
   - Usa esta contraseña en `EMAIL_PASSWORD`

### Variables de Entorno del Frontend (Opcional)

```env
VITE_API_URL=http://localhost:3001
```

---

## 📜 Scripts Disponibles

### Backend

```bash
npm start              # Iniciar servidor en modo producción
npm run dev            # Iniciar servidor en modo desarrollo
npm test               # Ejecutar todos los tests
npm run test:db        # Test de conexión a base de datos
npm run test:mail      # Test de envío de emails
```

### Frontend

```bash
npm run dev            # Iniciar servidor de desarrollo
npm run build          # Compilar para producción
npm run preview        # Previsualizar build de producción
npm run lint           # Ejecutar linter
```

### Scripts de Utilidad

**Backend:**
```bash
# Windows
reiniciar-backend.bat        # Reiniciar servidor backend
insert-products.bat          # Insertar productos de prueba
delete-products.bat          # Eliminar productos de prueba

# Los scripts están en la carpeta backend/
```

**Frontend:**
```bash
# Windows
reiniciar-frontend.bat       # Reiniciar servidor de desarrollo

# El script está en la carpeta frontend/
```

---

## 👥 Roles y Permisos

El sistema cuenta con 4 roles de usuario, cada uno con diferentes permisos:

### 🛍️ Comprador
- Ver catálogo de productos
- Buscar y filtrar productos
- Guardar productos como favoritos
- Contactar vendedores
- Ver detalles de productos activos
- Gestionar su perfil

### 💼 Vendedor
**Hereda permisos de Comprador +**
- Crear nuevos productos
- Editar sus propios productos
- Eliminar sus propios productos
- Ver estadísticas de sus productos
- Subir imágenes de productos
- Recibir notificaciones de moderación

### 🛡️ Moderador
**Hereda permisos de Comprador +**
- Ver todos los productos (cualquier estado)
- Aprobar/rechazar productos pendientes
- Marcar productos como peligrosos
- Suspender productos
- Ver panel de moderación con paginación
- Contactar vendedores de cualquier producto
- Acceder a estadísticas de moderación

### 👑 Administrador
**Permisos completos:**
- Todos los permisos de Moderador
- Gestionar usuarios (crear, editar, eliminar)
- Cambiar roles de usuarios
- Suspender/activar cuentas
- Ver panel de administración
- Gestionar sesiones de usuarios
- Acceso a todos los productos sin restricciones
- Configuración del sistema

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/logout` | Cerrar sesión | Sí |
| POST | `/verify-email` | Verificar email con código | No |
| POST | `/resend-verification-code` | Reenviar código de verificación | No |
| POST | `/forgot-password` | Solicitar recuperación de contraseña | No |
| POST | `/reset-password` | Restablecer contraseña con código | No |
| GET | `/profile` | Obtener perfil del usuario | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |
| GET | `/users` | Listar usuarios (Admin) | Sí |

### Productos (`/api/products`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar productos con filtros | No |
| GET | `/:id` | Obtener producto por ID | No |
| GET | `/view/:id` | Obtener producto para vista pública | Opcional |
| GET | `/my-products` | Productos del vendedor | Sí |
| GET | `/saved` | Productos guardados/favoritos | Sí |
| GET | `/pending-moderation` | Productos pendientes (Moderador) | Sí |
| POST | `/` | Crear nuevo producto | Sí |
| PUT | `/:id` | Actualizar producto | Sí |
| PUT | `/:id/status` | Cambiar estado (Moderador) | Sí |
| DELETE | `/:id` | Eliminar producto | Sí |
| POST | `/:id/save` | Guardar como favorito | Sí |
| DELETE | `/:id/unsave` | Quitar de favoritos | Sí |
| GET | `/:id/saved-status` | Verificar si está guardado | Sí |

### Categorías (`/api/categories`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todas las categorías | No |
| GET | `/tree` | Obtener árbol jerárquico | No |

### Ubicaciones (`/api/locations`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/provinces` | Listar provincias | No |
| GET | `/cantons/:provinceId` | Cantones por provincia | No |
| GET | `/districts/:cantonId` | Distritos por cantón | No |

### Imágenes (`/api/images`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Subir imagen | Sí |
| DELETE | `/:filename` | Eliminar imagen | Sí |

---

## 🗄️ Estructura de la Base de Datos

### Principales Tablas

#### `usuarios`
Almacena información de todos los usuarios del sistema.
- Campos: id, cedula, nombre, apellido, correo, password_hash, tipo_usuario, estado, etc.

#### `items`
Productos y servicios publicados en la plataforma.
- Campos: id, codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, etc.

#### `item_imagenes`
Imágenes asociadas a los productos.
- Campos: id, item_id, url_imagen, es_principal, orden

#### `categorias`
Categorías jerárquicas de productos (3 niveles).
- Campos: id, nombre, descripcion, categoria_padre_id, nivel

#### `ubicaciones`
Ubicaciones geográficas de Costa Rica.
- Campos: id, nombre, provincia, canton, distrito

#### `servicios`
Información adicional para productos de tipo servicio.
- Campos: id, item_id, tipo_frecuencia, duracion

#### `productos_guardados`
Relación entre usuarios y sus productos favoritos.
- Campos: id, usuario_id, item_id

#### `sesiones_usuario`
Sesiones activas de los usuarios.
- Campos: id, usuario_id, token, activa, fecha_creacion, fecha_expiracion

### Relaciones Principales

```
usuarios (1) -----> (*) items (vendedor_id)
usuarios (1) -----> (*) productos_guardados
items (1) --------> (*) item_imagenes
items (*) --------> (1) categorias
items (*) --------> (1) ubicaciones
items (1) --------> (1) servicios
```

---

## 🔒 Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Autenticación con JWT
- ✅ Protección CSRF
- ✅ Headers de seguridad con Helmet
- ✅ Rate limiting para prevenir ataques de fuerza bruta
- ✅ Validación de datos con Joi
- ✅ Sanitización de entradas
- ✅ CORS configurado
- ✅ Validación de contraseña anterior al restablecer
- ✅ Tokens de verificación con expiración (10 minutos)
- ✅ Gestión de sesiones

---

## 📊 Funcionalidades Avanzadas

### Detección de Contenido Prohibido
El sistema detecta automáticamente contenido peligroso en:
- Nombres de productos
- Descripciones
- Códigos

Palabras prohibidas incluyen: armas, drogas, explosivos, etc.

### Sistema de Estados de Productos
- **activo**: Producto aprobado y visible
- **inactivo**: Producto oculto por el vendedor
- **pendiente_revision**: Esperando aprobación de moderador
- **rechazado**: No cumple con las políticas
- **peligroso**: Contiene contenido prohibido
- **suspendido**: Suspendido por moderador/admin

### Sistema de Notificaciones por Email
- Bienvenida al registrarse
- Código de verificación de email
- Código de recuperación de contraseña
- Notificaciones de cambio de estado de productos

---

## 📱 Páginas del Sistema

### Públicas
- 🏠 **Home** - Página de inicio con información del sistema
- 🔍 **Catálogo** - Exploración de productos activos
- 🔐 **Login** - Inicio de sesión
- 📝 **Registro** - Registro de nuevos usuarios
- 🔑 **Recuperar Contraseña** - Solicitud de código de recuperación
- ✉️ **Verificar Email** - Ingreso de código de verificación

### Protegidas (Requieren Autenticación)
- 📊 **Dashboard** - Panel principal del usuario
- 👤 **Perfil** - Gestión de perfil de usuario
- 🛒 **Mis Productos** - Productos del vendedor (Vendedor)
- ➕ **Crear Producto** - Formulario de nuevo producto (Vendedor)
- ⭐ **Productos Guardados** - Favoritos del usuario
- 📧 **Contactar Vendedor** - Formulario de contacto
- 🛡️ **Moderación** - Panel de moderación (Moderador/Admin)
- 👥 **Gestión de Usuarios** - Administración de usuarios (Admin)
- 🔐 **Gestión de Sesiones** - Control de sesiones activas (Admin)

---

## 🧪 Testing

### Backend Tests

```bash
# Test de conexión a base de datos
npm run test:db

# Test de envío de emails
npm run test:mail

# Todos los tests
npm test
```

### Datos de Prueba

El sistema incluye scripts para insertar datos de prueba:

```bash
cd backend
insert-products.bat    # Inserta productos de ejemplo con imágenes
delete-products.bat    # Elimina todos los productos de prueba
```

---

## 🤝 Contribución

### Flujo de Trabajo

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convención de Commits

```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato (sin afectar código)
refactor: Refactorización de código
test: Agregar o modificar tests
chore: Cambios en build o herramientas
perf: Mejoras de rendimiento
```

### Estándares de Código

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + TypeScript strict mode
- **Base de datos**: Nombres en español, snake_case
- **Git**: Nombres de ramas en inglés, kebab-case

---

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 👨‍💻 Autores

- **Equipo de Desarrollo** - *Desarrollo inicial* - Sistema de Ventas Multiempresa

---

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Verifica que todos los requisitos estén instalados
3. Asegúrate de que las variables de entorno estén configuradas correctamente
4. Revisa los logs del servidor (backend y frontend)
5. Abre un issue en el repositorio

---

## 🎉 Agradecimientos

- React Team por React 19
- Vercel por Vite
- Tailwind Labs por Tailwind CSS
- shadcn por los componentes UI
- Lucide por los iconos
- Toda la comunidad open source

---

<div align="center">

**[⬆ Volver arriba](#-sistema-de-ventas-multiempresa)**

Made with ❤️ by Sistema de Ventas Team

</div>
