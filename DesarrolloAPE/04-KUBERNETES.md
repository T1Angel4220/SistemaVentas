# Configuración de Kubernetes

Esta guía explica cómo desplegar la aplicación en Kubernetes para orquestación de contenedores y escalabilidad.

---

## 📋 Objetivos

- Desplegar la aplicación en un clúster de Kubernetes
- Configurar servicios y deployments
- Probar la escalabilidad de la aplicación
- Gestionar aplicaciones en contenedores

---

## 1. Requisitos Previos

- Kubernetes instalado (minikube, Docker Desktop con K8s, o clúster real)
- kubectl configurado
- Docker instalado
- Imágenes Docker construidas

---

## 2. Estructura de Archivos

Crear carpeta `kubernetes/` en la raíz del proyecto:

```
kubernetes/
├── namespace.yaml
├── postgres-deployment.yaml
├── postgres-service.yaml
├── postgres-pvc.yaml
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
└── ingress.yaml (opcional)
```

---

## 3. Namespace

Crear namespace para aislar recursos:

**kubernetes/namespace.yaml:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sistema-ventas
  labels:
    name: sistema-ventas
```

---

## 4. PostgreSQL Deployment y Service

**kubernetes/postgres-pvc.yaml:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: sistema-ventas
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

**kubernetes/postgres-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: sistema-ventas
  labels:
    app: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: sistema_ventas
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

**kubernetes/postgres-service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: sistema-ventas
spec:
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
  type: ClusterIP
```

**kubernetes/postgres-secret.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: sistema-ventas
type: Opaque
data:
  password: cG9zdGdyZXM=  # base64 de "postgres"
```

---

## 5. Backend Deployment y Service

**kubernetes/backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: sistema-ventas
  labels:
    app: backend
spec:
  replicas: 2  # Múltiples réplicas para escalabilidad
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: sistema-ventas-backend:latest
        # O usar imagen de registro: tu-registro/sistema-ventas-backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "postgres-service"
        - name: DB_PORT
          value: "5432"
        - name: DB_NAME
          value: "sistema_ventas"
        - name: DB_USER
          value: "postgres"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

**kubernetes/backend-service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: sistema-ventas
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
  # Para desarrollo local, usar NodePort:
  # type: NodePort
  # nodePort: 30001
```

---

## 6. Frontend Deployment y Service

**kubernetes/frontend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: sistema-ventas
  labels:
    app: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: sistema-ventas-frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_URL
          value: "http://backend-service"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

**kubernetes/frontend-service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: sistema-ventas
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
  # Para minikube, usar NodePort:
  # type: NodePort
  # nodePort: 30002
```

---

## 7. Secrets

**kubernetes/app-secrets.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: sistema-ventas
type: Opaque
data:
  jwt-secret: dHUtanN0LXNlY3JldC1tdXktc2VndXJv  # base64 de tu secret
```

**Crear secret manualmente:**
```bash
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=tu-jwt-secret-muy-seguro \
  --namespace=sistema-ventas
```

---

## 8. Despliegue en Kubernetes

### Paso 1: Crear Namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

### Paso 2: Crear Secrets

```bash
kubectl apply -f kubernetes/postgres-secret.yaml
kubectl apply -f kubernetes/app-secrets.yaml
```

### Paso 3: Desplegar PostgreSQL

```bash
kubectl apply -f kubernetes/postgres-pvc.yaml
kubectl apply -f kubernetes/postgres-deployment.yaml
kubectl apply -f kubernetes/postgres-service.yaml
```

### Paso 4: Construir y Subir Imágenes

Si usas minikube:

```bash
# Configurar Docker para usar minikube
eval $(minikube docker-env)

# Construir imágenes
docker build -f Dockerfile.backend -t sistema-ventas-backend .
docker build -f Dockerfile.frontend -t sistema-ventas-frontend .
```

Si usas un registro:

```bash
# Tag imágenes
docker tag sistema-ventas-backend:latest tu-registro/sistema-ventas-backend:latest
docker tag sistema-ventas-frontend:latest tu-registro/sistema-ventas-frontend:latest

# Push imágenes
docker push tu-registro/sistema-ventas-backend:latest
docker push tu-registro/sistema-ventas-frontend:latest
```

### Paso 5: Desplegar Backend y Frontend

```bash
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
```

### Paso 6: Verificar Despliegue

