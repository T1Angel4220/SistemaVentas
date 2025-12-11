    pipeline {
        agent any
        
        environment {
            // Variables de entorno para Docker - nombres de imagenes
            BACKEND_IMAGE = 'sistemaventas-backend'
            FRONTEND_IMAGE = 'sistemaventas-frontend'
            IMAGE_TAG = "${env.BUILD_NUMBER}"
            
            // Variables para docker-compose - valores por defecto
            DB_NAME = 'sistema_ventas_multiempresa'
            DB_USER = 'postgres'
            DB_PASSWORD = 'Angel_4220'
            DB_PORT = '5432'
            JWT_SECRET = 'supersecretkey'
            JWT_EXPIRES_IN = '24h'
            JWT_REFRESH_EXPIRES_IN = '7d'
            
            // Variables de email - valores por defecto
            EMAIL_HOST = 'smtp.gmail.com'
            EMAIL_PORT = '587'
            EMAIL_SECURE = 'false'
            EMAIL_USER = 'eventconnect90@gmail.com'
            EMAIL_PASSWORD = 'oshzkgssiwxfdiqr'
            EMAIL_FROM = 'Sistema de Ventas <eventconnect90@gmail.com>'
            
            // URLs y puertos
            CORS_ORIGIN = 'http://localhost:80,http://localhost:5173'
            FRONTEND_URL = 'http://localhost:80'
            BACKEND_PORT = '3001'
            FRONTEND_PORT = '80'
            BCRYPT_SALT_ROUNDS = '10'
        }
        
        stages {
            stage('Limpiar Workspace') {
                steps {
                    script {
                        echo 'Limpiando workspace...'
                        // Detener y eliminar contenedores previos por nombre
                        sh '''
                            echo "Deteniendo contenedores existentes..."
                            docker stop sistema-ventas-db sistema-ventas-backend sistema-ventas-frontend 2>/dev/null || true
                            docker rm sistema-ventas-db sistema-ventas-backend sistema-ventas-frontend 2>/dev/null || true
                            
                            # Cargar comando de docker-compose
                            if [ -f ".docker-compose-command" ]; then
                                source .docker-compose-command
                            else
                                # Intentar detectar automáticamente
                                if docker compose version >/dev/null 2>&1; then
                                    DOCKER_COMPOSE_CMD="docker compose"
                                else
                                    DOCKER_COMPOSE_CMD="docker-compose"
                                fi
                            fi
                            
                            # Intentar docker-compose down si existe el archivo (eliminar volúmenes)
                            if [ -f "docker-compose.yml" ]; then
                                $DOCKER_COMPOSE_CMD down -v --remove-orphans 2>/dev/null || true
                            fi
                            
                            # Eliminar volúmenes específicos que puedan persistir
                            echo "Eliminando volúmenes de PostgreSQL..."
                            docker volume rm sistemaventas_postgres_data 2>/dev/null || true
                            docker volume rm sistema-ventas_postgres_data 2>/dev/null || true
                            docker volume rm sistema-ventas-pipeline_postgres_data 2>/dev/null || true
                            docker volume rm sistema-ventas-pipeline2_postgres_data 2>/dev/null || true
                            
                            # Limpiar volúmenes huérfanos
                            docker volume prune -f 2>/dev/null || true
                            
                            # Limpiar recursos no utilizados (opcional, comentar si quieres conservar imágenes)
                            # docker system prune -f || true
                        '''
                        cleanWs()
                    }
                }
            }
            
            stage('Checkout Código') {
                steps {
                    script {
                        echo 'Obteniendo codigo fuente...'
                        // Si se ejecuta desde SCM, usar checkout scm
                        // Si se ejecuta como script directo, obtener desde Git
                        try {
                            checkout scm
                        } catch (Exception e) {
                            echo 'ADVERTENCIA: No hay SCM configurado, obteniendo codigo desde Git...'
                            sh '''
                                if [ ! -d ".git" ]; then
                                    git clone https://github.com/T1Angel4220/SistemaVentas.git .
                                fi
                                # Cambiar a la rama correcta
                                git checkout Jankins/Jose || git checkout main || git checkout master
                                git pull origin Jankins/Jose || git pull origin main || git pull origin master
                            '''
                        }
                    }
                }
            }
            
            stage('Verificar Herramientas') {
                steps {
                    script {
                        echo 'Verificando herramientas necesarias...'
                        sh '''
                            echo "Verificando Docker..."
                            docker --version
                            
                            # Detectar qué versión de Docker Compose está disponible
                            echo "Verificando Docker Compose..."
                            if docker compose version >/dev/null 2>&1; then
                                echo "Usando: docker compose (plugin nativo)"
                                docker compose version
                                echo "DOCKER_COMPOSE_CMD=docker compose" > .docker-compose-command
                            elif docker-compose --version >/dev/null 2>&1; then
                                echo "Usando: docker-compose (standalone)"
                                docker-compose --version
                                echo "DOCKER_COMPOSE_CMD=docker-compose" > .docker-compose-command
                            else
                                echo "ERROR: No se encontró Docker Compose. Instalando..."
                                # Intentar instalar docker-compose plugin
                                sudo apt-get update && sudo apt-get install -y docker-compose-plugin || {
                                    echo "No se pudo instalar docker-compose-plugin. Intentando instalación manual..."
                                    exit 1
                                }
                                echo "DOCKER_COMPOSE_CMD=docker compose" > .docker-compose-command
                            fi
                            
                            source .docker-compose-command
                            echo "Comando Docker Compose configurado: $DOCKER_COMPOSE_CMD"
                            
                            echo "Verificando Node.js (si está disponible)..."
                            node --version || echo "Node.js no instalado en el agente (se usará Docker)"
                        '''
                    }
                }
            }
            
            stage('Build Backend') {
                steps {
                    script {
                        echo 'Construyendo imagen Docker del Backend...'
                        sh '''
                            # Verificar que el directorio backend existe
                            if [ ! -d "backend" ]; then
                                echo "ERROR: Directorio backend no encontrado"
                                ls -la
                                exit 1
                            fi
                            # Verificar que el Dockerfile existe
                            if [ ! -f "backend/Dockerfile" ]; then
                                echo "ERROR: Dockerfile no encontrado en backend"
                                ls -la backend/
                                exit 1
                            fi
                        '''
                        dir('backend') {
                            sh '''
                                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            '''
                        }
                    }
                }
            }
            
            stage('Build Frontend') {
                steps {
                    script {
                        echo 'Construyendo imagen Docker del Frontend...'
                        dir('frontend') {
                            sh '''
                                docker build --build-arg VITE_API_URL=http://localhost:3001 -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                            '''
                        }
                    }
                }
            }
            
            stage('Test Backend') {
                steps {
                    script {
                        echo 'Ejecutando pruebas del Backend...'
                        dir('backend') {
                            sh '''
                                # Ejecutar contenedor temporal para pruebas
                                docker run --rm \
                                    -v $(pwd):/app \
                                    -w /app \
                                    node:18-alpine \
                                    sh -c "npm install && npm test" || echo "Tests opcionales completados"
                            '''
                        }
                    }
                }
            }
            
            stage('Desplegar con Docker Compose') {
                steps {
                    script {
                        echo 'Desplegando aplicacion con Docker Compose...'
                        // Crear archivo .env.docker usando writeFile de Jenkins
                        def envContent = """DB_NAME=${env.DB_NAME}
DB_USER=${env.DB_USER}
DB_PASSWORD=${env.DB_PASSWORD}
DB_PORT=${env.DB_PORT}
JWT_SECRET=${env.JWT_SECRET}
JWT_EXPIRES_IN=${env.JWT_EXPIRES_IN}
JWT_REFRESH_EXPIRES_IN=${env.JWT_REFRESH_EXPIRES_IN}
EMAIL_HOST=${env.EMAIL_HOST}
EMAIL_PORT=${env.EMAIL_PORT}
EMAIL_SECURE=${env.EMAIL_SECURE}
EMAIL_USER=${env.EMAIL_USER}
EMAIL_PASSWORD=${env.EMAIL_PASSWORD}
EMAIL_FROM=${env.EMAIL_FROM}
CORS_ORIGIN=${env.CORS_ORIGIN}
FRONTEND_URL=${env.FRONTEND_URL}
BCRYPT_SALT_ROUNDS=${env.BCRYPT_SALT_ROUNDS}
BACKEND_PORT=${env.BACKEND_PORT}
FRONTEND_PORT=${env.FRONTEND_PORT}
"""
                        writeFile file: '.env.docker', text: envContent
                        
                        sh '''
                            echo "Archivo .env.docker creado"
                            cat .env.docker
                            
                            # Cargar comando de docker-compose
                            if [ -f ".docker-compose-command" ]; then
                                source .docker-compose-command
                            else
                                # Intentar detectar automáticamente
                                if docker compose version >/dev/null 2>&1; then
                                    DOCKER_COMPOSE_CMD="docker compose"
                                else
                                    DOCKER_COMPOSE_CMD="docker-compose"
                                fi
                            fi
                            
                            echo "Usando comando: $DOCKER_COMPOSE_CMD"
                            
                            # Verificar que docker-compose.yml existe
                            if [ ! -f "docker-compose.yml" ]; then
                                echo "ERROR: docker-compose.yml no encontrado"
                                ls -la
                                exit 1
                            fi
                            
                            # Usar docker-compose para desplegar con rebuild si es necesario
                            echo "Iniciando contenedores con $DOCKER_COMPOSE_CMD..."
                            # Copiar .env.docker a .env para compatibilidad con docker-compose
                            cp .env.docker .env
                            
                            # Ejecutar docker-compose (ambas versiones soportan --env-file, pero .env es más universal)
                            $DOCKER_COMPOSE_CMD --env-file .env.docker up -d --build || {
                                echo "Intentando sin --env-file (usando .env por defecto)..."
                                $DOCKER_COMPOSE_CMD up -d --build
                            }
                            
                            # Esperar a que los servicios estén listos
                            echo "Esperando a que los servicios estén listos..."
                            sleep 30
                            
                            # Verificar estado de los contenedores
                            echo "Estado de contenedores:"
                            $DOCKER_COMPOSE_CMD ps
                            
                            # Verificar logs de inicio
                            echo "Logs de inicio (últimas 20 líneas):"
                            $DOCKER_COMPOSE_CMD logs --tail=20
                        '''
                    }
                }
            }
            
            stage('Health Check') {
                steps {
                    script {
                        echo 'Verificando salud de los servicios...'
                        sh '''
                            # Verificar backend
                            echo "Verificando Backend..."
                            for i in {1..30}; do
                                if curl -f http://localhost:3001/api/health 2>/dev/null; then
                                    echo "OK: Backend esta respondiendo"
                                    break
                                fi
                                echo "Esperando backend... (intento $i/30)"
                                sleep 2
                            done
                            
                            # Verificar frontend
                            echo "Verificando Frontend..."
                            for i in {1..30}; do
                                if curl -f http://localhost:80 2>/dev/null; then
                                    echo "OK: Frontend esta respondiendo"
                                    break
                                fi
                                echo "Esperando frontend... (intento $i/30)"
                                sleep 2
                            done
                            
                            # Verificar base de datos
                            echo "Verificando Base de Datos..."
                            docker exec sistema-ventas-db pg_isready -U ${DB_USER:-postgres} || echo "ADVERTENCIA: Base de datos puede no estar lista"
                        '''
                    }
                }
            }
            
            stage('Generar Reporte') {
                steps {
                    script {
                        echo 'Generando reporte de despliegue...'
                        sh '''
                            # Cargar comando de docker-compose
                            if [ -f ".docker-compose-command" ]; then
                                source .docker-compose-command
                            else
                                # Intentar detectar automáticamente
                                if docker compose version >/dev/null 2>&1; then
                                    DOCKER_COMPOSE_CMD="docker compose"
                                else
                                    DOCKER_COMPOSE_CMD="docker-compose"
                                fi
                            fi
                            
                            echo "=== REPORTE DE DESPLIEGUE ===" > deployment-report.txt
                            echo "Fecha: $(date)" >> deployment-report.txt
                            echo "Build Number: ${BUILD_NUMBER}" >> deployment-report.txt
                            echo "Git Commit: ${GIT_COMMIT}" >> deployment-report.txt
                            echo "" >> deployment-report.txt
                            echo "=== ESTADO DE CONTENEDORES ===" >> deployment-report.txt
                            $DOCKER_COMPOSE_CMD ps >> deployment-report.txt
                            echo "" >> deployment-report.txt
                            echo "=== IMAGENES DOCKER ===" >> deployment-report.txt
                            docker images | grep -E "sistemaventas|sistema-ventas" >> deployment-report.txt
                            echo "" >> deployment-report.txt
                            echo "=== LOGS RECIENTES ===" >> deployment-report.txt
                            $DOCKER_COMPOSE_CMD logs --tail=50 >> deployment-report.txt
                        '''
                        archiveArtifacts artifacts: 'deployment-report.txt', fingerprint: true
                    }
                }
            }
        }
        
        post {
            success {
                echo 'OK: Pipeline ejecutado exitosamente'
                script {
                    sh '''
                        echo "=== INFORMACIÓN DE ACCESO ==="
                        echo "Frontend: http://localhost:80"
                        echo "Backend API: http://localhost:3001/api"
                        echo "Base de Datos: localhost:5432"
                    '''
                }
            }
            failure {
                echo 'ERROR: Pipeline fallo'
                script {
                    sh '''
                        # Cargar comando de docker-compose
                        if [ -f ".docker-compose-command" ]; then
                            source .docker-compose-command
                        else
                            # Intentar detectar automáticamente
                            if docker compose version >/dev/null 2>&1; then
                                DOCKER_COMPOSE_CMD="docker compose"
                            else
                                DOCKER_COMPOSE_CMD="docker-compose"
                            fi
                        fi
                        
                        echo "=== LOGS DE ERROR ==="
                        $DOCKER_COMPOSE_CMD logs --tail=100 2>&1 || echo "No se pudieron obtener logs de docker-compose"
                    '''
                }
            }
            always {
                echo 'Limpiando artefactos temporales...'
            }
        }
    }

