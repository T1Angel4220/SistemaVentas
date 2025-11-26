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
    
    // 2. Verificar/crear ubicaciones de Ecuador (el SQL ya se ejecutó por Docker, pero verificamos)
    if (locationsCount === 0) {
      console.log('🌎 Verificando ubicaciones de Ecuador...');
      // Las ubicaciones deberían haberse cargado desde 05-ecuador-locations.sql en las migraciones
      // Si no están, esperamos un poco más por si Docker aún está ejecutando el script
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const recheckLocations = await query(`
        SELECT COUNT(*) as count FROM ubicaciones WHERE provincia IS NOT NULL
      `);
      const recheckCount = parseInt(recheckLocations.rows[0].count);
      
      if (recheckCount === 0) {
        console.log('⚠️ Ubicaciones de Ecuador no encontradas. Cargando desde el script SQL...');
        // Intentar cargar el SQL desde el archivo
        try {
          const locationsSQLPath = path.join(__dirname, '..', '..', 'migrations', '05-ecuador-locations.sql');
          if (fs.existsSync(locationsSQLPath)) {
            const locationsSQL = fs.readFileSync(locationsSQLPath, 'utf8');
            // Ejecutar el SQL línea por línea para evitar problemas con comandos especiales
            const statements = locationsSQL
              .split(';')
              .map(s => s.trim())
              .filter(s => s && !s.startsWith('--') && !s.toLowerCase().startsWith('set'));
            
            for (const statement of statements) {
              if (statement.length > 10) {
                try {
                  await query(statement);
                } catch (err) {
                  // Ignorar errores de duplicados o sintaxis menores
                  if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
                    console.warn(`   Advertencia: ${err.message.substring(0, 50)}...`);
                  }
                }
              }
            }
            console.log('✅ Ubicaciones de Ecuador cargadas desde el script');
          }
        } catch (err) {
          console.warn('⚠️ Error cargando ubicaciones:', err.message);
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
    
    // 4. Insertar productos de prueba (opcional)
    const productsCheck = await query('SELECT COUNT(*) as count FROM items');
    const productsCount = parseInt(productsCheck.rows[0].count);
    
    if (productsCount === 0) {
      console.log('📦 Insertando productos de prueba...');
      try {
        const scriptPath = path.join(__dirname, '..', '..', 'insert-test-products-corregido.js');
        if (fs.existsSync(scriptPath)) {
          const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
            cwd: path.join(__dirname, '..', '..'),
            env: { ...process.env, DB_HOST: config.database.host, DB_PORT: config.database.port, DB_NAME: config.database.name, DB_USER: config.database.user, DB_PASSWORD: config.database.password }
          });
          if (stdout) console.log(stdout);
          console.log('✅ Productos de prueba insertados');
        } else {
          console.warn('⚠️ No se encontró el archivo insert-test-products-corregido.js');
        }
      } catch (err) {
        console.warn('⚠️ Error insertando productos de prueba:', err.message);
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

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initializeDatabase,
  populateInitialData,
  cleanTestData,
  restoreTestData,
  getDatabaseStatus,
  fixEncodingIssues
};
