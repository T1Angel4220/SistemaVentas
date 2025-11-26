const { Pool } = require('pg');
const { config } = require('./config');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuración de la base de datos
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Configuración UTF-8 para manejar caracteres especiales
  client_encoding: 'UTF8',
  // Configuración adicional para caracteres especiales
  application_name: 'sistema_ventas_multiempresa'
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    
    // Verificar codificación de la conexión
    const encodingResult = await client.query("SHOW client_encoding");
    console.log(`✅ Conexión a la base de datos exitosa (Codificación: ${encodingResult.rows[0].client_encoding})`);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    return false;
  }
};

// Función para ejecutar consultas
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query ejecutada', { text: text.substring(0, 50) + '...', duration: duration + 'ms' });
    return res;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

// Función para obtener un cliente de la pool
const getClient = async () => {
  return await pool.connect();
};

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    console.log('🔧 Verificando estructura de la base de datos...');
    
    // Verificar si las tablas principales existen
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'sesiones_usuario', 'items', 'categorias')
    `);
    
    // Esperar un poco para asegurar que Docker haya terminado de inicializar
    if (tablesCheck.rows.length < 4) {
      console.log('⚠️  Algunas tablas no existen. Esperando a que Docker complete la inicialización...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar de nuevo después de esperar
      const retryCheck = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('usuarios', 'sesiones_usuario', 'items', 'categorias')
      `);
      
      if (retryCheck.rows.length >= 4) {
        console.log('✅ Base de datos ya inicializada por Docker');
        return true;
      }
      
      console.log('⚠️  Ejecutando scripts de inicialización manualmente...');
      
      // Ejecutar script de base de datos
      const dbScript = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
      
      // Limpiar el script: eliminar comandos de psql y líneas problemáticas
      let cleanScript = dbScript
        // Eliminar comandos CREATE DATABASE (no se pueden ejecutar desde conexión existente)
        .replace(/CREATE\s+DATABASE[^;]*;/gi, '')
        // Eliminar comandos de psql (empiezan con \)
        .replace(/\\[^\n]*/g, '')
        // Corregir $ $ a $$ en funciones
        .replace(/\$\s+\$/g, '$$')
        // Eliminar comentarios de línea (-- comentario)
        .replace(/--[^\n]*/g, '');
      
      // Dividir por punto y coma, pero preservar funciones que usan $$
      const statements = [];
      let currentStatement = '';
      let inFunction = false;
      
      for (const line of cleanScript.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        currentStatement += ' ' + trimmed;
        
        // Detectar inicio de función
        if (trimmed.includes('RETURNS TRIGGER AS') || trimmed.includes('AS $$')) {
          inFunction = true;
        }
        
        // Detectar fin de función o fin de statement
        if (trimmed.includes('$$ LANGUAGE') || (trimmed.endsWith(';') && !inFunction)) {
          if (inFunction && trimmed.includes('$$ LANGUAGE')) {
            inFunction = false;
          }
          if (currentStatement.trim() && !currentStatement.trim().startsWith('--')) {
            statements.push(currentStatement.trim());
          }
          currentStatement = '';
        }
      }
      
      // Agregar el último statement si existe
      if (currentStatement.trim() && !inFunction) {
        statements.push(currentStatement.trim());
      }
      
      // Ejecutar comandos SQL limpios uno por uno
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed && trimmed.length > 10 && !trimmed.startsWith('--')) {
          try {
            await query(trimmed);
          } catch (err) {
            // Ignorar errores de "ya existe" para tipos y tablas
            if (!err.message.includes('already exists') && 
                !err.message.includes('duplicate') && 
                !err.message.includes('syntax error at or near')) {
              console.warn(`Advertencia al ejecutar SQL: ${err.message}`);
            }
          }
        }
      }
      
      // Ejecutar datos iniciales
      const initialDataScript = fs.readFileSync(path.join(__dirname, 'initial_data.sql'), 'utf8');
      const cleanInitialScript = initialDataScript
        .split(';')
        .map(line => line.trim())
        .filter(line => {
          if (!line || line.startsWith('--')) return false;
          if (line.startsWith('\\')) return false;
          return true;
        })
        .join(';\n') + ';';
      
      const initialStatements = cleanInitialScript.split(';').filter(s => s.trim().length > 0);
      for (const statement of initialStatements) {
        const trimmed = statement.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          try {
            await query(trimmed);
          } catch (err) {
            // Ignorar errores de duplicados en datos iniciales
            if (!err.message.includes('duplicate key') && !err.message.includes('already exists')) {
              console.warn(`Advertencia al insertar datos: ${err.message}`);
            }
          }
        }
      }
      
      console.log('✅ Base de datos inicializada correctamente');
    } else {
      console.log('✅ Estructura de la base de datos verificada');
    }
    
    // Verificar si necesitamos poblar datos iniciales
    await populateInitialData();
    
    // Verificar y agregar el valor 'en_apelacion' al enum estado_item si no existe
    await ensureApelacionEstadoExists();
    
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    throw error;
  }
};

