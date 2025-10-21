@echo off
chcp 65001 >nul
echo =====================================================
echo  LIMPIEZA DE BASE DE DATOS
echo =====================================================
echo.
echo ⚠️  ADVERTENCIA: Esta acción eliminará datos
echo.
echo    Se eliminarán:
echo    - Todos los COMPRADORES
echo    - Todos los VENDEDORES
echo    - Todos los productos
echo    - Todas las sesiones
echo    - Todos los chats y mensajes
echo    - Todos los reportes
echo    - Todas las imágenes
echo.
echo    SE MANTENDRÁN:
echo    ✅ Administradores
echo    ✅ Moderadores
echo    ✅ Acciones de moderación (auditoría)
echo    ✅ Categorías
echo    ✅ Ubicaciones
echo.
echo =====================================================
echo.
echo Presiona CTRL+C para cancelar, o
pause
echo.

node limpiar-base-datos.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================
    echo ✅ PROCESO COMPLETADO
    echo =====================================================
) else (
    echo.
    echo =====================================================
    echo ❌ ERROR EN LA EJECUCIÓN
    echo =====================================================
    echo.
    echo Verifica:
    echo 1. PostgreSQL está corriendo
    echo 2. Las credenciales en .env son correctas
    echo 3. La base de datos existe
    echo 4. Tienes Node.js instalado
    echo.
)

pause

