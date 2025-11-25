# Configuración para Ejecutar Pruebas

## ⚠️ Problema Detectado

Las pruebas requieren un archivo `.env` en el directorio `backend/` con las credenciales de la base de datos.

## 📝 Pasos para Configurar

### 1. Crear archivo `.env` en `backend/`

Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```env
# Servidor
PORT=3001
NODE_ENV=development
HOST=localhost

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui

# JWT
JWT_SECRET=tu_secret_key_muy_segura_aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email (para pruebas puede usar valores de prueba)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_email
EMAIL_FROM=noreply@sistema-ventas.com

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2. Ajustar valores según tu configuración

- **DB_PASSWORD**: La contraseña de tu base de datos PostgreSQL
- **DB_NAME**: El nombre de tu base de datos (puede ser `sistema_ventas` o `sistema_ventas_multiempresa`)
- **JWT_SECRET**: Una cadena secreta para firmar los tokens JWT
- **EMAIL_***: Configuración de email (puede usar valores de prueba si no envía emails)

### 3. Verificar conexión a la base de datos

Antes de ejecutar las pruebas, verifica que la conexión funcione:

```bash
cd backend
node test-connection.js
```

### 4. Ejecutar las pruebas

Una vez configurado el `.env`, ejecuta las pruebas:

```bash
npm run test:integration -- test/integration/products/products-crud.test.js
```

## 🔒 Seguridad

**IMPORTANTE**: 
- El archivo `.env` NO debe subirse a Git
- Asegúrate de que esté en `.gitignore`
- Usa valores diferentes para desarrollo y producción

## 📋 Variables Requeridas

Las siguientes variables son **obligatorias** para que las pruebas funcionen:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD` ⚠️ **Esta es la que está causando el error actual**

## ✅ Verificación

Después de crear el `.env`, verifica que las variables se carguen correctamente:

```bash
cd backend
node -e "require('dotenv').config(); console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Configurada' : 'NO CONFIGURADA');"
```



