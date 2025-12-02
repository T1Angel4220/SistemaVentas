# Guía Rápida - APE7

Esta es una guía rápida de referencia para completar la APE7.

---

## 🚀 Inicio Rápido

### 1. Instalar Herramientas

```bash
# Ver guía completa: 01-INSTALACION.md
# Docker Desktop: https://www.docker.com/products/docker-desktop
# Jenkins: https://www.jenkins.io/download/
```

### 2. Construir y Ejecutar con Docker

```bash
cd DesarrolloAPE
docker-compose build
docker-compose up -d
```

**Verificar:**
- Frontend: http://localhost
- Backend: http://localhost:3001

### 3. Configurar Jenkins

1. Abrir: http://localhost:8080
2. Crear nuevo job tipo "Pipeline"
3. Configurar para usar Jenkinsfile desde SCM o pegar directamente
4. Ejecutar "Build Now"

### 4. Kubernetes - NO Se Implementa

**Kubernetes NO se implementa en esta APE.** Solo se investiga teóricamente.

```bash
cd kubernetes
kubectl apply -f namespace.yaml
kubectl apply -f postgres-secret.yaml
kubectl apply -f app-secrets.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

---

## 📋 Checklist de Entrega

### Documentación
- [ ] Investigación sobre Jenkins completada
- [ ] Investigación sobre Docker completada
- [ ] Investigación sobre Kubernetes completada
- [ ] Guías de instalación documentadas
- [ ] Proceso completo documentado

### Implementación
- [ ] Dockerfiles creados (backend y frontend)
- [ ] docker-compose.yml configurado
- [ ] Jenkinsfile creado y funcionando
- [ ] Pipeline ejecutado exitosamente
- [ ] Aplicación desplegada en contenedores
- [ ] Kubernetes investigado teóricamente (NO se implementa)
- [ ] (Opcional) Escalabilidad probada

### Capturas de Pantalla
- [ ] Instalación de herramientas
- [ ] Construcción de imágenes Docker
- [ ] Contenedores en ejecución
- [ ] Pipeline de Jenkins en ejecución
- [ ] Logs del pipeline
- [ ] Aplicación funcionando
- [ ] NO aplica - Kubernetes no se implementa
- [ ] (Opcional) Escalado de réplicas

### Informe Final
- [ ] Informe en formato PDF
- [ ] Todas las capturas incluidas
- [ ] Documentación completa
- [ ] Conclusiones y recomendaciones

---

## 🔧 Comandos Útiles

### Docker

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Ver contenedores
docker ps

# Ver imágenes
docker images
```

### Jenkins

```bash
# Acceder a Jenkins
http://localhost:8080

# Ver logs de Jenkins (Linux)
sudo tail -f /var/log/jenkins/jenkins.log

# Reiniciar Jenkins (Linux)
sudo systemctl restart jenkins
```

### Kubernetes

```bash
# Ver pods
kubectl get pods -n sistema-ventas

# Ver servicios
kubectl get services -n sistema-ventas

# Ver logs
kubectl logs -f deployment/backend -n sistema-ventas

# Escalar
kubectl scale deployment backend --replicas=3 -n sistema-ventas

# Eliminar todo
kubectl delete namespace sistema-ventas
```

---

## 📁 Estructura de Archivos

```
DesarrolloAPE/
├── README.md                    # Índice principal
├── 01-INSTALACION.md           # Guía de instalación
├── 02-DOCKER.md                # Configuración Docker
├── 03-JENKINS.md               # Configuración Jenkins
~~├── 04-KUBERNETES.md~~            # ELIMINADO - Kubernetes no se implementa
├── 05-EJECUCION.md             # Guía de ejecución
├── 06-RESULTADOS.md            # Resultados obtenidos
├── 07-CONCLUSIONES.md          # Conclusiones
├── GUIA-RAPIDA.md              # Esta guía
├── Dockerfile.backend          # Dockerfile del backend
├── Dockerfile.frontend         # Dockerfile del frontend
├── docker-compose.yml          # Orquestación Docker
├── Jenkinsfile                 # Pipeline CI/CD
├── .dockerignore               # Archivos excluidos
├── kubernetes/                 # NO necesario (solo investigación teórica)
│   ├── namespace.yaml
│   ├── postgres-*.yaml
│   ├── backend-*.yaml
│   ├── frontend-*.yaml
│   └── hpa-backend.yaml
├── capturas/                   # Capturas de pantalla
└── logs/                       # Logs de ejecución
```

---

## 🆘 Solución de Problemas Comunes

### Docker no inicia
- Verificar que WSL 2 está instalado (Windows)
- Reiniciar Docker Desktop
- Verificar que la virtualización está habilitada en BIOS

### Jenkins no accesible
- Verificar que el puerto 8080 no está en uso
- Verificar que Jenkins está corriendo
- Revisar logs de Jenkins

### Contenedores no inician
- Verificar logs: `docker-compose logs`
- Verificar variables de entorno
- Verificar que la base de datos está saludable

### Pipeline falla
- Verificar que Docker está disponible para Jenkins
- Verificar permisos de Docker
- Revisar logs del pipeline en Jenkins

---

## 📞 Recursos Adicionales

- **Docker Docs**: https://docs.docker.com/
- **Jenkins Docs**: https://www.jenkins.io/doc/
- **Kubernetes Docs**: https://kubernetes.io/docs/ (solo para investigación teórica)
- **Docker Compose**: https://docs.docker.com/compose/

---

**¡Éxito en tu APE7!** 🎉

