/**
 * Helpers para pruebas de productos/servicios
 */

const { query } = require('../../src/config/database');

/**
 * Crea un producto de prueba en la base de datos
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto creado
 */
async function createTestProduct(productData = {}) {
  try {
    // Generar código único usando timestamp y número aleatorio
    const uniqueCode = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultData = {
      codigo: uniqueCode,
      nombre: 'Producto de Prueba',
      descripcion: 'Descripción del producto de prueba',
      precio: 100.00,
      tipo: 'producto',
      estado: 'pendiente_revision',
      disponibilidad: false,
      es_peligroso: false,
      categoria_id: null, // Debe ser proporcionado
      vendedor_id: null, // Debe ser proporcionado
      ubicacion_id: null,
      ubicacion_provincia: 'San José',
      ubicacion_canton: 'San José',
      ubicacion_distrito: null,
      ubicacion_direccion: 'Dirección de prueba por defecto',
      coordenadas: null
    };

    const product = { ...defaultData, ...productData };

    // Validar que se proporcionaron datos requeridos
    if (!product.categoria_id) {
      throw new Error('categoria_id es requerido');
    }
    if (!product.vendedor_id) {
      throw new Error('vendedor_id es requerido');
    }

    const result = await query(`
      INSERT INTO items (
        codigo, nombre, descripcion, precio, tipo, estado, disponibilidad,
        es_peligroso, categoria_id, vendedor_id, ubicacion_id,
        ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion,
        coordenadas, fecha_publicacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      product.codigo,
      product.nombre,
      product.descripcion,
      product.precio,
      product.tipo,
      product.estado,
      product.disponibilidad,
      product.es_peligroso,
      product.categoria_id,
      product.vendedor_id,
      product.ubicacion_id,
      product.ubicacion_provincia,
      product.ubicacion_canton,
      product.ubicacion_distrito,
      product.ubicacion_direccion,
      product.coordenadas
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando producto de prueba:', error.message);
    throw error;
  }
}

/**
 * Crea un servicio de prueba
 * @param {Object} serviceData - Datos del servicio
 * @returns {Object} Servicio creado (con item_id)
 */
async function createTestService(serviceData = {}) {
  try {
    const defaultServiceData = {
      horario_atencion: '09:00 - 18:00',
      dias_disponibles: 'Lunes a Viernes',
      duracion_estimada: '1 hora'
    };

    const service = { ...defaultServiceData, ...serviceData };

    // Crear el item primero
    const item = await createTestProduct({
      tipo: 'servicio',
      ...serviceData
    });

    // Crear el registro de servicio
    if (service.horario_atencion || service.dias_disponibles || service.duracion_estimada) {
      await query(`
        INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada)
        VALUES ($1, $2, $3, $4)
      `, [
        item.id,
        service.horario_atencion,
        service.dias_disponibles,
        service.duracion_estimada
      ]);
    }

    return { ...item, servicio: service };
  } catch (error) {
    console.error('❌ Error creando servicio de prueba:', error.message);
    throw error;
  }
}

/**
 * Crea un producto peligroso de prueba
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto peligroso creado
 */
async function createDangerousProduct(productData = {}) {
  return createTestProduct({
    nombre: 'Producto Peligroso de Prueba',
    descripcion: 'Este producto contiene contenido peligroso',
    estado: 'peligroso',
    es_peligroso: true,
    motivo_rechazo: 'Contenido peligroso detectado automáticamente',
    fecha_deteccion_peligroso: new Date(),
    ...productData
  });
}

/**
 * Crea un producto activo de prueba
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto activo creado
 */
async function createActiveProduct(productData = {}) {
  return createTestProduct({
    estado: 'activo',
    disponibilidad: true,
    es_peligroso: false,
    ...productData
  });
}

/**
 * Crea un producto rechazado de prueba
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto rechazado creado
 */
async function createRejectedProduct(productData = {}) {
  return createTestProduct({
    estado: 'rechazado',
    disponibilidad: false,
    motivo_rechazo: 'Producto rechazado por moderador',
    ...productData
  });
}

/**
 * Crea un producto suspendido de prueba
 * @param {Object} productData - Datos del producto
 * @returns {Object} Producto suspendido creado
 */
async function createSuspendedProduct(productData = {}) {
  return createTestProduct({
    estado: 'suspendido',
    disponibilidad: false,
    motivo_rechazo: 'Producto suspendido temporalmente',
    ...productData
  });
}

/**
 * Crea una categoría de prueba
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Object} Categoría creada
 */
async function createTestCategory(categoryData = {}) {
  try {
    const defaultData = {
      nombre: `Categoría Test ${Date.now()}`,
      descripcion: 'Descripción de categoría de prueba',
      activa: true,
      categoria_padre_id: null
    };

    const category = { ...defaultData, ...categoryData };

    const result = await query(`
      INSERT INTO categorias (nombre, descripcion, activa, categoria_padre_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      category.nombre,
      category.descripcion,
      category.activa,
      category.categoria_padre_id
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando categoría de prueba:', error.message);
    throw error;
  }
}

/**
 * Obtiene una categoría existente o crea una de prueba
 * @returns {Object} Categoría
 */
async function getOrCreateTestCategory() {
  try {
    // Intentar obtener una categoría existente
    const result = await query(`
      SELECT * FROM categorias WHERE activa = true LIMIT 1
    `);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Si no hay categorías, crear una
    return await createTestCategory();
  } catch (error) {
    console.error('❌ Error obteniendo/creando categoría:', error.message);
    throw error;
  }
}

/**
 * Obtiene una ubicación existente o crea una de prueba
 * @returns {Object} Ubicación
 */
async function getOrCreateTestLocation() {
  try {
    // Primero intentar obtener una ubicación existente
    let result = await query(`
      SELECT * FROM ubicaciones WHERE provincia = $1 AND canton = $2 LIMIT 1
    `, ['San José', 'San José']);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Si no existe, crear una nueva
    // Intentar insertar, si falla por duplicado, obtener la existente
    try {
      result = await query(`
        INSERT INTO ubicaciones (provincia, canton, nombre)
        VALUES ($1, $2, $3)
        RETURNING *
      `, ['San José', 'San José', 'San José, San José']);
      
      return result.rows[0];
    } catch (insertError) {
      // Si hay error de constraint único u otro error, intentar obtener la existente
      if (insertError.code === '23505' || insertError.code === '23503') {
        result = await query(`
          SELECT * FROM ubicaciones WHERE provincia = $1 AND canton = $2 LIMIT 1
        `, ['San José', 'San José']);
        
        if (result.rows.length > 0) {
          return result.rows[0];
        }
      }
      // Si no se pudo obtener, lanzar el error original
      throw insertError;
    }
  } catch (error) {
    console.error('❌ Error obteniendo/creando ubicación:', error.message);
    throw error;
  }
}

/**
 * Agrega una imagen a un producto
 * @param {number} itemId - ID del producto
 * @param {string} imageUrl - URL de la imagen
 * @param {number} order - Orden de la imagen
 * @param {boolean} isPrincipal - Si es la imagen principal
 * @returns {Object} Imagen creada
 */
async function addImageToProduct(itemId, imageUrl, order = 1, isPrincipal = false) {
  try {
    const result = await query(`
      INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [itemId, imageUrl, order, isPrincipal]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error agregando imagen a producto:', error.message);
    throw error;
  }
}

/**
 * Crea una apelación de prueba
 * @param {Object} appealData - Datos de la apelación
 * @returns {Object} Apelación creada
 */
async function createTestAppeal(appealData = {}) {
  try {
    const defaultData = {
      motivo_apelacion: 'Este es un motivo de apelación de prueba con al menos 20 caracteres',
      informacion_adicional: 'Información adicional de la apelación',
      estado: 'en_apelacion'
    };

    const appeal = { ...defaultData, ...appealData };

    if (!appeal.item_id) {
      throw new Error('item_id es requerido');
    }
    if (!appeal.usuario_apelante_id) {
      throw new Error('usuario_apelante_id es requerido');
    }

    const result = await query(`
      INSERT INTO apelaciones (
        item_id, usuario_apelante_id, motivo_apelacion, informacion_adicional, estado, fecha_apelacion
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      appeal.item_id,
      appeal.usuario_apelante_id,
      appeal.motivo_apelacion,
      appeal.informacion_adicional,
      appeal.estado
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando apelación de prueba:', error.message);
    throw error;
  }
}

/**
 * Crea un reporte de prueba
 * @param {Object} reportData - Datos del reporte
 * @returns {Object} Reporte creado
 */
async function createTestReport(reportData = {}) {
  try {
    const defaultData = {
      tipo_reporte: 'contenido_inapropiado',
      descripcion: 'Este es un reporte de prueba con al menos 20 caracteres',
      comentario_opcional: 'Comentario opcional del reporte',
      estado: 'pendiente'
    };

    const report = { ...defaultData, ...reportData };

    if (!report.item_id) {
      throw new Error('item_id es requerido');
    }
    if (!report.usuario_reportador_id) {
      throw new Error('usuario_reportador_id es requerido');
    }

    const result = await query(`
      INSERT INTO reportes (
        item_id, usuario_reportador_id, tipo_reporte, descripcion, comentario_opcional, estado, fecha_reporte
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      report.item_id,
      report.usuario_reportador_id,
      report.tipo_reporte,
      report.descripcion,
      report.comentario_opcional,
      report.estado
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando reporte de prueba:', error.message);
    throw error;
  }
}

/**
 * Guarda un producto como favorito
 * @param {number} userId - ID del usuario
 * @param {number} itemId - ID del producto
 * @returns {Object} Producto guardado
 */
async function saveProductAsFavorite(userId, itemId) {
  try {
    const result = await query(`
      INSERT INTO productos_guardados (usuario_id, item_id, fecha_guardado)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `, [userId, itemId]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error guardando producto como favorito:', error.message);
    throw error;
  }
}

/**
 * Obtiene un producto por ID
 * @param {number} productId - ID del producto
 * @returns {Object} Producto
 */
async function getProductById(productId) {
  try {
    const result = await query('SELECT * FROM items WHERE id = $1', [productId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error obteniendo producto:', error.message);
    throw error;
  }
}

/**
 * Obtiene el estado de un producto
 * @param {number} productId - ID del producto
 * @returns {string} Estado del producto
 */
async function getProductStatus(productId) {
  try {
    const product = await getProductById(productId);
    return product ? product.estado : null;
  } catch (error) {
    console.error('❌ Error obteniendo estado del producto:', error.message);
    throw error;
  }
}

/**
 * Verifica si un producto es peligroso
 * @param {number} productId - ID del producto
 * @returns {boolean} Si es peligroso
 */
async function isProductDangerous(productId) {
  try {
    const product = await getProductById(productId);
    return product ? product.es_peligroso : false;
  } catch (error) {
    console.error('❌ Error verificando si producto es peligroso:', error.message);
    throw error;
  }
}

/**
 * Cuenta productos peligrosos de un vendedor
 * @param {number} vendedorId - ID del vendedor
 * @returns {number} Cantidad de productos peligrosos
 */
async function countDangerousProducts(vendedorId) {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM items
      WHERE vendedor_id = $1 AND es_peligroso = true
    `, [vendedorId]);

    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('❌ Error contando productos peligrosos:', error.message);
    throw error;
  }
}

/**
 * Limpia todas las tablas relacionadas con productos
 */
async function cleanProductsTables() {
  try {
    // Limpiar en orden de dependencias
    await query('DELETE FROM item_imagenes WHERE id > 0;');
    await query('DELETE FROM servicios WHERE id > 0;');
    await query('DELETE FROM productos_guardados WHERE id > 0;');
    await query('DELETE FROM apelaciones WHERE id > 0;');
    await query('DELETE FROM reportes WHERE id > 0;');
    await query('DELETE FROM items WHERE id > 0;');

    // Reiniciar secuencias
    await query('ALTER SEQUENCE items_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE item_imagenes_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE servicios_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE productos_guardados_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE apelaciones_id_seq RESTART WITH 1;');
    await query('ALTER SEQUENCE reportes_id_seq RESTART WITH 1;');

    console.log('✅ Tablas de productos limpiadas');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando tablas de productos:', error.message);
    throw error;
  }
}

module.exports = {
  createTestProduct,
  createTestService,
  createDangerousProduct,
  createActiveProduct,
  createRejectedProduct,
  createSuspendedProduct,
  createTestCategory,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  addImageToProduct,
  createTestAppeal,
  createTestReport,
  saveProductAsFavorite,
  getProductById,
  getProductStatus,
  isProductDangerous,
  countDangerousProducts,
  cleanProductsTables
};


