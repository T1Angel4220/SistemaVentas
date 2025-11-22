@echo off
REM ========================================
REM INICIAR BACKEND EN SERVIDOR LOCAL
REM Sistema de Ventas Multiempresa
REM ========================================
echo.
echo ========================================
echo INICIANDO BACKEND EN SERVIDOR LOCAL
echo ========================================
echo.
echo IMPORTANTE: Este script inicia el backend Node.js
echo que es necesario para que el sistema funcione correctamente.
echo.
echo El backend se ejecuta en: http://localhost:3001
echo El frontend se ejecuta en: http://localhost:8080/SistemaVentas
echo.
echo Requisitos previos:
echo [1] PostgreSQL debe estar corriendo
echo [2] Las variables de entorno deben estar configuradas (.env)
echo [3] La base de datos debe estar inicializada
echo.
pause
echo.

REM Cambiar al directorio del backend
cd backend

REM Verificar que existe node_modules
if not exist "node_modules" (
    echo.
    echo ERROR: No se encontraron las dependencias de Node.js
    echo Ejecuta primero: npm install
    echo.
    pause
    exit /b 1
)

REM Verificar que existe el archivo .env
if not exist ".env" (
    echo.
    echo ADVERTENCIA: No se encontro el archivo .env
    echo Asegurate de configurar las variables de entorno
    echo.
)

echo.
echo Iniciando servidor backend...
echo.
echo El backend se ejecutara en segundo plano.
echo Para detenerlo, cierra esta ventana o presiona Ctrl+C
echo.
echo ========================================
echo.

REM Iniciar el servidor
call npm start

REM Si llegamos aqui, el servidor se cerro
echo.
echo El servidor backend se ha detenido.
pause


