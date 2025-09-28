# Sistema de Ventas Multiempresa

## Descripción
Sistema de gestión de ventas diseñado para manejar múltiples empresas con funcionalidades completas de inventario, usuarios, productos y reportes.

## Arquitectura del Proyecto

### Backend (API con Node + Express)
```
backend/
├── src/
│   ├── config/          # Configuración (DB, JWT, env)
│   ├── controllers/     # Lógica de negocio por recurso
│   ├── middlewares/     # Middlewares (auth, validaciones)
│   ├── models/          # Modelos de datos (ORM o queries SQL)
│   ├── routes/          # Rutas agrupadas por módulo
│   ├── services/        # Servicios (ej: detección productos prohibidos)
│   ├── utils/           # Funciones de ayuda (hash, validaciones)
│   ├── app.js           # Configuración Express
│   └── tests/           # Tests del backend
├── package.json
└── .env
```

### Frontend (Interfaz con React + Vite)
```
frontend/
├── src/
│   ├── assets/          # Imágenes, logos, estilos globales
│   ├── components/      # Componentes reutilizables (botones, inputs)
│   ├── pages/           # Vistas (Login, Registro, Productos, etc.)
│   ├── hooks/           # Hooks personalizados (ej: useAuth, useFetch)
│   ├── context/         # Context API (ej: AuthContext, CartContext)
│   ├── services/        # Consumo de la API (fetch/axios)
│   ├── routes/          # Configuración de React Router
│   └── main.jsx         # Punto de entrada Vite
├── public/              # Archivos estáticos (favicon, index.html)
├── package.json
└── vite.config.js
```

### Documentación y Configuración
```
docs/                    # Documentación del proyecto (diagramas, manuales)
docker/                  # Configs si usas Docker (Dockerfile, docker-compose)
.gitignore
README.md
```

## Tecnologías Utilizadas

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT para autenticación
- bcrypt para hash de contraseñas
- Multer para manejo de archivos
- Nodemailer para envío de emails

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Chart.js para gráficos
- jsPDF para reportes

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- PostgreSQL
- npm o yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Configurar las siguientes variables en `backend/.env`:

- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Secreto para JWT
- `EMAIL_USER`: Usuario de email
- `EMAIL_PASSWORD`: Contraseña de email

## Funcionalidades

- [ ] Autenticación y autorización de usuarios
- [ ] Gestión de empresas múltiples
- [ ] CRUD de productos
- [ ] Gestión de inventario
- [ ] Sistema de ventas
- [ ] Reportes y estadísticas
- [ ] Gestión de usuarios por empresa
- [ ] Sistema de notificaciones por email

## Desarrollo

### Estructura de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests

## Licencia
ISC
