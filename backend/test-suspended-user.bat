@echo off
echo.
echo ========================================================
echo     PRUEBA DE AVISO DE CUENTA SUSPENDIDA
echo ========================================================
echo.
echo Este script suspendera temporalmente un usuario
echo para que puedas probar el aviso de login.
echo.
pause
echo.

cd /d "%~dp0"
node test-suspended-user.js

echo.
echo ========================================================
echo                 PRUEBA COMPLETADA
echo ========================================================
echo.
pause

