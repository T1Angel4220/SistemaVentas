@echo off
chcp 65001 > nul
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║   🧪 PRUEBA DE EMAIL DE NUEVA SESIÓN                         ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Este script enviará 4 emails de prueba mostrando diferentes
echo navegadores e IPs para verificar el diseño y formato.
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Valores por defecto
set "DEFAULT_EMAIL=test@example.com"
set "DEFAULT_NAME=Johan"

REM Pedir email
set /p EMAIL="📧 Ingresa el email de destino [%DEFAULT_EMAIL%]: "
if "%EMAIL%"=="" set "EMAIL=%DEFAULT_EMAIL%"

REM Pedir nombre
set /p NAME="👤 Ingresa el nombre del usuario [%DEFAULT_NAME%]: "
if "%NAME%"=="" set "NAME=%DEFAULT_NAME%"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🚀 Ejecutando prueba...
echo    Email: %EMAIL%
echo    Nombre: %NAME%
echo.

node test-session-email.js "%EMAIL%" "%NAME%"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul

