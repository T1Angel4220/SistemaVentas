@echo off
echo ========================================
echo REINICIANDO FRONTEND CON CAMBIOS
echo ========================================
echo.

echo [1/4] Limpiando cache de Vite...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Cache de Vite eliminado
) else (
    echo No hay cache de Vite
)
echo.

echo [2/4] Limpiando cache de npm...
call npm cache clean --force
echo.

echo [3/4] Limpiando dist...
if exist dist (
    rmdir /s /q dist
    echo Dist eliminado
) else (
    echo No hay dist
)
echo.

echo [4/4] Iniciando servidor de desarrollo...
echo.
echo IMPORTANTE: 
echo - El servidor se va a iniciar ahora
echo - Cuando veas "Local: http://localhost:5173/" presiona Ctrl+Shift+R en el navegador
echo - NO uses el boton Atras del navegador, usa el boton Regresar de la pagina
echo.
pause
echo.

call npm run dev

