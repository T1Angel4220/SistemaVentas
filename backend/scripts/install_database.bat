@echo off
echo =====================================================
echo INSTALACION DE BASE DE DATOS - SISTEMA DE VENTAS
echo =====================================================
echo.

REM Verificar si PostgreSQL está instalado
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL no esta instalado o no esta en el PATH
    echo Por favor instala PostgreSQL desde: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo PostgreSQL encontrado. Continuando con la instalacion...
echo.

REM Solicitar información de conexión
set /p DB_HOST="Host de la base de datos (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Puerto de la base de datos (default: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set /p DB_USER="Usuario de PostgreSQL (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_PASSWORD="Contraseña de PostgreSQL: "

echo.
echo Configurando base de datos...
echo Host: %DB_HOST%
echo Puerto: %DB_PORT%
echo Usuario: %DB_USER%
echo.

REM Crear archivo .env temporal
echo DB_HOST=%DB_HOST% > .env.temp
echo DB_PORT=%DB_PORT% >> .env.temp
echo DB_NAME=sistema_ventas_multiempresa >> .env.temp
echo DB_USER=%DB_USER% >> .env.temp
echo DB_PASSWORD=%DB_PASSWORD% >> .env.temp
echo. >> .env.temp
echo PORT=3000 >> .env.temp
echo NODE_ENV=development >> .env.temp
echo. >> .env.temp
echo JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion >> .env.temp
echo. >> .env.temp
echo EMAIL_HOST=smtp.gmail.com >> .env.temp
echo EMAIL_PORT=587 >> .env.temp
echo EMAIL_USER=tu_email@gmail.com >> .env.temp
echo EMAIL_PASSWORD=tu_password_email >> .env.temp
echo. >> .env.temp
echo UPLOAD_PATH=./uploads >> .env.temp
echo MAX_FILE_SIZE=5242880 >> .env.temp

REM Ejecutar script de configuración de base de datos
echo Ejecutando script de configuracion...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -f src/config/setup_database.sql

if %errorlevel% neq 0 (
    echo ERROR: Fallo al ejecutar el script de configuracion
    del .env.temp
    pause
    exit /b 1
)

REM Ejecutar script de creación de tablas
echo Ejecutando script de creacion de tablas...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d sistema_ventas_multiempresa -f src/config/database.sql

if %errorlevel% neq 0 (
    echo ERROR: Fallo al ejecutar el script de creacion de tablas
    del .env.temp
    pause
    exit /b 1
)

REM Ejecutar script de datos iniciales
echo Ejecutando script de datos iniciales...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d sistema_ventas_multiempresa -f src/config/initial_data.sql

if %errorlevel% neq 0 (
    echo ERROR: Fallo al ejecutar el script de datos iniciales
    del .env.temp
    pause
    exit /b 1
)

REM Mover archivo .env temporal a .env final
if exist .env (
    echo El archivo .env ya existe. Creando backup...
    move .env .env.backup
)
move .env.temp .env

echo.
echo =====================================================
echo INSTALACION COMPLETADA EXITOSAMENTE
echo =====================================================
echo.
echo La base de datos ha sido creada con los siguientes datos:
echo - Base de datos: sistema_ventas_multiempresa
echo - Usuario administrador: admin@sistemaventas.com
echo - Contraseña: (ver archivo .env)
echo.
echo Para iniciar el servidor:
echo   npm start
echo.
echo Para probar la conexion:
echo   npm test
echo.
pause
