# 📋 Resumen: Despliegue en Azure - Sistema de Ventas Multiempresa

## 🎯 Objetivo

Desplegar el Sistema de Ventas Multiempresa en Azure usando el plan estudiantil gratuito.

---

## 📚 Documentación Creada

1. **`ANALISIS_PROYECTO_AZURE.md`** - Análisis completo del proyecto
2. **`GUIA_DESPLIEGUE_AZURE.md`** - Guía paso a paso detallada
3. **`backend/azure-deploy-config.md`** - Configuración específica del backend
4. **`frontend/azure-deploy-config.md`** - Configuración específica del frontend

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────┐
│           Azure Static Web Apps                │
│         (Frontend - React + Vite)              │
│  https://frontend-sistema-ventas.azure...      │
└──────────────────┬─────────────────────────────┘
                   │ HTTPS
                   │ API Calls
┌──────────────────▼─────────────────────────────┐
│         Azure App Service                      │
│    (Backend - Node.js + Express)               │
│  https://backend-sistema-ventas.azure...       │
└──────────────────┬─────────────────────────────┘
                   │ SSL Connection
┌──────────────────▼─────────────────────────────┐
│   Azure Database for PostgreSQL                │
│         (Flexible Server)                      │
│  postgres-sistema-ventas.postgres...           │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Recursos Azure Necesarios

| Recurso | Tipo | Plan | Costo Estimado |
|---------|------|------|----------------|
| App Service | Backend | F1 (Gratis) o B1 Basic | $0 o ~$13/mes |
| Static Web App | Frontend | Gratis | $0 |
| PostgreSQL | Base de datos | Burstable B1ms | ~$12-15/mes |
| Storage Account | Imágenes (opcional) | LRS | ~$0.02/GB/mes |

**Total con plan estudiantil:** ~$0-15/mes (dependiendo del plan elegido)

---

## ✅ Cambios Realizados en el Código

### Backend (`backend/src/app.js`)

✅ **CORS actualizado** para aceptar URL de producción desde variables de entorno:

```javascript
const corsOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://localhost:3001'
];

if (process.env.CORS_ORIGIN) {
  corsOrigins.push(process.env.CORS_ORIGIN);
}
```

---

## 📝 Pasos Rápidos para Desplegar

### 1. Preparar Proyecto (5 min)
- [ ] Verificar que `tsx` esté en `dependencies`
- [ ] Actualizar CORS en `backend/src/app.js` (ya hecho)
- [ ] Probar build del frontend: `npm run build`

### 2. Crear Base de Datos (10 min)
- [ ] Crear Azure Database for PostgreSQL Flexible Server
- [ ] Configurar firewall (permitir Azure Services)
- [ ] Crear base de datos `sistema_ventas_multiempresa`
- [ ] Ejecutar scripts SQL de inicialización

### 3. Desplegar Backend (15 min)
- [ ] Crear App Service (Node.js 18/20)
- [ ] Configurar variables de entorno
- [ ] Configurar comando de inicio: `tsx index.ts`
- [ ] Conectar con GitHub (carpeta: `backend`)
- [ ] Verificar despliegue

### 4. Desplegar Frontend (10 min)
- [ ] Crear Static Web App
- [ ] Conectar con GitHub (carpeta: `frontend`)
- [ ] Configurar variables de entorno (`VITE_API_URL`)
- [ ] Verificar despliegue

### 5. Configurar Conexiones (5 min)
- [ ] Actualizar `CORS_ORIGIN` en backend con URL del frontend
- [ ] Verificar reglas de firewall de PostgreSQL
- [ ] Probar funcionalidades

**Tiempo total estimado:** ~45 minutos

---

## 🔐 Variables de Entorno Necesarias

### Backend (App Service)

```
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

DB_HOST=postgres-sistema-ventas.postgres.database.azure.com
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=azureuser
DB_PASSWORD=TU_CONTRASEÑA

JWT_SECRET=CLAVE_SECRETA_MUY_SEGURA
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eventconnect90@gmail.com
EMAIL_PASSWORD=oshzkgssiwxfdiqr
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>

CORS_ORIGIN=https://frontend-sistema-ventas.azurestaticapps.net
FRONTEND_URL=https://frontend-sistema-ventas.azurestaticapps.net

BCRYPT_SALT_ROUNDS=10
```

### Frontend (Static Web App)

```
VITE_API_URL=https://backend-sistema-ventas.azurewebsites.net/api
```

---

## ⚠️ Consideraciones Importantes

### 1. **Imágenes (`uploads/`)**
- ⚠️ El sistema de archivos de App Service es **efímero**
- ✅ Las imágenes se perderán al reiniciar el servicio
- 💡 **Solución:** Migrar a Azure Blob Storage (ver guía completa)

### 2. **Tareas Programadas (node-cron)**
- ⚠️ En plan F1 (gratis), "Always On" no está disponible
- ⚠️ Las tareas pueden no ejecutarse si el servicio está inactivo
- 💡 **Solución:** Usar Azure Functions para tareas programadas

### 3. **SSL/HTTPS**
- ✅ Azure proporciona SSL automático para App Service y Static Web Apps
- ✅ No necesitas configurar certificados manualmente

### 4. **Dominios Personalizados**
- ✅ Puedes agregar dominios personalizados después del despliegue
- ✅ Azure proporciona dominios `.azurewebsites.net` y `.azurestaticapps.net` gratis

---

## 🧪 Pruebas Post-Despliegue

### Backend
```bash
# Endpoint de salud
curl https://backend-sistema-ventas.azurewebsites.net/

# Documentación API
curl https://backend-sistema-ventas.azurewebsites.net/api/docs
```

### Frontend
- Abre: `https://frontend-sistema-ventas.azurestaticapps.net`
- Verifica que carga correctamente
- Prueba login/registro
- Verifica que las peticiones a la API funcionen

---

## 🐛 Solución de Problemas

### Backend no inicia
1. Revisa logs en **App Service → Registros → Log stream**
2. Verifica que `tsx` esté en `dependencies`
3. Verifica que el comando de inicio sea correcto

### Error de conexión a PostgreSQL
1. Verifica reglas de firewall en PostgreSQL
2. Verifica credenciales en variables de entorno
3. Verifica que el servidor PostgreSQL esté en ejecución

### CORS bloqueado
1. Verifica `CORS_ORIGIN` en App Service
2. Verifica que la URL del frontend sea correcta
3. Revisa la consola del navegador para ver el error exacto

### Frontend no se conecta a la API
1. Verifica `VITE_API_URL` en Static Web App
2. Verifica que la variable esté disponible en el build
3. Revisa la consola del navegador

---

## 📚 Recursos Adicionales

- [Documentación Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Documentación Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
- [Documentación Azure Database for PostgreSQL](https://docs.microsoft.com/azure/postgresql/)

---

## 🎉 Siguiente Paso

**Lee la guía completa:** `GUIA_DESPLIEGUE_AZURE.md`

Esta guía contiene instrucciones detalladas paso a paso con capturas y explicaciones para cada configuración.

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:
1. Revisa los logs en Azure Portal
2. Revisa los logs de GitHub Actions
3. Consulta la sección "Solución de Problemas" en la guía completa

