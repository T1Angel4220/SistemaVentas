# Script completo para desplegar SistemaVentas en WildFly
# Ejecutar desde cualquier ubicación

Write-Host "=== Despliegue de SistemaVentas en WildFly ===" -ForegroundColor Cyan
Write-Host ""

# ===== CONFIGURACIÓN =====
# Detectar automáticamente la ruta del proyecto basándose en dónde está este script
# El script está en la raíz del proyecto, así que esa es la ruta del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $scriptPath  # El script está en la raíz del proyecto
$frontendPath = Join-Path $projectRoot "frontend"

$wildflyPath = "C:\wildfly-38.0.0.Final"  # AJUSTA ESTA RUTA si es diferente
$tempPath = "C:\temp\sistemaventas-war"
$warPath = "C:\temp\SistemaVentas.war"
$deploymentPath = "$wildflyPath\standalone\deployments\SistemaVentas.war"

# Mostrar rutas detectadas
Write-Host "Rutas detectadas:" -ForegroundColor Cyan
Write-Host "  Script: $scriptPath" -ForegroundColor Gray
Write-Host "  Proyecto: $projectRoot" -ForegroundColor Gray
Write-Host "  Frontend: $frontendPath" -ForegroundColor Gray
Write-Host ""

# ===== VERIFICACIONES =====
Write-Host "[1/6] Verificando requisitos..." -ForegroundColor Yellow

# Verificar WildFly
if (-not (Test-Path $wildflyPath)) {
    Write-Host "ERROR: WildFly no encontrado en: $wildflyPath" -ForegroundColor Red
    Write-Host "Por favor, ajusta la variable `$wildflyPath en el script" -ForegroundColor Yellow
    exit 1
}

