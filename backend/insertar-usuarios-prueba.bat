@echo off
echo =====================================================
echo INSERTAR USUARIOS DE PRUEBA
echo =====================================================
echo.
echo Se insertaran los siguientes usuarios:
echo.
echo ADMINISTRADOR:
echo   - ingenieria664@gmail.com
echo.
echo MODERADORES (2):
echo   - diehalloman@gmail.com
echo   - patricia.mendoza111@gmail.com
echo.
echo VENDEDORES (4):
echo   - ayuquinaangel4220@gmail.com
echo   - luis.fernandez321@gmail.com
echo   - ana.torres654@gmail.com
echo   - roberto.vargas987@gmail.com
echo.
echo COMPRADORES (4):
echo   - ayuquinaangel123@gmail.com
echo   - maria.gonzalez123@gmail.com
echo   - carlos.ramirez456@gmail.com
echo   - sofia.morales789@gmail.com
echo.
echo Contrasena para todos: Angel_4220
echo.
set /p confirm="Continuar? (S/N): "

if /i NOT "%confirm%"=="S" (
    echo.
    echo Operacion cancelada
    pause
    exit /b
)

echo.
echo Insertando usuarios...
echo.

psql -U postgres -d sistema_ventas_multiempresa -f insertar-usuarios-prueba.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================
    echo USUARIOS CREADOS EXITOSAMENTE
    echo =====================================================
) else (
    echo.
    echo =====================================================
    echo ERROR: No se pudieron crear los usuarios
    echo =====================================================
)

echo.
pause

