@echo off
echo.
echo ========================================================
echo          REACTIVAR USUARIO SUSPENDIDO
echo ========================================================
echo.

if "%1"=="" (
    echo ERROR: Debes proporcionar el ID del usuario
    echo.
    echo Uso: reactivate-user.bat [ID_USUARIO]
    echo Ejemplo: reactivate-user.bat 5
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"
node reactivate-user.js %1

echo.
pause

