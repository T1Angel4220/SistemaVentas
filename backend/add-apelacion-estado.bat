@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     AGREGAR ESTADO 'en_apelacion' A LA BASE DE DATOS          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PGPASSWORD=Angel_4220

echo 📊 Agregando estado 'en_apelacion' al enum estado_item...
echo.

psql -U postgres -d sistema_ventas_multiempresa -f add-apelacion-estado.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Estado 'en_apelacion' agregado exitosamente
) else (
    echo.
    echo ❌ Error al agregar el estado
)

echo.
echo Presiona cualquier tecla para salir...
pause >nul