// Función para poblar datos iniciales (categorías, ubicaciones, usuarios, productos)
const populateInitialData = async () => {
  try {
    console.log('📦 Verificando datos iniciales...');
    
    // Verificar si ya existen categorías
    const categoriesCheck = await query('SELECT COUNT(*) as count FROM categorias');
    const categoriesCount = parseInt(categoriesCheck.rows[0].count);
    
    // Verificar si ya existen ubicaciones de Ecuador (deben tener provincia)
    const locationsCheck = await query(`
      SELECT COUNT(*) as count FROM ubicaciones WHERE provincia IS NOT NULL
    `);
    const locationsCount = parseInt(locationsCheck.rows[0].count);
    
    // Verificar si ya existen usuarios de prueba
    const usersCheck = await query(`
      SELECT COUNT(*) as count FROM usuarios WHERE correo IN (
        'vendedor@test.com', 
        'comprador@test.com', 
        'admin@test.com', 
        'moderador@test.com'
      )
    `);
    const testUsersCount = parseInt(usersCheck.rows[0].count);
    
    // Si ya existen datos, no hacer nada
    if (categoriesCount > 0 && locationsCount > 0 && testUsersCount === 4) {
      console.log('✅ Datos iniciales ya están cargados');
      return;
    }
    
    console.log('🔄 Poblando datos iniciales...');
    
    // Verificar y agregar categoría "Otros" si no existe
    const otrosCheck = await query(`
      SELECT COUNT(*) as count FROM categorias WHERE nombre = 'Otros' AND nivel = 0
    `);
    const otrosExists = parseInt(otrosCheck.rows[0].count) > 0;
    
    if (!otrosExists) {
      console.log('📂 Agregando categoría "Otros"...');
      try {
        await query(`
          INSERT INTO categorias (nombre, descripcion, categoria_padre_id, nivel, orden, activa)
          VALUES ('Otros', 'Categoría general para productos diversos', NULL, 0, 11, true)
          ON CONFLICT DO NOTHING
        `);
        console.log('✅ Categoría "Otros" agregada');
      } catch (err) {
        console.warn('⚠️ Error agregando categoría Otros:', err.message);
      }
    }
    
    // 1. Crear categorías jerárquicas
    if (categoriesCount === 0) {
      console.log('📂 Creando categorías jerárquicas...');
      try {
        const scriptPath = path.join(__dirname, '..', '..', 'create-hierarchical-categories.js');
        if (fs.existsSync(scriptPath)) {
          const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
            cwd: path.join(__dirname, '..', '..'),
            env: { ...process.env, DB_HOST: config.database.host, DB_PORT: config.database.port, DB_NAME: config.database.name, DB_USER: config.database.user, DB_PASSWORD: config.database.password }
          });
          if (stdout) console.log(stdout);
          console.log('✅ Categorías jerárquicas creadas');
        } else {
          console.warn('⚠️ No se encontró el script create-hierarchical-categories.js');
        }
      } catch (err) {
        console.warn('⚠️ Error creando categorías:', err.message);
      }
    }
    
    // 2. Verificar/crear ubicaciones de Ecuador (SIEMPRE verificar e insertar si faltan)
    if (locationsCount === 0 || locationsCount < 100) {
      console.log('🌎 Verificando ubicaciones de Ecuador...');
      // Las ubicaciones deberían haberse cargado desde 05-ecuador-locations.sql en las migraciones
      // Si no están, esperamos un poco más por si Docker aún está ejecutando el script
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const recheckLocations = await query(`
        SELECT COUNT(*) as count FROM ubicaciones WHERE provincia IS NOT NULL
      `);
      const recheckCount = parseInt(recheckLocations.rows[0].count);
      
      if (recheckCount === 0 || recheckCount < 100) {
        console.log(`⚠️ Ubicaciones de Ecuador no encontradas o insuficientes (${recheckCount} encontradas). Cargando desde el script SQL...`);
        // Intentar cargar el SQL desde el archivo
        try {
          const locationsSQLPath = path.join(__dirname, '..', '..', 'migrations', '05-ecuador-locations.sql');
          if (fs.existsSync(locationsSQLPath)) {
            const locationsSQL = fs.readFileSync(locationsSQLPath, 'utf8');
            
            // Primero ejecutar TRUNCATE y ALTER SEQUENCE si existen
            try {
              await query('TRUNCATE TABLE ubicaciones CASCADE');
              await query('ALTER SEQUENCE ubicaciones_id_seq RESTART WITH 1');
              console.log('   Limpiando ubicaciones antiguas...');
            } catch (truncateErr) {
              console.log('   No se pudieron limpiar ubicaciones antiguas (puede ser normal si está vacío)');
            }
            
            // Ejecutar el SQL usando el cliente directamente para manejar mejor statements multilínea
            const client = await getClient();
            try {
              // Ejecutar el SQL completo - PostgreSQL puede manejar múltiples statements
              // Dividir por ; pero reconstruir statements completos que pueden estar en múltiples líneas
              const lines = locationsSQL.split('\n');
              let currentStatement = '';
              let inComment = false;
              let insertedCount = 0;
              
              for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                
                // Ignorar líneas de comentario completas
                if (line.startsWith('--')) continue;
                if (line.startsWith('/*')) {
                  inComment = true;
                  continue;
                }
                if (inComment) {
                  if (line.includes('*/')) {
                    inComment = false;
                    line = line.split('*/')[1].trim();
                  } else {
                    continue;
                  }
                }
                
                // Ignorar líneas SET y comandos especiales de psql
                if (line.toLowerCase().startsWith('set ') || line.startsWith('\\c') || line.toLowerCase().includes('client_encoding')) {
                  continue;
                }
                
                if (line) {
                  currentStatement += (currentStatement ? ' ' : '') + line;
                  
                  // Si la línea termina con ; y tenemos un statement completo
                  if (line.endsWith(';') && currentStatement) {
                    const statement = currentStatement.trim();
                    if (statement.length > 10) {
                      try {
                        await client.query(statement);
                        if (statement.toUpperCase().includes('INSERT')) {
                          insertedCount++;
                        }
                      } catch (err) {
                        // Ignorar errores de duplicados, pero mostrar otros
                        if (!err.message.includes('already exists') && 
                            !err.message.includes('duplicate') && 
                            !err.message.includes('violates foreign key') &&
                            !err.message.includes('does not exist')) {
                          console.warn(`   Advertencia en línea ${i + 1}: ${err.message.substring(0, 80)}`);
                        }
                      }
                    }
                    currentStatement = '';
                  }
                }
              }
              
              // Ejecutar cualquier statement que quede sin terminar
              if (currentStatement.trim().length > 10) {
                try {
                  await client.query(currentStatement.trim());
                  if (currentStatement.toUpperCase().includes('INSERT')) {
                    insertedCount++;
                  }
                } catch (err) {
                  if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
                    console.warn(`   Advertencia en statement final: ${err.message.substring(0, 80)}`);
                  }
                }
              }
              
              console.log(`✅ Ubicaciones de Ecuador cargadas (${insertedCount} inserts ejecutados)`);
              
              // Verificar que se insertaron
              const verifyLocations = await query(`
                SELECT COUNT(*) as count FROM ubicaciones WHERE provincia IS NOT NULL
              `);
              const finalCount = parseInt(verifyLocations.rows[0].count);
              console.log(`   Verificado: ${finalCount} ubicaciones en la base de datos`);
              
            } finally {
              client.release();
            }
          } else {
            console.warn('⚠️ No se encontró el archivo migrations/05-ecuador-locations.sql');
          }
        } catch (err) {
          console.warn('⚠️ Error cargando ubicaciones:', err.message);
          if (err.stack) {
            console.warn('   Stack:', err.stack.substring(0, 200));
          }
        }
      } else {
        console.log(`✅ Ubicaciones de Ecuador encontradas (${recheckCount} ubicaciones)`);
      }
    }
    
    // 3. Crear usuarios de prueba
    if (testUsersCount < 4) {
      console.log('👥 Creando usuarios de prueba...');
      try {
        const scriptPath = path.join(__dirname, '..', '..', 'create-test-users.js');
        if (fs.existsSync(scriptPath)) {
          const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
            cwd: path.join(__dirname, '..', '..'),
            env: { ...process.env, DB_HOST: config.database.host, DB_PORT: config.database.port, DB_NAME: config.database.name, DB_USER: config.database.user, DB_PASSWORD: config.database.password }
          });
          if (stdout) console.log(stdout);
          console.log('✅ Usuarios de prueba creados');
        } else {
          console.warn('⚠️ No se encontró el script create-test-users.js');
        }
      } catch (err) {
        console.warn('⚠️ Error creando usuarios de prueba:', err.message);
      }
    }
    
    // 4. Insertar productos de prueba (SIEMPRE verificar e insertar si faltan)
    // Verificar primero que existan ubicaciones
    const finalLocationsCheck = await query(`
      SELECT COUNT(*) as count FROM ubicaciones WHERE provincia IS NOT NULL
    `);
    const finalLocationsCount = parseInt(finalLocationsCheck.rows[0].count);
    
    if (finalLocationsCount === 0) {
      console.warn('⚠️ No hay ubicaciones disponibles. Los productos no se pueden insertar sin ubicaciones.');
    } else {
      const productsCheck = await query('SELECT COUNT(*) as count FROM items');
      const productsCount = parseInt(productsCheck.rows[0].count);
      
      if (productsCount === 0 || productsCount < 5) {
        console.log(`📦 Insertando productos de prueba (actualmente hay ${productsCount}, ubicaciones: ${finalLocationsCount})...`);
        try {
          const scriptPath = path.join(__dirname, '..', '..', 'insert-test-products-corregido.js');
          if (fs.existsSync(scriptPath)) {
            const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
              cwd: path.join(__dirname, '..', '..'),
              env: { ...process.env, DB_HOST: config.database.host, DB_PORT: config.database.port, DB_NAME: config.database.name, DB_USER: config.database.user, DB_PASSWORD: config.database.password }
            });
            if (stdout) console.log(stdout);
            if (stderr && !stderr.includes('Warning')) console.warn('Stderr:', stderr);
            console.log('✅ Productos de prueba insertados');
            
            // Verificar que se insertaron productos
            const verifyProducts = await query('SELECT COUNT(*) as count FROM items');
            const finalProductsCount = parseInt(verifyProducts.rows[0].count);
            console.log(`   Verificado: ${finalProductsCount} productos en la base de datos`);
          } else {
            console.warn('⚠️ No se encontró el archivo insert-test-products-corregido.js');
          }
        } catch (err) {
          console.warn('⚠️ Error insertando productos de prueba:', err.message);
          if (err.stdout) console.log('Stdout:', err.stdout);
          if (err.stderr) console.warn('Stderr:', err.stderr);
        }
      } else {
        console.log(`✅ Productos de prueba ya existen (${productsCount} productos)`);
      }
    }
    
    console.log('✅ Población de datos iniciales completada');
    
  } catch (error) {
    console.warn('⚠️ Error al poblar datos iniciales:', error.message);
    // No lanzar error para no detener el inicio del servidor
  }
};

