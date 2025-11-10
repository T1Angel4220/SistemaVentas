# ⚙️ Configuración Frontend para Azure Static Web Apps

## 📋 Checklist Pre-Despliegue

### 1. Variables de Entorno

En **Static Web App → Configuración → Configuración de aplicación**, agrega:

```
VITE_API_URL=https://TU_BACKEND.azurewebsites.net/api
```

### 2. Configuración de Build

En **Static Web App → Configuración → Configuración general**:

- **Carpeta de compilación:** `frontend`
- **Comando de compilación:** `npm run build`
- **Ubicación de artefactos:** `dist`

### 3. Actualizar Workflow de GitHub Actions

El archivo `.github/workflows/azure-static-web-apps-*.yml` debería tener:

```yaml
env:
  VITE_API_URL: https://TU_BACKEND.azurewebsites.net/api
```

### 4. Verificar que el build funciona localmente

```bash
cd frontend
npm install
npm run build
```

Deberías ver la carpeta `dist/` creada sin errores.

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar que el frontend carga

Abre: `https://TU_STATIC_WEB_APP.azurestaticapps.net`

Deberías ver la aplicación React cargando.

### 2. Verificar conexión a la API

Abre la consola del navegador (F12) y verifica que:
- No haya errores de CORS
- Las peticiones a la API funcionen
- La URL base sea correcta

### 3. Probar funcionalidades

- [ ] Login
- [ ] Registro
- [ ] Navegación entre páginas
- [ ] Carga de productos
- [ ] Subida de imágenes

---

## 🐛 Problemas Comunes

### Error: "Failed to fetch" o CORS

**Solución:**
1. Verifica que `VITE_API_URL` esté configurado correctamente
2. Verifica que el backend tenga `CORS_ORIGIN` configurado con la URL del frontend
3. Revisa la consola del navegador para ver el error exacto

### Error: "Module not found" en build

**Solución:**
1. Verifica que todas las dependencias estén en `package.json`
2. Ejecuta `npm install` localmente y verifica que no haya errores
3. Revisa los logs de GitHub Actions

### Error: Build falla en GitHub Actions

**Solución:**
1. Ve a tu repositorio → Pestaña "Actions"
2. Revisa los logs del workflow
3. Verifica que Node.js version sea compatible (18 o 20)

### La aplicación carga pero no se conecta a la API

**Solución:**
1. Verifica que `VITE_API_URL` esté configurado en Azure
2. Verifica que la variable esté disponible en el build (debe empezar con `VITE_`)
3. Revisa la consola del navegador para ver qué URL está usando

---

## 📝 Notas Importantes

- ✅ Las variables de entorno deben empezar con `VITE_` para que Vite las incluya en el build
- ⚠️ Las variables se inyectan en tiempo de build, no en tiempo de ejecución
- ✅ Si cambias variables, necesitas hacer un nuevo despliegue
- ✅ El frontend se sirve como archivos estáticos, no necesita servidor Node.js

