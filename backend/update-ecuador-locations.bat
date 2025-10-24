@echo off
echo ========================================
echo ACTUALIZANDO UBICACIONES DE ECUADOR
echo ========================================
echo.
echo Este script limpiara las ubicaciones existentes
echo e insertara las 210 ubicaciones de Ecuador.
echo.
pause

REM Configurar codificación UTF-8 para la consola
chcp 65001 > nul

REM Ejecutar el script SQL con codificación UTF-8
psql -U postgres -d sistema_ventas_multiempresa --set client_encoding=UTF8 -f backend/update-ecuador-locations.sql

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