// Función para limpiar datos de prueba
const cleanTestData = async () => {
  try {
    console.log('🧹 Limpiando datos de prueba...');
    
    await query('DELETE FROM sesiones_usuario WHERE usuario_id > 0');
    await query('DELETE FROM valoraciones WHERE id > 0');
    await query('DELETE FROM mensajes_chat WHERE id > 0');
    await query('DELETE FROM chats WHERE id > 0');
    await query('DELETE FROM productos_guardados WHERE id > 0');
    await query('DELETE FROM apelaciones WHERE id > 0');
    await query('DELETE FROM reportes WHERE id > 0');
    await query('DELETE FROM item_imagenes WHERE id > 0');
    await query('DELETE FROM servicios WHERE id > 0');
    await query('DELETE FROM items WHERE id > 0');
    await query('DELETE FROM usuarios WHERE id > 0');
    
    console.log('✅ Datos de prueba limpiados');
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error.message);
    throw error;
  }
};

// Función para restaurar datos de prueba
const restoreTestData = async () => {
  try {
    console.log('🔄 Restaurando datos de prueba...');
    
    const initialDataScript = fs.readFileSync(path.join(__dirname, 'initial_data.sql'), 'utf8');
    await query(initialDataScript);
    
    console.log('✅ Datos de prueba restaurados');
    return true;
  } catch (error) {
    console.error('❌ Error al restaurar datos:', error.message);
    throw error;
  }
};

