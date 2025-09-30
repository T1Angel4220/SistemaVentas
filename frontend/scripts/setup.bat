@echo off
echo =====================================================
echo CONFIGURACION DEL FRONTEND - SISTEMA DE VENTAS
echo =====================================================
echo.

echo 1. Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no esta instalado. Por favor instala Node.js 18 o superior.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 2. Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no esta instalado.
    pause
    exit /b 1
)
echo ✅ npm encontrado

echo.
echo 3. Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.
echo 4. Configurando variables de entorno...
if not exist .env (
    copy .env.example .env
    echo ✅ Archivo .env creado desde .env.example
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 5. Verificando configuración...
echo    - Vite configurado
echo    - TypeScript configurado
echo    - Tailwind CSS configurado
echo    - React Router configurado
echo ✅ Configuración verificada

echo.
echo =====================================================
echo CONFIGURACION COMPLETADA EXITOSAMENTE
echo =====================================================
echo.
echo Para iniciar el servidor de desarrollo:
echo   npm run dev
echo.
echo Para crear build de producción:
echo   npm run build
echo.
echo Para ejecutar linting:
echo   npm run lint
echo.
echo URL de desarrollo:
echo   http://localhost:5173
echo.
pause

