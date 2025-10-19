@echo off
echo ========================================
echo    Insertar Productos de Prueba
echo ========================================
echo.
echo Este script insertará 15 productos de prueba
echo con 3 imágenes cada uno en la base de datos.
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 5
echo.
echo Ejecutando script...
echo.
node insert-test-products.js
echo.
echo ========================================
echo Script finalizado
echo ========================================
pause