// Función para corregir caracteres mal codificados
const fixEncodingIssues = async () => {
  try {
    console.log('🔧 Verificando y corrigiendo problemas de codificación...');
    
    // Lista de correcciones comunes para caracteres mal codificados
    const corrections = [
      { from: 'Ã¡', to: 'á' }, // á
      { from: 'Ã©', to: 'é' }, // é
      { from: 'Ã­', to: 'í' }, // í
      { from: 'Ã³', to: 'ó' }, // ó
      { from: 'Ãº', to: 'ú' }, // ú
      { from: 'Ã±', to: 'ñ' }, // ñ
      { from: 'Ã', to: 'Á' },  // Á
      { from: 'Ã‰', to: 'É' }, // É
      { from: 'Ã', to: 'Í' },  // Í
      { from: 'Ã"', to: 'Ó' }, // Ó
      { from: 'Ãš', to: 'Ú' }, // Ú
      { from: 'Ã\u0091', to: 'Ñ' }, // Ñ
    ];

    // Corregir categorías
    for (const correction of corrections) {
      await query(
        'UPDATE categorias SET nombre = REPLACE(nombre, $1, $2) WHERE nombre LIKE $3',
        [correction.from, correction.to, `%${correction.from}%`]
      );
    }

    // Verificar si hay categorías con problemas de codificación
    const problematicCategories = await query(`
      SELECT id, nombre 
      FROM categorias 
      WHERE nombre ~ '[^\x00-\x7F]' 
      AND nombre NOT ~ '[áéíóúñÁÉÍÓÚÑ]'
    `);

    if (problematicCategories.rows.length > 0) {
      console.log('⚠️  Se encontraron categorías con posibles problemas de codificación:');
      problematicCategories.rows.forEach(cat => {
        console.log(`   - ID ${cat.id}: "${cat.nombre}"`);
      });
    } else {
      console.log('✅ Todas las categorías tienen codificación correcta');
    }

    return true;
  } catch (error) {
    console.error('❌ Error al corregir problemas de codificación:', error.message);
    return false;
  }
};

