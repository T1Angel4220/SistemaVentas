@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     AGREGAR ESTADO 'en_apelacion' A LA BASE DE DATOS          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PGPASSWORD=7dejunio

echo 📊 Agregando estado 'en_apelacion' al enum estado_item...
echo.

REM Intentar con psql en PATH
where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    psql -U postgres -d sistema_ventas_multiempresa -f add-apelacion-estado.sql
) else (
    REM Usar ruta completa de PostgreSQL 17
    "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d sistema_ventas_multiempresa -f add-apelacion-estado.sql
)

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