# Verificar frontend - usar Join-Path para manejar rutas correctamente
$distPath = Join-Path $frontendPath "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "ERROR: No se encontro la carpeta dist en: $distPath" -ForegroundColor Red
    Write-Host "Verificando si existe la carpeta frontend..." -ForegroundColor Yellow
    
    # Verificar si existe el frontend
    if (-not (Test-Path $frontendPath)) {
        Write-Host "ERROR: La carpeta frontend no existe en: $frontendPath" -ForegroundColor Red
        Write-Host "Por favor, verifica la ruta en el script" -ForegroundColor Yellow
    } else {
        Write-Host "La carpeta frontend existe, pero no hay carpeta dist" -ForegroundColor Yellow
        Write-Host "Listando contenido de frontend:" -ForegroundColor Yellow
        Get-ChildItem $frontendPath | Select-Object Name, PSIsContainer | Format-Table
        Write-Host ""
        Write-Host "Por favor, ejecuta 'npm run build' en: $frontendPath" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "[OK] Verificaciones completadas" -ForegroundColor Green
Write-Host ""

# ===== LIMPIAR CARPETA TEMPORAL =====
Write-Host "[2/6] Preparando carpeta temporal..." -ForegroundColor Yellow
if (Test-Path $tempPath) {
    Remove-Item $tempPath -Recurse -Force
}
New-Item -ItemType Directory -Path $tempPath -Force | Out-Null
Write-Host "[OK] Carpeta temporal lista" -ForegroundColor Green
Write-Host ""

# ===== COPIAR ARCHIVOS DE DIST =====
Write-Host "[3/6] Copiando archivos del build..." -ForegroundColor Yellow
$distSource = Join-Path $frontendPath "dist"
Copy-Item -Path "$distSource\*" -Destination $tempPath -Recurse -Force

# Verificar que se copiaron los archivos críticos
if (-not (Test-Path "$tempPath\index.html")) {
    Write-Host "ERROR: index.html no se copió!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "$tempPath\assets")) {
    Write-Host "ERROR: carpeta assets no se copió!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Archivos copiados correctamente" -ForegroundColor Green
Write-Host ""

# ===== CREAR WEB-INF Y WEB.XML =====
Write-Host "[4/6] Creando WEB-INF y web.xml..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "$tempPath\WEB-INF" -Force | Out-Null

# Crear web.xml con UTF-8 sin BOM (compatible con WildFly)
# Incluye configuración para SPA (Single Page Application) routing
$webXmlContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    <display-name>Sistema de Ventas</display-name>
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
    </welcome-file-list>
    
    <!-- Configuración para SPA: redirigir todas las rutas no encontradas a index.html -->
    <!-- Esto permite que React Router maneje el enrutamiento del lado del cliente -->
    <error-page>
        <error-code>404</error-code>
        <location>/index.html</location>
    </error-page>
    
    <!-- También configurar para otros códigos de error comunes -->
    <error-page>
        <error-code>403</error-code>
        <location>/index.html</location>
    </error-page>
    
    <!-- Configurar para manejar errores de servlet (500) - esto es crítico para SPA -->
    <error-page>
        <error-code>500</error-code>
        <location>/index.html</location>
    </error-page>
    
    <!-- Configurar para manejar excepciones de servlet matching -->
    <error-page>
        <exception-type>java.lang.IllegalArgumentException</exception-type>
        <location>/index.html</location>
    </error-page>
    
    <!-- Configuración de MIME types para archivos estáticos -->
    <mime-mapping>
        <extension>js</extension>
        <mime-type>application/javascript</mime-type>
    </mime-mapping>
    <mime-mapping>
        <extension>css</extension>
        <mime-type>text/css</mime-type>
    </mime-mapping>
    <mime-mapping>
        <extension>json</extension>
        <mime-type>application/json</mime-type>
    </mime-mapping>
    <mime-mapping>
        <extension>svg</extension>
        <mime-type>image/svg+xml</mime-type>
    </mime-mapping>
    <mime-mapping>
        <extension>woff</extension>
        <mime-type>font/woff</mime-type>
    </mime-mapping>
    <mime-mapping>
        <extension>woff2</extension>
        <mime-type>font/woff2</mime-type>
    </mime-mapping>
</web-app>
"@

# Crear archivo jboss-web.xml para configuración específica de WildFly
$jbossWebContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<jboss-web xmlns="http://www.jboss.com/xml/ns/javaee"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.jboss.com/xml/ns/javaee
           http://www.jboss.com/xml/ns/javaee/jboss-web_10_0.xsd"
           version="10.0">
    <context-root>/SistemaVentas</context-root>
</jboss-web>
"@

# Escribir web.xml sin BOM
$webXmlPath = Join-Path $tempPath "WEB-INF\web.xml"
[System.IO.File]::WriteAllText($webXmlPath, $webXmlContent, [System.Text.UTF8Encoding]::new($false))

# Escribir jboss-web.xml
$jbossWebPath = Join-Path $tempPath "WEB-INF\jboss-web.xml"
[System.IO.File]::WriteAllText($jbossWebPath, $jbossWebContent, [System.Text.UTF8Encoding]::new($false))

Write-Host "[OK] WEB-INF, web.xml y jboss-web.xml creados" -ForegroundColor Green
Write-Host ""

# ===== ELIMINAR DESPLIEGUE ANTERIOR =====
Write-Host "[5/6] Eliminando despliegue anterior..." -ForegroundColor Yellow
if (Test-Path $deploymentPath) {
    Remove-Item $deploymentPath -Recurse -Force
}
# Eliminar archivos marcadores
Get-ChildItem "$wildflyPath\standalone\deployments\SistemaVentas.war.*" -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host "[OK] Despliegue anterior eliminado" -ForegroundColor Green
Write-Host ""

# ===== COPIAR A DEPLOYMENTS (DESPLIEGUE EXPLODED) =====
Write-Host "[6/6] Desplegando en WildFly (método exploded)..." -ForegroundColor Yellow
Copy-Item -Path $tempPath -Destination $deploymentPath -Recurse -Force

# Verificar que se copió correctamente
if (-not (Test-Path "$deploymentPath\index.html")) {
    Write-Host "ERROR: No se pudo copiar a deployments!" -ForegroundColor Red
    exit 1
}

# Crear archivo marcador para forzar despliegue
$dodeployFile = "$deploymentPath.dodeploy"
New-Item -ItemType File -Path $dodeployFile -Force | Out-Null

Write-Host "[OK] Despliegue completado" -ForegroundColor Green
Write-Host ""

# ===== RESUMEN =====
Write-Host "=== Despliegue Completado ===" -ForegroundColor Green
Write-Host ""
Write-Host "Ubicación del despliegue: $deploymentPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Espera 10-15 segundos para que WildFly detecte el despliegue" -ForegroundColor White
Write-Host "2. Ve a http://localhost:9990 y verifica en 'Deployments'" -ForegroundColor White
Write-Host "3. El estado deberia ser 'Enabled' y 'Exploded: [checkmark]'" -ForegroundColor White
Write-Host "4. Accede a la aplicación en: http://localhost:8080/SistemaVentas/" -ForegroundColor White
Write-Host ""

