@echo off
REM ============================================
REM Script para Ejecutar Pruebas de Productos
REM ============================================

echo.
echo ============================================
echo   PRUEBAS DE PRODUCTOS/SERVICIOS
echo ============================================
echo.

REM Cambiar al directorio del backend
cd /d "%~dp0"

REM Verificar que existe node_modules
if not exist "node_modules\" (
    echo [ERROR] No se encontraron las dependencias.
    echo Por favor ejecuta: npm install
    pause
    exit /b 1
)

REM Verificar que existe .env
if not exist ".env" (
    echo [ADVERTENCIA] No se encontró el archivo .env
    echo Por favor crea el archivo .env con las variables de entorno necesarias.
    echo Ver: test\CONFIGURACION_PRUEBAS.md
    echo.
    pause
)

echo [1] Verificar conexión a base de datos...
node -e "require('dotenv').config(); const { testConnection } = require('./src/config/database'); testConnection().then(result => { console.log(result ? '✅ Conexión OK' : '❌ Error de conexión'); process.exit(result ? 0 : 1); });" 2>nul
if errorlevel 1 (
    echo [ERROR] No se pudo conectar a la base de datos.
    echo Por favor verifica tu archivo .env y que PostgreSQL esté ejecutándose.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   MENU DE OPCIONES
echo ============================================
echo.
echo 1. Ejecutar TODAS las pruebas de productos (64 casos)
echo 2. Ejecutar pruebas CRUD (CF-063 a CF-082)
echo 3. Ejecutar pruebas de Filtros (CF-083 a CF-090)
echo 4. Ejecutar pruebas de Detección de Contenido (CF-091 a CF-094)
echo 5. Ejecutar pruebas de Apelaciones (CF-095 a CF-100)
echo 6. Ejecutar pruebas de Productos Peligrosos (CF-101 a CF-106)
echo 7. Ejecutar pruebas de Reportes (CF-107 a CF-111)
echo 8. Ejecutar pruebas de Productos Guardados (CF-112 a CF-115)
echo 9. Ejecutar pruebas de Moderación (CF-116 a CF-120)
echo 10. Ejecutar pruebas de Servicios (CF-121 a CF-126)
echo 11. Ejecutar con cobertura de código
echo 12. Modo watch (desarrollo)
echo 0. Salir
echo.
set /p opcion="Selecciona una opción: "

if "%opcion%"=="0" exit /b 0
if "%opcion%"=="1" goto todas
if "%opcion%"=="2" goto crud
if "%opcion%"=="3" goto filtros
if "%opcion%"=="4" goto deteccion
if "%opcion%"=="5" goto apelaciones
if "%opcion%"=="6" goto peligrosos
if "%opcion%"=="7" goto reportes
if "%opcion%"=="8" goto guardados
if "%opcion%"=="9" goto moderacion
if "%opcion%"=="10" goto servicios
if "%opcion%"=="11" goto cobertura
if "%opcion%"=="12" goto watch

echo Opción inválida.
pause
exit /b 1

:todas
echo.
echo ============================================
echo   Ejecutando TODAS las pruebas de productos
echo ============================================
echo.
npm run test:integration -- test/integration/products/*.test.js
goto fin

:crud
echo.
echo ============================================
echo   Ejecutando pruebas CRUD (CF-063 a CF-082)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-crud.test.js
goto fin

:filtros
echo.
echo ============================================
echo   Ejecutando pruebas de Filtros (CF-083 a CF-090)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-filters.test.js
goto fin

:deteccion
echo.
echo ============================================
echo   Ejecutando pruebas de Detección (CF-091 a CF-094)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-content-detection.test.js
goto fin

:apelaciones
echo.
echo ============================================
echo   Ejecutando pruebas de Apelaciones (CF-095 a CF-100)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-appeals.test.js
goto fin

:peligrosos
echo.
echo ============================================
echo   Ejecutando pruebas de Productos Peligrosos (CF-101 a CF-106)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-dangerous.test.js
goto fin

:reportes
echo.
echo ============================================
echo   Ejecutando pruebas de Reportes (CF-107 a CF-111)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-reports.test.js
goto fin

:guardados
echo.
echo ============================================
echo   Ejecutando pruebas de Productos Guardados (CF-112 a CF-115)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-saved.test.js
goto fin

:moderacion
echo.
echo ============================================
echo   Ejecutando pruebas de Moderación (CF-116 a CF-120)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-moderation.test.js
goto fin

:servicios
echo.
echo ============================================
echo   Ejecutando pruebas de Servicios (CF-121 a CF-126)
echo ============================================
echo.
npm run test:integration -- test/integration/products/products-services.test.js
goto fin

:cobertura
echo.
echo ============================================
echo   Ejecutando pruebas con cobertura de código
echo ============================================
echo.
npm run test:coverage -- test/integration/products/*.test.js
echo.
echo Reporte de cobertura generado en: coverage\index.html
echo.
pause
start coverage\index.html
goto fin

:watch
echo.
echo ============================================
echo   Modo Watch - Las pruebas se re-ejecutarán automáticamente
echo   Presiona Ctrl+C para salir
echo ============================================
echo.
npm run test:watch -- test/integration/products/*.test.js
goto fin

:fin
echo.
echo ============================================
echo   Pruebas completadas
echo ============================================
echo.
pause

