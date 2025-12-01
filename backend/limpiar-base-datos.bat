@echo off
REM =====================================================
REM SCRIPT DE LIMPIEZA DE BASE DE DATOS - WINDOWS
REM =====================================================
REM Este script ejecuta el SQL de limpieza usando psql
REM =====================================================

echo ================================================
echo SCRIPT DE LIMPIEZA DE BASE DE DATOS
echo ================================================
echo.
echo ADVERTENCIA: Este script eliminara TODOS los datos
echo de TODAS las tablas excepto categorias y ubicaciones
echo.
echo Esta accion NO se puede deshacer!
echo.
pause

REM Configurar variables de entorno de PostgreSQL
set PGHOST=postgres-sistema-ventas.postgres.database.azure.com
set PGUSER=azureuser
set PGPORT=5432
set PGDATABASE=sistema_ventas_multiempresa
set PGPASSWORD=Angel_4220

echo.
echo Conectando a la base de datos...
echo Host: %PGHOST%
echo Database: %PGDATABASE%
echo User: %PGUSER%
echo.

REM Ejecutar el script SQL
psql -h %PGHOST% -U %PGUSER% -d %PGDATABASE% -p %PGPORT% -f limpiar-base-datos-completo.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo LIMPIEZA COMPLETADA EXITOSAMENTE
    echo ================================================
) else (
    echo.
    echo ================================================
    echo ERROR AL EJECUTAR EL SCRIPT
    echo ================================================
    echo Verifica que:
    echo 1. psql este instalado y en el PATH
    echo 2. Las credenciales sean correctas
    echo 3. Tengas permisos para ejecutar TRUNCATE
    echo ================================================
)

pause
