@echo off
chcp 65001 >nul
echo =====================================================
echo Eliminando columna moderador_asignado_id de reportes
echo =====================================================
echo.
echo Esta columna no se usa en el sistema.
echo Solo se registra quién resolvió en moderador_resolutor_id
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

set PGPASSWORD=Angel_4220
psql -U postgres -d sistema_ventas_multiempresa -f remove-moderador-asignado.sql

echo.
echo =====================================================
echo Proceso completado
echo =====================================================
echo.
pause

