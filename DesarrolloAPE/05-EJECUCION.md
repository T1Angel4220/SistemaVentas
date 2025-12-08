# Ejecución del Pipeline

Esta guía detalla el proceso completo de ejecución del pipeline de CI/CD y despliegue automatizado.

---

## 📋 Proceso Completo

### 1. Preparación del Entorno

Antes de ejecutar el pipeline, asegurar:

- ✅ Docker Desktop instalado y funcionando en Windows
- ✅ Jenkins corriendo en contenedor Docker
- ✅ Repositorio Git configurado
- ✅ Jenkinsfile en la raíz del proyecto
- ✅ Dockerfiles creados (backend y frontend)
- ✅ docker-compose.yml configurado

**Verificar en PowerShell:**
```powershell
# Verificar Docker
docker --version
docker-compose --version
docker ps

# Verificar Jenkins en contenedor
docker ps | Select-String "jenkins"

# Verificar Jenkins accesible
# Abrir navegador: http://localhost:8080
```

---

### 2. Configuración del Repositorio GitHub

**IMPORTANTE:** El pipeline está configurado para clonar desde GitHub y usar la rama `Jenkins/Johan`.

#### Pasos Previos:

1. **Asegúrate de tener el código en GitHub:**
   ```bash
   git remote add origin <tu-url-github>
   git checkout -b Jenkins/Johan
   git push -u origin Jenkins/Johan
   ```

2. **Verificar el Jenkinsfile:**
   - El `Jenkinsfile` ya está configurado con la URL: `https://github.com/T1Angel4220/SistemaVentas.git`
   - Si necesitas cambiarla, edita la variable `GITHUB_REPO_URL` en `DesarrolloAPE/Jenkinsfile`

3. **El pipeline automáticamente:**
   - Clonará el repositorio desde GitHub
   - Cambiará a la rama `Jenkins/Johan`
   - Hará pull de los últimos cambios
   - Construirá y desplegará la aplicación

---

### 3. Ejecución del Pipeline en Jenkins

#### Paso 1: Verificar Jenkins está Corriendo

En PowerShell:

```powershell
# Verificar contenedor de Jenkins
docker ps | Select-String "jenkins"

# Si no está corriendo, iniciarlo
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
docker-compose up -d jenkins

# Ver logs si hay problemas
docker logs sistema-ventas-jenkins
```

#### Paso 2: Acceder a Jenkins

1. Abrir navegador: `http://localhost:8080`
2. Iniciar sesión con tus credenciales

#### Paso 3: Crear o Abrir el Job

1. Click en **Dashboard**
2. Seleccionar el job **Sistema-Ventas-CI-CD**
3. O crear nuevo job si no existe (ver [03-JENKINS.md](./03-JENKINS.md))

#### Paso 4: Ejecutar Pipeline

**Ejecución Manual:**
1. Click en **Build Now**
2. Ver progreso en **Build History**
3. Click en el build para ver detalles

**Ejecución Automática (Webhook):**
1. Hacer push al repositorio
2. El pipeline se ejecutará automáticamente

---

### 4. Monitoreo del Pipeline

#### Ver Logs en Tiempo Real

1. Click en el build en ejecución
2. Click en **Console Output**
3. Ver logs paso a paso

#### Etapas del Pipeline

El pipeline ejecutará las siguientes etapas:

1. **Checkout**: Descarga código del repositorio
2. **Build Backend**: Construye imagen Docker del backend
3. **Build Frontend**: Construye imagen Docker del frontend
4. **Test**: Ejecuta pruebas (si están configuradas)
5. **Stop Old Containers**: Detiene contenedores anteriores
6. **Deploy**: Despliega con docker-compose
7. **Health Check**: Verifica que la aplicación funciona

---

### 5. Verificación Post-Despliegue

#### Verificar Contenedores

En PowerShell:

```powershell
# Ver todos los contenedores
docker ps

# O usando docker-compose
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
docker-compose ps
```

