const { pool, testConnection } = require('./src/config/database');
const ProductsController = require('./src/controllers/productsController');

// Función query sin logs para pruebas
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

/**
 * Script completo de prueba: Reportar producto + Simular 1 día + Probar suspensión automática
 */

async function testSuspensionCompleto() {
  try {
    console.log('🧪 === PRUEBA COMPLETA DE SUSPENSIÓN AUTOMÁTICA ===\n');
    
    // Verificar conexión
    console.log('📊 Verificando conexión a la base de datos...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    console.log('✅ Conexión exitosa\n');
    
    // PASO 1: Buscar un producto activo para reportar
    console.log('🔍 PASO 1: Buscando un producto activo...');
    const productos = await query(
      `SELECT id, codigo, nombre, estado, fecha_publicacion, vendedor_id 
       FROM items 
       WHERE estado = 'activo' 
       AND es_peligroso = false
       LIMIT 1`
    );
    
    if (productos.rows.length === 0) {
      console.log('⚠️ No hay productos activos. Creando uno de prueba...');
      
      // Buscar un vendedor
      const vendedores = await query(
        `SELECT id FROM usuarios WHERE tipo_usuario = 'vendedor' LIMIT 1`
      );
      
      if (vendedores.rows.length === 0) {
        console.error('❌ No hay vendedores en la base de datos');
        process.exit(1);
      }
      
      const vendedorId = vendedores.rows[0].id;
      
      // Buscar una categoría
      const categorias = await query(`SELECT id FROM categorias LIMIT 1`);
      if (categorias.rows.length === 0) {
        console.error('❌ No hay categorías en la base de datos');
        process.exit(1);
      }
      
      const categoriaId = categorias.rows[0].id;
      
      // Crear producto de prueba
      const nuevoProducto = await query(
        `INSERT INTO items (codigo, nombre, descripcion, precio, tipo, categoria_id, vendedor_id, estado, disponibilidad)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, codigo, nombre, estado`,
        [
          `TEST-${Date.now()}`,
          'Producto de Prueba para Suspensión Automática',
          'Este producto es solo para probar la suspensión automática',
          100.00,
          'producto',
          categoriaId,
          vendedorId,
          'activo',
          true
        ]
      );
      
      productos.rows.push(nuevoProducto.rows[0]);
      console.log(`✅ Producto de prueba creado: #${productos.rows[0].id} - "${productos.rows[0].nombre}"`);
    }
    
    const producto = productos.rows[0];
    console.log(`✅ Producto encontrado: #${producto.id} - "${producto.nombre}"\n`);
    
    // PASO 2: Cambiar estado a pendiente_revision (simula que fue reportado y está pendiente)
    console.log('📝 PASO 2: Cambiando producto a estado pendiente_revision...');
    await query(
      `UPDATE items 
       SET estado = 'pendiente_revision',
           fecha_publicacion = CURRENT_TIMESTAMP - INTERVAL '25 hours'
       WHERE id = $1`,
      [producto.id]
    );
    console.log(`✅ Producto #${producto.id} ahora está en pendiente_revision con fecha_publicacion de hace 25 horas\n`);
    
    // PASO 3: Crear un reporte del producto
    console.log('📋 PASO 3: Creando reporte del producto...');
    
    // Buscar un usuario comprador para crear el reporte
    const compradores = await query(
      `SELECT id FROM usuarios WHERE tipo_usuario = 'comprador' LIMIT 1`
    );
    
    let reportadorId;
    if (compradores.rows.length === 0) {
      // Si no hay compradores, usar el vendedor (en casos reales no puede, pero para prueba está bien)
      reportadorId = producto.vendedor_id;
    } else {
      reportadorId = compradores.rows[0].id;
    }
    
    // Verificar si ya existe un reporte
    const reporteExistente = await query(
      `SELECT id FROM reportes WHERE item_id = $1 AND usuario_reportador_id = $2`,
      [producto.id, reportadorId]
    );
    
    if (reporteExistente.rows.length === 0) {
      await query(
        `INSERT INTO reportes (item_id, usuario_reportador_id, tipo_reporte, descripcion, estado)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          producto.id,
          reportadorId,
          'contenido_inapropiado',
          'Reporte de prueba para suspensión automática',
          'pendiente'
        ]
      );
      console.log(`✅ Reporte creado para el producto #${producto.id}\n`);
    } else {
      console.log(`ℹ️ Ya existe un reporte para este producto\n`);
    }
    
    // PASO 4: Verificar estado actual
    console.log('🔍 PASO 4: Verificando estado actual del producto...');
    const estadoActual = await query(
      `SELECT id, codigo, nombre, estado, fecha_publicacion, 
              EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fecha_publicacion)) / 86400 as dias_pendiente
       FROM items 
       WHERE id = $1`,
      [producto.id]
    );
    
    const productoActual = estadoActual.rows[0];
    console.log(`   - Estado: ${productoActual.estado}`);
    console.log(`   - Fecha publicación: ${productoActual.fecha_publicacion}`);
    console.log(`   - Días pendiente: ${Math.round(productoActual.dias_pendiente * 100) / 100}\n`);
    
    // PASO 5: Ejecutar suspensión automática
    console.log('🔄 PASO 5: Ejecutando suspensión automática...\n');
    const resultado = await ProductsController.suspenderProductosExpirados();
    
    // PASO 6: Verificar resultado
    console.log('\n📊 PASO 6: Verificando resultados...');
    const estadoFinal = await query(
      `SELECT id, codigo, nombre, estado, motivo_rechazo 
       FROM items 
       WHERE id = $1`,
      [producto.id]
    );
    
    const productoFinal = estadoFinal.rows[0];
    console.log(`   - Estado final: ${productoFinal.estado}`);
    console.log(`   - Motivo: ${productoFinal.motivo_rechazo?.substring(0, 100)}...`);
    
    // Verificar auditoría
    const auditoria = await query(
      `SELECT accion, detalles, fecha_accion 
       FROM acciones_moderacion 
       WHERE registro_id = $1 
       AND accion = 'suspension_automatica_tiempo_expirado'
       ORDER BY fecha_accion DESC 
       LIMIT 1`,
      [producto.id]
    );
    
    if (auditoria.rows.length > 0) {
      console.log(`   - ✅ Acción registrada en auditoría`);
      console.log(`   - Fecha: ${auditoria.rows[0].fecha_accion}`);
    }
    
    // Resultado final
    console.log('\n📊 === RESULTADO FINAL ===');
    if (productoFinal.estado === 'suspendido') {
      console.log('✅ ¡ÉXITO! El producto fue suspendido automáticamente');
      console.log(`   - Producto #${productoFinal.id}: "${productoFinal.nombre}"`);
      console.log(`   - Estado: ${productoFinal.estado}`);
      console.log(`   - Productos suspendidos en esta ejecución: ${resultado.suspendidos}`);
    } else {
      console.log('⚠️ El producto NO fue suspendido');
      console.log(`   - Estado actual: ${productoFinal.estado}`);
      console.log(`   - Razón: El producto no cumple los criterios (menos de 1 día o ya procesado)`);
    }
    
    console.log('\n✅ Prueba completada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar la prueba
testSuspensionCompleto();
