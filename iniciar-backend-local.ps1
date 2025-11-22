# ========================================
# INICIAR BACKEND EN SERVIDOR LOCAL
# Sistema de Ventas Multiempresa
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INICIANDO BACKEND EN SERVIDOR LOCAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANTE: Este script inicia el backend Node.js" -ForegroundColor Yellow
Write-Host "que es necesario para que el sistema funcione correctamente." -ForegroundColor Yellow
Write-Host ""
Write-Host "El backend se ejecuta en: http://localhost:3001" -ForegroundColor Green
Write-Host "El frontend se ejecuta en: http://localhost:8080/SistemaVentas" -ForegroundColor Green
Write-Host ""

Write-Host "Requisitos previos:" -ForegroundColor Yellow
Write-Host "[1] PostgreSQL debe estar corriendo" -ForegroundColor White
Write-Host "[2] Las variables de entorno deben estar configuradas (.env)" -ForegroundColor White
Write-Host "[3] La base de datos debe estar inicializada" -ForegroundColor White
Write-Host ""

# Cambiar al directorio del backend
$backendPath = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: No se encontro el directorio backend" -ForegroundColor Red
    Write-Host "Ruta esperada: $backendPath" -ForegroundColor Red
    pause
    exit 1
}

Set-Location $backendPath

# Verificar que existe node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "ERROR: No se encontraron las dependencias de Node.js" -ForegroundColor Red
    Write-Host "Ejecuta primero: npm install" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "ADVERTENCIA: No se encontro el archivo .env" -ForegroundColor Yellow
    Write-Host "Asegurate de configurar las variables de entorno" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "Iniciando servidor backend..." -ForegroundColor Green
Write-Host ""
Write-Host "El backend se ejecutara en esta ventana." -ForegroundColor Yellow
Write-Host "Para detenerlo, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar el servidor
try {
    npm start
} catch {
    Write-Host ""
    Write-Host "ERROR: No se pudo iniciar el servidor" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}


