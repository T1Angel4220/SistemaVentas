# Cambios Realizados en el Jenkinsfile

## 📝 Resumen de Modificaciones

### 1. ✅ Eliminada la Dependencia de Kubernetes

- Kubernetes marcado como **completamente opcional**
- Documentación actualizada para indicar que NO es requerido
- Creado archivo `NOTA-KUBERNETES.md` explicando que es opcional

### 2. ✅ Configuración de GitHub y Rama Específica

El Jenkinsfile ahora:

1. **Clona el repositorio desde GitHub**
   - Variable configurable: `GITHUB_REPO_URL`
   - Por defecto: `https://github.com/tu-usuario/SistemaVentas.git`
   - **DEBES CAMBIAR ESTA URL** por tu URL real

2. **Cambia automáticamente a la rama `Jenkins/Johan`**
   - Variable: `GITHUB_BRANCH = 'Jenkins/Johan'`
   - Si la rama no existe localmente, la crea desde origin
   - Maneja errores si la rama no existe

3. **Hace pull de los últimos cambios**
   - Actualiza el código antes de construir
   - Continúa aunque el pull falle (código local)

### 3. ✅ Rutas Actualizadas

Todas las rutas se actualizaron para trabajar con el directorio clonado:

- Antes: `DesarrolloAPE/...`
- Ahora: `SistemaVentas/DesarrolloAPE/...`

### 4. ✅ Proceso Completo del Pipeline

El pipeline ahora ejecuta:

1. **Checkout**: Clona desde GitHub → Cambia a rama `Jenkins/Johan` → Pull
2. **Build Backend**: Construye imagen Docker del backend
3. **Build Frontend**: Construye imagen Docker del frontend
4. **Test**: Ejecuta pruebas (opcional, no falla el pipeline)
5. **Stop Old Containers**: Detiene contenedores anteriores
6. **Deploy**: Despliega con docker-compose
7. **Health Check**: Verifica que la aplicación funciona

---

## 🔧 Configuración Necesaria

### Antes de Ejecutar el Pipeline:

1. **El Jenkinsfile ya está configurado con la URL real:**
   ```groovy
   environment {
       GITHUB_REPO_URL = 'https://github.com/T1Angel4220/SistemaVentas.git'
       GITHUB_BRANCH = 'Jenkins/Johan'
       // ...
   }
   ```

2. **Asegurar que la rama existe en GitHub:**
   ```bash
   git checkout -b Jenkins/Johan
   git push -u origin Jenkins/Johan
   ```

3. **Subir el código a GitHub:**
   ```bash
   git add .
   git commit -m "Configuración para APE7"
   git push origin Jenkins/Johan
   ```

---

## 📋 Estructura del Pipeline

```
Pipeline
├── Checkout (GitHub → Jenkins/Johan → Pull)
├── Build Backend (Docker)
├── Build Frontend (Docker)
├── Test (Opcional)
├── Stop Old Containers
├── Deploy (docker-compose)
└── Health Check
```

---

## ✅ Verificación

Para verificar que todo está correcto:

1. ✅ Jenkinsfile actualizado con clonación desde GitHub
2. ✅ Rama `Jenkins/Johan` configurada
3. ✅ Rutas actualizadas para el directorio clonado
4. ✅ Kubernetes marcado como opcional en toda la documentación
5. ✅ Documentación actualizada con las nuevas instrucciones

---

## 🚀 Próximos Pasos

1. Editar `GITHUB_REPO_URL` en el Jenkinsfile
2. Crear la rama `Jenkins/Johan` en GitHub
3. Subir el código a esa rama
4. Crear el job en Jenkins
5. Ejecutar el pipeline

---

**Fecha de Actualización:** [Fecha actual]  
**Versión:** 2.0 - Con soporte para GitHub y rama específica

