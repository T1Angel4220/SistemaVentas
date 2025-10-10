const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sistema_ventas_multiempresa',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function updateCategoriesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando actualización de tabla categorías...');
    
    // 1. Agregar columnas si no existen
    console.log('📝 Agregando columnas necesarias...');
    
    await client.query(`
      ALTER TABLE categorias 
      ADD COLUMN IF NOT EXISTS categoria_padre_id INTEGER,
      ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE;
    `);
    
    console.log('✅ Columnas agregadas exitosamente');
    
    // 2. Crear foreign key constraint si no existe
    console.log('🔗 Creando foreign key constraint...');
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'categorias_categoria_padre_id_fkey'
        ) THEN
          ALTER TABLE categorias 
          ADD CONSTRAINT categorias_categoria_padre_id_fkey 
          FOREIGN KEY (categoria_padre_id) REFERENCES categorias(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    
    console.log('✅ Foreign key constraint creado');
    
    // 3. Crear unique constraint si no existe
    console.log('🔒 Creando unique constraint...');
    
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'categorias_nombre_padre_unique'
        ) THEN
          ALTER TABLE categorias 
          ADD CONSTRAINT categorias_nombre_padre_unique 
          UNIQUE(nombre, categoria_padre_id);
        END IF;
      END $$;
    `);
    
    console.log('✅ Unique constraint creado');
    
    // 4. Actualizar nivel de categorías existentes
    console.log('📊 Actualizando niveles de categorías existentes...');
    
    const updateResult = await client.query(`
      UPDATE categorias 
      SET nivel = 0, activa = true 
      WHERE nivel IS NULL OR activa IS NULL;
    `);
    
    console.log(`✅ ${updateResult.rowCount} categorías actualizadas`);
    
    // 5. Verificar estructura final
    console.log('🔍 Verificando estructura final...');
    
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura final de la tabla categorías:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });
    
    console.log('🎉 ¡Actualización completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  updateCategoriesTable()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { updateCategoriesTable };
