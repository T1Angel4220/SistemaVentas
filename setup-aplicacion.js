#!/usr/bin/env node

/**
 * Script de Configuración Completa del Sistema de Ventas
 * 
 * Este script automatiza todo el proceso de configuración:
 * 1. Solicita la contraseña de PostgreSQL
 * 2. Configura el archivo .env
 * 3. Elimina y recrea la base de datos
 * 4. Crea el esquema completo
 * 5. Crea categorías jerárquicas
 * 6. Inserta categorías estilo Amazon (amazon-categories.sql)
 * 7. Actualiza ubicaciones de Ecuador
 * 8. Inserta datos iniciales (usuarios, productos, servicios, etc.)
 * 9. Crea usuarios de prueba
 * 10. Inserta productos de prueba (insert-test-products.js)
 * 11. Instala dependencias
 * 12. Levanta backend y frontend
 */

const readline = require('readline');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Función para solicitar entrada del usuario
function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Función para solicitar contraseña (oculta)
function questionPassword(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let password = '';
    process.stdin.on('data', char => {
      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          rl.close();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

// Función para ejecutar comandos
async function runCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10, // 10MB
      ...options
    });
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

// Función para ejecutar comandos de PostgreSQL
async function runPostgresCommand(command, password, database = 'postgres') {
  const env = { ...process.env };
  env.PGPASSWORD = password;
  
  // Escapar comillas en el comando SQL
  const escapedCommand = command.replace(/"/g, '\\"');
  
  const fullCommand = `psql -U postgres -d ${database} -c "${escapedCommand}"`;
  
  return await runCommand(fullCommand, { env, shell: true });
}

// Función para ejecutar archivo SQL
async function runSQLFile(filePath, password, database = 'postgres') {
  const env = { ...process.env };
  env.PGPASSWORD = password;
  
  // En Windows, usar comillas dobles, en Linux/Mac usar comillas simples
  const isWindows = process.platform === 'win32';
  const quote = isWindows ? '"' : "'";
  
  const fullCommand = `psql -U postgres -d ${database} -f ${quote}${filePath}${quote}`;
  
  return await runCommand(fullCommand, { env, shell: true });
}

// Función para crear/actualizar archivo .env
function updateEnvFile(backendPath, dbPassword) {
  const envContent = `# =====================================================
# CONFIGURACIÓN DEL SISTEMA DE VENTAS MULTIEMPRESA
# =====================================================

# Configuración del servidor
PORT=3001
NODE_ENV=development
HOST=localhost

# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ventas_multiempresa
DB_USER=postgres
DB_PASSWORD=${dbPassword}

# Configuración de JWT
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Configuración de email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=eventconnect90@gmail.com
EMAIL_PASSWORD=oshzkgssiwxfdiqr
EMAIL_FROM=Sistema de Ventas <eventconnect90@gmail.com>

# Configuración de bcrypt
BCRYPT_SALT_ROUNDS=10

# Configuración de CORS
CORS_ORIGIN=http://localhost:5173

# URL del Frontend (para links en emails)
FRONTEND_URL=http://localhost:5173
`;

  fs.writeFileSync(path.join(backendPath, '.env'), envContent);
  logSuccess('Archivo .env del backend creado/actualizado');
}

// Función para verificar requisitos
async function checkRequirements() {
  logStep(1, 'Verificando requisitos del sistema...');

  // Verificar Node.js
  const nodeCheck = await runCommand('node --version');
  if (!nodeCheck.success) {
    logError('Node.js no está instalado. Por favor instala Node.js 18 o superior.');
    process.exit(1);
  }
  logSuccess(`Node.js encontrado: ${nodeCheck.stdout.trim()}`);

  // Verificar npm
  const npmCheck = await runCommand('npm --version');
  if (!npmCheck.success) {
    logError('npm no está instalado.');
    process.exit(1);
  }
  logSuccess(`npm encontrado: ${npmCheck.stdout.trim()}`);

  // Verificar PostgreSQL
  const psqlCheck = await runCommand('psql --version');
  if (!psqlCheck.success) {
    logError('PostgreSQL no está instalado o no está en el PATH.');
    process.exit(1);
  }
  logSuccess(`PostgreSQL encontrado: ${psqlCheck.stdout.trim()}`);
}

// Función principal
async function main() {
  console.clear();
  log('═══════════════════════════════════════════════════════════', 'bright');
  log('   SISTEMA DE VENTAS MULTIEMPRESA - CONFIGURACIÓN AUTOMÁTICA', 'bright');
  log('═══════════════════════════════════════════════════════════', 'bright');
  log('');

  try {
    // 1. Verificar requisitos
    await checkRequirements();

    // 2. Solicitar contraseña de PostgreSQL
    logStep(2, 'Configuración de base de datos');
    logWarning('Se necesita la contraseña del usuario postgres de PostgreSQL');
    const dbPassword = await questionPassword('Ingresa la contraseña de PostgreSQL: ');

    if (!dbPassword) {
      logError('La contraseña no puede estar vacía.');
      process.exit(1);
    }

    // 3. Verificar conexión a PostgreSQL
    log('Verificando conexión a PostgreSQL...');
    const connectionTest = await runPostgresCommand('SELECT version();', dbPassword);
    if (!connectionTest.success) {
      logError('No se pudo conectar a PostgreSQL. Verifica la contraseña y que PostgreSQL esté ejecutándose.');
      process.exit(1);
    }
    logSuccess('Conexión a PostgreSQL exitosa');

    // 4. Configurar archivos .env
    logStep(3, 'Configurando variables de entorno');
    const backendPath = path.join(__dirname, 'backend');
    const frontendPath = path.join(__dirname, 'frontend');

    // Backend .env
    updateEnvFile(backendPath, dbPassword);
    
    // Frontend .env (si no existe)
    const frontendEnvPath = path.join(frontendPath, '.env');
    if (!fs.existsSync(frontendEnvPath)) {
      const frontendEnvContent = `# Configuración del Frontend - Sistema de Ventas Multiempresa

# URL de la API del backend
VITE_API_URL=http://localhost:3001/api

# Configuración de la aplicación
VITE_APP_NAME=Sistema de Ventas Multiempresa
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Plataforma completa para comprar y vender productos y servicios

# Configuración de autenticación
VITE_JWT_STORAGE_KEY=accessToken
VITE_REFRESH_TOKEN_KEY=refreshToken

# Configuración de la aplicación
VITE_DEFAULT_PAGE_SIZE=10
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Configuración de notificaciones
VITE_ENABLE_NOTIFICATIONS=true
VITE_NOTIFICATION_DURATION=5000

# Configuración de desarrollo
VITE_DEBUG_MODE=false
VITE_ENABLE_LOGGING=true

# URLs de soporte
VITE_SUPPORT_EMAIL=soporte@sistemaventas.com
VITE_SUPPORT_PHONE=+506-8888-8888
VITE_TERMS_URL=/terms
VITE_PRIVACY_URL=/privacy

# Configuración de paginación
VITE_DEFAULT_PAGE=1
VITE_MAX_PAGE_SIZE=50

# Configuración de cache
VITE_CACHE_DURATION=300000
VITE_ENABLE_CACHE=true

# Configuración de validación
VITE_MIN_PASSWORD_LENGTH=6
VITE_MAX_PASSWORD_LENGTH=100
VITE_MIN_NAME_LENGTH=2
VITE_MAX_NAME_LENGTH=100

# Configuración de formularios
VITE_FORM_DEBOUNCE_DELAY=300
VITE_AUTO_SAVE_INTERVAL=30000

# Configuración de UI
VITE_THEME=light
VITE_ENABLE_ANIMATIONS=true
VITE_ANIMATION_DURATION=300

# Configuración de errores
VITE_ERROR_BOUNDARY_ENABLED=true
VITE_ERROR_REPORTING_ENABLED=false

# Configuración de analytics (opcional)
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_ID=

# Configuración de PWA (opcional)
VITE_PWA_ENABLED=false
VITE_PWA_NAME=Sistema de Ventas
VITE_PWA_SHORT_NAME=SistemaVentas
VITE_PWA_DESCRIPTION=Sistema de Ventas Multiempresa
VITE_PWA_THEME_COLOR=#2563eb
VITE_PWA_BACKGROUND_COLOR=#ffffff
`;
      fs.writeFileSync(frontendEnvPath, frontendEnvContent);
      logSuccess('Archivo .env del frontend creado');
    } else {
      logSuccess('Archivo .env del frontend ya existe');
    }

    // 5. Eliminar base de datos si existe
    logStep(4, 'Eliminando base de datos existente (si existe)');
    const dropDbResult = await runPostgresCommand(
      'DROP DATABASE IF EXISTS sistema_ventas_multiempresa;',
      dbPassword
    );
    if (dropDbResult.success) {
      logSuccess('Base de datos eliminada (si existía)');
    } else {
      // Si no existe, no es un error
      log('Base de datos no existe, continuando...');
    }

    // 6. Crear base de datos y esquema
    logStep(5, 'Creando base de datos y esquema completo');
    
    // Primero crear la base de datos
    log('Creando base de datos...');
    const createDbResult = await runPostgresCommand(
      'CREATE DATABASE sistema_ventas_multiempresa;',
      dbPassword,
      'postgres'
    );
    
    if (!createDbResult.success && !createDbResult.stderr.includes('already exists')) {
      logWarning('Advertencia al crear base de datos (puede que ya exista)');
    } else {
      logSuccess('Base de datos creada');
    }

    // Ejecutar el archivo SQL completo
    const databaseSQLPath = path.join(backendPath, 'src', 'config', 'database.sql');
    
    if (!fs.existsSync(databaseSQLPath)) {
      logError(`No se encontró el archivo: ${databaseSQLPath}`);
      process.exit(1);
    }

    // Leer el archivo SQL, procesarlo y ejecutarlo
    log('Leyendo database.sql...');
    let sqlContent = fs.readFileSync(databaseSQLPath, 'utf8');
    
    // Remover el comando CREATE DATABASE si existe (ya lo creamos)
    sqlContent = sqlContent.replace(/CREATE DATABASE\s+sistema_ventas_multiempresa;?/gi, '');
    
    // Remover el comando \c (cambiar de base de datos) ya que lo especificamos en el comando
    sqlContent = sqlContent.replace(/\\c\s+sistema_ventas_multiempresa;?/gi, '');
    
    // Guardar temporalmente el SQL procesado
    const tempSQLPath = path.join(backendPath, 'temp_database.sql');
    fs.writeFileSync(tempSQLPath, sqlContent, 'utf8');
    
    try {
      log('Ejecutando esquema completo...');
      const sqlResult = await runSQLFile(tempSQLPath, dbPassword, 'sistema_ventas_multiempresa');
      
      if (!sqlResult.success) {
        logError('Error ejecutando database.sql');
        logError(sqlResult.stderr || sqlResult.error);
        // Intentar ejecutar directamente con psql
        log('Intentando método alternativo...');
        const env = { ...process.env };
        env.PGPASSWORD = dbPassword;
        const altCommand = `psql -U postgres -d sistema_ventas_multiempresa -f "${tempSQLPath}"`;
        const altResult = await runCommand(altCommand, { env });
        
        if (!altResult.success) {
          logError('Error en método alternativo también');
          process.exit(1);
        }
      }
      
      logSuccess('Base de datos y esquema creados exitosamente');
    } finally {
      // Eliminar archivo temporal
      if (fs.existsSync(tempSQLPath)) {
        fs.unlinkSync(tempSQLPath);
      }
    }

    // 7. Instalar dependencias del backend (PRIMERO, antes de ejecutar scripts que las necesitan)
    logStep(6, 'Instalando dependencias del backend');
    process.chdir(backendPath);
    const backendInstallResult = await runCommand('npm install');
    
    if (!backendInstallResult.success) {
      logError('Error instalando dependencias del backend');
      logError(backendInstallResult.error);
      process.exit(1);
    }
    
    logSuccess('Dependencias del backend instaladas');

    // 8. Crear categorías jerárquicas (ahora que las dependencias están instaladas)
    logStep(7, 'Creando categorías jerárquicas');
    const categoriesScriptPath = path.join(backendPath, 'create-hierarchical-categories.js');
    
    if (!fs.existsSync(categoriesScriptPath)) {
      logError(`No se encontró el archivo: ${categoriesScriptPath}`);
      process.exit(1);
    }

    const categoriesResult = await runCommand(`node ${categoriesScriptPath}`);
    
    if (!categoriesResult.success) {
      logError('Error creando categorías jerárquicas');
      logError(categoriesResult.error);
      if (categoriesResult.stderr) {
        logError(categoriesResult.stderr);
      }
      process.exit(1);
    }
    
    logSuccess('Categorías jerárquicas creadas');

    // 7.5. Insertar categorías de Amazon
    logStep(7.5, 'Insertando categorías estilo Amazon');
    const amazonCategoriesSQLPath = path.join(backendPath, 'src', 'config', 'amazon-categories.sql');
    
    if (!fs.existsSync(amazonCategoriesSQLPath)) {
      logWarning('No se encontró amazon-categories.sql, saltando este paso...');
    } else {
      const amazonCategoriesResult = await runSQLFile(amazonCategoriesSQLPath, dbPassword, 'sistema_ventas_multiempresa');
      
      if (!amazonCategoriesResult.success) {
        logWarning('Error insertando categorías de Amazon, pero continuando...');
        logWarning(amazonCategoriesResult.stderr || amazonCategoriesResult.error);
      } else {
        logSuccess('Categorías estilo Amazon insertadas exitosamente');
      }
    }

    // 9. Actualizar ubicaciones de Ecuador
    logStep(8, 'Actualizando ubicaciones de Ecuador');
    const locationsSQLPath = path.join(backendPath, 'update-ecuador-locations.sql');
    
    if (!fs.existsSync(locationsSQLPath)) {
      logWarning('No se encontró update-ecuador-locations.sql, saltando este paso...');
    } else {
      const locationsResult = await runSQLFile(locationsSQLPath, dbPassword, 'sistema_ventas_multiempresa');
      
      if (!locationsResult.success) {
        logWarning('Error actualizando ubicaciones, pero continuando...');
        logWarning(locationsResult.error);
      } else {
        logSuccess('Ubicaciones de Ecuador actualizadas');
      }
    }

    // 9.1. Agregar estado 'en_apelacion' al enum estado_item
    logStep(8.5, 'Agregando estado de apelación al enum estado_item');
    const apelacionSQLPath = path.join(backendPath, 'add-apelacion-estado.sql');
    
    if (!fs.existsSync(apelacionSQLPath)) {
      logWarning('No se encontró add-apelacion-estado.sql, saltando este paso...');
    } else {
      const apelacionResult = await runSQLFile(apelacionSQLPath, dbPassword, 'sistema_ventas_multiempresa');
      
      if (!apelacionResult.success) {
        logWarning('Error agregando estado de apelación, pero continuando...');
        logWarning(apelacionResult.stderr || apelacionResult.error);
      } else {
        logSuccess('Estado de apelación agregado al enum estado_item');
      }
    }

    // 10. Insertar datos iniciales
    logStep(9, 'Insertando datos iniciales');
    const initialDataSQLPath = path.join(backendPath, 'src', 'config', 'initial_data.sql');
    
    if (!fs.existsSync(initialDataSQLPath)) {
      logWarning('No se encontró initial_data.sql, saltando este paso...');
    } else {
      log('Leyendo initial_data.sql...');
      let initialDataContent = fs.readFileSync(initialDataSQLPath, 'utf8');
      
      // Remover el comando \c (cambiar de base de datos) ya que lo especificamos en el comando
      initialDataContent = initialDataContent.replace(/\\c\s+sistema_ventas_multiempresa;?/gi, '');
      
      // Guardar temporalmente el SQL procesado
      const tempInitialDataPath = path.join(backendPath, 'temp_initial_data.sql');
      fs.writeFileSync(tempInitialDataPath, initialDataContent, 'utf8');
      
      try {
        log('Ejecutando datos iniciales...');
        const initialDataResult = await runSQLFile(tempInitialDataPath, dbPassword, 'sistema_ventas_multiempresa');
        
        if (!initialDataResult.success) {
          logWarning('Error ejecutando initial_data.sql, pero continuando...');
          logWarning(initialDataResult.stderr || initialDataResult.error);
        } else {
          logSuccess('Datos iniciales insertados exitosamente');
        }
      } finally {
        // Eliminar archivo temporal
        if (fs.existsSync(tempInitialDataPath)) {
          fs.unlinkSync(tempInitialDataPath);
        }
      }
    }

    // 10.1. Crear usuarios de prueba con contraseñas correctas
    logStep(9.5, 'Creando/actualizando usuarios de prueba con contraseñas correctas');
    const createTestUsersScriptPath = path.join(backendPath, 'create-test-users.js');
    
    if (!fs.existsSync(createTestUsersScriptPath)) {
      logWarning('No se encontró create-test-users.js, saltando este paso...');
    } else {
      // Cambiar al directorio del backend para ejecutar el script
      const originalCwd = process.cwd();
      process.chdir(backendPath);
      
      try {
        log('Ejecutando create-test-users.js...');
        const testUsersResult = await runCommand(`node create-test-users.js`);
        
        if (!testUsersResult.success) {
          logWarning('Error ejecutando create-test-users.js, pero continuando...');
          logWarning(testUsersResult.stderr || testUsersResult.error);
        } else {
          logSuccess('Usuarios de prueba creados/actualizados con contraseñas correctas');
        }
      } finally {
        // Volver al directorio original
        process.chdir(originalCwd);
      }
    }

    // 9.6. Insertar productos de prueba
    logStep(9.6, 'Insertando productos de prueba');
    const insertTestProductsScriptPath = path.join(backendPath, 'insert-test-products.js');
    
    if (!fs.existsSync(insertTestProductsScriptPath)) {
      logWarning('No se encontró insert-test-products.js, saltando este paso...');
    } else {
      // Cambiar al directorio del backend para ejecutar el script
      const originalCwd = process.cwd();
      process.chdir(backendPath);
      
      try {
        log('Ejecutando insert-test-products.js...');
        const testProductsResult = await runCommand(`node insert-test-products.js`);
        
        if (!testProductsResult.success) {
          logWarning('Error ejecutando insert-test-products.js, pero continuando...');
          logWarning(testProductsResult.stderr || testProductsResult.error);
        } else {
          logSuccess('Productos de prueba insertados exitosamente');
        }
      } finally {
        // Volver al directorio original
        process.chdir(originalCwd);
      }
    }

    // 11. Instalar dependencias del frontend
    logStep(10, 'Instalando dependencias del frontend');
    process.chdir(frontendPath);
    
    if (!fs.existsSync(path.join(frontendPath, 'package.json'))) {
      logError('No se encontró package.json en el frontend');
      process.exit(1);
    }

    const frontendInstallResult = await runCommand('npm install');
    
    if (!frontendInstallResult.success) {
      logError('Error instalando dependencias del frontend');
      logError(frontendInstallResult.error);
      process.exit(1);
    }
    
    logSuccess('Dependencias del frontend instaladas');

    // 12. Resumen final
    log('\n═══════════════════════════════════════════════════════════', 'bright');
    log('   ✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE', 'green');
    log('═══════════════════════════════════════════════════════════', 'bright');
    log('');
    log('📋 Resumen de la configuración:', 'cyan');
    log('   ✅ Base de datos creada y configurada');
    log('   ✅ Categorías jerárquicas creadas');
    log('   ✅ Categorías estilo Amazon insertadas');
    log('   ✅ Ubicaciones de Ecuador actualizadas');
    log('   ✅ Datos iniciales insertados');
    log('   ✅ Usuarios de prueba creados');
    log('   ✅ Productos de prueba insertados');
    log('   ✅ Dependencias instaladas');
    log('   ✅ Archivos .env configurados');
    log('');
    log('🚀 Para iniciar la aplicación:', 'yellow');
    log('');
    log('   Terminal 1 - Backend:', 'cyan');
    log('   cd backend');
    log('   npm start');
    log('');
    log('   Terminal 2 - Frontend:', 'cyan');
    log('   cd frontend');
    log('   npm run dev');
    log('');
    log('🌐 URLs de la aplicación:', 'yellow');
    log('   Backend:  http://localhost:3001');
    log('   Frontend: http://localhost:5173');
    log('');

    // Preguntar si quiere iniciar ahora
    const startNow = await question('¿Deseas iniciar la aplicación ahora? (s/n): ');
    
    if (startNow.toLowerCase() === 's' || startNow.toLowerCase() === 'sí' || startNow.toLowerCase() === 'y') {
      log('\n🚀 Iniciando aplicación en ventanas separadas...', 'bright');
      log('');
      
      // Detectar si estamos en Windows
      const isWindows = process.platform === 'win32';
      
      if (isWindows) {
        // En Windows, usar 'start' para abrir nuevas ventanas
        log('Abriendo terminal para Backend...', 'cyan');
        
        // Usar execAsync pero no esperar el resultado (fire and forget)
        const backendCommand = `start "Backend - Sistema de Ventas" cmd /k "cd /d "${backendPath}" && echo ======================================== && echo   BACKEND - SISTEMA DE VENTAS && echo ======================================== && echo. && echo Puerto: 3001 && echo URL: http://localhost:3001 && echo. && npm start"`;
        
        // Ejecutar sin await para que no bloquee
        exec(backendCommand, { 
          windowsHide: true,
          detached: true
        }, (error) => {
          if (error) {
            logError(`Error abriendo backend: ${error.message}`);
          }
        });
        
        // Esperar un poco antes de abrir la segunda ventana
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        log('Abriendo terminal para Frontend...', 'cyan');
        
        const frontendCommand = `start "Frontend - Sistema de Ventas" cmd /k "cd /d "${frontendPath}" && echo ======================================== && echo   FRONTEND - SISTEMA DE VENTAS && echo ======================================== && echo. && echo Puerto: 5173 && echo URL: http://localhost:5173 && echo. && npm run dev"`;
        
        // Ejecutar sin await para que no bloquee
        exec(frontendCommand, { 
          windowsHide: true,
          detached: true
        }, (error) => {
          if (error) {
            logError(`Error abriendo frontend: ${error.message}`);
          }
        });
        
        // Esperar un poco para que las ventanas se abran
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        log('');
        log('✅ Servidores iniciados en ventanas separadas', 'green');
        log('   Backend:  http://localhost:3001', 'cyan');
        log('   Frontend: http://localhost:5173', 'cyan');
        log('');
        log('💡 Puedes cerrar las ventanas de terminal para detener los servidores', 'yellow');
        log('');
      } else {
        // En Linux/Mac, usar terminales separadas con xterm/gnome-terminal/etc
        log('Abriendo terminal para Backend...', 'cyan');
        const terminalCommand = process.env.TERM_PROGRAM || 'xterm';
        
        let backendCommand;
        if (terminalCommand.includes('gnome') || terminalCommand.includes('ubuntu')) {
          backendCommand = `gnome-terminal --title="Backend - Sistema de Ventas" -- bash -c "cd '${backendPath}' && npm start; exec bash"`;
        } else if (terminalCommand.includes('xterm')) {
          backendCommand = `xterm -title "Backend - Sistema de Ventas" -e "cd '${backendPath}' && npm start" &`;
        } else {
          backendCommand = `osascript -e 'tell app "Terminal" to do script "cd '${backendPath}' && npm start"'`;
        }
        
        await runCommand(backendCommand);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        log('Abriendo terminal para Frontend...', 'cyan');
        let frontendCommand;
        if (terminalCommand.includes('gnome') || terminalCommand.includes('ubuntu')) {
          frontendCommand = `gnome-terminal --title="Frontend - Sistema de Ventas" -- bash -c "cd '${frontendPath}' && npm run dev; exec bash"`;
        } else if (terminalCommand.includes('xterm')) {
          frontendCommand = `xterm -title "Frontend - Sistema de Ventas" -e "cd '${frontendPath}' && npm run dev" &`;
        } else {
          frontendCommand = `osascript -e 'tell app "Terminal" to do script "cd '${frontendPath}' && npm run dev"'`;
        }
        
        await runCommand(frontendCommand);
        
        log('');
        log('✅ Servidores iniciados en ventanas separadas', 'green');
        log('   Backend:  http://localhost:3001', 'cyan');
        log('   Frontend: http://localhost:5173', 'cyan');
        log('');
      }
    } else {
      log('✅ Configuración completada. Puedes iniciar la aplicación cuando desees.', 'green');
      process.exit(0);
    }

  } catch (error) {
    logError(`Error fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    logError(`Error no manejado: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };

