@echo off
echo =====================================================
echo INSERTANDO MODERADOR Y ADMINISTRADOR
echo =====================================================
echo.

echo Conectando a la base de datos...
echo.

REM Cambiar al directorio del backend
cd /d "%~dp0.."

REM Ejecutar el script SQL
psql -h localhost -p 5432 -U postgres -d sistema_ventas_multiempresa -f insert-moderator-admin.sql

echo.
echo =====================================================
echo INSERTS COMPLETADOS
echo =====================================================
echo.
echo CREDENCIALES DE ACCESO:
echo.
echo MODERADOR:
echo Email: maria.moderador@sistemaventas.com
echo Password: password123
echo.
echo ADMINISTRADOR:
echo Email: admin@sistemaventas.com
echo Password: password123
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
