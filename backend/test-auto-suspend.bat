@echo off
echo ========================================
echo PRUEBA DE SUSPENSION AUTOMATICA
echo ========================================
echo.
echo Este script ejecuta manualmente la funcion
echo de suspension automatica de productos
echo pendientes de revision por mas de 1 dia.
echo.
pause

node test-auto-suspend.js

echo.
echo ========================================
pause