```bash
# Ver pods
kubectl get pods -n sistema-ventas

# Ver servicios
kubectl get services -n sistema-ventas

# Ver deployments
kubectl get deployments -n sistema-ventas

# Ver logs
kubectl logs -f deployment/backend -n sistema-ventas
kubectl logs -f deployment/frontend -n sistema-ventas
```

---

## 9. Acceso a la Aplicación

### Con minikube:

```bash
# Obtener URL del servicio
minikube service frontend-service -n sistema-ventas

# O usar tunnel
minikube tunnel
```

### Con NodePort:

```bash
# Obtener IP del nodo
kubectl get nodes -o wide

# Acceder en: http://NODE_IP:30002
```

### Con LoadBalancer:

```bash
# Obtener IP externa
kubectl get service frontend-service -n sistema-ventas
```

---

## 10. Escalabilidad

### Escalado Manual

```bash
# Escalar backend a 3 réplicas
kubectl scale deployment backend --replicas=3 -n sistema-ventas

# Escalar frontend a 5 réplicas
kubectl scale deployment frontend --replicas=5 -n sistema-ventas
```

### Autoescalado Horizontal (HPA)

**kubernetes/hpa-backend.yaml:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: sistema-ventas
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Aplicar:
```bash
kubectl apply -f kubernetes/hpa-backend.yaml
```

---

## 11. Rolling Updates

### Actualizar Imagen

```bash
# Actualizar imagen del deployment
kubectl set image deployment/backend \
  backend=sistema-ventas-backend:v2 \
  -n sistema-ventas

# Ver progreso del rollout
kubectl rollout status deployment/backend -n sistema-ventas
```

### Rollback

```bash
# Ver historial
kubectl rollout history deployment/backend -n sistema-ventas

# Rollback a versión anterior
kubectl rollout undo deployment/backend -n sistema-ventas
```

---

## 12. ConfigMaps

Para configuración no sensible:

**kubernetes/configmap.yaml:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: sistema-ventas
data:
  NODE_ENV: "production"
  API_URL: "http://backend-service"
```

Usar en deployment:
```yaml
envFrom:
- configMapRef:
    name: app-config
```

---

## 13. Troubleshooting

### Ver Logs

```bash
# Logs de un pod específico
kubectl logs <pod-name> -n sistema-ventas

# Logs de todos los pods de un deployment
kubectl logs -f deployment/backend -n sistema-ventas

# Logs anteriores (si el pod se reinició)
kubectl logs <pod-name> --previous -n sistema-ventas
```

### Describir Recursos

```bash
# Describir pod
kubectl describe pod <pod-name> -n sistema-ventas

# Describir deployment
kubectl describe deployment backend -n sistema-ventas

# Describir service
kubectl describe service backend-service -n sistema-ventas
```

### Ejecutar Comandos en Pods

```bash
# Acceder a shell del pod
kubectl exec -it <pod-name> -n sistema-ventas -- sh

# Ejecutar comando
kubectl exec <pod-name> -n sistema-ventas -- npm test
```

### Eliminar y Recrear

```bash
# Eliminar deployment
kubectl delete deployment backend -n sistema-ventas

# Recrear
kubectl apply -f kubernetes/backend-deployment.yaml
```

---

## 14. Limpieza

```bash
# Eliminar todos los recursos del namespace
kubectl delete namespace sistema-ventas

# O eliminar recursos individuales
kubectl delete -f kubernetes/
```

---

## 📝 Capturas de Pantalla Necesarias

1. Pods en ejecución (`kubectl get pods`)
2. Servicios creados (`kubectl get services`)
3. Deployments (`kubectl get deployments`)
4. Logs de los pods
5. Escalado de réplicas
6. Aplicación funcionando
7. Métricas de recursos (si se configuró HPA)

---

## 🔗 Comandos Útiles

```bash
# Ver todos los recursos
kubectl get all -n sistema-ventas

# Ver eventos
kubectl get events -n sistema-ventas --sort-by='.lastTimestamp'

# Ver uso de recursos
kubectl top pods -n sistema-ventas
kubectl top nodes

# Port forwarding para acceso local
kubectl port-forward service/backend-service 3001:80 -n sistema-ventas
kubectl port-forward service/frontend-service 8080:80 -n sistema-ventas
```

---

**Próximo Paso:** [Ejecución del Pipeline](./05-EJECUCION.md)

