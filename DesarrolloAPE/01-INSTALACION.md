# Guía de Instalación de Herramientas

Esta guía detalla la instalación de todas las herramientas necesarias para completar la APE7.

---

## 📋 Requisitos Previos

- Sistema operativo: Windows 10/11, Linux o macOS
- Mínimo 8GB de RAM (recomendado 16GB)
- 20GB de espacio libre en disco
- Acceso a internet

---

## 1. Instalación de Docker

### Windows

1. **Descargar Docker Desktop:**
   - Visitar: https://www.docker.com/products/docker-desktop
   - Descargar Docker Desktop para Windows
   - Ejecutar el instalador

2. **Requisitos del Sistema:**
   - Windows 10 64-bit: Pro, Enterprise o Education (Build 19041 o superior)
   - WSL 2 habilitado
   - Virtualización habilitada en BIOS

3. **Instalación:**
   ```powershell
   # Verificar si WSL 2 está instalado
   wsl --version
   
   # Si no está instalado, instalar WSL 2
   wsl --install
   
   # Reiniciar el sistema
   ```
   
4. **Verificar Instalación:**
   ```powershell
   docker --version
   docker-compose --version
   docker run hello-world
   ```

### Linux (Ubuntu/Debian)

1. **Actualizar el sistema:**
   ```bash
   sudo apt-get update
   sudo apt-get upgrade -y
   ```

2. **Instalar dependencias:**
   ```bash
   sudo apt-get install -y \
       apt-transport-https \
       ca-certificates \
       curl \
       gnupg \
       lsb-release
   ```

3. **Añadir la clave GPG oficial de Docker:**
   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

4. **Configurar el repositorio:**
   ```bash
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

5. **Instalar Docker:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
   ```

6. **Añadir usuario al grupo docker:**
   ```bash
   sudo usermod -aG docker $USER
   # Cerrar sesión y volver a iniciar
   ```

7. **Verificar Instalación:**
   ```bash
   docker --version
   docker compose version
   docker run hello-world
   ```

### macOS

1. **Descargar Docker Desktop:**
   - Visitar: https://www.docker.com/products/docker-desktop
   - Descargar Docker Desktop para Mac
   - Abrir el archivo .dmg y arrastrar Docker a Applications

2. **Iniciar Docker Desktop:**
   - Abrir Docker Desktop desde Applications
   - Esperar a que se inicie completamente

3. **Verificar Instalación:**
   ```bash
   docker --version
   docker-compose --version
   docker run hello-world
   ```

---

## 2. Instalación de Jenkins

### Windows

1. **Requisitos:**
   - Java JDK 11 o superior
   - Git instalado

2. **Instalar Java JDK:**
   - Descargar desde: https://adoptium.net/
   - Instalar JDK 11 o superior
   - Configurar JAVA_HOME en variables de entorno

3. **Descargar Jenkins:**
   - Visitar: https://www.jenkins.io/download/
   - Descargar Jenkins.war

4. **Iniciar Jenkins:**
   ```powershell
   # Navegar a la carpeta donde está jenkins.war
   cd C:\jenkins
   
   # Iniciar Jenkins
   java -jar jenkins.war --httpPort=8080
   ```

5. **Configuración Inicial:**
   - Abrir navegador en: http://localhost:8080
   - Copiar la contraseña inicial del archivo mostrado
   - Instalar plugins sugeridos
   - Crear usuario administrador

### Linux (Ubuntu/Debian)

1. **Instalar Java JDK:**
   ```bash
   sudo apt update
   sudo apt install -y openjdk-11-jdk
   ```

2. **Añadir clave del repositorio Jenkins:**
   ```bash
   curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
     /usr/share/keyrings/jenkins-keyring.asc > /dev/null
   ```

3. **Añadir repositorio Jenkins:**
   ```bash
   echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
     https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
     /etc/apt/sources.list.d/jenkins.list > /dev/null
   ```

4. **Instalar Jenkins:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y jenkins
   ```

5. **Iniciar Jenkins:**
   ```bash
   sudo systemctl start jenkins
   sudo systemctl enable jenkins
   sudo systemctl status jenkins
   ```

6. **Configuración Inicial:**
   - Abrir navegador en: http://localhost:8080
   - Obtener contraseña inicial:
     ```bash
     sudo cat /var/lib/jenkins/secrets/initialAdminPassword
     ```
   - Instalar plugins sugeridos
   - Crear usuario administrador

### macOS

1. **Instalar Homebrew (si no está instalado):**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Instalar Java:**
   ```bash
   brew install openjdk@11
   ```

3. **Instalar Jenkins:**
   ```bash
   brew install jenkins-lts
   ```

4. **Iniciar Jenkins:**
   ```bash
   brew services start jenkins-lts
   ```

5. **Configuración Inicial:**
   - Abrir navegador en: http://localhost:8080
   - Seguir los pasos de configuración inicial

---

## 3. Instalación de Kubernetes (Opcional)

### Usando Docker Desktop (Windows/macOS)

1. **Habilitar Kubernetes en Docker Desktop:**
   - Abrir Docker Desktop
   - Ir a Settings > Kubernetes
   - Marcar "Enable Kubernetes"
   - Click en "Apply & Restart"

2. **Verificar Instalación:**
   ```bash
   kubectl version --client
   ```

### Linux (kubeadm)

1. **Instalar kubectl:**
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   ```

2. **Instalar minikube (para desarrollo local):**
   ```bash
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   minikube start
   ```

3. **Verificar Instalación:**
   ```bash
   kubectl version --client
   minikube status
   ```

---

## 4. Instalación de Git (si no está instalado)

### Windows
- Descargar desde: https://git-scm.com/download/win
- Ejecutar el instalador con opciones por defecto

### Linux
```bash
sudo apt-get update
sudo apt-get install -y git
```

### macOS
```bash
brew install git
```

---

## 5. Verificación Completa

Ejecutar los siguientes comandos para verificar que todo está instalado correctamente:

```bash
# Verificar Docker
docker --version
docker-compose --version
docker ps

# Verificar Jenkins
java -version
# Verificar que Jenkins está corriendo en http://localhost:8080

# Verificar Kubernetes (si se instaló)
kubectl version --client
kubectl cluster-info

# Verificar Git
git --version
```

---

## 6. Plugins de Jenkins Necesarios

Después de la instalación inicial de Jenkins, instalar los siguientes plugins:

1. **Pipeline Plugin** - Para usar Jenkinsfile
2. **Docker Pipeline Plugin** - Para integración con Docker
3. **Kubernetes Plugin** - Para integración con Kubernetes
4. **Git Plugin** - Para integración con Git
5. **Blue Ocean Plugin** - Interfaz moderna (opcional)

**Instalación de Plugins:**
- Ir a Jenkins > Manage Jenkins > Manage Plugins
- Buscar cada plugin en la pestaña "Available"
- Marcar e instalar
- Reiniciar Jenkins si es necesario

---

## 📝 Notas

- **Docker Desktop** requiere WSL 2 en Windows
- **Jenkins** necesita Java JDK 11 o superior
- **Kubernetes** es opcional pero recomendado para la práctica completa
- Guardar todas las contraseñas y tokens generados en un lugar seguro

---

## 🔗 Enlaces Útiles

- Docker: https://docs.docker.com/get-started/
- Jenkins: https://www.jenkins.io/doc/
- Kubernetes: https://kubernetes.io/docs/home/

---

**Próximo Paso:** [Configuración de Docker](./02-DOCKER.md)

