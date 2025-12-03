/**
 * Script para restaurar datos completos del sistema
 * 
 * Este script:
 * 1. Borra datos de usuarios, productos, apelaciones, reportes, servicios y tablas relacionadas
 * 2. Inserta items, servicios e imágenes desde initial_data.sql (líneas 42-143)
 * 3. Ejecuta create-e2e-test-users.js
 * 4. Ejecuta create-test-users.js
 */

const { Pool } = require('pg');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const execAsync = promisify(exec);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_ventas_multiempresa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para ejecutar comandos
async function runCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10, // 10MB
      cwd: __dirname,
      ...options
    });
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

// Función para ejecutar SQL
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function restaurarDatos() {
  const client = await pool.connect();
  
  try {
    console.log('=====================================================');
    console.log('🔄 SCRIPT DE RESTAURACIÓN DE DATOS COMPLETOS');
    console.log('=====================================================\n');

    // PASO 1: Borrar datos
    console.log('🗑️  PASO 1/4: Borrando datos existentes...\n');
    
    await client.query('BEGIN;');
    
    // Desactivar temporalmente las restricciones de foreign keys
    await client.query('SET session_replication_role = replica;');
    
    // Borrar tablas que dependen de otras (orden de dependencias)
    console.log('   Eliminando mensajes de chat...');
    await client.query('DELETE FROM mensajes_chat;');
    
    console.log('   Eliminando valoraciones...');
    await client.query('DELETE FROM valoraciones;');
    
    console.log('   Eliminando chats...');
    await client.query('DELETE FROM chats;');
    
    console.log('   Eliminando productos guardados...');
    await client.query('DELETE FROM productos_guardados;');
    
    console.log('   Eliminando apelaciones...');
    await client.query('DELETE FROM apelaciones;');
    
    console.log('   Eliminando reportes...');
    await client.query('DELETE FROM reportes;');
    
    console.log('   Eliminando imágenes de productos...');
    await client.query('DELETE FROM item_imagenes;');
    
    console.log('   Eliminando servicios...');
    await client.query('DELETE FROM servicios;');
    
    console.log('   Eliminando acciones de moderación...');
    await client.query('DELETE FROM acciones_moderacion;');
    
    console.log('   Eliminando sesiones de usuario...');
    await client.query('DELETE FROM sesiones_usuario;');
    
    console.log('   Eliminando productos (items)...');
    await client.query('DELETE FROM items;');
    
    console.log('   Eliminando usuarios...');
    await client.query('DELETE FROM usuarios;');
    
    // Reactivar las restricciones de foreign keys
    await client.query('SET session_replication_role = DEFAULT;');
    
    await client.query('COMMIT;');
    
    console.log('   ✅ Datos eliminados correctamente\n');
    
    // Reiniciar secuencias de IDs para que empiecen desde 1
    console.log('   Reiniciando secuencias de IDs...');
    await client.query('BEGIN;');
    
    // Reiniciar secuencias de las tablas borradas
    await client.query('ALTER SEQUENCE IF EXISTS items_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS item_imagenes_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS servicios_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS usuarios_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS reportes_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS apelaciones_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS productos_guardados_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS chats_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS mensajes_chat_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS valoraciones_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS acciones_moderacion_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE IF EXISTS sesiones_usuario_id_seq RESTART WITH 1;');
    
    await client.query('COMMIT;');
    console.log('   ✅ Secuencias reiniciadas correctamente\n');

    // PASO 2: Ejecutar create-e2e-test-users.js (PRIMERO para tener usuarios)
    console.log('👥 PASO 2/4: Ejecutando create-e2e-test-users.js...\n');
    const e2eResult = await runCommand('node create-e2e-test-users.js');
    
    if (!e2eResult.success) {
      console.error('❌ Error ejecutando create-e2e-test-users.js');
      console.error(e2eResult.error || e2eResult.stderr);
      process.exit(1);
    }
    
    console.log('   ✅ Usuarios E2E creados correctamente\n');

    // PASO 3: Ejecutar create-test-users.js
    console.log('👥 PASO 3/4: Ejecutando create-test-users.js...\n');
    const testUsersResult = await runCommand('node create-test-users.js');
    
    if (!testUsersResult.success) {
      console.error('❌ Error ejecutando create-test-users.js');
      console.error(testUsersResult.error || testUsersResult.stderr);
      process.exit(1);
    }
    
    console.log('   ✅ Usuarios de prueba creados correctamente\n');

    // PASO 4: Insertar items, servicios e imágenes desde initial_data.sql
    console.log('📦 PASO 4/4: Insertando items, servicios e imágenes desde initial_data.sql...\n');
    
    await client.query('BEGIN;');
    
    try {
      // Obtener IDs de los vendedores creados por create-test-users.js
      console.log('   Obteniendo IDs de vendedores...');
      const vendedores = await client.query(`
        SELECT id, correo FROM usuarios 
        WHERE correo IN (
          'ana.vendedor@sistemaventas.com',
          'luis.vendedor@sistemaventas.com',
          'carmen.vendedor@sistemaventas.com',
          'roberto.vendedor@sistemaventas.com'
        )
        ORDER BY correo
      `);
      
      if (vendedores.rows.length < 4) {
        throw new Error('No se encontraron los 4 vendedores necesarios. Asegúrate de que create-test-users.js se ejecutó correctamente.');
      }
      
      // Mapear vendedores por correo
      const vendedorMap = {};
      vendedores.rows.forEach(v => {
        vendedorMap[v.correo] = v.id;
      });
      
      const anaId = vendedorMap['ana.vendedor@sistemaventas.com'];
      const luisId = vendedorMap['luis.vendedor@sistemaventas.com'];
      const carmenId = vendedorMap['carmen.vendedor@sistemaventas.com'];
      const robertoId = vendedorMap['roberto.vendedor@sistemaventas.com'];
      
      console.log(`   Ana ID: ${anaId}, Luis ID: ${luisId}, Carmen ID: ${carmenId}, Roberto ID: ${robertoId}`);
      
      // Obtener IDs reales de categorías por nombre (NO las creamos, solo las obtenemos)
      console.log('   Obteniendo IDs de categorías existentes...');
      const categoriasNecesarias = ['Electrónicos', 'Hogar y Jardín', 'Ropa y Accesorios', 'Deportes y Recreación', 'Libros y Educación', 'Servicios'];
      
      const categoriasResult = await client.query(`
        SELECT id, nombre FROM categorias 
        WHERE nombre IN ($1, $2, $3, $4, $5, $6)
        AND activa = TRUE
      `, categoriasNecesarias);
      
      if (categoriasResult.rows.length === 0) {
        throw new Error('No se encontraron categorías. Las categorías deben existir antes de insertar productos. Ejecuta create-hierarchical-categories-corregido.js primero.');
      }
      
      // Mapear categorías por nombre
      const categoriaMap = {};
      categoriasResult.rows.forEach(cat => {
        categoriaMap[cat.nombre] = cat.id;
      });
      
      // Verificar que todas las categorías necesarias existan
      const categoriasFaltantes = categoriasNecesarias.filter(nombre => !categoriaMap[nombre]);
      if (categoriasFaltantes.length > 0) {
        throw new Error(`Categorías faltantes: ${categoriasFaltantes.join(', ')}. Las categorías deben existir antes de insertar productos.`);
      }
      
      const categoriaElectroId = categoriaMap['Electrónicos'];
      const categoriaHogarId = categoriaMap['Hogar y Jardín'];
      const categoriaRopaId = categoriaMap['Ropa y Accesorios'];
      const categoriaDepId = categoriaMap['Deportes y Recreación'];
      const categoriaLibrosId = categoriaMap['Libros y Educación'];
      const categoriaServId = categoriaMap['Servicios'];
      
      console.log(`   Electrónicos ID: ${categoriaElectroId}, Hogar ID: ${categoriaHogarId}, Ropa ID: ${categoriaRopaId}`);
      console.log(`   Deportes ID: ${categoriaDepId}, Libros ID: ${categoriaLibrosId}, Servicios ID: ${categoriaServId}\n`);
      
      // Obtener ubicaciones existentes (NO las creamos, solo las obtenemos)
      console.log('   Obteniendo IDs de ubicaciones existentes...');
      const ubicacionesResult = await client.query(`
        SELECT id, nombre FROM ubicaciones 
        WHERE activa = TRUE
        ORDER BY id
        LIMIT 5
      `);
      
      if (ubicacionesResult.rows.length < 5) {
        throw new Error('No se encontraron suficientes ubicaciones. Las ubicaciones deben existir antes de insertar productos.');
      }
      
      const ubicacion1Id = ubicacionesResult.rows[0]?.id || null;
      const ubicacion2Id = ubicacionesResult.rows[1]?.id || null;
      const ubicacion3Id = ubicacionesResult.rows[2]?.id || null;
      const ubicacion4Id = ubicacionesResult.rows[3]?.id || null;
      const ubicacion5Id = ubicacionesResult.rows[4]?.id || null;
      
      console.log(`   Ubicaciones encontradas: ${ubicacionesResult.rows.length}\n`);
      
      // Insertar productos (usando IDs reales de vendedores, categorías y ubicaciones)
      console.log('   Insertando productos...');
      
      // Productos electrónicos
      await client.query(`
        INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
        ('ELEC001', 'iPhone 13 Pro Max', 'iPhone 13 Pro Max 256GB en excelente estado, incluye cargador y funda protectora', 850000.00, $1, 'producto', $2, $3, 'activo'),
        ('ELEC002', 'MacBook Air M1', 'MacBook Air con chip M1, 8GB RAM, 256GB SSD, prácticamente nueva', 1200000.00, $4, 'producto', $2, $3, 'activo'),
        ('ELEC003', 'Samsung Galaxy S21', 'Samsung Galaxy S21 128GB, color negro, con accesorios originales', 450000.00, $1, 'producto', $2, $5, 'activo'),
        ('ELEC004', 'iPad Pro 11"', 'iPad Pro 11 pulgadas, 128GB, WiFi, incluye Apple Pencil', 650000.00, $6, 'producto', $2, $5, 'activo');
      `, [ubicacion1Id, categoriaElectroId, anaId, ubicacion2Id, luisId, ubicacion3Id]);
      
      // Productos del hogar
      await client.query(`
        INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
        ('HOG001', 'Sofá de 3 plazas', 'Sofá moderno de 3 plazas, color gris, excelente estado', 180000.00, $1, 'producto', $2, $3, 'activo'),
        ('HOG002', 'Mesa de comedor', 'Mesa de comedor para 6 personas, madera de teca', 120000.00, $4, 'producto', $2, $3, 'activo'),
        ('HOG003', 'Refrigeradora Samsung', 'Refrigeradora Samsung 2 puertas, 300L, color plateado', 350000.00, $5, 'producto', $2, $6, 'activo');
      `, [ubicacion1Id, categoriaHogarId, carmenId, ubicacion2Id, ubicacion4Id, robertoId]);
      
      // Productos de ropa
      await client.query(`
        INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
        ('ROP001', 'Vestido de noche', 'Vestido elegante de noche, talla M, color negro', 45000.00, $1, 'producto', $2, $3, 'activo'),
        ('ROP002', 'Traje de hombre', 'Traje formal para hombre, talla 40, color azul marino', 80000.00, $4, 'producto', $2, $5, 'activo'),
        ('ROP003', 'Zapatos deportivos Nike', 'Zapatos deportivos Nike Air Max, talla 42, color blanco', 65000.00, $6, 'producto', $2, $7, 'activo');
      `, [ubicacion1Id, categoriaRopaId, carmenId, ubicacion2Id, luisId, ubicacion3Id, robertoId]);
      
      // Productos deportivos
      await client.query(`
        INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
        ('DEP001', 'Bicicleta de montaña', 'Bicicleta de montaña Trek, 21 velocidades, excelente estado', 180000.00, $1, 'producto', $2, $3, 'activo'),
        ('DEP002', 'Set de pesas', 'Set completo de pesas para gimnasio casero, hasta 50kg', 95000.00, $4, 'producto', $2, $5, 'activo'),
        ('DEP003', 'Raqueta de tenis', 'Raqueta de tenis Wilson Pro Staff, incluye cordaje', 120000.00, $6, 'producto', $2, $7, 'activo');
      `, [ubicacion5Id, categoriaDepId, anaId, ubicacion1Id, luisId, ubicacion2Id, carmenId]);
      
      // Productos de libros
      await client.query(`
        INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
        ('LIB001', 'Libro de Programación', 'Clean Code: A Handbook of Agile Software Craftsmanship', 25000.00, $1, 'producto', $2, $3, 'activo'),
        ('LIB002', 'Novela clásica', 'Cien años de soledad - Gabriel García Márquez', 15000.00, $4, 'producto', $2, $5, 'activo'),
        ('LIB003', 'Libro de cocina', 'Recetas tradicionales costarricenses', 20000.00, $6, 'producto', $2, $7, 'activo');
      `, [ubicacion1Id, categoriaLibrosId, robertoId, ubicacion3Id, anaId, ubicacion4Id, luisId]);
      
      // Servicios
      console.log('   Insertando servicios...');
      await client.query(`
        INSERT INTO items (codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id, estado) VALUES
        ('SER001', 'Clases de guitarra', 'Clases particulares de guitarra acústica y eléctrica', 15000.00, $1, 'servicio', $2, $3, 'activo'),
        ('SER002', 'Servicio de limpieza', 'Servicio de limpieza residencial y comercial', 25000.00, $4, 'servicio', $2, $5, 'activo'),
        ('SER003', 'Reparación de computadoras', 'Servicio técnico para computadoras y laptops', 20000.00, $6, 'servicio', $2, $7, 'activo'),
        ('SER004', 'Clases de inglés', 'Clases particulares de inglés conversacional', 18000.00, $8, 'servicio', $2, $9, 'activo');
      `, [ubicacion1Id, categoriaServId, anaId, ubicacion2Id, luisId, ubicacion3Id, carmenId, ubicacion4Id, robertoId]);
      
      // Obtener IDs de los servicios recién insertados (deben ser los últimos 4 items)
      const serviciosInsertados = await client.query(`
        SELECT id FROM items 
        WHERE codigo IN ('SER001', 'SER002', 'SER003', 'SER004')
        ORDER BY codigo
      `);
      
      if (serviciosInsertados.rows.length !== 4) {
        throw new Error('No se pudieron obtener los IDs de los servicios insertados');
      }
      
      const ser1Id = serviciosInsertados.rows[0].id;
      const ser2Id = serviciosInsertados.rows[1].id;
      const ser3Id = serviciosInsertados.rows[2].id;
      const ser4Id = serviciosInsertados.rows[3].id;
      
      // Datos específicos de servicios
      await client.query(`
        INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada) VALUES
        ($1, '8:00 AM - 6:00 PM', 'Lunes a Viernes', '1 hora por clase'),
        ($2, '7:00 AM - 5:00 PM', 'Lunes a Sábado', '2-4 horas'),
        ($3, '9:00 AM - 7:00 PM', 'Lunes a Viernes', '1-3 horas'),
        ($4, '2:00 PM - 8:00 PM', 'Martes y Jueves', '1 hora por clase');
      `, [ser1Id, ser2Id, ser3Id, ser4Id]);
      
      // Obtener IDs de los primeros productos para las imágenes
      const productosImagenes = await client.query(`
        SELECT id FROM items 
        WHERE codigo IN ('ELEC001', 'ELEC002', 'ELEC003')
        ORDER BY codigo
      `);
      
      if (productosImagenes.rows.length !== 3) {
        throw new Error('No se pudieron obtener los IDs de los productos para imágenes');
      }
      
      const prod1Id = productosImagenes.rows[0].id; // ELEC001
      const prod2Id = productosImagenes.rows[1].id; // ELEC002
      const prod3Id = productosImagenes.rows[2].id; // ELEC003
      
      // Imágenes
      console.log('   Insertando imágenes...');
      await client.query(`
        INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal) VALUES
        ($1, 'https://example.com/images/iphone13_1.jpg', 1, TRUE),
        ($1, 'https://example.com/images/iphone13_2.jpg', 2, FALSE),
        ($1, 'https://example.com/images/iphone13_3.jpg', 3, FALSE),
        ($2, 'https://example.com/images/macbook_1.jpg', 1, TRUE),
        ($2, 'https://example.com/images/macbook_2.jpg', 2, FALSE),
        ($3, 'https://example.com/images/galaxy_1.jpg', 1, TRUE),
        ($3, 'https://example.com/images/galaxy_2.jpg', 2, FALSE),
        ($3, 'https://example.com/images/galaxy_3.jpg', 3, FALSE);
      `, [prod1Id, prod2Id, prod3Id]);
      
      await client.query('COMMIT;');
      console.log('   ✅ Items, servicios e imágenes insertados correctamente\n');
      
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    }

    console.log('=====================================================');
    console.log('🎉 ¡RESTAURACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('=====================================================');
    console.log('✅ Datos eliminados');
    console.log('✅ Usuarios E2E creados');
    console.log('✅ Usuarios de prueba creados');
    console.log('✅ Items, servicios e imágenes insertados\n');

  } catch (error) {
    console.error('\n❌ Error durante la restauración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
restaurarDatos()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando el script:', error);
    process.exit(1);
  });

