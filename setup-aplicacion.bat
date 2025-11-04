@echo off
chcp 65001 > nul
echo ========================================
echo CONFIGURACION AUTOMATICA DEL SISTEMA
echo ========================================
echo.
echo Este script configurara completamente la aplicacion
echo.

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no esta instalado
    echo Por favor instala Node.js 18 o superior
    pause
    exit /b 1
)

REM Verificar que el script existe
if not exist "setup-aplicacion.js" (
    echo ❌ No se encuentra el archivo setup-aplicacion.js
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Ejecutar el script de Node.js
echo Iniciando configuracion...
echo.
node setup-aplicacion.js

REM Si hay error, pausar para ver el mensaje
if %errorlevel% neq 0 (
    echo.
    echo ❌ Ocurrio un error durante la configuracion
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Proceso completado exitosamente
echo.

REM Obtener las rutas de los directorios
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

REM Preguntar si quiere iniciar los servidores
echo.
set /p INICIAR="¿Deseas iniciar los servidores ahora? (s/n): "

if /i "%INICIAR%"=="s" (
    echo.
    echo ✅ Iniciando servidores en ventanas separadas...
    echo.
    
    REM Verificar que las carpetas existan
    if not exist "%BACKEND_DIR%" (
        echo ❌ No se encuentra la carpeta backend
        pause
        exit /b 1
    )
    
    if not exist "%FRONTEND_DIR%" (
        echo ❌ No se encuentra la carpeta frontend
        pause
        exit /b 1
    )
    
    REM Abrir terminal para Backend
    echo Abriendo terminal para Backend...
    start "Backend - Sistema de Ventas" cmd /k "cd /d %BACKEND_DIR% && echo ======================================== && echo   BACKEND - SISTEMA DE VENTAS && echo ======================================== && echo. && echo Puerto: 3001 && echo URL: http://localhost:3001 && echo. && npm start"
    
    REM Esperar un momento antes de abrir la segunda ventana
    timeout /t 2 /nobreak >nul
    
    REM Abrir terminal para Frontend
    echo Abriendo terminal para Frontend...
    start "Frontend - Sistema de Ventas" cmd /k "cd /d %FRONTEND_DIR% && echo ======================================== && echo   FRONTEND - SISTEMA DE VENTAS && echo ======================================== && echo. && echo Puerto: 5173 && echo URL: http://localhost:5173 && echo. && npm run dev"
    
    echo.
    echo ✅ Servidores iniciados en ventanas separadas
    echo.
    echo 📊 Backend:  http://localhost:3001
    echo 🌐 Frontend: http://localhost:5173
    echo.
    echo 💡 Cierra las ventanas de terminal para detener los servidores
    echo.
) else (
    echo.
    echo 💡 Para iniciar los servidores mas tarde, ejecuta este script nuevamente
    echo    o ejecuta manualmente:
    echo    - Backend:  cd backend ^&^& npm start
    echo    - Frontend: cd frontend ^&^& npm run dev
    echo.
)

pause

