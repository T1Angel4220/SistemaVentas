# ⚙️ Configuración para Despliegue en Azure

## 📋 Checklist Pre-Despliegue

### 1. Verificar Dependencias

Asegúrate de que `tsx` esté en `dependencies`:

```bash
npm list tsx
```

Si no está, instálalo:

```bash
npm install tsx
```

### 2. Variables de Entorno en Azure Portal

Configura estas variables en **App Service → Configuración → Configuración de aplicación**:

```
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

DB_HOST=TU_SERVIDOR.postgres.database.azure.com
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=azureuser
DB_PASSWORD=TU_CONTRASEÑA

JWT_SECRET=GENERA_UNA_CLAVE_SECRETA_MUY_SEGURA
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eventconnect90@gmail.com
EMAIL_PASSWORD=oshzkgssiwxfdiqr
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>

CORS_ORIGIN=https://TU_STATIC_WEB_APP.azurestaticapps.net
FRONTEND_URL=https://TU_STATIC_WEB_APP.azurestaticapps.net

BCRYPT_SALT_ROUNDS=10
```

### 3. Comando de Inicio

En **App Service → Configuración → Configuración general**:

```
Comando de inicio: tsx index.ts
```

### 4. Carpeta de Implementación

En **Centro de implementación → Configuración**:

- **Carpeta:** `backend`

### 5. Reglas de Firewall PostgreSQL

En **PostgreSQL → Seguridad → Redes**:

- ✅ Habilitar "Permitir acceso público"
- ✅ Agregar regla: `AllowAzureServices` (0.0.0.0 - 0.0.0.0)
- ✅ Agregar IP de salida del App Service (opcional, más seguro)

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar que el servidor inicia

```bash
# En Azure Portal → App Service → Registros → Log stream
# Deberías ver:
# ✅ Servidor iniciado exitosamente
# 🚀 Servidor corriendo en puerto 3001
```

### 2. Probar endpoint de salud

```bash
curl https://TU_BACKEND.azurewebsites.net/
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Sistema de Ventas Multiempresa - API",
  "version": "1.0.0"
}
```

### 3. Verificar conexión a base de datos

En los logs deberías ver:
```
📊 Verificando conexión a la base de datos...
✅ Conexión exitosa a PostgreSQL
```

---

## 🐛 Problemas Comunes

### Error: "tsx: command not found"

**Solución:** Asegúrate de que `tsx` esté en `dependencies`, no en `devDependencies`.

### Error: "Cannot connect to database"

**Solución:**
1. Verifica las reglas de firewall en PostgreSQL
2. Verifica que las credenciales sean correctas
3. Verifica que el servidor PostgreSQL esté en ejecución

### Error: CORS bloqueado

**Solución:**
1. Verifica que `CORS_ORIGIN` tenga la URL correcta del frontend
2. Actualiza `backend/src/app.js` para incluir la URL de producción

---

## 📝 Notas Importantes

- ⚠️ Las imágenes en `uploads/` se perderán al reiniciar (sistema de archivos efímero)
- ✅ Considera migrar a Azure Blob Storage para persistencia
- ⚠️ Las tareas cron pueden no ejecutarse en plan F1 (gratis)
- ✅ Para producción, considera usar un plan de pago con "Always On"

