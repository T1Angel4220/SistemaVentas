@echo off
chcp 65001 >nul
echo =====================================================
echo 🧹 SCRIPT DE LIMPIEZA DE DATOS
echo =====================================================
echo.
echo ⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE
echo    Se eliminarán TODAS las filas de:
echo    - usuarios
echo    - items (productos/servicios)
echo    - apelaciones
echo    - reportes
echo    - servicios
echo    - Y tablas relacionadas
echo.
echo =====================================================
echo.
pause

echo.
echo 🔄 Ejecutando script de limpieza...
echo.

node borrar-datos-usuarios-productos.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Script ejecutado correctamente
) else (
    echo.
    echo ❌ Error ejecutando el script
)

echo.
pause

