@echo off
echo ========================================
echo REINICIANDO BACKEND CON CAMBIOS
echo ========================================
echo.

echo IMPORTANTE:
echo - Se han realizado cambios criticos en el backend
echo - Es necesario reiniciar para que funcionen
echo.
echo Cambios aplicados:
echo  [1] Productos pendientes ahora permiten contacto con vendedor
echo  [2] Endpoint getProductById devuelve todos los datos del vendedor
echo.
pause
echo.

echo Iniciando servidor backend...
echo.
echo Si ves errores, verifica:
echo - Que PostgreSQL este corriendo
echo - Que el archivo .env tenga la configuracion correcta
echo.

call npm start

