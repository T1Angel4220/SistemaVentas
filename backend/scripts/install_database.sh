#!/bin/bash

echo "====================================================="
echo "INSTALACION DEL SISTEMA DE VENTAS MULTIEMPRESA"
echo "====================================================="
echo

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar errores
show_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Función para mostrar éxito
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencias
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "1. Verificando Node.js..."
if ! command -v node &> /dev/null; then
    show_error "Node.js no está instalado. Por favor instala Node.js 18 o superior."
fi
show_success "Node.js encontrado"

echo
echo "2. Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    show_error "PostgreSQL no está instalado. Por favor instala PostgreSQL."
fi
show_success "PostgreSQL encontrado"

echo
echo "3. Instalando dependencias de Node.js..."
if ! npm install; then
    show_error "Error instalando dependencias"
fi
show_success "Dependencias instaladas"

echo
echo "4. Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    show_success "Archivo .env creado desde .env.example"
    show_warning "IMPORTANTE: Edita el archivo .env con tus credenciales"
else
    show_success "Archivo .env ya existe"
fi

echo
echo "5. Configurando base de datos..."
echo "   Creando base de datos..."
if ! psql -U postgres -f src/config/setup_database.sql; then
    show_error "Error creando base de datos"
fi

echo "   Creando tablas..."
if ! psql -U postgres -d sistema_ventas_multiempresa -f src/config/database.sql; then
    show_error "Error creando tablas"
fi

echo "   Insertando datos iniciales..."
if ! psql -U postgres -d sistema_ventas_multiempresa -f src/config/initial_data.sql; then
    show_error "Error insertando datos iniciales"
fi

show_success "Base de datos configurada"

echo
echo "6. Ejecutando pruebas..."
if ! npm test; then
    show_error "Algunas pruebas fallaron"
fi
show_success "Todas las pruebas pasaron"

echo
echo "====================================================="
echo "INSTALACION COMPLETADA EXITOSAMENTE"
echo "====================================================="
echo
echo "Para iniciar el servidor:"
echo "  npm start"
echo
echo "Para modo desarrollo:"
echo "  npm run dev"
echo
echo "Para ejecutar pruebas:"
echo "  npm test"
echo
echo "Documentación de la API:"
echo "  http://localhost:3001/api/docs"
echo

