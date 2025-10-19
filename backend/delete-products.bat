@echo off
echo ========================================
echo    Eliminar Productos de Prueba
echo ========================================
echo.
echo ADVERTENCIA: Este script eliminará todos
echo los productos de prueba insertados.
echo.
echo Esta acción NO se puede deshacer.
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 5
echo.
echo Ejecutando script de eliminación...
echo.
node delete-test-products.js
echo.
echo ========================================
echo Script finalizado
echo ========================================
pause

