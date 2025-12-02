# Configuración de Kubernetes

Esta carpeta contiene todos los manifiestos de Kubernetes necesarios para desplegar la aplicación Sistema de Ventas Multiempresa.

## 📁 Archivos Incluidos

- `namespace.yaml` - Namespace para aislar recursos
- `postgres-secret.yaml` - Secret para credenciales de PostgreSQL
- `app-secrets.yaml` - Secret para JWT y otras configuraciones
- `postgres-pvc.yaml` - PersistentVolumeClaim para datos de PostgreSQL
- `postgres-deployment.yaml` - Deployment de PostgreSQL
- `postgres-service.yaml` - Service de PostgreSQL
- `backend-deployment.yaml` - Deployment del backend
- `backend-service.yaml` - Service del backend
- `frontend-deployment.yaml` - Deployment del frontend
- `frontend-service.yaml` - Service del frontend
- `hpa-backend.yaml` - HorizontalPodAutoscaler para el backend (opcional)

## 🚀 Despliegue Rápido

### Orden de Aplicación

```bash
# 1. Crear namespace
kubectl apply -f namespace.yaml

# 2. Crear secrets
kubectl apply -f postgres-secret.yaml
kubectl apply -f app-secrets.yaml

# 3. Desplegar PostgreSQL
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# 4. Desplegar Backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# 5. Desplegar Frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 6. (Opcional) Configurar Autoescalado
kubectl apply -f hpa-backend.yaml
```

### Despliegue con un Comando

```bash
kubectl apply -f .
```

## 🔧 Configuración

### Cambiar Secrets

Los secrets están en base64. Para cambiarlos:

```bash
# Generar base64
echo -n "tu-password" | base64

# Editar los archivos secret y reemplazar el valor
```

O crear secrets directamente:

```bash
kubectl create secret generic postgres-secret \
  --from-literal=password=tu-password \
  --namespace=sistema-ventas

kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=tu-jwt-secret \
  --namespace=sistema-ventas
```

### Cambiar Imágenes Docker

Si usas un registro de imágenes, editar los deployments y cambiar:

```yaml
image: tu-registro/sistema-ventas-backend:latest
```

## 📊 Verificación

```bash
# Ver todos los recursos
kubectl get all -n sistema-ventas

# Ver pods
kubectl get pods -n sistema-ventas

# Ver servicios
kubectl get services -n sistema-ventas

# Ver logs
kubectl logs -f deployment/backend -n sistema-ventas
kubectl logs -f deployment/frontend -n sistema-ventas
```

## 🧹 Limpieza

```bash
# Eliminar todos los recursos
kubectl delete namespace sistema-ventas

# O eliminar recursos individuales
kubectl delete -f .
```

## 📝 Notas

- Ajustar `storageClassName` en `postgres-pvc.yaml` según tu clúster
- Para minikube, cambiar `type: LoadBalancer` a `type: NodePort` en los services
- Las imágenes deben estar disponibles en el clúster o en un registro accesible

