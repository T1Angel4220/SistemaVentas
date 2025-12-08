# Guía de Instalación de Herramientas - Windows

Esta guía detalla la instalación de todas las herramientas necesarias para completar la APE7 en **Windows**.

**IMPORTANTE:** Jenkins se ejecutará en un contenedor Docker, NO se instala directamente en Windows.

---

## 📋 Requisitos Previos

- Sistema operativo: **Windows 10/11** (64-bit)
- Mínimo 8GB de RAM (recomendado 16GB)
- 20GB de espacio libre en disco
- Acceso a internet
- Virtualización habilitada en BIOS

---

## 1. Instalación de Docker Desktop para Windows

### Paso 1: Verificar Requisitos del Sistema

1. **Verificar versión de Windows:**
   - Windows 10 64-bit: Pro, Enterprise o Education (Build 19041 o superior)
   - Windows 11 (cualquier versión)

2. **Habilitar WSL 2:**
   ```powershell
   # Abrir PowerShell como Administrador
   # Verificar si WSL 2 está instalado
   wsl --version
   
   # Si no está instalado, ejecutar:
   wsl --install
   
   # Reiniciar el sistema después de la instalación
   ```

3. **Habilitar Virtualización en BIOS:**
   - Reiniciar el equipo
   - Entrar a BIOS/UEFI (generalmente presionando F2, F10, F12 o Del durante el arranque)
   - Buscar opción "Virtualization Technology" o "Intel VT-x" / "AMD-V"
   - Habilitarla
   - Guardar y salir

### Paso 2: Descargar Docker Desktop

1. Visitar: https://www.docker.com/products/docker-desktop
2. Descargar **Docker Desktop para Windows**
3. Ejecutar el instalador `Docker Desktop Installer.exe`

### Paso 3: Instalar Docker Desktop

1. Ejecutar el instalador
2. Aceptar los términos y condiciones
3. Marcar las opciones recomendadas:
   - ✅ Use WSL 2 instead of Hyper-V (recomendado)
   - ✅ Add shortcut to desktop
4. Click en **OK** para instalar
5. Cuando termine, click en **Close and restart**

### Paso 4: Iniciar Docker Desktop

1. Buscar "Docker Desktop" en el menú de inicio
2. Ejecutar Docker Desktop
3. Aceptar los términos de servicio
4. Esperar a que Docker Desktop se inicie completamente (ícono de ballena en la bandeja del sistema)

### Paso 5: Verificar Instalación

Abrir PowerShell o CMD y ejecutar:

```powershell
# Verificar versión de Docker
docker --version

# Verificar versión de Docker Compose
docker-compose --version

# Probar Docker con un contenedor de prueba
docker run hello-world
```

Si todos los comandos funcionan correctamente, Docker está instalado y funcionando.

---

## 2. Configuración de Jenkins en Contenedor Docker

**IMPORTANTE:** Jenkins NO se instala directamente en Windows. Se ejecutará en un contenedor Docker.

### Paso 1: Verificar Docker está Funcionando

```powershell
# Verificar que Docker está corriendo
docker ps

# Si muestra una lista (aunque esté vacía), Docker está funcionando
```

### Paso 2: Iniciar Jenkins en Contenedor

1. **Navegar a la carpeta del proyecto:**
   ```powershell
   cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
   ```

2. **Iniciar Jenkins con Docker Compose:**
   ```powershell
   docker-compose up -d jenkins
   ```

   Este comando:
   - Descargará la imagen oficial de Jenkins LTS
   - Creará un contenedor llamado `sistema-ventas-jenkins`
   - Montará el socket de Docker para que Jenkins pueda construir imágenes
   - Expondrá Jenkins en el puerto 8080

3. **Verificar que Jenkins está corriendo:**
   ```powershell
   docker ps
   ```

   Deberías ver el contenedor `sistema-ventas-jenkins` en estado "Up".

### Paso 3: Acceder a Jenkins

