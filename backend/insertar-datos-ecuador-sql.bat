@echo off
REM =====================================================
REM Script para insertar datos de prueba - Ecuador (SQL)
REM Configuración para Azure PostgreSQL
REM =====================================================

echo ================================================
echo INSERTAR DATOS DE PRUEBA - ECUADOR (SQL)
echo ================================================
echo.

REM Configurar variables de entorno para PostgreSQL
set PGHOST=postgres-sistema-ventas.postgres.database.azure.com
set PGUSER=azureuser
set PGPORT=5432
set PGDATABASE=sistema_ventas_multiempresa
set PGPASSWORD=Angel_4220

echo Configurando variables de entorno...
echo Host: %PGHOST%
echo Usuario: %PGUSER%
echo Base de datos: %PGDATABASE%
echo.

REM Verificar que psql esté instalado
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: psql (PostgreSQL client) no está instalado o no está en el PATH
    echo Por favor, instala PostgreSQL client desde https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo Ejecutando script SQL...
echo.

REM Ejecutar el script SQL
psql -h %PGHOST% -U %PGUSER% -d %PGDATABASE% -f insertar-datos-prueba-ecuador.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo INSERCION COMPLETADA EXITOSAMENTE
    echo ================================================
) else (
    echo.
    echo ================================================
    echo ERROR EN LA INSERCION
    echo ================================================
)

echo.
pause

