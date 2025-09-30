@echo off
echo =====================================================
echo  INSTALANDO DEPENDENCIAS DEL FRONTEND
echo =====================================================
echo.

echo [1/2] Instalando dependencias de producción...
npm install

echo.
echo [2/2] Verificando instalación...
npm list --depth=0

echo.
echo =====================================================
echo  ✅ INSTALACIÓN COMPLETADA
echo =====================================================
echo.
echo Ahora puedes ejecutar: npm run dev
echo.

pause

