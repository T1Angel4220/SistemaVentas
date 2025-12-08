# 🚀 INICIO AQUÍ - APE7

¡Bienvenido! Este es el punto de partida para completar tu APE7: **Investigación y Práctica sobre la Automatización del Despliegue**.

---

## 📚 ¿Por Dónde Empezar?

### 🚀 ¿Solo Tienes Docker Instalado?

👉 **[GUIA-DESDE-CERO.md](./GUIA-DESDE-CERO.md)** - **¡Empieza aquí!** Guía paso a paso desde cero, asumiendo que solo tienes Docker instalado. Te lleva desde iniciar Jenkins hasta ejecutar el pipeline completo.

### 1. Lee el README Principal
👉 **[README.md](./README.md)** - Contiene el índice completo y la estructura de toda la documentación.

### 2. Sigue las Guías en Orden

1. **[01-INSTALACION.md](./01-INSTALACION.md)** (Solo Windows)
   - Instala Docker Desktop para Windows
   - Configura Jenkins en contenedor Docker
   - **IMPORTANTE:** Jenkins se ejecuta en contenedor, NO se instala directamente

2. **[02-DOCKER.md](./02-DOCKER.md)**
   - Aprende sobre Docker
   - Crea las imágenes Docker
   - Configura docker-compose

3. **[03-JENKINS.md](./03-JENKINS.md)**
   - Configura Jenkins en contenedor Docker
   - Crea el pipeline CI/CD
   - Automatiza el despliegue

4. **Kubernetes** - Solo investigación teórica
   - **NO se implementa** - Solo se investiga y documenta teóricamente
   - La carpeta `kubernetes/` NO es necesaria

5. **[05-EJECUCION.md](./05-EJECUCION.md)**
   - Ejecuta el pipeline completo
   - Verifica el funcionamiento

6. **[06-RESULTADOS.md](./06-RESULTADOS.md)**
   - Documenta los resultados obtenidos
   - Registra métricas y tiempos

7. **[07-CONCLUSIONES.md](./07-CONCLUSIONES.md)**
   - Escribe tus conclusiones
   - Reflexiona sobre lo aprendido

---

## 🎯 Objetivos de la APE7

- ✅ Investigar sobre Jenkins, Docker y Kubernetes (Kubernetes solo teóricamente)
- ✅ Crear pipeline de automatización en Jenkins
- ✅ Containerizar la aplicación con Docker
- ✅ Desplegar automáticamente la aplicación
- ✅ Clonar desde GitHub y usar rama `Jenkins/Johan`
- ✅ Investigar Kubernetes teóricamente (NO se implementa)
- ✅ Documentar todo el proceso

---

## 📁 Archivos de Configuración

Todos los archivos necesarios están listos:

- ✅ `Dockerfile.backend` - Imagen del backend
- ✅ `Dockerfile.frontend` - Imagen del frontend
- ✅ `docker-compose.yml` - Orquestación de servicios
- ✅ `Jenkinsfile` - Pipeline CI/CD
- ⚠️ `kubernetes/` - NO necesario (solo investigación teórica)

---

## ⚡ Inicio Rápido

### 1. Configurar GitHub

```bash
# Asegúrate de tener tu código en GitHub en la rama Jenkins/Johan
git checkout -b Jenkins/Johan
git push -u origin Jenkins/Johan
```

### 2. Verificar Jenkinsfile

El `Jenkinsfile` ya está configurado con la URL del repositorio:
```groovy
GITHUB_REPO_URL = 'https://github.com/T1Angel4220/SistemaVentas.git'
```

Si necesitas cambiarla, edita el archivo `DesarrolloAPE/Jenkinsfile`.

### 3. Iniciar Jenkins en Contenedor (Windows)

```powershell
# Navegar a la carpeta del proyecto
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE

# Iniciar Jenkins en contenedor
docker-compose up -d jenkins

# Obtener contraseña inicial
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 4. Construir y Ejecutar Aplicación con Docker (Opcional)

```powershell
# Construir y ejecutar localmente (opcional, para probar)
docker-compose build
docker-compose up -d

# Verificar que funciona
# Frontend: http://localhost
# Backend: http://localhost:3001
# Jenkins: http://localhost:8080
```

### 5. Configurar Pipeline en Jenkins

1. Abrir http://localhost:8080
2. Completar configuración inicial (usar contraseña obtenida arriba)
3. Instalar plugins sugeridos
4. Crear job tipo **Pipeline**
5. En Pipeline Definition: **Pipeline script**
6. Copiar y pegar el contenido de `DesarrolloAPE/Jenkinsfile`
7. Guardar y ejecutar "Build Now"

---

## 📸 Capturas de Pantalla

No olvides tomar capturas de pantalla durante todo el proceso y guardarlas en:
- `capturas/` - Para todas las capturas necesarias

---

## 📝 Checklist Rápido

- [ ] Leer README.md
- [ ] Instalar Docker Desktop para Windows
- [ ] Iniciar Jenkins en contenedor Docker
- [ ] Configurar Jenkins (plugins, credenciales)
- [ ] Seguir guías en orden
- [ ] Ejecutar pipeline
- [ ] Tomar capturas de pantalla
- [ ] Documentar resultados
- [ ] Escribir conclusiones
- [ ] Generar informe PDF

---

## 🆘 ¿Necesitas Ayuda?

- Revisa la **[GUIA-RAPIDA.md](./GUIA-RAPIDA.md)** para comandos comunes
- Consulta la documentación oficial:
  - Docker: https://docs.docker.com/
  - Jenkins: https://www.jenkins.io/doc/
  - Kubernetes: https://kubernetes.io/docs/

---

## ✅ Próximos Pasos

**Si solo tienes Docker instalado:**
1. **Sigue [GUIA-DESDE-CERO.md](./GUIA-DESDE-CERO.md)** - Guía completa paso a paso desde cero

**Si quieres entender todo el proceso:**
1. **Lee el [README.md](./README.md)** para entender la estructura completa
2. **Sigue [01-INSTALACION.md](./01-INSTALACION.md)** para instalar las herramientas
3. **Continúa con las demás guías en orden**

---

**¡Éxito en tu APE7!** 🎉

*Recuerda: La documentación está completa, solo necesitas seguir los pasos y documentar tus resultados.*

