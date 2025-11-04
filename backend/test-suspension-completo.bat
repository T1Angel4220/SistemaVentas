@echo off
echo ========================================
echo PRUEBA COMPLETA: SUSPENSION AUTOMATICA
echo ========================================
echo.
echo Este script:
echo   1. Busca o crea un producto
echo   2. Lo pone en estado pendiente_revision
echo   3. Simula que paso 1 dia (25 horas)
echo   4. Crea un reporte del producto
echo   5. Ejecuta la suspension automatica
echo   6. Verifica el resultado
echo.
pause

node test-suspension-completo.js

echo.
echo ========================================
pause
