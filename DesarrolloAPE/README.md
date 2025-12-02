# APE7: Automatización del Despliegue de Software

## 📋 Índice

1. [Introducción](#introducción)
2. [Investigación](#investigación)
   - [Jenkins](#jenkins)
   - [Docker](#docker)
   - [Kubernetes](#kubernetes)
3. [Guías de Implementación](#guías-de-implementación)
   - [Instalación de Herramientas](#instalación-de-herramientas)
   - [Configuración de Docker](#configuración-de-docker)
   - [Configuración de Jenkins](#configuración-de-jenkins)
   - [Configuración de Kubernetes](#configuración-de-kubernetes)
4. [Archivos de Configuración](#archivos-de-configuración)
5. [Ejecución del Pipeline](#ejecución-del-pipeline)
6. [Resultados Obtenidos](#resultados-obtenidos)
7. [Conclusiones](#conclusiones)

---

## 🎯 Introducción

Este documento contiene la implementación completa de la **APE7: Investigación y Práctica sobre la Automatización del Despliegue** para el Sistema de Ventas Multiempresa.

El objetivo es automatizar el despliegue de la aplicación utilizando herramientas modernas de DevOps:
- **Jenkins**: Para la integración y entrega continua (CI/CD)
- **Docker**: Para la containerización de la aplicación
- **Kubernetes**: Investigación teórica únicamente (NO se implementa)

---

## 📚 Investigación

### Jenkins

**¿Qué es Jenkins?**
Jenkins es un servidor de automatización open-source escrito en Java que facilita la integración continua y la entrega continua (CI/CD).

**Funcionamiento Básico:**
- Jenkins funciona como un servidor que ejecuta tareas automatizadas llamadas "jobs" o "pipelines"
- Los pipelines pueden ser definidos como código (Jenkinsfile) o mediante la interfaz web
- Jenkins puede integrarse con Git, Docker y muchas otras herramientas

**Conceptos Clave:**
- **Pipeline**: Secuencia de pasos automatizados
- **Job**: Tarea individual que puede ejecutarse
- **Node/Agent**: Máquina que ejecuta los jobs
- **Plugin**: Extensión que añade funcionalidad

**Integración Continua (CI):**
- Automatiza la compilación y pruebas cada vez que se hace commit
- Detecta errores tempranamente
- Mantiene el código siempre en un estado funcional

**Entrega Continua (CD):**
- Automatiza el despliegue a entornos de producción
- Reduce errores humanos
- Permite despliegues frecuentes y confiables

**Configuración de Pipelines:**
- **Declarative Pipeline**: Sintaxis basada en Groovy, más simple y legible
- **Scripted Pipeline**: Más flexible pero más complejo
- Los pipelines se definen en un archivo `Jenkinsfile` en el repositorio

**Ventajas:**
- Open-source y gratuito
- Gran ecosistema de plugins
- Comunidad activa
- Escalable y flexible

**Desventajas:**
- Requiere mantenimiento del servidor
- Puede ser complejo para proyectos pequeños
- Consume recursos del servidor

---

### Docker

**¿Qué es Docker?**
Docker es una plataforma de containerización que permite empaquetar aplicaciones y sus dependencias en contenedores ligeros y portables.

**Conceptos Fundamentales:**
- **Imagen**: Plantilla de solo lectura para crear contenedores
- **Contenedor**: Instancia ejecutable de una imagen
- **Dockerfile**: Archivo de texto con instrucciones para construir una imagen
- **Docker Hub**: Repositorio público de imágenes Docker

**Ventajas de Docker:**
- **Portabilidad**: "Funciona en mi máquina" ya no es un problema
- **Aislamiento**: Cada contenedor tiene su propio entorno
- **Eficiencia**: Menor uso de recursos que máquinas virtuales
- **Escalabilidad**: Fácil crear múltiples instancias
- **Consistencia**: Mismo entorno en desarrollo, testing y producción

**Uso de Contenedores:**
- Empaquetar aplicaciones con todas sus dependencias
- Ejecutar aplicaciones de forma aislada
- Facilitar el despliegue en diferentes entornos
- Simplificar la gestión de dependencias

**Creación de Imágenes:**
- Se define un `Dockerfile` con las instrucciones
- Se construye la imagen con `docker build`
- Se puede subir a un registro (Docker Hub, AWS ECR, etc.)

**Ejecución de Contenedores:**
- `docker run` para ejecutar un contenedor
- `docker-compose` para orquestar múltiples contenedores
- Contenedores pueden comunicarse mediante redes Docker

**Docker Compose:**
- Herramienta para definir y ejecutar aplicaciones multi-contenedor
- Define servicios, redes y volúmenes en un archivo YAML
- Facilita la gestión de aplicaciones complejas

---

### Kubernetes

**¿Qué es Kubernetes?**
Kubernetes (K8s) es una plataforma open-source para orquestar contenedores, desarrollada originalmente por Google.

**Conceptos Clave:**
- **Cluster**: Conjunto de nodos (máquinas) que ejecutan contenedores
- **Pod**: Unidad más pequeña, puede contener uno o más contenedores
- **Deployment**: Define el estado deseado de la aplicación
- **Service**: Expone los pods como un servicio de red
- **Namespace**: División lógica del cluster

**Orquestación de Contenedores:**
- Gestiona automáticamente el ciclo de vida de los contenedores
- Distribuye la carga entre múltiples nodos
- Detecta y reemplaza contenedores que fallan
- Escala automáticamente según la demanda

**Despliegue en Clústeres:**
- Permite ejecutar aplicaciones en múltiples servidores
- Distribuye pods entre nodos disponibles
- Gestiona la comunicación entre servicios

**Escalabilidad:**
- **Escalado Horizontal**: Añadir más pods/replicas
- **Escalado Vertical**: Aumentar recursos de pods existentes
- **Autoescalado**: Kubernetes ajusta automáticamente según métricas

**Gestión de Aplicaciones:**
- **Rolling Updates**: Actualizaciones sin downtime
- **Rollbacks**: Revertir a versiones anteriores
- **Health Checks**: Verificación de salud de pods
- **Resource Limits**: Control de recursos (CPU, memoria)

**Ventajas:**
- Alta disponibilidad
- Escalabilidad automática
- Auto-recuperación
- Gestión declarativa del estado

**Desventajas:**
- Curva de aprendizaje pronunciada
- Requiere infraestructura adecuada
- Puede ser excesivo para aplicaciones simples

---

## 🛠️ Guías de Implementación

### Instalación de Herramientas

Ver el archivo: [01-INSTALACION.md](./01-INSTALACION.md)

### Configuración de Docker

Ver el archivo: [02-DOCKER.md](./02-DOCKER.md)

### Configuración de Jenkins

Ver el archivo: [03-JENKINS.md](./03-JENKINS.md)

### Investigación sobre Kubernetes (Solo Teórica)

Kubernetes se investiga solo teóricamente. No se implementa en esta APE. Ver sección de investigación más arriba.

---

## 📁 Archivos de Configuración

### Docker
- `Dockerfile.backend` - Imagen Docker para el backend
- `Dockerfile.frontend` - Imagen Docker para el frontend
- `docker-compose.yml` - Orquestación de servicios
- `.dockerignore` - Archivos excluidos de la imagen

### Jenkins
- `Jenkinsfile` - Pipeline de CI/CD
- `jenkins/plugins.txt` - Lista de plugins necesarios

### Kubernetes
- **NO se implementa** - Solo investigación teórica
- La carpeta `kubernetes/` existe pero NO es necesaria para esta APE

---

## 🚀 Ejecución del Pipeline

Ver el archivo: [05-EJECUCION.md](./05-EJECUCION.md)

---

## 📊 Resultados Obtenidos

Ver el archivo: [06-RESULTADOS.md](./06-RESULTADOS.md)

---

## ✅ Conclusiones

Ver el archivo: [07-CONCLUSIONES.md](./07-CONCLUSIONES.md)

---

## 📝 Notas Adicionales

- Todas las capturas de pantalla deben guardarse en la carpeta `capturas/`
- Los logs de ejecución deben guardarse en la carpeta `logs/`
- El informe final debe incluir todas las capturas y documentación

---

**Autor:** [Tu Nombre]  
**Fecha:** [Fecha de Entrega]  
**Asignatura:** Gestión de Pruebas e Implantación de Software  
**Universidad:** Universidad Técnica de Ambato

