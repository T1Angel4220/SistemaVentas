/**
 * Script para ejecutar todas las pruebas E2E en el orden óptimo
 * 
 * ORDEN DE EJECUCIÓN:
 * 1. auth (Autenticación) - Base para todo
 * 2. users (Usuarios) - Requiere autenticación
 * 3. moderation (Moderación) - Requiere usuarios y productos
 * 4. products (Productos) - Al final porque puede depender de usuarios y moderación
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);
const headed = args.includes('--headed');
const debug = args.includes('--debug');
const ui = args.includes('--ui');
const slowMo = args.find(arg => arg.startsWith('--slow-mo'));
const workersArg = args.find(arg => arg.startsWith('--workers'));
// Por defecto usar 1 worker, pero permitir override
const workers = workersArg ? (workersArg.split('=')[1] || workersArg.replace('--workers', '') || '1') : '1';

// Construir comando base
let baseCommand = 'npx playwright test';
if (headed) baseCommand += ' --headed';
if (debug) baseCommand += ' --debug';
if (ui) baseCommand += ' --ui';
if (slowMo) baseCommand += ` ${slowMo}`;
// Siempre agregar workers=1 por defecto
baseCommand += ` --workers=${workers}`;
log(`\n⚙️  Workers configurados: ${workers}`, 'cyan');

// Objeto para almacenar estadísticas globales
const globalStats = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  modules: []
};

function parsePlaywrightOutput(output) {
  // Intentar parsear el output de Playwright para extraer estadísticas
  const lines = output.split('\n');
  let passed = 0, failed = 0, skipped = 0, total = 0;
  
  // Buscar en el output líneas como:
  // "X passed"
  // "Y failed"
  // "Z skipped"
  // "N total"
  for (const line of lines) {
    // Patrones más flexibles
    const passedMatch = line.match(/(\d+)\s+passed/i) || line.match(/passed:\s*(\d+)/i);
    const failedMatch = line.match(/(\d+)\s+failed/i) || line.match(/failed:\s*(\d+)/i);
    const skippedMatch = line.match(/(\d+)\s+skipped/i) || line.match(/skipped:\s*(\d+)/i);
    const totalMatch = line.match(/(\d+)\s+total/i) || line.match(/total:\s*(\d+)/i);
    
    if (passedMatch) passed = Math.max(passed, parseInt(passedMatch[1]));
    if (failedMatch) failed = Math.max(failed, parseInt(failedMatch[1]));
    if (skippedMatch) skipped = Math.max(skipped, parseInt(skippedMatch[1]));
    if (totalMatch) total = Math.max(total, parseInt(totalMatch[1]));
  }
  
  // Si no encontramos total, calcularlo
  if (total === 0 && (passed + failed + skipped > 0)) {
    total = passed + failed + skipped;
  }
  
  return { passed, failed, skipped, total };
}

function readPlaywrightJSON() {
  // Intentar leer el archivo JSON de resultados de Playwright
  const jsonPath = join(__dirname, '..', 'test-results', 'results.json');
  if (existsSync(jsonPath)) {
    try {
      const jsonContent = readFileSync(jsonPath, 'utf-8');
      const results = JSON.parse(jsonContent);
      
      if (results.stats) {
        return {
          passed: results.stats.expected || 0,
          failed: results.stats.unexpected || 0,
          skipped: results.stats.skipped || 0,
          total: (results.stats.expected || 0) + (results.stats.unexpected || 0) + (results.stats.skipped || 0)
        };
      }
    } catch (error) {
      // Si hay error al leer el JSON, usar el parsing del output
    }
  }
  return null;
}

function runTests(files, moduleName, parallel = false) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`MÓDULO: ${moduleName}`, 'cyan');
  if (parallel && workers) {
    log(`⚡ Ejecutando en paralelo con ${workers} workers`, 'yellow');
  }
  log('='.repeat(60), 'bright');
  
  const moduleStats = {
    name: moduleName,
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    files: []
  };
  
  if (parallel && workers && files.length > 1) {
    // Ejecutar todos los archivos del módulo en paralelo
    const filePaths = files.map(file => `flows/${file}`).join(' ');
    log(`\n▶ Ejecutando ${files.length} archivos en paralelo:`, 'yellow');
    files.forEach(file => log(`   - ${file}`, 'yellow'));
    
    try {
      const command = `${baseCommand} ${filePaths}`;
      const output = execSync(command, {
        encoding: 'utf-8',
        cwd: join(__dirname, '..'),
        env: { ...process.env },
      });
      console.log(output); // Mostrar output en consola
      const stats = parsePlaywrightOutput(output);
      moduleStats.passed += stats.passed;
      moduleStats.failed += stats.failed;
      moduleStats.skipped += stats.skipped;
      moduleStats.total += stats.total;
      log(`\n✅ Módulo ${moduleName} - COMPLETADO`, 'green');
    } catch (error) {
      // Playwright puede lanzar error aunque algunas pruebas pasen
      const output = error.stdout?.toString() || error.message || '';
      console.log(output);
      const stats = parsePlaywrightOutput(output);
      moduleStats.passed += stats.passed;
      moduleStats.failed += stats.failed;
      moduleStats.skipped += stats.skipped;
      moduleStats.total += stats.total;
      log(`\n⚠️  Módulo ${moduleName} - COMPLETADO CON ERRORES`, 'magenta');
    }
  } else {
    // Ejecutar archivos secuencialmente (por defecto o si no hay workers)
    for (const file of files) {
      const filePath = `flows/${file}`;
      log(`\n▶ Ejecutando: ${file}`, 'yellow');
      
      const fileStats = {
        name: file,
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
      };
      
      try {
        const command = `${baseCommand} "${filePath}"`;
        const output = execSync(command, {
          encoding: 'utf-8',
          cwd: join(__dirname, '..'),
          env: { ...process.env },
          stdio: 'inherit', // Mostrar output en tiempo real
        });
        
        // Intentar leer del JSON primero, luego del output
        let stats = readPlaywrightJSON();
        if (!stats || stats.total === 0) {
          stats = parsePlaywrightOutput(output || '');
        }
        
        fileStats.passed = stats.passed;
        fileStats.failed = stats.failed;
        fileStats.skipped = stats.skipped;
        fileStats.total = stats.total;
        
        moduleStats.passed += stats.passed;
        moduleStats.failed += stats.failed;
        moduleStats.skipped += stats.skipped;
        moduleStats.total += stats.total;
        
        if (stats.failed === 0 && stats.skipped === 0) {
          log(`✅ ${file} - PASÓ (${stats.passed} pruebas)`, 'green');
        } else if (stats.failed === 0) {
          log(`✅ ${file} - PASÓ (${stats.passed} pasaron, ${stats.skipped} skipeadas)`, 'green');
        } else {
          log(`⚠️  ${file} - COMPLETADO (${stats.passed} pasaron, ${stats.failed} fallaron, ${stats.skipped} skipeadas)`, 'magenta');
        }
      } catch (error) {
        // Playwright puede lanzar error aunque algunas pruebas pasen
        const output = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
        
        // Intentar leer del JSON primero, luego del output
        let stats = readPlaywrightJSON();
        if (!stats || stats.total === 0) {
          stats = parsePlaywrightOutput(output);
        }
        
        fileStats.passed = stats.passed;
        fileStats.failed = stats.failed;
        fileStats.skipped = stats.skipped;
        fileStats.total = stats.total;
        
        moduleStats.passed += stats.passed;
        moduleStats.failed += stats.failed;
        moduleStats.skipped += stats.skipped;
        moduleStats.total += stats.total;
        
        log(`❌ ${file} - COMPLETADO CON ERRORES (${stats.passed} pasaron, ${stats.failed} fallaron, ${stats.skipped} skipeadas)`, 'magenta');
      }
      
      moduleStats.files.push(fileStats);
    }
  }
  
  // Acumular estadísticas globales
  globalStats.passed += moduleStats.passed;
  globalStats.failed += moduleStats.failed;
  globalStats.skipped += moduleStats.skipped;
  globalStats.total += moduleStats.total;
  globalStats.modules.push(moduleStats);
  
  // Mostrar resumen del módulo
  log(`\n📊 Resumen ${moduleName}:`, 'cyan');
  log(`   ✅ Pasadas: ${moduleStats.passed}`, 'green');
  log(`   ❌ Fallidas: ${moduleStats.failed}`, moduleStats.failed > 0 ? 'magenta' : 'reset');
  log(`   ⏭️  Skipeadas: ${moduleStats.skipped}`, moduleStats.skipped > 0 ? 'yellow' : 'reset');
  log(`   📈 Total: ${moduleStats.total}`, 'cyan');
}

// ORDEN DE EJECUCIÓN DE PRUEBAS

// MÓDULO 1: AUTENTICACIÓN (auth)
// Orden óptimo basado en dependencias:
const authTests = [
  'auth/register.spec.ts',        // 1. Crea usuarios (base para todo)
  'auth/login.spec.ts',           // 2. Autenticación (requiere usuarios)
  'auth/verification.spec.ts',    // 3. Verificación de email (requiere registro)
  'auth/password-recovery.spec.ts', // 4. Recuperación de contraseña (requiere login)
  'auth/profile.spec.ts',         // 5. Perfil de usuario (requiere login)
  'auth/logout.spec.ts',          // 6. Cerrar sesión (requiere login)
];

// MÓDULO 2: GESTIÓN DE USUARIOS (users)
// Orden óptimo basado en dependencias:
const usersTests = [
  'users/register-moderator.spec.ts', // 1. Registrar moderadores (requiere admin autenticado)
  'users/user-management.spec.ts',    // 2. Gestión de usuarios (requiere admin autenticado)
  'users/user-suspension-flow.spec.ts', // 3. Suspensión de usuarios (requiere usuarios y admin)
  'users/session-management.spec.ts',  // 4. Gestión de sesiones (requiere usuarios autenticados)
];

// MÓDULO 3: MODERACIÓN (moderation)
// Orden óptimo basado en dependencias:
const moderationTests = [
  'moderation/report-product.spec.ts', // 1. Reportar productos (requiere productos y usuarios)
  'moderation/manage-reports.spec.ts',  // 2. Gestionar reportes (requiere reportes y moderador)
  'moderation/moderate-products.spec.ts', // 3. Moderar productos (requiere reportes y moderador)
];

// MÓDULO 4: PRODUCTOS (products)
// Orden óptimo basado en dependencias (ya tienen orden numérico):
const productsTests = [
  'products/01-product-creation.spec.ts',     // 1. Crear productos (base)
  'products/02-product-edition.spec.ts',     // 2. Editar productos (requiere productos creados)
  'products/03-product-deletion.spec.ts',     // 3. Eliminar productos (requiere productos creados)
  'products/04-product-visualization.spec.ts', // 4. Visualizar productos (requiere productos)
  'products/05-product-appeals.spec.ts',      // 5. Apelaciones (requiere productos suspendidos)
  'products/06-product-reports.spec.ts',      // 6. Reportes de productos (requiere productos)
  'products/07-product-saved.spec.ts',        // 7. Productos guardados (requiere productos)
  'products/08-product-moderation.spec.ts',   // 8. Moderación de productos (requiere productos y reportes)
];

// Ejecutar pruebas en orden
log('\n🚀 INICIANDO EJECUCIÓN DE PRUEBAS E2E EN ORDEN ÓPTIMO', 'bright');
log('='.repeat(60), 'bright');

// Determinar si se debe ejecutar en paralelo dentro de cada módulo
// Solo si hay workers configurados y el usuario lo permite
const parallelModules = args.includes('--parallel-modules');

// Ejecutar módulo 1: auth (secuencial por dependencias)
runTests(authTests, '1. AUTENTICACIÓN (auth)', false);

// Ejecutar módulo 2: users (secuencial por dependencias)
runTests(usersTests, '2. GESTIÓN DE USUARIOS (users)', false);

// Ejecutar módulo 3: moderation (puede ser paralelo si no hay dependencias)
runTests(moderationTests, '3. MODERACIÓN (moderation)', parallelModules);

// Ejecutar módulo 4: products (secuencial por dependencias numéricas)
runTests(productsTests, '4. PRODUCTOS (products)', false);

log('\n' + '='.repeat(60), 'bright');
log('✅ EJECUCIÓN DE PRUEBAS COMPLETADA', 'green');
log('='.repeat(60), 'bright');

// Generar reporte HTML
log('\n📄 Generando reporte HTML...', 'cyan');
try {
  execSync('npx playwright show-report', {
    stdio: 'pipe',
    cwd: join(__dirname, '..'),
    env: { ...process.env },
  });
  log('✅ Reporte HTML generado. Ejecuta: npx playwright show-report', 'green');
} catch (error) {
  log('⚠️  No se pudo abrir el reporte automáticamente. Ejecuta manualmente: npx playwright show-report', 'yellow');
}

// Mostrar resumen completo final
log('\n' + '='.repeat(80), 'bright');
log('📊 RESUMEN FINAL DE TODAS LAS PRUEBAS', 'bright');
log('='.repeat(80), 'bright');

// Resumen por módulo
log('\n📦 RESUMEN POR MÓDULO:', 'cyan');
globalStats.modules.forEach(module => {
  log(`\n${module.name}:`, 'cyan');
  log(`   ✅ Pasadas: ${module.passed}`, 'green');
  log(`   ❌ Fallidas: ${module.failed}`, module.failed > 0 ? 'magenta' : 'reset');
  log(`   ⏭️  Skipeadas: ${module.skipped}`, module.skipped > 0 ? 'yellow' : 'reset');
  log(`   📈 Total: ${module.total}`, 'cyan');
  
  // Mostrar archivos con fallos si los hay
  if (module.files && module.files.length > 0) {
    const failedFiles = module.files.filter(f => f.failed > 0);
    if (failedFiles.length > 0) {
      log(`   ⚠️  Archivos con fallos:`, 'magenta');
      failedFiles.forEach(f => {
        log(`      - ${f.name}: ${f.failed} fallo(s)`, 'magenta');
      });
    }
  }
});

// Resumen global
log('\n' + '='.repeat(80), 'bright');
log('🌍 RESUMEN GLOBAL:', 'bright');
log('='.repeat(80), 'bright');
log(`\n   ✅ Pruebas Pasadas: ${globalStats.passed}`, 'green');
log(`   ❌ Pruebas Fallidas: ${globalStats.failed}`, globalStats.failed > 0 ? 'magenta' : 'reset');
log(`   ⏭️  Pruebas Skipeadas: ${globalStats.skipped}`, globalStats.skipped > 0 ? 'yellow' : 'reset');
log(`   📈 Total de Pruebas: ${globalStats.total}`, 'cyan');

// Calcular porcentaje de éxito
if (globalStats.total > 0) {
  const successRate = ((globalStats.passed / globalStats.total) * 100).toFixed(2);
  log(`   📊 Tasa de Éxito: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'magenta');
}

// Mensaje final
log('\n' + '='.repeat(80), 'bright');
if (globalStats.failed === 0) {
  log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!', 'green');
} else {
  log(`⚠️  ${globalStats.failed} prueba(s) fallaron. Revisa el reporte para más detalles.`, 'magenta');
}
log('='.repeat(80), 'bright');
log('\n💡 Para ver el reporte HTML completo, ejecuta: npx playwright show-report', 'cyan');
log('='.repeat(80), 'bright');

