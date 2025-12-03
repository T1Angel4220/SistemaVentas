@echo off
chcp 65001 >nul
echo =====================================================
echo 🔄 SCRIPT DE RESTAURACIÓN DE DATOS COMPLETOS
echo =====================================================
echo.
echo Este script realizará:
echo   1. Borrar datos de usuarios, productos, apelaciones, reportes, servicios
echo   2. Insertar items, servicios e imágenes desde initial_data.sql
echo   3. Ejecutar create-e2e-test-users.js
echo   4. Ejecutar create-test-users.js
echo.
echo ⚠️  ADVERTENCIA: Esta acción eliminará datos existentes
echo.
pause

echo.
echo 🔄 Ejecutando script de restauración...
echo.

cd /d "%~dp0"

node restaurar-datos-completos.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Script ejecutado correctamente
) else (
    echo.
    echo ❌ Error ejecutando el script
)

echo.
pause

