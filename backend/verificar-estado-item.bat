@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     VERIFICAR ESTADO 'en_apelacion' EN LA BASE DE DATOS       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PGPASSWORD=S1805787841

echo 🔍 Consultando valores del ENUM estado_item...
echo.

REM Intentar con psql en PATH
where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    psql -U postgres -d sistema_ventas_multiempresa -f verificar-estado-item.sql
) else (
    REM Usar ruta completa de PostgreSQL 17
    "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d sistema_ventas_multiempresa -f verificar-estado-item.sql
)

echo.
echo Presiona cualquier tecla para salir...
pause >nul



