# Nota: Jenkins en Contenedor Docker - Windows

## Configuración de Docker-in-Docker para Windows

### Importante

En Windows con Docker Desktop, el socket de Docker está disponible a través de WSL2. La configuración en `docker-compose.yml` monta el socket de Docker del host al contenedor de Jenkins:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
  - /usr/bin/docker:/usr/bin/docker
```

### Verificación

Para verificar que Jenkins puede acceder a Docker:

```powershell
# Verificar que el socket está montado
docker exec sistema-ventas-jenkins ls -la /var/run/docker.sock

# Verificar que Docker CLI está disponible
docker exec sistema-ventas-jenkins docker --version

# Probar ejecutar un comando Docker desde Jenkins
docker exec sistema-ventas-jenkins docker ps
```

### Si Docker no funciona desde Jenkins

Si Jenkins no puede ejecutar comandos Docker, puedes instalar Docker CLI dentro del contenedor:

```powershell
# Acceder al contenedor
docker exec -it sistema-ventas-jenkins bash

# Dentro del contenedor, instalar Docker CLI
apt-get update
apt-get install -y docker.io

# Salir del contenedor
exit
```

Sin embargo, con la configuración actual usando el socket montado, esto NO debería ser necesario.

### Alternativa: Usar Docker-in-Docker (DinD)

Si el método del socket no funciona, puedes usar Docker-in-Docker:

```yaml
jenkins:
  image: jenkins/jenkins:lts
  # ... otras configuraciones ...
  volumes:
    - jenkins_home:/var/jenkins_home
  # NO montar el socket, usar DinD
```

Y ejecutar Docker como un servicio separado con DinD. Sin embargo, esto es más complejo y consume más recursos.

### Recomendación

La configuración actual con el socket montado debería funcionar correctamente en Windows con Docker Desktop. Si encuentras problemas, verifica:

1. Docker Desktop está corriendo
2. WSL2 está instalado y funcionando
3. El contenedor de Jenkins tiene permisos para acceder al socket

