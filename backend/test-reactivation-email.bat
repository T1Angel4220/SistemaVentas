@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  📧 PRUEBA DE EMAILS DE SUSPENSIÓN Y REACTIVACIÓN            ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Este script enviará emails de prueba para verificar que el
echo sistema esté funcionando correctamente.
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

set /p EMAIL="Ingresa el email de destino: "
set /p NOMBRE="Ingresa el nombre del usuario: "

echo.
echo 🚀 Ejecutando prueba...
echo.

node test-reactivation-email.js "%EMAIL%" "%NOMBRE%"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause

