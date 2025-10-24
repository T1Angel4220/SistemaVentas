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

set PGPASSWORD=S1805787841

REM Intentar con psql en PATH
where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    psql -U postgres -d sistema_ventas_multiempresa -f remove-moderador-asignado.sql
) else (
    REM Usar ruta completa de PostgreSQL 17
    "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d sistema_ventas_multiempresa -f remove-moderador-asignado.sql
)

echo.
echo =====================================================
echo Proceso completado
echo =====================================================
echo.
pause

