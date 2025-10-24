@echo off
echo ========================================
echo LIMPIAR UBICACIONES INCORRECTAS
echo ========================================
echo.
echo Este script eliminara las ubicaciones creadas
echo por error y dejara solo las 210 de Ecuador.
echo.
pause

REM Configurar codificación UTF-8
chcp 65001 > nul

REM Ejecutar el script SQL
psql -U postgres -d sistema_ventas_multiempresa --set client_encoding=UTF8 -f cleanup-extra-locations.sql

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

