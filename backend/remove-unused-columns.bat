@echo off
echo ========================================
echo ELIMINAR COLUMNAS NO USADAS
echo ========================================
echo.
echo Este script eliminara las columnas
echo 'distrito' y 'coordenadas' de la tabla
echo ubicaciones (no se usan).
echo.
pause

REM Configurar codificación UTF-8
chcp 65001 > nul

REM Ejecutar el script SQL
psql -U postgres -d sistema_ventas_multiempresa --set client_encoding=UTF8 -f backend/remove-unused-location-columns.sql

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

