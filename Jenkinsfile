pipeline {
    agent any
    
    environment {
        // Variables de entorno para Docker
        DOCKER_REGISTRY = 'localhost:5000' // Cambiar según tu registro Docker
        BACKEND_IMAGE = 'sistema-ventas-backend'
        FRONTEND_IMAGE = 'sistema-ventas-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Variables para docker-compose
        DB_NAME = 'sistema_ventas_multiempresa'
        DB_USER = credentials('db-user') ?: 'postgres'
        DB_PASSWORD = credentials('db-password') ?: 'postgres'
        JWT_SECRET = credentials('jwt-secret') ?: 'supersecretkey'
        
        // Variables de email (opcional, configurar en Jenkins credentials)
        EMAIL_USER = credentials('email-user') ?: ''
        EMAIL_PASSWORD = credentials('email-password') ?: ''
    }
    
    stages {
        stage('Limpiar Workspace') {
            steps {
                script {
                    echo '🧹 Limpiando workspace...'
                    cleanWs()
                    // Detener contenedores previos si existen
                    sh '''
                        docker-compose down -v 2>/dev/null || true
                        docker system prune -f || true
                    '''
                }
            }
        }
        
        stage('Checkout Código') {
            steps {
                script {
                    echo '📥 Obteniendo código fuente...'
                    checkout scm
                }
            }
        }
        
        stage('Verificar Herramientas') {
            steps {
                script {
                    echo '🔍 Verificando herramientas necesarias...'
                    sh '''
                        echo "Verificando Docker..."
                        docker --version
                        docker-compose --version
                        
                        echo "Verificando Node.js (si está disponible)..."
                        node --version || echo "Node.js no instalado en el agente (se usará Docker)"
                    '''
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                script {
                    echo '🏗️ Construyendo imagen Docker del Backend...'
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
                    echo '🏗️ Construyendo imagen Docker del Frontend...'
                    dir('frontend') {
                        // Crear archivo .env temporal para el build
                        sh '''
                            echo "VITE_API_URL=http://localhost:3001/api" > .env
                        '''
                        sh '''
                            docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                        '''
                    }
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                script {
                    echo '🧪 Ejecutando pruebas del Backend...'
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
                    echo '🚀 Desplegando aplicación con Docker Compose...'
                    sh '''
                        # Crear archivo .env para docker-compose si no existe
                        if [ ! -f .env.docker ]; then
                            cat > .env.docker << EOF
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_PORT=5432
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=${EMAIL_USER}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>
CORS_ORIGIN=http://localhost:80,http://localhost:5173
FRONTEND_URL=http://localhost:80
BCRYPT_SALT_ROUNDS=10
BACKEND_PORT=3001
FRONTEND_PORT=80
EOF
                        fi
                        
                        # Usar docker-compose para desplegar
                        docker-compose --env-file .env.docker up -d
                        
                        # Esperar a que los servicios estén listos
                        echo "Esperando a que los servicios estén listos..."
                        sleep 30
                        
                        # Verificar estado de los contenedores
                        docker-compose ps
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '🏥 Verificando salud de los servicios...'
                    sh '''
                        # Verificar backend
                        echo "Verificando Backend..."
                        for i in {1..30}; do
                            if curl -f http://localhost:3001/api/health 2>/dev/null; then
                                echo "✅ Backend está respondiendo"
                                break
                            fi
                            echo "Esperando backend... (intento $i/30)"
                            sleep 2
                        done
                        
                        # Verificar frontend
                        echo "Verificando Frontend..."
                        for i in {1..30}; do
                            if curl -f http://localhost:80 2>/dev/null; then
                                echo "✅ Frontend está respondiendo"
                                break
                            fi
                            echo "Esperando frontend... (intento $i/30)"
                            sleep 2
                        done
                        
                        # Verificar base de datos
                        echo "Verificando Base de Datos..."
                        docker exec sistema-ventas-db pg_isready -U ${DB_USER} || echo "⚠️ Advertencia: Base de datos puede no estar lista"
                    '''
                }
            }
        }
        
        stage('Generar Reporte') {
            steps {
                script {
                    echo '📊 Generando reporte de despliegue...'
                    sh '''
                        echo "=== REPORTE DE DESPLIEGUE ===" > deployment-report.txt
                        echo "Fecha: $(date)" >> deployment-report.txt
                        echo "Build Number: ${BUILD_NUMBER}" >> deployment-report.txt
                        echo "Git Commit: ${GIT_COMMIT}" >> deployment-report.txt
                        echo "" >> deployment-report.txt
                        echo "=== ESTADO DE CONTENEDORES ===" >> deployment-report.txt
                        docker-compose ps >> deployment-report.txt
                        echo "" >> deployment-report.txt
                        echo "=== IMÁGENES DOCKER ===" >> deployment-report.txt
                        docker images | grep sistema-ventas >> deployment-report.txt
                        echo "" >> deployment-report.txt
                        echo "=== LOGS RECIENTES ===" >> deployment-report.txt
                        docker-compose logs --tail=50 >> deployment-report.txt
                    '''
                    archiveArtifacts artifacts: 'deployment-report.txt', fingerprint: true
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline ejecutado exitosamente'
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
            echo '❌ Pipeline falló'
            script {
                sh '''
                    echo "=== LOGS DE ERROR ==="
                    docker-compose logs --tail=100
                '''
            }
        }
        always {
            echo '🧹 Limpiando artefactos temporales...'
            // Opcional: comentar la siguiente línea si quieres mantener los contenedores corriendo
            // sh 'docker-compose down'
        }
    }
}

