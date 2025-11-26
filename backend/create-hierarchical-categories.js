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

// Estructura jerárquica de categorías estilo Amazon
const categoriesStructure = {
  // Categorías principales (nivel 0)
  'Hogar y Jardín': {
    nivel: 0,
    orden: 1,
    subcategorias: {
      'Muebles': { orden: 1 },
      'Decoración': { orden: 2 },
      'Electrodomésticos': { orden: 3 },
      'Jardín': { orden: 4 },
      'Cocina': { orden: 5 },
      'Baño': { orden: 6 }
    }
  },
  'Electrónicos': {
    nivel: 0,
    orden: 2,
    subcategorias: {
      'Computadoras y Tablets': { orden: 1 },
      'Teléfonos y Accesorios': { orden: 2 },
      'Audio y Video': { orden: 3 },
      'Gaming': { orden: 4 },
      'Fotografía': { orden: 5 }
    }
  },
  'Ropa y Accesorios': {
    nivel: 0,
    orden: 3,
    subcategorias: {
      'Ropa Masculina': { orden: 1 },
      'Ropa Femenina': { orden: 2 },
      'Calzado': { orden: 3 },
      'Accesorios': { orden: 4 },
      'Relojes': { orden: 5 }
    }
  },
  'Deportes y Aire Libre': {
    nivel: 0,
    orden: 4,
    subcategorias: {
      'Fitness': { orden: 1 },
      'Deportes de Equipo': { orden: 2 },
      'Ciclismo': { orden: 3 },
      'Running': { orden: 4 },
      'Camping': { orden: 5 }
    }
  },
  'Automotriz': {
    nivel: 0,
    orden: 5,
    subcategorias: {
      'Repuestos': { orden: 1 },
      'Accesorios': { orden: 2 },
      'Herramientas': { orden: 3 },
      'Limpieza': { orden: 4 }
    }
  },
  'Salud y Belleza': {
    nivel: 0,
    orden: 6,
    subcategorias: {
      'Cuidado Personal': { orden: 1 },
      'Cosméticos': { orden: 2 },
      'Salud': { orden: 3 },
      'Suplementos': { orden: 4 }
    }
  },
  'Libros y Entretenimiento': {
    nivel: 0,
    orden: 7,
    subcategorias: {
      'Libros': { orden: 1 },
      'Música': { orden: 2 },
      'Películas': { orden: 3 },
      'Juguetes': { orden: 4 }
    }
  },
  'Alimentación': {
    nivel: 0,
    orden: 8,
    subcategorias: {
      'Comida': { orden: 1 },
      'Bebidas': { orden: 2 },
      'Snacks': { orden: 3 },
      'Orgánicos': { orden: 4 }
    }
  },
  'Bebés y Niños': {
    nivel: 0,
    orden: 9,
    subcategorias: {
      'Ropa': { orden: 1 },
      'Juguetes': { orden: 2 },
      'Cuidado': { orden: 3 },
      'Equipamiento': { orden: 4 }
    }
  },
  'Mascotas': {
    nivel: 0,
    orden: 10,
    subcategorias: {
      'Perros': { orden: 1 },
      'Gatos': { orden: 2 },
      'Peces': { orden: 3 },
      'Otros': { orden: 4 }
    }
  },
  'Otros': {
    nivel: 0,
    orden: 11,
    subcategorias: {
      'Varios': { orden: 1 },
      'Sin categoría': { orden: 2 }
    }
  }
};

async function createHierarchicalCategories() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando creación de categorías jerárquicas...');
    
    // Limpiar categorías existentes (opcional - comentar si quieres mantener las actuales)
    console.log('🗑️ Limpiando categorías existentes...');
    await client.query('DELETE FROM categorias');
    console.log('✅ Categorías existentes eliminadas');
    
    let totalCreated = 0;
    
    // Crear categorías principales y sus subcategorías
    for (const [mainCategoryName, mainCategoryData] of Object.entries(categoriesStructure)) {
      console.log(`\n📂 Creando categoría principal: ${mainCategoryName}`);
      
      // Crear categoría principal
      const mainCategoryResult = await client.query(`
        INSERT INTO categorias (nombre, descripcion, categoria_padre_id, nivel, orden, activa)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        mainCategoryName,
        `Categoría principal de ${mainCategoryName.toLowerCase()}`,
        null,
        mainCategoryData.nivel,
        mainCategoryData.orden,
        true
      ]);
      
      const mainCategoryId = mainCategoryResult.rows[0].id;
      console.log(`  ✅ Categoría principal creada (ID: ${mainCategoryId})`);
      totalCreated++;
      
      // Crear subcategorías
      if (mainCategoryData.subcategorias) {
        for (const [subCategoryName, subCategoryData] of Object.entries(mainCategoryData.subcategorias)) {
          console.log(`    📁 Creando subcategoría: ${subCategoryName}`);
          
          await client.query(`
            INSERT INTO categorias (nombre, descripcion, categoria_padre_id, nivel, orden, activa)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            subCategoryName,
            `Subcategoría de ${subCategoryName.toLowerCase()} bajo ${mainCategoryName.toLowerCase()}`,
            mainCategoryId,
            1,
            subCategoryData.orden,
            true
          ]);
          
          console.log(`      ✅ Subcategoría creada`);
          totalCreated++;
        }
      }
    }
    
    // Verificar categorías creadas
    console.log('\n🔍 Verificando categorías creadas...');
    
    const mainCategories = await client.query(`
      SELECT id, nombre, nivel, orden 
      FROM categorias 
      WHERE nivel = 0 
      ORDER BY orden
    `);
    
    const subCategories = await client.query(`
      SELECT id, nombre, categoria_padre_id, nivel, orden 
      FROM categorias 
      WHERE nivel = 1 
      ORDER BY categoria_padre_id, orden
    `);
    
    console.log(`\n📊 Resumen de categorías creadas:`);
    console.log(`  - Categorías principales: ${mainCategories.rows.length}`);
    console.log(`  - Subcategorías: ${subCategories.rows.length}`);
    console.log(`  - Total: ${totalCreated}`);
    
    console.log('\n📂 Categorías principales:');
    mainCategories.rows.forEach(cat => {
      console.log(`  ${cat.orden}. ${cat.nombre} (ID: ${cat.id})`);
      
      const subcats = subCategories.rows.filter(sub => sub.categoria_padre_id === cat.id);
      if (subcats.length > 0) {
        subcats.forEach(sub => {
          console.log(`    ${sub.orden}. ${sub.nombre} (ID: ${sub.id})`);
        });
      }
    });
    
    console.log('\n🎉 ¡Categorías jerárquicas creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la creación:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createHierarchicalCategories()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { createHierarchicalCategories };
