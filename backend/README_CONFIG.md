# Configuración Centralizada - Sistema de Ventas Multiempresa

## 📋 Descripción

Este sistema utiliza una configuración centralizada que consume todas las variables de entorno del archivo `.env` de manera organizada y segura.

## 🔧 Archivos de Configuración

### `config.js` - Configuración Principal
Archivo central que consume todas las variables de entorno y las organiza por categorías:

```javascript
const { config } = require('./config');
```

**Categorías de configuración:**
- `config.server` - Configuración del servidor
- `config.database` - Configuración de la base de datos
- `config.jwt` - Configuración de JWT
- `config.email` - Configuración de email
- `config.upload` - Configuración de archivos
- `config.cors` - Configuración de CORS
- `config.security` - Configuración de seguridad

### `database.js` - Configuración de Base de Datos
Consume la configuración desde `config.js`:

```javascript
const dbConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  // ... más configuraciones
};
```

### `jwt.js` - Configuración de JWT
Maneja tokens JWT usando la configuración centralizada:

```javascript
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};
```

### `email.js` - Configuración de Email
Configuración de email usando nodemailer:

```javascript
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});
```

## 📝 Variables de Entorno Consumidas

### Servidor
```env
PORT=3001                    # Puerto del servidor
NODE_ENV=development         # Entorno de ejecución
HOST=localhost              # Host del servidor
```

### Base de Datos
```env
DB_HOST=localhost           # Host de PostgreSQL
DB_PORT=5432               # Puerto de PostgreSQL
DB_NAME=sistema_ventas_multiempresa  # Nombre de la base de datos
DB_USER=postgres           # Usuario de PostgreSQL
DB_PASSWORD=Angel_4220     # Contraseña de PostgreSQL
DATABASE_URL=postgresql://postgres:Angel_4220@localhost:5432/sistema_ventas_multiempresa
```

### JWT
```env
JWT_SECRET=supersecretkey   # Secreto para firmar tokens
JWT_EXPIRES_IN=1h          # Tiempo de expiración de tokens
JWT_REFRESH_EXPIRES_IN=7d  # Tiempo de expiración de refresh tokens
```

### Email
```env
EMAIL_HOST=smtp.gmail.com   # Servidor SMTP
EMAIL_PORT=587             # Puerto SMTP
EMAIL_USER=eventconnect90@gmail.com  # Usuario de email
EMAIL_PASS=oshzkgssiwxfdiqr  # Contraseña de email
EMAIL_FROM=eventconnect90@gmail.com  # Email remitente
```

### Archivos
```env
UPLOAD_PATH=./uploads      # Ruta para archivos subidos
MAX_FILE_SIZE=5242880      # Tamaño máximo de archivos (5MB)
```

### CORS
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173  # Orígenes permitidos
```

### Seguridad
```env
BCRYPT_ROUNDS=12           # Rondas para hash de contraseñas
SESSION_SECRET=supersecretkey  # Secreto para sesiones
COOKIE_MAX_AGE=86400000    # Tiempo de vida de cookies (24h)
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW=900000   # Ventana de tiempo (15 min)
RATE_LIMIT_MAX=100         # Máximo de requests por IP
```

### Logging
```env
LOG_LEVEL=info             # Nivel de logging
LOG_FORMAT=combined        # Formato de logs
```

### Paginación
```env
PAGINATION_LIMIT=10        # Límite por defecto
PAGINATION_MAX_LIMIT=100   # Límite máximo
```

### Cache
```env
CACHE_TTL=300              # Tiempo de vida del cache (5 min)
CACHE_MAX=100              # Máximo de elementos en cache
```

## 🔍 Validación de Configuración

El sistema incluye validación automática de configuración crítica:

```javascript
const validateConfig = () => {
  const errors = [];
  
  // Validar configuración de base de datos
  if (!config.database.host) errors.push('DB_HOST es requerido');
  if (!config.database.name) errors.push('DB_NAME es requerido');
  if (!config.database.user) errors.push('DB_USER es requerido');
  if (!config.database.password) errors.push('DB_PASSWORD es requerido');
  
  // Validar configuración de JWT
  if (!config.jwt.secret || config.jwt.secret === 'supersecretkey') {
    errors.push('JWT_SECRET debe ser configurado con un valor seguro');
  }
  
  // Validar configuración de email
  if (!config.email.user) errors.push('EMAIL_USER es requerido');
  if (!config.email.password) errors.push('EMAIL_PASS es requerido');
  
  return errors.length === 0;
};
```

## 🚀 Uso en la Aplicación

### En el Servidor Principal (`index.ts`)
```javascript
import { config, validateConfig, getConfigSummary } from './src/config/config';

// Validar configuración al iniciar
if (!validateConfig()) {
  console.error('❌ Configuración inválida');
  process.exit(1);
}

// Mostrar resumen de configuración
const configSummary = getConfigSummary();
console.log('📋 Configuración del sistema:', configSummary);

// Usar configuración
const PORT = config.server.port;
```

### En la Aplicación Express (`app.js`)
```javascript
const { config } = require('./config');

// Usar configuración de CORS
app.use(cors(config.cors));

// Usar configuración de entorno para errores
app.use((err, req, res, next) => {
  res.status(500).json({ 
    error: config.server.nodeEnv === 'development' ? err.message : {}
  });
});
```

### En las Pruebas
```javascript
const { config } = require('../src/config/config');

// Usar configuración en pruebas
const emailConfig = config.email;
console.log(`Host: ${emailConfig.host}`);
console.log(`Usuario: ${emailConfig.user}`);
```

## 🔒 Seguridad

### Datos Sensibles
- Las contraseñas y secretos nunca se muestran en logs
- La función `getConfigSummary()` oculta datos sensibles
- Los valores por defecto son seguros para desarrollo

### Validación
- Validación automática de configuración crítica
- Verificación de tipos de datos
- Mensajes de error claros para configuración faltante

## 📊 Monitoreo

### Resumen de Configuración
```javascript
const summary = getConfigSummary();
console.log(summary);
// Muestra configuración sin datos sensibles
```

### Estado del Sistema
```javascript
const status = await getDatabaseStatus();
console.log(status);
// Muestra estado de la base de datos
```

## 🧪 Pruebas

Las pruebas utilizan la configuración centralizada:

```javascript
// Pruebas de base de datos
const dbConnected = await testConnection();

// Pruebas de email
const emailConfigured = await testEmailConfiguration();

// Pruebas de JWT
const token = generateToken(payload);
```

## 📝 Notas Importantes

1. **Orden de Carga**: `dotenv.config()` debe ejecutarse antes de importar `config.js`
2. **Valores por Defecto**: Todos los valores tienen defaults seguros
3. **Validación**: La configuración se valida al iniciar el servidor
4. **Seguridad**: Los datos sensibles nunca se exponen en logs
5. **Flexibilidad**: Fácil agregar nuevas configuraciones

## 🔄 Actualización de Configuración

Para agregar nuevas variables de entorno:

1. Agregar la variable al `.env`
2. Agregar la configuración a `config.js`
3. Usar `config.nuevaCategoria.nuevaVariable` en el código
4. Actualizar la validación si es crítica

---

**Esta configuración centralizada asegura que todo el sistema consuma las variables de entorno de manera consistente y segura.**