1. Abrir navegador en: **http://localhost:8080**
2. Esperar a que Jenkins termine de inicializar (puede tardar 1-2 minutos)
3. Verás una pantalla pidiendo la contraseña inicial

### Paso 4: Obtener Contraseña Inicial de Jenkins

En PowerShell, ejecutar:

```powershell
# Ver la contraseña inicial de Jenkins
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copiar la contraseña que aparece y pegarla en la pantalla de Jenkins.

### Paso 5: Configuración Inicial de Jenkins

1. **Instalar plugins:**
   - Seleccionar **"Install suggested plugins"** (recomendado)
   - Esperar a que se instalen los plugins (puede tardar varios minutos)

2. **Crear usuario administrador:**
   - Username: (elegir un nombre de usuario)
   - Password: (elegir una contraseña segura)
   - Confirm password: (repetir la contraseña)
   - Full name: (tu nombre completo)
   - E-mail address: (tu email)
   - Click en **Save and Continue**

3. **Configurar URL de Jenkins:**
   - Dejar la URL por defecto: `http://localhost:8080/`
   - Click en **Save and Finish**

4. **Click en "Start using Jenkins"**

### Paso 6: Instalar Plugins Adicionales Necesarios

1. En el Dashboard de Jenkins, click en **Manage Jenkins**
2. Click en **Manage Plugins**
3. Ir a la pestaña **Available**
4. Buscar e instalar los siguientes plugins:
   - ✅ **Pipeline** - Para usar Jenkinsfile
   - ✅ **Docker Pipeline** - Integración con Docker
   - ✅ **Docker** - Para construir imágenes Docker
   - ✅ **Git** - Integración con Git
   - ✅ **Blue Ocean** - Interfaz moderna (opcional pero recomendado)
5. Marcar los plugins y click en **Install without restart**
6. Esperar a que se instalen
7. Si se solicita, click en **Restart Jenkins when installation is complete and no jobs are running**

---

## 3. Configurar Docker en Jenkins (Docker-in-Docker)

Para que Jenkins pueda construir imágenes Docker desde dentro del contenedor, necesitamos configurar el acceso a Docker.

### Verificar Acceso a Docker desde Jenkins

1. En Jenkins, click en **Manage Jenkins**
2. Click en **Manage Nodes and Clouds**
3. Click en **Configure System**
4. Verificar que Docker está disponible

**Nota:** Como Jenkins está en un contenedor y tiene acceso al socket de Docker del host (configurado en docker-compose.yml), Jenkins puede ejecutar comandos Docker directamente.

### Probar Docker desde Jenkins

1. En Jenkins, click en **New Item**
2. Nombre: `test-docker`
3. Tipo: **Freestyle project**
4. Click en **OK**
5. En **Build**, agregar paso **Execute shell** (o **Execute Windows batch command**):
   ```bash
   docker --version
   docker ps
   ```
6. Click en **Save**
7. Click en **Build Now**
8. Verificar que el build es exitoso y muestra la versión de Docker

---

## 4. Instalación de Git (si no está instalado)

### Verificar si Git está Instalado

```powershell
git --version
```

### Instalar Git (si no está instalado)

1. Descargar desde: https://git-scm.com/download/win
2. Ejecutar el instalador
3. Usar opciones por defecto (recomendado)
4. Click en **Next** hasta completar la instalación

### Verificar Instalación

```powershell
git --version
```

---

## 5. Verificación Completa

Ejecutar los siguientes comandos para verificar que todo está instalado correctamente:

```powershell
# Verificar Docker
docker --version
docker-compose --version
docker ps

# Verificar Jenkins (debe estar corriendo en contenedor)
docker ps | Select-String "jenkins"

# Verificar Git
git --version
```

### Verificar Jenkins en Navegador

1. Abrir navegador: **http://localhost:8080**
2. Deberías ver el Dashboard de Jenkins
3. Si no aparece, verificar que el contenedor está corriendo:
   ```powershell
   docker ps
   docker logs sistema-ventas-jenkins
   ```

---

## 6. Comandos Útiles para Jenkins en Docker

### Iniciar Jenkins

