const ProductsController = require('./src/controllers/productsController');
const { testConnection } = require('./src/config/database');

/**
 * Script de prueba para suspensión automática de productos
 * Ejecuta manualmente la función de suspensión automática
 */

async function testAutoSuspend() {
  try {
    console.log('🧪 === PRUEBA DE SUSPENSIÓN AUTOMÁTICA DE PRODUCTOS ===\n');
    
    // Verificar conexión a la base de datos
    console.log('📊 Verificando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    console.log('✅ Conexión a la base de datos exitosa\n');
    
    // Ejecutar la función de suspensión automática
    console.log('🔄 Ejecutando suspensión automática...\n');
    const resultado = await ProductsController.suspenderProductosExpirados();
    
    // Mostrar resultados
    console.log('\n📊 === RESULTADOS DE LA PRUEBA ===');
    console.log(`✅ Productos suspendidos: ${resultado.suspendidos}`);
    
    if (resultado.productos && resultado.productos.length > 0) {
      console.log('\n📋 Productos suspendidos:');
      resultado.productos.forEach((producto, index) => {
        console.log(`   ${index + 1}. #${producto.id} - "${producto.nombre}" (${producto.dias_pendiente} días pendiente)`);
      });
    }
    
    if (resultado.error) {
      console.error('\n❌ Error:', resultado.error);
    }
    
    console.log('\n✅ Prueba completada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testAutoSuspend();
