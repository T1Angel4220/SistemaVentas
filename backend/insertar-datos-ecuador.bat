@echo off
REM =====================================================
REM Script para insertar datos de prueba - Ecuador
REM Configuración para Azure PostgreSQL
REM =====================================================

echo ================================================
echo INSERTAR DATOS DE PRUEBA - ECUADOR
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

REM Verificar que Node.js esté instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Ejecutando script Node.js...
echo.

REM Ejecutar el script Node.js
node insertar-datos-prueba-ecuador.js

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

