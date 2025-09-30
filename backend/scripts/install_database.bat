@echo off
echo =====================================================
echo INSTALACION DEL SISTEMA DE VENTAS MULTIEMPRESA
echo =====================================================
echo.

echo 1. Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no esta instalado. Por favor instala Node.js 18 o superior.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo 2. Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no esta instalado. Por favor instala PostgreSQL.
    pause
    exit /b 1
)
echo ✅ PostgreSQL encontrado

echo.
echo 3. Instalando dependencias de Node.js...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.
echo 4. Configurando variables de entorno...
if not exist .env (
    copy .env.example .env
    echo ✅ Archivo .env creado desde .env.example
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 5. Configurando base de datos...
echo    Creando base de datos...
psql -U postgres -f src/config/setup_database.sql
if %errorlevel% neq 0 (
    echo ❌ Error creando base de datos
    pause
    exit /b 1
)

echo    Creando tablas...
psql -U postgres -d sistema_ventas_multiempresa -f src/config/database.sql
if %errorlevel% neq 0 (
    echo ❌ Error creando tablas
    pause
    exit /b 1
)

echo    Insertando datos iniciales...
psql -U postgres -d sistema_ventas_multiempresa -f src/config/initial_data.sql
if %errorlevel% neq 0 (
    echo ❌ Error insertando datos iniciales
    pause
    exit /b 1
)

echo ✅ Base de datos configurada

echo.
echo 6. Ejecutando pruebas...
npm test
if %errorlevel% neq 0 (
    echo ❌ Algunas pruebas fallaron
    pause
    exit /b 1
)
echo ✅ Todas las pruebas pasaron

echo.
echo =====================================================
echo INSTALACION COMPLETADA EXITOSAMENTE
echo =====================================================
echo.
echo Para iniciar el servidor:
echo   npm start
echo.
echo Para modo desarrollo:
echo   npm run dev
echo.
echo Para ejecutar pruebas:
echo   npm test
echo.
echo Documentacion de la API:
echo   http://localhost:3001/api/docs
echo.
pause

