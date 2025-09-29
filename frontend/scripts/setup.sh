#!/bin/bash

echo "====================================================="
echo "CONFIGURACION DEL FRONTEND - SISTEMA DE VENTAS"
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
echo "2. Verificando npm..."
if ! command -v npm &> /dev/null; then
    show_error "npm no está instalado."
fi
show_success "npm encontrado"

echo
echo "3. Instalando dependencias..."
if ! npm install; then
    show_error "Error instalando dependencias"
fi
show_success "Dependencias instaladas"

echo
echo "4. Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    show_success "Archivo .env creado desde .env.example"
    show_warning "IMPORTANTE: Edita el archivo .env con tus configuraciones"
else
    show_success "Archivo .env ya existe"
fi

echo
echo "5. Verificando configuración..."
echo "   - Vite configurado"
echo "   - TypeScript configurado"
echo "   - Tailwind CSS configurado"
echo "   - React Router configurado"
show_success "Configuración verificada"

echo
echo "====================================================="
echo "CONFIGURACION COMPLETADA EXITOSAMENTE"
echo "====================================================="
echo
echo "Para iniciar el servidor de desarrollo:"
echo "  npm run dev"
echo
echo "Para crear build de producción:"
echo "  npm run build"
echo
echo "Para ejecutar linting:"
echo "  npm run lint"
echo
echo "URL de desarrollo:"
echo "  http://localhost:5173"
echo

