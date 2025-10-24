@echo off
echo ========================================
echo AGREGAR CAMPOS DE UBICACION A ITEMS
echo ========================================
echo.
echo Este script agregara columnas para guardar
echo ubicacion detallada en cada producto.
echo.
pause

REM Configurar codificación UTF-8 para la consola
chcp 65001 > nul

REM Ejecutar el script SQL con codificación UTF-8
psql -U postgres -d sistema_ventas_multiempresa --set client_encoding=UTF8 -f backend/add-location-fields-to-items.sql

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

