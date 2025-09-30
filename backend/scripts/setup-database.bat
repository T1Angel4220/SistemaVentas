@echo off
echo =====================================================
echo CONFIGURACION DE BASE DE DATOS - SISTEMA DE VENTAS
echo =====================================================
echo.

echo 1. Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no esta instalado. Por favor instala PostgreSQL.
    pause
    exit /b 1
)
echo ✅ PostgreSQL encontrado

echo.
echo 2. Creando base de datos...
psql -U postgres -f src/config/setup_database.sql
if %errorlevel% neq 0 (
    echo ❌ Error creando base de datos
    pause
    exit /b 1
)
echo ✅ Base de datos creada

echo.
echo 3. Creando tablas...
psql -U postgres -d sistema_ventas_multiempresa -f src/config/database.sql
if %errorlevel% neq 0 (
    echo ❌ Error creando tablas
    pause
    exit /b 1
)
echo ✅ Tablas creadas

echo.
echo 4. Insertando datos iniciales...
psql -U postgres -d sistema_ventas_multiempresa -f src/config/initial_data.sql
if %errorlevel% neq 0 (
    echo ❌ Error insertando datos iniciales
    pause
    exit /b 1
)
echo ✅ Datos iniciales insertados

echo.
echo 5. Verificando conexión...
psql -U postgres -d sistema_ventas_multiempresa -c "SELECT 'Conexión exitosa' as status;"
if %errorlevel% neq 0 (
    echo ❌ Error verificando conexión
    pause
    exit /b 1
)
echo ✅ Conexión verificada

echo.
echo =====================================================
echo BASE DE DATOS CONFIGURADA EXITOSAMENTE
echo =====================================================
echo.
echo Base de datos: sistema_ventas_multiempresa
echo Usuario: postgres
echo Host: localhost
echo Puerto: 5432
echo.
echo Para iniciar el servidor:
echo   npm start
echo.
pause