```powershell
cd C:\Users\Johan\Desktop\ape7\SistemaVentas\DesarrolloAPE
docker-compose up -d jenkins
```

### Detener Jenkins

```powershell
docker-compose stop jenkins
```

### Ver Logs de Jenkins

```powershell
docker logs -f sistema-ventas-jenkins
```

### Reiniciar Jenkins

```powershell
docker-compose restart jenkins
```

### Acceder al Shell de Jenkins

```powershell
docker exec -it sistema-ventas-jenkins bash
```

### Ver Contraseña Inicial (si la olvidaste)

```powershell
docker exec sistema-ventas-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Backup de Datos de Jenkins

```powershell
# Crear backup del volumen de Jenkins
docker run --rm -v sistema-ventas_jenkins_home:/data -v ${PWD}:/backup alpine tar czf /backup/jenkins-backup.tar.gz /data
```

### Restaurar Backup de Jenkins

```powershell
# Detener Jenkins primero
docker-compose stop jenkins

# Restaurar backup
docker run --rm -v sistema-ventas_jenkins_home:/data -v ${PWD}:/backup alpine tar xzf /backup/jenkins-backup.tar.gz -C /

# Iniciar Jenkins
docker-compose start jenkins
```

---

## 7. Solución de Problemas

### Problema: Docker Desktop no inicia

**Solución:**
1. Verificar que WSL 2 está instalado: `wsl --version`
2. Verificar que la virtualización está habilitada en BIOS
3. Reiniciar Docker Desktop
4. Si persiste, reinstalar Docker Desktop

### Problema: Jenkins no accesible en http://localhost:8080

**Solución:**
```powershell
# Verificar que el contenedor está corriendo
docker ps

# Ver logs para identificar el problema
docker logs sistema-ventas-jenkins

# Verificar que el puerto 8080 no está en uso
netstat -ano | findstr :8080

# Si el puerto está en uso, cambiar el puerto en docker-compose.yml
```

### Problema: Jenkins no puede ejecutar comandos Docker

**Solución:**
1. Verificar que el contenedor tiene acceso al socket de Docker:
   ```powershell
   docker exec sistema-ventas-jenkins ls -la /var/run/docker.sock
   ```

2. Si no existe, verificar la configuración en `docker-compose.yml`:
   ```yaml
   volumes:
     - /var/run/docker.sock:/var/run/docker.sock
   ```

3. Reiniciar el contenedor:
   ```powershell
   docker-compose restart jenkins
   ```

### Problema: Contenedor de Jenkins se detiene inmediatamente

**Solución:**
```powershell
# Ver logs del contenedor
docker logs sistema-ventas-jenkins

# Verificar permisos del volumen
docker volume inspect sistema-ventas_jenkins_home

# Recrear el contenedor
docker-compose down jenkins
docker-compose up -d jenkins
```

---

## 📝 Notas Importantes

- **Jenkins se ejecuta en contenedor Docker**, NO se instala directamente en Windows
- **Docker Desktop** requiere WSL 2 en Windows
- Los datos de Jenkins se guardan en un volumen Docker llamado `jenkins_home`
- El contenedor de Jenkins tiene acceso al socket de Docker del host para poder construir imágenes
- **Kubernetes NO se instala** - Solo investigación teórica

---

## 🔗 Enlaces Útiles

- Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
- Jenkins en Docker: https://www.jenkins.io/doc/book/installing/docker/
- WSL 2: https://docs.microsoft.com/en-us/windows/wsl/install

---

## ✅ Checklist de Instalación

- [ ] Docker Desktop instalado y funcionando
- [ ] WSL 2 instalado y configurado
- [ ] Jenkins corriendo en contenedor Docker
- [ ] Jenkins accesible en http://localhost:8080
- [ ] Configuración inicial de Jenkins completada
- [ ] Plugins necesarios instalados
- [ ] Git instalado (si no estaba)
- [ ] Docker funciona desde Jenkins (verificado con test)

---

**Próximo Paso:** [Configuración de Docker](./02-DOCKER.md)