Deberías ver:
- `sistema-ventas-jenkins` (running)
- `sistema-ventas-db` (running)
- `sistema-ventas-backend` (running)
- `sistema-ventas-frontend` (running)

#### Verificar Logs

```powershell
# Logs de todos los servicios
docker-compose logs

# Logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Logs de Jenkins
docker logs sistema-ventas-jenkins
```

#### Verificar Aplicación

1. **Frontend**: Abrir `http://localhost` en el navegador
2. **Backend API**: Verificar `http://localhost:3001/health`
3. **Base de datos**: Verificar conexión

---

### 6. Kubernetes - NO Se Implementa

**IMPORTANTE:** Kubernetes NO se implementa en esta APE. Solo se investiga teóricamente.

La siguiente sección es solo informativa y NO es necesaria para completar la APE:

~~Si decides implementar Kubernetes (NO RECOMENDADO PARA ESTA APE):~~

#### Paso 1: Asegurar que Kubernetes está corriendo

```bash
# Con minikube
minikube status

# Con Docker Desktop
# Verificar que Kubernetes está habilitado
```

#### Paso 2: Aplicar Manifests

```bash
# Crear namespace
kubectl apply -f kubernetes/namespace.yaml

# Crear secrets
kubectl apply -f kubernetes/postgres-secret.yaml
kubectl apply -f kubernetes/app-secrets.yaml

# Desplegar PostgreSQL
kubectl apply -f kubernetes/postgres-pvc.yaml
kubectl apply -f kubernetes/postgres-deployment.yaml
kubectl apply -f kubernetes/postgres-service.yaml

# Desplegar Backend
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# Desplegar Frontend
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
```

#### Paso 3: Verificar Despliegue

```bash
# Ver pods
kubectl get pods -n sistema-ventas

# Ver servicios
kubectl get services -n sistema-ventas

# Ver logs
kubectl logs -f deployment/backend -n sistema-ventas
```

#### Paso 4: Acceder a la Aplicación

```bash
# Con minikube
minikube service frontend-service -n sistema-ventas

# O port-forward
kubectl port-forward service/frontend-service 8080:80 -n sistema-ventas
# Acceder en http://localhost:8080
```

---

### 7. Pruebas de Escalabilidad - NO Aplica

**Kubernetes NO se implementa**, por lo que las pruebas de escalabilidad en Kubernetes NO son necesarias.

#### Escalar Backend

```bash
# Escalar a 3 réplicas
kubectl scale deployment backend --replicas=3 -n sistema-ventas

# Verificar
kubectl get pods -n sistema-ventas -l app=backend
```

#### Escalar Frontend

```bash
# Escalar a 5 réplicas
kubectl scale deployment frontend --replicas=5 -n sistema-ventas

# Verificar
kubectl get pods -n sistema-ventas -l app=frontend
```

#### Verificar Distribución de Carga

```bash
# Ver pods y sus nodos
kubectl get pods -n sistema-ventas -o wide

# Ver uso de recursos
kubectl top pods -n sistema-ventas
```

---

### 8. Troubleshooting

#### Pipeline Falla en Build

**Problema**: Error al construir imágenes Docker

**Solución en PowerShell**:
```powershell
# Verificar Docker está corriendo
docker ps

# Verificar que Jenkins puede acceder a Docker
docker exec sistema-ventas-jenkins docker --version

# Verificar Dockerfiles existen
Get-ChildItem Dockerfile.*

# Construir manualmente para ver error
docker build -f DesarrolloAPE/Dockerfile.backend .
```

#### Pipeline Falla en Deploy

**Problema**: Error al desplegar con docker-compose

**Solución en PowerShell**:
```powershell
# Verificar docker-compose.yml
docker-compose config

# Detener contenedores existentes
docker-compose down

# Intentar deploy manual
docker-compose up -d
```

#### Contenedores No Inician

**Problema**: Contenedores se reinician constantemente

**Solución en PowerShell**:
```powershell
# Ver logs del contenedor
docker-compose logs backend

# Verificar variables de entorno
docker-compose exec backend env

# Verificar salud de base de datos
docker-compose exec postgres pg_isready
```

