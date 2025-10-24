@echo off
echo ================================================
echo    Agregando campo de coordenadas a items
echo ================================================
echo.

psql -U postgres -d sistema_ventas_multiempresa -f add-coordenadas-field.sql

echo.
echo ================================================
echo    Completado!
echo ================================================
pause

