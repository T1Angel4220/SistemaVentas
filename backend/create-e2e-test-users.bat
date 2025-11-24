@echo off
echo ========================================
echo Creando usuarios de prueba para E2E
echo ========================================
echo.

cd /d "%~dp0"

node create-e2e-test-users.js

echo.
echo ========================================
echo Proceso completado
echo ========================================
pause