#### Jenkins No Puede Ejecutar Docker

**Problema**: Jenkins no puede construir imágenes Docker

**Solución**:
```powershell
# Verificar acceso al socket de Docker
docker exec sistema-ventas-jenkins ls -la /var/run/docker.sock

# Reiniciar Jenkins
docker-compose restart jenkins

# Verificar desde dentro del contenedor
docker exec sistema-ventas-jenkins docker ps
```

#### Kubernetes: Pods en CrashLoopBackOff

**Problema**: Pods no pueden iniciar

**Solución**:
```bash
# Ver logs del pod
kubectl logs <pod-name> -n sistema-ventas

# Describir pod para ver eventos
kubectl describe pod <pod-name> -n sistema-ventas

# Verificar configuración
kubectl get deployment backend -n sistema-ventas -o yaml
```

---

### 9. Re-ejecución del Pipeline

#### Después de Cambios en el Código

1. Hacer commit de los cambios:
   ```powershell
   git add .
   git commit -m "Actualización de código"
   git push origin Jenkins/Johan
   ```

2. Si hay webhook configurado, el pipeline se ejecutará automáticamente
3. O ejecutar manualmente desde Jenkins

#### Forzar Re-construcción

En PowerShell:

```powershell
# Eliminar imágenes antiguas
docker-compose down
docker rmi sistema-ventas-backend sistema-ventas-frontend

# Re-ejecutar pipeline desde Jenkins
# O construir manualmente
docker-compose build --no-cache
docker-compose up -d
```

---

### 10. Métricas y Monitoreo

#### Ver Estadísticas de Contenedores

En PowerShell:

```powershell
# Estadísticas en tiempo real
docker stats

# Estadísticas específicas
docker stats sistema-ventas-backend sistema-ventas-frontend sistema-ventas-jenkins
```

#### Kubernetes - NO Aplica

Kubernetes NO se implementa en esta APE.

---

## 📝 Checklist de Ejecución

- [ ] Docker Desktop instalado y funcionando en Windows
- [ ] Jenkins corriendo en contenedor Docker
- [ ] Jenkins accesible en http://localhost:8080
- [ ] Repositorio configurado en GitHub
- [ ] Jenkinsfile en DesarrolloAPE/
- [ ] Dockerfiles creados (backend y frontend)
- [ ] docker-compose.yml configurado con Jenkins
- [ ] Job creado en Jenkins
- [ ] Pipeline ejecutado exitosamente
- [ ] Contenedores desplegados y funcionando
- [ ] Aplicación accesible en navegador
- [ ] Logs verificados
- [ ] Kubernetes investigado teóricamente (NO se implementa)

---

## 📸 Capturas de Pantalla Requeridas

1. **Dashboard de Jenkins** con el job creado
2. **Ejecución del Pipeline** (Blue Ocean o clásico)
3. **Logs del Pipeline** mostrando todas las etapas
4. **Estado del Pipeline** (Success/Failed)
5. **Contenedores Docker** en ejecución (`docker ps`)
6. **Aplicación Frontend** funcionando en navegador
7. **API Backend** respondiendo (health check)
8. **Logs de Contenedores** (backend, frontend, postgres)
9. **NO aplica** - Kubernetes no se implementa

---

## 🔗 Comandos de Referencia Rápida (PowerShell)

```powershell
# Docker Compose
docker-compose up -d          # Iniciar servicios
docker-compose down           # Detener servicios
docker-compose logs -f        # Ver logs
docker-compose ps             # Ver estado

# Jenkins en Docker
docker-compose up -d jenkins  # Iniciar Jenkins
docker-compose stop jenkins   # Detener Jenkins
docker-compose restart jenkins # Reiniciar Jenkins
docker logs -f sistema-ventas-jenkins # Ver logs de Jenkins

# Acceder a Jenkins
# http://localhost:8080
# Build Now para ejecutar pipeline

# Kubernetes - NO se usa en esta APE
```

---

**Próximo Paso:** [Resultados Obtenidos](./06-RESULTADOS.md)

