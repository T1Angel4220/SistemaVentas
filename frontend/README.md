# Frontend - Sistema de Ventas Multiempresa

## 📋 Descripción

Frontend desarrollado con React 19, TypeScript, Vite y Tailwind CSS para el Sistema de Ventas Multiempresa. Incluye un sistema completo de autenticación, gestión de usuarios y interfaz moderna.

## 🚀 Tecnologías Utilizadas

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **React Router DOM** - Enrutamiento
- **Lucide React** - Iconos
- **Chart.js** - Gráficos
- **jsPDF** - Generación de PDFs

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── layout/         # Componentes de layout
│   │   └── ui/             # Componentes de UI base
│   ├── contexts/           # Contextos de React
│   │   └── AuthContext.tsx # Contexto de autenticación
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios de API
│   │   └── api.ts          # Cliente de API
│   ├── lib/                # Utilidades
│   │   └── utils.ts        # Funciones helper
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── .env.example           # Variables de entorno
├── tailwind.config.js     # Configuración de Tailwind
├── vite.config.ts         # Configuración de Vite
└── package.json           # Dependencias
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno
Configurar las siguientes variables en `.env`:

```env
# URL de la API del backend
VITE_API_URL=http://localhost:3001/api

# Configuración de la aplicación
VITE_APP_NAME=Sistema de Ventas Multiempresa
VITE_APP_VERSION=1.0.0

# Configuración de autenticación
VITE_JWT_STORAGE_KEY=accessToken
VITE_REFRESH_TOKEN_KEY=refreshToken
```

## 🎨 Componentes Implementados

### Componentes de Autenticación
- **LoginForm** - Formulario de inicio de sesión
- **RegisterForm** - Formulario de registro
- **AuthContext** - Contexto de autenticación global

### Componentes de UI
- **Button** - Botón con variantes y estados
- **Input** - Campo de entrada con validación
- **Card** - Tarjeta contenedora
- **Alert** - Alertas y notificaciones

### Componentes de Layout
- **Navbar** - Barra de navegación
- **ProtectedRoute** - Ruta protegida con autenticación

## 📱 Páginas Implementadas

### Páginas Públicas
- **HomePage** - Página de inicio
- **LoginPage** - Página de login
- **RegisterPage** - Página de registro

### Páginas Protegidas
- **DashboardPage** - Panel principal del usuario
- **NotFoundPage** - Página 404

## 🔐 Sistema de Autenticación

### Funcionalidades
- ✅ **Login/Logout** con JWT
- ✅ **Registro** de usuarios
- ✅ **Verificación de email**
- ✅ **Recuperación de contraseña**
- ✅ **Gestión de sesiones**
- ✅ **Protección de rutas**
- ✅ **Control de roles**

### Estados de Usuario
- `activo` - Usuario activo
- `inactivo` - Usuario desactivado
- `suspendido` - Usuario suspendido
- `pendiente_verificacion` - Email no verificado

### Roles de Usuario
- `comprador` - Puede comprar productos
- `vendedor` - Puede vender productos
- `moderador` - Puede moderar contenido
- `administrador` - Acceso completo al sistema

## 🎯 Rutas Configuradas

### Rutas Públicas
- `/` - Página de inicio
- `/login` - Login de usuarios
- `/register` - Registro de usuarios

### Rutas Protegidas
- `/dashboard` - Panel principal
- `/products` - Catálogo de productos
- `/chat` - Sistema de chat
- `/profile` - Perfil de usuario
- `/settings` - Configuración
- `/admin/*` - Panel de administración (solo moderadores/admin)

## 🎨 Estilos y Diseño

### Tailwind CSS
- Configuración personalizada
- Variables CSS para temas
- Componentes reutilizables
- Responsive design

### Tema
- Colores personalizados
- Tipografía Inter
- Iconos Lucide React
- Animaciones suaves

## 🔌 Integración con Backend

### API Service
- Cliente HTTP configurado
- Manejo de tokens JWT
- Interceptores de requests
- Manejo de errores

### Endpoints Utilizados
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Perfil de usuario
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify-email` - Verificación de email
- `POST /api/auth/request-password-reset` - Recuperación de contraseña
- `POST /api/auth/reset-password` - Reset de contraseña

## 🧪 Pruebas y Desarrollo

### Scripts Disponibles
```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de linting
```

### Desarrollo
- Hot reload habilitado
- TypeScript strict mode
- ESLint configurado
- Prettier para formateo

## 📱 Responsive Design

### Breakpoints
- `sm` - 640px y superior
- `md` - 768px y superior
- `lg` - 1024px y superior
- `xl` - 1280px y superior

### Características
- Mobile-first approach
- Grid system responsive
- Componentes adaptativos
- Navegación móvil

## 🔒 Seguridad

### Implementada
- ✅ Validación de formularios
- ✅ Sanitización de entrada
- ✅ Tokens JWT seguros
- ✅ Rutas protegidas
- ✅ Control de acceso por roles
- ✅ Manejo seguro de errores

### Validaciones
- Email válido
- Contraseñas seguras
- Campos requeridos
- Longitud de caracteres
- Tipos de datos

## 🚀 Despliegue

### Build de Producción
```bash
# Crear build optimizado
npm run build

# Los archivos se generan en dist/
```

### Variables de Producción
```env
VITE_API_URL=https://api.sistemaventas.com/api
VITE_APP_NAME=Sistema de Ventas Multiempresa
VITE_DEBUG_MODE=false
```

## 📊 Características del Dashboard

### Información del Usuario
- Datos personales completos
- Estado de la cuenta
- Rol y permisos
- Fechas de registro y último acceso

### Acciones Rápidas
- Comprar productos
- Vender productos
- Acceder al chat
- Configuración de cuenta

### Panel de Administración
- Gestión de usuarios (moderadores/admin)
- Moderación de contenido
- Configuración del sistema

## 🎯 Próximas Funcionalidades

### En Desarrollo
- [ ] Catálogo de productos
- [ ] Sistema de chat en tiempo real
- [ ] Gestión de perfil de usuario
- [ ] Panel de administración completo
- [ ] Sistema de notificaciones
- [ ] Búsqueda avanzada
- [ ] Filtros y categorías
- [ ] Sistema de valoraciones

### Futuras Mejoras
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Internacionalización
- [ ] Analytics integrado
- [ ] Testing automatizado

## 📞 Soporte

Para problemas o preguntas:
- **Email**: soporte@sistemaventas.com
- **Teléfono**: +506-8888-8888
- **Documentación**: `/docs`

---

**El frontend está completamente implementado y listo para desarrollo y pruebas de software.**