// Función para obtener estado de la base de datos
const getDatabaseStatus = async () => {
  try {
    const tables = await query(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    const users = await query('SELECT COUNT(*) as total FROM usuarios');
    const sessions = await query('SELECT COUNT(*) as total FROM sesiones_usuario');
    const items = await query('SELECT COUNT(*) as total FROM items');
    
    return {
      tables: tables.rows,
      users: users.rows[0].total,
      sessions: sessions.rows[0].total,
      items: items.rows[0].total,
      status: 'connected'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Cerrar la pool al terminar la aplicación
process.on('SIGINT', () => {
  pool.end();
});

process.on('SIGTERM', () => {
  pool.end();
});

// Función para asegurar que el valor 'en_apelacion' exista en el enum estado_item
// Esta función se ejecuta cada vez que el backend se inicializa para garantizar
// que el valor existe incluso si los scripts de inicialización de PostgreSQL no se ejecutaron
const ensureApelacionEstadoExists = async () => {
  try {
    console.log('🔍 Verificando que el enum estado_item tenga el valor "en_apelacion"...');
    
    // Verificar si el tipo enum existe
    const typeCheck = await query(`
      SELECT 1 FROM pg_type WHERE typname = 'estado_item'
    `);
    
    if (typeCheck.rows.length === 0) {
      console.log('⚠️  El tipo enum estado_item no existe aún');
      return;
    }
    
    // Verificar si el valor 'en_apelacion' ya existe
    const enumCheck = await query(`
      SELECT 1 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_item'
      AND e.enumlabel = 'en_apelacion'
    `);
    
    if (enumCheck.rows.length > 0) {
      console.log('✅ El valor "en_apelacion" ya existe en estado_item');
      return;
    }
    
    // Si no existe, agregarlo
    console.log('➕ Agregando valor "en_apelacion" al enum estado_item...');
    
    // NOTA: ALTER TYPE ADD VALUE no puede ejecutarse dentro de una transacción
    // pero podemos intentarlo directamente
    try {
      // Usar un cliente directo para ejecutar fuera de la transacción
      const client = await pool.connect();
      try {
        // PostgreSQL no soporta IF NOT EXISTS, pero ya verificamos antes
        await client.query('ALTER TYPE estado_item ADD VALUE \'en_apelacion\'');
        console.log('✅ Valor "en_apelacion" agregado exitosamente al enum estado_item');
      } catch (err) {
        // Si falla, intentar sin IF NOT EXISTS (para versiones antiguas de PostgreSQL)
        if (err.message.includes('syntax error') || err.message.includes('IF NOT EXISTS')) {
          try {
            await client.query('ALTER TYPE estado_item ADD VALUE \'en_apelacion\'');
            console.log('✅ Valor "en_apelacion" agregado exitosamente al enum estado_item');
          } catch (err2) {
            if (err2.message.includes('already exists') || err2.message.includes('duplicate')) {
              console.log('✅ El valor "en_apelacion" ya existe en estado_item');
            } else {
              console.warn('⚠️  No se pudo agregar "en_apelacion" al enum:', err2.message);
              // Intentar ejecutar el script de migración directamente
              const migrationScript = path.join(__dirname, '../../migrations/06-add-apelacion-estado.sql');
              if (fs.existsSync(migrationScript)) {
                console.log('📄 Ejecutando script de migración 06-add-apelacion-estado.sql...');
                const scriptContent = fs.readFileSync(migrationScript, 'utf8');
                const cleanScript = scriptContent
                  .replace(/--[^\n]*/g, '')
                  .split(';')
                  .map(s => s.trim())
                  .filter(s => s.length > 0);
                
                for (const statement of cleanScript) {
                  try {
                    await client.query(statement);
                  } catch (err3) {
                    if (!err3.message.includes('already exists') && !err3.message.includes('duplicate')) {
                      console.warn('⚠️  Error ejecutando script:', err3.message);
                    }
                  }
                }
              }
            }
          }
        } else if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log('✅ El valor "en_apelacion" ya existe en estado_item');
        } else {
          console.warn('⚠️  No se pudo agregar "en_apelacion" al enum:', err.message);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.warn('⚠️  Error al verificar/agregar "en_apelacion" al enum:', error.message);
    }
  } catch (error) {
    console.warn('⚠️  Error al verificar enum estado_item:', error.message);
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initializeDatabase,
  populateInitialData,
  ensureApelacionEstadoExists,
  cleanTestData,
  restoreTestData,
  getDatabaseStatus,
  fixEncodingIssues
};
