# 📊 Análisis del Proyecto - Sistema de Ventas Multiempresa

## 🔍 Resumen del Proyecto

### **Backend**
- **Stack:** Node.js + Express + TypeScript
- **Runtime:** TypeScript ejecutado directamente con `tsx` (no compila a JS)
- **Puerto:** 3001
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (access + refresh tokens)
- **Email:** Nodemailer (Gmail SMTP)
- **Archivos:** Multer (carpeta `uploads/`)
- **Tareas programadas:** node-cron (suspensión automática de productos)

### **Frontend**
- **Stack:** React 19 + Vite + TypeScript
- **Puerto desarrollo:** 5173
- **UI:** Tailwind CSS + Radix UI
- **Mapas:** Leaflet (React Leaflet)
- **Gráficos:** Chart.js
- **Routing:** React Router DOM

---

## 📁 Estructura del Proyecto

### Backend (`/backend`)
```
backend/
├── index.ts              # Punto de entrada (usa tsx)
├── package.json          # Dependencias y scripts
├── .env                  # Variables de entorno (NO subir a GitHub)
├── .env.example          # Plantilla de variables
├── src/
│   ├── app.js            # Configuración Express
│   ├── config/           # Configuración (DB, JWT, Email)
│   ├── controllers/      # Lógica de negocio
│   ├── routes/           # Rutas de la API
│   ├── middlewares/      # Auth, validación, upload
│   ├── services/         # Email, JWT, detección de contenido
│   └── utils/            # Utilidades (geolocalización, validadores)
└── uploads/              # Imágenes subidas (NO subir a GitHub)
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── main.tsx          # Punto de entrada
│   ├── App.tsx           # Componente principal
│   ├── pages/            # Páginas de la aplicación
│   ├── components/       # Componentes reutilizables
│   ├── services/         # Servicios API
│   ├── contexts/         # Context API (AuthContext)
│   ├── hooks/            # Custom hooks
│   └── config/           # Configuración API
├── package.json
├── vite.config.ts
└── .env.example
```

---

## 🔧 Configuración Actual

### Variables de Entorno Backend (`.env`)
```env
PORT=3001
NODE_ENV=development
HOST=localhost

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=Angel_4220

# JWT
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eventconnect90@gmail.com
EMAIL_PASSWORD=oshzkgssiwxfdiqr
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Variables de Entorno Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## ⚠️ Consideraciones para Azure

### 1. **Backend - TypeScript con tsx**
- ✅ Azure App Service puede ejecutar `tsx` directamente
- ⚠️ Necesitas configurar el comando de inicio: `tsx index.ts`
- ⚠️ Asegúrate de que `tsx` esté en `dependencies` (no `devDependencies`)

### 2. **Base de Datos PostgreSQL**
- ✅ Usar Azure Database for PostgreSQL Flexible Server
- ⚠️ Cambiar `DB_HOST` a la URL de Azure
- ⚠️ Habilitar SSL (`sslmode=require`)
- ⚠️ Configurar reglas de firewall para permitir acceso desde App Service

### 3. **Carpeta `uploads/`**
- ⚠️ **PROBLEMA:** Azure App Service tiene sistema de archivos efímero
- ✅ **SOLUCIÓN:** Usar Azure Blob Storage para almacenar imágenes
- ⚠️ Alternativa temporal: usar el sistema de archivos (se perderán al reiniciar)

### 4. **CORS**
- ⚠️ Actualmente solo permite `http://localhost:5173`
- ✅ Necesitas agregar la URL de Azure Static Web App al CORS

### 5. **Tareas Programadas (node-cron)**
- ✅ Funciona en Azure App Service
- ⚠️ Si el plan es "Always On", funciona bien
- ⚠️ Si el plan es "Consumption", puede tener problemas (mejor usar Azure Functions)

### 6. **Email (Gmail SMTP)**
- ✅ Funciona desde Azure sin cambios
- ⚠️ Asegúrate de que las credenciales estén en variables de entorno

### 7. **Variables de Entorno**
- ✅ Configurar en Azure Portal → App Service → Configuration → Application Settings
- ⚠️ **NO** subir `.env` a GitHub

---

## 🎯 Plan de Despliegue Recomendado

### **Opción 1: App Service + Static Web App (Recomendada)**
- ✅ Backend: Azure App Service (Node.js)
- ✅ Frontend: Azure Static Web Apps
- ✅ Base de datos: Azure Database for PostgreSQL Flexible Server
- ✅ Almacenamiento: Azure Blob Storage (para imágenes)

### **Opción 2: Todo en App Service**
- ✅ Backend: Azure App Service
- ✅ Frontend: Azure App Service (servir archivos estáticos)
- ✅ Base de datos: Azure Database for PostgreSQL Flexible Server
- ⚠️ Más simple pero menos optimizado para frontend

---

## 📋 Checklist Pre-Despliegue

- [ ] Verificar que `tsx` esté en `dependencies` (no `devDependencies`)
- [ ] Crear `.env.production` con variables de producción
- [ ] Actualizar CORS para incluir URL de producción
- [ ] Configurar Azure Blob Storage para imágenes (o aceptar pérdida temporal)
- [ ] Verificar que todas las dependencias estén en `package.json`
- [ ] Probar build del frontend: `npm run build`
- [ ] Verificar que no haya referencias hardcodeadas a `localhost`
- [ ] Configurar variables de entorno en Azure Portal
- [ ] Habilitar "Always On" en App Service (para cron jobs)

---

## 🚀 Próximos Pasos

Ver documento `GUIA_DESPLIEGUE_AZURE.md` para instrucciones paso a paso.

