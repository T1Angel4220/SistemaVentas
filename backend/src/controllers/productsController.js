const { query } = require('../config/database');
const { config } = require('../config/config');
const { detectarContenidoInadecuado, obtenerMensajeRechazo } = require('../services/contentDetection');
const { filtrarPorProximidad } = require('../utils/geoLocation');
const { sendAccountBlockedByDangerousProductsEmail } = require('../services/email');

// Función helper para construir URLs completas de imágenes
// NOTA: SIEMPRE usar 'localhost' para que el navegador pueda acceder (nunca 0.0.0.0)
const buildImageUrl = (filename) => {
  // SIEMPRE usar localhost para URLs accesibles desde el navegador
  const port = config.server.port || 3001;
  return `http://localhost:${port}/uploads/${filename}`;
};

// Función helper para normalizar URLs de imágenes (reemplazar 0.0.0.0 por localhost)
// Esta función garantiza que todas las URLs usen localhost en lugar de 0.0.0.0
const normalizeImageUrl = (url) => {
  if (!url) return url;
  
  // Si es una URL absoluta, reemplazar cualquier 0.0.0.0 con localhost
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Reemplazar 0.0.0.0 por localhost en cualquier parte de la URL
    let normalized = url.replace(/http:\/\/0\.0\.0\.0:(\d+)/gi, 'http://localhost:$1');
    normalized = normalized.replace(/https:\/\/0\.0\.0\.0:(\d+)/gi, 'https://localhost:$1');
    
    // También reemplazar si viene con 127.0.0.1 o cualquier otra variante problemática
    normalized = normalized.replace(/http:\/\/127\.0\.0\.1:(\d+)/gi, 'http://localhost:$1');
    
    return normalized;
  }
  
  // Si es una URL relativa que empieza con /uploads, convertirla a absoluta con localhost
  if (url.startsWith('/uploads')) {
    // Extraer el nombre del archivo
    const filename = url.replace('/uploads/', '').replace('/uploads/products/', '');
    return buildImageUrl(filename);
  }
  
  return url;
};

// Controlador de productos y servicios
class ProductsController {
  
  // Crear nuevo producto/servicio
  static async createProduct(req, res) {
    try {
      console.log('Datos recibidos:', {
        body: req.body,
        files: req.files ? req.files.map(f => ({ filename: f.filename, originalname: f.originalname })) : 'No files'
      });

      const { 
        codigo, 
        nombre, 
        descripcion, 
        precio, 
        ubicacion_id,
        ubicacion_provincia,
        ubicacion_canton,
        ubicacion_distrito,
        ubicacion_direccion,
        coordenadas,
        tipo, 
        categoria_id,
        horario_atencion, 
        dias_disponibles, 
        duracion_estimada 
      } = req.body;

      // Obtener el ID del vendedor desde el token
      const vendedor_id = req.user.id;

      // Validar que el usuario sea vendedor
      if (req.user.tipo_usuario !== 'vendedor' && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los vendedores pueden crear productos'
        });
      }

      // Validar datos requeridos
      if (!codigo || !nombre || !descripcion || !precio || !tipo || !categoria_id) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: codigo, nombre, descripcion, precio, tipo, categoria_id'
        });
      }

      // Detectar contenido inadecuado
      const deteccion = detectarContenidoInadecuado(nombre, descripcion);
      console.log('Detección de contenido:', deteccion);
      
      // Determinar estado inicial basado en detección
      let estadoInicial = 'pendiente_revision';
      let esPeligroso = false;
      let motivoRechazo = null;

      if (deteccion.esInadecuado) {
        if (deteccion.nivelRiesgo === 'alto') {
          estadoInicial = 'peligroso';
          esPeligroso = true;
          motivoRechazo = obtenerMensajeRechazo(deteccion.categoria, deteccion.palabrasDetectadas);
        } else if (deteccion.nivelRiesgo === 'medio') {
          estadoInicial = 'pendiente_revision';
          motivoRechazo = obtenerMensajeRechazo(deteccion.categoria, deteccion.palabrasDetectadas);
        } else {
          estadoInicial = 'pendiente_revision';
        }
      }

      // Verificar que el código sea único
      const codigoExistente = await query(
        'SELECT id FROM items WHERE codigo = $1',
        [codigo]
      );

      if (codigoExistente.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El código del producto ya existe'
        });
      }

      // Manejar ubicación con campos separados
      let ubicacionIdFinal = ubicacion_id;
      
      // Si se proporcionan los campos separados de ubicación, buscar ubicación existente
      if (ubicacion_provincia && ubicacion_canton) {
        try {
          // Buscar la ubicación base (solo provincia + canton)
          // El distrito y dirección se guardan en la tabla items, NO en ubicaciones
          const ubicacionExistente = await query(
            'SELECT id FROM ubicaciones WHERE provincia = $1 AND canton = $2 LIMIT 1',
            [ubicacion_provincia, ubicacion_canton]
          );
          
          if (ubicacionExistente.rows.length > 0) {
            ubicacionIdFinal = ubicacionExistente.rows[0].id;
          } else {
            return res.status(400).json({
              success: false,
              message: 'Ubicación no válida. Por favor selecciona una provincia y cantón válidos.'
            });
          }
        } catch (error) {
          console.error('Error al manejar ubicación:', error);
          return res.status(500).json({
            success: false,
            message: 'Error al procesar la ubicación'
          });
        }
      }

      // Crear el producto
      // La disponibilidad debe ser false inicialmente (sin stock hasta que el vendedor lo configure)
      // Solo se puede cambiar a true cuando el producto esté aprobado (estado: 'activo')
      const disponibilidad = false;
      const nuevoProducto = await query(
        `INSERT INTO items (
          codigo, nombre, descripcion, precio, ubicacion_id, 
          ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion, coordenadas,
          tipo, categoria_id, vendedor_id, estado, disponibilidad, es_peligroso, motivo_rechazo, fecha_deteccion_peligroso
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [codigo, nombre, descripcion, precio, ubicacionIdFinal, 
         ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion, coordenadas,
         tipo, categoria_id, vendedor_id, estadoInicial, disponibilidad, esPeligroso, motivoRechazo, 
         esPeligroso ? new Date() : null]
      );

      const producto = nuevoProducto.rows[0];

      // Si es un servicio, crear registro adicional
      if (tipo === 'servicio' && horario_atencion) {
        await query(
          `INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada)
           VALUES ($1, $2, $3, $4)`,
          [producto.id, horario_atencion, dias_disponibles, duracion_estimada]
        );
      }

      // Manejar imágenes si se enviaron
      if (req.files && req.files.length > 0) {
        console.log('📸 Procesando imágenes:', req.files.length);
        
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const esPrincipal = i === 0; // La primera imagen es la principal
          // Guardar solo la ruta relativa en la base de datos (mejor práctica)
          // Asegurar que siempre sea relativa, eliminando cualquier URL absoluta
          let urlImagen = `/uploads/${file.filename}`;
          
          // Validación adicional: si por alguna razón llegara una URL absoluta, convertirla a relativa
          if (urlImagen.startsWith('http://') || urlImagen.startsWith('https://')) {
            // Extraer solo la ruta relativa
            const urlObj = new URL(urlImagen);
            urlImagen = urlObj.pathname;
          }
          
          // Asegurar que empiece con /uploads
          if (!urlImagen.startsWith('/uploads')) {
            urlImagen = `/uploads/${file.filename}`;
          }
          
          await query(
            `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
             VALUES ($1, $2, $3, $4)`,
            [producto.id, urlImagen, i + 1, esPrincipal]
          );
        }
        
        console.log('✅ Imágenes guardadas exitosamente');
      }

      // Si se creó un producto peligroso, verificar si se debe bloquear la cuenta del vendedor
      if (esPeligroso && vendedor_id) {
        const bloqueoResult = await ProductsController.verificarYBloquearCuentaPorProductosPeligrosos(vendedor_id);
        if (bloqueoResult.bloqueado) {
          console.log(`⚠️ Cuenta del vendedor ${vendedor_id} bloqueada automáticamente por tener ${bloqueoResult.cantidadPeligrosos} productos peligrosos`);
        }
      }

      // Determinar mensaje de respuesta basado en el estado
      let mensajeRespuesta = 'Producto creado exitosamente';
      let informacionAdicional = null;

      if (deteccion.esInadecuado) {
        if (estadoInicial === 'peligroso') {
          mensajeRespuesta = 'Producto creado pero marcado como peligroso automáticamente';
          informacionAdicional = {
            estado: 'peligroso',
            motivo: motivoRechazo,
            requiere_revision: true,
            no_eliminable: true
          };
        } else {
          mensajeRespuesta = 'Producto creado y enviado para revisión';
          informacionAdicional = {
            estado: 'pendiente_revision',
            requiere_revision: true,
            motivo: motivoRechazo
          };
        }
      } else {
        informacionAdicional = {
          estado: 'pendiente_revision',
          requiere_revision: true
        };
      }

      res.status(201).json({
        success: true,
        message: mensajeRespuesta,
        data: producto,
        informacion: informacionAdicional
      });

    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener todos los productos con filtros
  static async getProducts(req, res) {
    try {
      const { 
        categoria_id, 
        tipo, 
        precio_min, 
        precio_max, 
        ubicacion_id,
        provincia,
        canton,
        distrito,
        direccion,
        estado = 'activo',
        disponibilidad = true,
        page = 1,
        limit = 10,
        search,
        // Filtros de proximidad
        user_lat,    // Latitud del usuario
        user_lng,    // Longitud del usuario
        radio_km     // Radio de búsqueda en kilómetros (default: 50km)
      } = req.query;

      // Ocultar productos peligrosos para todos los usuarios públicos (compradores)
      // Los productos peligrosos solo son visibles para moderadores en su panel de moderación
      let whereConditions = ['i.estado = $1', 'i.disponibilidad = $2', 'i.es_peligroso = false'];
      let queryParams = [estado, disponibilidad];
      let paramCount = 2;

      // Construir condiciones dinámicas
      if (categoria_id) {
        paramCount++;
        whereConditions.push(`i.categoria_id = $${paramCount}`);
        queryParams.push(categoria_id);
      }

      if (tipo) {
        paramCount++;
        whereConditions.push(`i.tipo = $${paramCount}`);
        queryParams.push(tipo);
      }

      if (precio_min) {
        paramCount++;
        whereConditions.push(`i.precio >= $${paramCount}`);
        queryParams.push(precio_min);
      }

      if (precio_max) {
        paramCount++;
        whereConditions.push(`i.precio <= $${paramCount}`);
        queryParams.push(precio_max);
      }

      if (ubicacion_id) {
        paramCount++;
        whereConditions.push(`i.ubicacion_id = $${paramCount}`);
        queryParams.push(ubicacion_id);
      }

      // Filtrar por provincia (usar campo directo de items)
      if (provincia) {
        paramCount++;
        whereConditions.push(`i.ubicacion_provincia = $${paramCount}`);
        queryParams.push(provincia);
      }

      // Filtrar por cantón (usar campo directo de items)
      if (canton) {
        paramCount++;
        whereConditions.push(`i.ubicacion_canton = $${paramCount}`);
        queryParams.push(canton);
      }

      // Filtrar por distrito (usar campo directo de items)
      if (distrito) {
        paramCount++;
        whereConditions.push(`i.ubicacion_distrito ILIKE $${paramCount}`);
        queryParams.push(`%${distrito}%`);
      }

      // Filtrar por dirección (usar campo directo de items)
      if (direccion) {
        paramCount++;
        whereConditions.push(`i.ubicacion_direccion ILIKE $${paramCount}`);
        queryParams.push(`%${direccion}%`);
      }

      if (search) {
        paramCount++;
        whereConditions.push(`(i.nombre ILIKE $${paramCount} OR i.descripcion ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // Calcular offset para paginación
      const offset = (page - 1) * limit;
      paramCount++;
      queryParams.push(limit);
      paramCount++;
      queryParams.push(offset);

      // Query principal con JOINs
      const productos = await query(
        `SELECT 
          i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso,
          i.ubicacion_provincia, i.ubicacion_canton, i.ubicacion_distrito, i.ubicacion_direccion,
          i.coordenadas,
          c.nombre as categoria_nombre,
          u.nombre || ' ' || u.apellido as vendedor_nombre,
          ub.nombre as ubicacion_nombre,
          COUNT(ii.id) as total_imagenes,
          (SELECT ii2.url_imagen FROM item_imagenes ii2 WHERE ii2.item_id = i.id ORDER BY ii2.orden LIMIT 1) as primera_imagen
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        WHERE ${whereClause}
        GROUP BY i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
                 i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso,
                 i.ubicacion_provincia, i.ubicacion_canton, i.ubicacion_distrito, i.ubicacion_direccion,
                 i.coordenadas,
                 c.nombre, u.nombre, u.apellido, ub.nombre
        ORDER BY i.fecha_publicacion DESC
        LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
        queryParams
      );

      // Contar total para paginación
      const totalCount = await query(
        `SELECT COUNT(*) as total
         FROM items i
         WHERE ${whereClause}`,
        queryParams.slice(0, -2) // Remover limit y offset
      );

      const total = parseInt(totalCount.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Aplicar filtro de proximidad si se proporcionan coordenadas del usuario
      let productosFinales = productos.rows;
      if (user_lat && user_lng) {
        const lat = parseFloat(user_lat);
        const lng = parseFloat(user_lng);
        const radio = parseFloat(radio_km) || 50; // Default 50km
        
        console.log('\n🌍 === FILTRO DE PROXIMIDAD ===');
        console.log('Usuario ubicado en:', { lat, lng });
        console.log('Radio de búsqueda:', radio, 'km');
        console.log('Total de productos antes del filtro:', productos.rows.length);
        
        // Mostrar coordenadas de cada producto
        productos.rows.forEach((prod, index) => {
          console.log(`\nProducto ${index + 1}: ${prod.nombre}`);
          console.log('  → Coordenadas en DB:', prod.coordenadas);
          console.log('  → Tipo:', typeof prod.coordenadas);
        });
        
        if (!isNaN(lat) && !isNaN(lng) && !isNaN(radio)) {
          productosFinales = filtrarPorProximidad(productos.rows, lat, lng, radio);
          console.log(`\n✅ Resultado: ${productosFinales.length} productos dentro de ${radio}km`);
          
          // Mostrar los productos filtrados con sus distancias
          productosFinales.forEach((prod, index) => {
            console.log(`  ${index + 1}. ${prod.nombre} - ${prod.distancia} km`);
          });
        }
        console.log('=================================\n');
      }

      // Si se aplicó filtro de proximidad, recalcular la paginación
      let totalFinal = total;
      let totalPagesFinal = totalPages;
      
      if (user_lat && user_lng) {
        totalFinal = productosFinales.length;
        totalPagesFinal = Math.ceil(totalFinal / limit);
      }

      // Normalizar URLs de imágenes en todos los productos (reemplazar 0.0.0.0 por localhost)
      const productosNormalizados = productosFinales.map(producto => ({
        ...producto,
        primera_imagen: producto.primera_imagen ? normalizeImageUrl(
          producto.primera_imagen.startsWith('http') 
            ? producto.primera_imagen 
            : buildImageUrl(producto.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
        ) : null
      }));

      res.json({
        success: true,
        data: productosNormalizados,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPagesFinal,
          total_items: totalFinal,
          items_per_page: parseInt(limit),
          has_next: page < totalPagesFinal,
          has_prev: page > 1
        },
        // Información adicional si se usó filtro de proximidad
        ...(user_lat && user_lng && {
          proximity_filter: {
            enabled: true,
            user_location: { lat: parseFloat(user_lat), lng: parseFloat(user_lng) },
            radius_km: parseFloat(radio_km) || 50,
            results_count: productosFinales.length
          }
        })
      });

    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener producto específico por ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      const producto = await query(
        `SELECT 
          i.*,
          c.nombre as categoria_nombre,
          c.descripcion as categoria_descripcion,
          u.nombre as vendedor_nombre,
          u.apellido as vendedor_apellido,
          u.correo as vendedor_email,
          u.correo as vendedor_correo,
          u.telefono as vendedor_telefono,
          u.direccion as vendedor_direccion,
          ub.nombre as ubicacion_nombre,
          i.ubicacion_provincia,
          i.ubicacion_canton,
          i.ubicacion_distrito,
          i.ubicacion_direccion
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        WHERE i.id = $1`,
        [id]
      );

      if (producto.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Obtener imágenes del producto
      const imagenes = await query(
        'SELECT * FROM item_imagenes WHERE item_id = $1 ORDER BY orden',
        [id]
      );

      // Convertir URLs relativas a absolutas y normalizar (reemplazar 0.0.0.0 por localhost)
      const imagenesConUrlsCompletas = imagenes.rows.map(imagen => {
        let url = imagen.url_imagen.startsWith('http') 
          ? imagen.url_imagen 
          : buildImageUrl(imagen.url_imagen.replace('/uploads/', '').replace('/uploads/products/', ''));
        return {
          ...imagen,
          url_imagen: normalizeImageUrl(url)
        };
      });

      // Si es un servicio, obtener información adicional
      let servicioInfo = null;
      if (producto.rows[0].tipo === 'servicio') {
        const servicio = await query(
          'SELECT * FROM servicios WHERE item_id = $1',
          [id]
        );
        servicioInfo = servicio.rows[0];
      }

      res.json({
        success: true,
        data: {
          ...producto.rows[0],
          imagenes: imagenesConUrlsCompletas,
          servicio: servicioInfo
        }
      });

    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener producto para vista de comprador (con información del vendedor)
  static async getProductForView(req, res) {
    try {
      const { id } = req.params;
      const user = req.user; // Puede ser null si no está autenticado

      // Si es administrador o moderador, permitir cualquier estado
      // Si no, solo permitir estados específicos
      const isAdminOrModerator = user && (user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador');
      
      let whereClause;
      if (isAdminOrModerator) {
        // Administradores y moderadores pueden ver productos en cualquier estado
        whereClause = 'WHERE i.id = $1';
      } else {
        // Otros usuarios solo pueden ver productos activos, pendientes o inactivos
        whereClause = `WHERE i.id = $1 AND i.estado IN ('activo', 'pendiente_revision', 'inactivo')`;
      }

      const producto = await query(
        `SELECT 
          i.*,
          c.nombre as categoria_nombre,
          c.descripcion as categoria_descripcion,
          u.nombre as vendedor_nombre,
          u.apellido as vendedor_apellido,
          u.correo as vendedor_correo,
          u.telefono as vendedor_telefono,
          u.direccion as vendedor_direccion,
          ub.nombre as ubicacion_nombre,
          i.ubicacion_provincia,
          i.ubicacion_canton,
          i.ubicacion_distrito,
          i.ubicacion_direccion
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        ${whereClause}`,
        [id]
      );

      if (producto.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado o no está disponible'
        });
      }

      // Obtener imágenes del producto
      const imagenes = await query(
        'SELECT * FROM item_imagenes WHERE item_id = $1 ORDER BY orden',
        [id]
      );

      // Convertir URLs relativas a absolutas y normalizar (reemplazar 0.0.0.0 por localhost)
      const imagenesConUrlsCompletas = imagenes.rows.map(imagen => {
        let url = imagen.url_imagen.startsWith('http') 
          ? imagen.url_imagen 
          : buildImageUrl(imagen.url_imagen.replace('/uploads/', '').replace('/uploads/products/', ''));
        return {
          ...imagen,
          url_imagen: normalizeImageUrl(url)
        };
      });

      // Si es un servicio, obtener información adicional
      let servicioInfo = null;
      if (producto.rows[0].tipo === 'servicio') {
        const servicio = await query(
          'SELECT * FROM servicios WHERE item_id = $1',
          [id]
        );
        servicioInfo = servicio.rows[0];
      }

      res.json({
        success: true,
        data: {
          ...producto.rows[0],
          imagenes: imagenesConUrlsCompletas,
          servicio: servicioInfo
        }
      });

    } catch (error) {
      console.error('Error al obtener producto para vista:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Actualizar producto
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que req.body existe
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: 'No se recibieron datos para actualizar'
        });
      }

      // Debug: Log completo de la request
      console.log('🔍 DEBUG UPDATE PRODUCT:', {
        body: req.body,
        bodyKeys: Object.keys(req.body),
        coordenadas: req.body.coordenadas, // Log específico de coordenadas
        files: req.files ? req.files.length : 0,
        deleted_images: req.body.deleted_images,
        contentType: req.get('Content-Type')
      });

      const { 
        nombre, 
        descripcion, 
        precio, 
        ubicacion_id,
        ubicacion_provincia,
        ubicacion_canton,
        ubicacion_distrito,
        ubicacion_direccion,
        coordenadas,
        categoria_id,
        horario_atencion, 
        dias_disponibles, 
        duracion_estimada,
        respuesta_rechazo  // Respuesta del vendedor al rechazo (para crear apelación automática)
      } = req.body;

      // Verificar que el producto existe
      const productoExistente = await query(
        'SELECT * FROM items WHERE id = $1',
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const producto = productoExistente.rows[0];

      // Verificar permisos (solo el vendedor propietario o admin)
      if (req.user.id !== producto.vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar este producto'
        });
      }

      // Verificar que no esté marcado como peligroso
      if (producto.es_peligroso) {
        return res.status(400).json({
          success: false,
          message: 'No se puede editar un producto marcado como peligroso'
        });
      }

      // Verificar que no esté en revisión (solo admins pueden editar productos en revisión)
      if (producto.estado === 'pendiente_revision' && req.user.tipo_usuario !== 'administrador') {
        return res.status(400).json({
          success: false,
          message: 'No se puede editar un producto que está pendiente de revisión. Espera a que los moderadores lo revisen.'
        });
      }

      // Verificar que no esté suspendido (solo admins pueden editar productos suspendidos)
      if (producto.estado === 'suspendido' && req.user.tipo_usuario !== 'administrador') {
        return res.status(400).json({
          success: false,
          message: 'No se puede editar un producto que ha sido suspendido. Contacta con los moderadores para más información.'
        });
      }

      // Detectar contenido inadecuado en los campos actualizados
      const nombreParaDetectar = nombre || producto.nombre;
      const descripcionParaDetectar = descripcion || producto.descripcion;
      
      const deteccion = detectarContenidoInadecuado(nombreParaDetectar, descripcionParaDetectar);
      console.log('Detección de contenido en actualización:', deteccion);
      
      // Determinar si se debe cambiar el estado
      let nuevoEstado = producto.estado;
      let esPeligroso = producto.es_peligroso;
      let motivoRechazo = producto.motivo_rechazo;

      // Si el producto estaba rechazado y el vendedor lo está editando
      // Verificar si viene una respuesta/apelación del vendedor
      let crearApelacion = false;
      let motivoApelacion = null;
      let informacionAdicionalApelacion = null;
      
      if (producto.estado === 'rechazado' && req.user.id === producto.vendedor_id) {
        // Cuando un vendedor corrige un producto rechazado, SIEMPRE crear apelación y cambiar a en_apelacion
        crearApelacion = true;
        nuevoEstado = 'en_apelacion';
        
        // Si viene respuesta del vendedor, usarla; si no, usar mensaje por defecto
        if (req.body.respuesta_rechazo && req.body.respuesta_rechazo.trim().length > 0) {
          motivoApelacion = req.body.respuesta_rechazo.trim();
          informacionAdicionalApelacion = 'Producto corregido y actualizado según las observaciones del moderador.';
        } else {
          // Mensaje por defecto si no se proporciona respuesta
          motivoApelacion = 'Producto corregido según las observaciones del moderador. Solicitando revisión nuevamente.';
          informacionAdicionalApelacion = 'El vendedor ha realizado correcciones en el producto y solicita una nueva revisión.';
        }
      }

      // Guardar si el producto estaba rechazado antes de cualquier cambio
      const productoEstabaRechazado = producto.estado === 'rechazado';
      
      if (deteccion.esInadecuado) {
        if (deteccion.nivelRiesgo === 'alto') {
          // Si es alto riesgo, siempre marcarlo como peligroso (sobrescribe cualquier estado)
          nuevoEstado = 'peligroso';
          esPeligroso = true;
          motivoRechazo = obtenerMensajeRechazo(deteccion.categoria, deteccion.palabrasDetectadas);
          crearApelacion = false; // No crear apelación si es peligroso
        } else if (deteccion.nivelRiesgo === 'medio') {
          // Si es riesgo medio:
          // 1. NO sobrescribir si el producto estaba rechazado y se corrigió (mantener en_apelacion)
          // 2. Solo cambiar a pendiente_revision si el producto estaba activo
          if (producto.estado === 'activo' && !productoEstabaRechazado) {
            nuevoEstado = 'pendiente_revision';
            motivoRechazo = obtenerMensajeRechazo(deteccion.categoria, deteccion.palabrasDetectadas);
          }
          // Si el producto estaba rechazado y se corrigió, mantener en_apelacion (no cambiar)
          // El motivo de rechazo ya existe del rechazo anterior
        }
      }

      // Manejar ubicación con campos separados
      let ubicacionIdFinal = ubicacion_id;
      
      // Si se proporcionan los campos separados de ubicación, buscar ubicación existente
      if (ubicacion_provincia && ubicacion_canton) {
        try {
          // Buscar la ubicación base (solo provincia + canton)
          // El distrito y dirección se guardan en la tabla items, NO en ubicaciones
          const ubicacionExistente = await query(
            'SELECT id FROM ubicaciones WHERE provincia = $1 AND canton = $2 LIMIT 1',
            [ubicacion_provincia, ubicacion_canton]
          );
          
          if (ubicacionExistente.rows.length > 0) {
            ubicacionIdFinal = ubicacionExistente.rows[0].id;
          } else {
            return res.status(400).json({
              success: false,
              message: 'Ubicación no válida. Por favor selecciona una provincia y cantón válidos.'
            });
          }
        } catch (error) {
          console.error('Error al manejar ubicación:', error);
          return res.status(500).json({
            success: false,
            message: 'Error al procesar la ubicación'
          });
        }
      }

      // Actualizar producto
      // Solo permitir cambio de disponibilidad (stock) si el producto está en estado 'activo'
      // La disponibilidad solo se puede cambiar cuando el producto está aprobado
      let disponibilidadFinal = undefined;
      if (req.body.disponibilidad !== undefined) {
        if (nuevoEstado === 'activo' || producto.estado === 'activo') {
          // Solo permitir cambio de stock si el producto está aprobado
          disponibilidadFinal = req.body.disponibilidad;
        } else {
          // Si no está activo, forzar a false (sin stock hasta aprobación)
          disponibilidadFinal = false;
        }
      }
      
      const productoActualizado = await query(
        `UPDATE items SET 
          nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          ubicacion_id = COALESCE($4, ubicacion_id),
          ubicacion_provincia = COALESCE($5, ubicacion_provincia),
          ubicacion_canton = COALESCE($6, ubicacion_canton),
          ubicacion_distrito = COALESCE($7, ubicacion_distrito),
          ubicacion_direccion = COALESCE($8, ubicacion_direccion),
          coordenadas = COALESCE(NULLIF($9, ''), coordenadas),
          categoria_id = COALESCE($10, categoria_id),
          disponibilidad = COALESCE($11, disponibilidad),
          estado = COALESCE($12, estado),
          es_peligroso = COALESCE($13, es_peligroso),
          motivo_rechazo = COALESCE($14, motivo_rechazo),
          fecha_deteccion_peligroso = CASE 
            WHEN $13 = TRUE AND es_peligroso = FALSE THEN CURRENT_TIMESTAMP 
            WHEN $13 = FALSE THEN NULL 
            ELSE fecha_deteccion_peligroso 
          END,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $15
        RETURNING *`,
        [nombre, descripcion, precio, ubicacionIdFinal, 
         ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion, coordenadas || null,
         categoria_id, disponibilidadFinal, nuevoEstado, esPeligroso, motivoRechazo, id]
      );

      // Si es un servicio, actualizar información adicional
      if (producto.tipo === 'servicio' && (horario_atencion || dias_disponibles || duracion_estimada)) {
        await query(
          `UPDATE servicios SET 
            horario_atencion = COALESCE($1, horario_atencion),
            dias_disponibles = COALESCE($2, dias_disponibles),
            duracion_estimada = COALESCE($3, duracion_estimada)
          WHERE item_id = $4`,
          [horario_atencion, dias_disponibles, duracion_estimada, id]
        );
      }

      // Manejar imágenes eliminadas
      console.log('🔍 Verificando deleted_images:', {
        exists: !!req.body.deleted_images,
        value: req.body.deleted_images,
        type: typeof req.body.deleted_images
      });
      
      if (req.body.deleted_images) {
        try {
          const deletedImageIndices = JSON.parse(req.body.deleted_images);
          console.log('🗑️ Recibiendo índices de imágenes para eliminar:', deletedImageIndices);
          
          if (Array.isArray(deletedImageIndices) && deletedImageIndices.length > 0) {
            // Obtener todas las imágenes del producto ordenadas por orden
            const allImages = await query(
              'SELECT id, url_imagen FROM item_imagenes WHERE item_id = $1 ORDER BY orden ASC',
              [id]
            );
            
            console.log('📋 Todas las imágenes del producto:', allImages.rows);
            
            // Obtener los IDs reales de las imágenes a eliminar basados en los índices
            const idsToDelete = deletedImageIndices.map(index => {
              if (index >= 0 && index < allImages.rows.length) {
                return allImages.rows[index].id;
              }
              return null;
            }).filter(id => id !== null);
            
            console.log('🎯 IDs reales a eliminar:', idsToDelete);
            
            if (idsToDelete.length > 0) {
              // Obtener URLs de las imágenes a eliminar (para logs)
              const imagesToDelete = await query(
                'SELECT url_imagen FROM item_imagenes WHERE id = ANY($1)',
                [idsToDelete]
              );
              
              console.log('📁 URLs de imágenes a eliminar:', imagesToDelete.rows);
              
              // Eliminar de la base de datos
              await query(
                'DELETE FROM item_imagenes WHERE id = ANY($1)',
                [idsToDelete]
              );
              
              console.log('✅ Imágenes eliminadas de la base de datos');
            } else {
              console.log('⚠️ No se encontraron imágenes válidas para eliminar');
            }
          }
        } catch (error) {
          console.error('⚠️ Error al procesar imágenes eliminadas:', error);
        }
      }

      // Manejar nuevas imágenes
      if (req.files && req.files.length > 0) {
        console.log('📸 Agregando nuevas imágenes:', req.files.length);
        
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          
          // Obtener el siguiente orden
          const nextOrder = await query(
            'SELECT COALESCE(MAX(orden), 0) + 1 as next_order FROM item_imagenes WHERE item_id = $1',
            [id]
          );
          
          // Guardar solo la ruta relativa en la base de datos (mejor práctica)
          // Asegurar que siempre sea relativa, eliminando cualquier URL absoluta
          let urlImagen = `/uploads/${file.filename}`;
          
          // Validación adicional: si por alguna razón llegara una URL absoluta, convertirla a relativa
          if (urlImagen.startsWith('http://') || urlImagen.startsWith('https://')) {
            // Extraer solo la ruta relativa
            const urlObj = new URL(urlImagen);
            urlImagen = urlObj.pathname;
          }
          
          // Asegurar que empiece con /uploads
          if (!urlImagen.startsWith('/uploads')) {
            urlImagen = `/uploads/${file.filename}`;
          }
          
          await query(
            `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
             VALUES ($1, $2, $3, $4)`,
            [id, urlImagen, nextOrder.rows[0].next_order, false]
          );
        }
      }

      // Si se marcó como peligroso, verificar si se debe bloquear la cuenta del vendedor
      if (esPeligroso && producto.vendedor_id) {
        const bloqueoResult = await ProductsController.verificarYBloquearCuentaPorProductosPeligrosos(producto.vendedor_id);
        if (bloqueoResult.bloqueado) {
          console.log(`⚠️ Cuenta del vendedor ${producto.vendedor_id} bloqueada automáticamente por tener ${bloqueoResult.cantidadPeligrosos} productos peligrosos`);
        }
      }

      // Crear apelación si es necesario (después de actualizar el producto)
      if (crearApelacion && motivoApelacion) {
        try {
          // Verificar si ya existe una apelación pendiente
          const apelacionExistente = await query(
            'SELECT * FROM apelaciones WHERE item_id = $1 AND estado IN ($2, $3)',
            [id, 'en_apelacion', 'pendiente']
          );

          if (apelacionExistente.rows.length === 0) {
            // Crear la apelación
            await query(
              `INSERT INTO apelaciones 
              (item_id, usuario_apelante_id, motivo_apelacion, informacion_adicional, estado, fecha_apelacion)
              VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
              RETURNING *`,
              [id, req.user.id, motivoApelacion, informacionAdicionalApelacion || null, 'en_apelacion']
            );
          }
        } catch (error) {
          console.error('Error al crear apelación automática:', error);
          // No fallar la actualización si hay error al crear apelación
        }
      }

      // Si el producto estaba rechazado y ahora está en en_apelacion, informar al usuario
      let productoEnApelacion = false;
      if (producto.estado === 'rechazado' && nuevoEstado === 'en_apelacion') {
        productoEnApelacion = true;
      }

      // Determinar mensaje de respuesta basado en cambios de estado
      let mensajeRespuesta = 'Producto actualizado exitosamente';
      let informacionAdicional = null;

      if (productoEnApelacion) {
        mensajeRespuesta = 'Producto corregido y apelación creada exitosamente';
        informacionAdicional = {
          estado_anterior: 'rechazado',
          estado_nuevo: 'en_apelacion',
          requiere_revision: true,
          apelacion_creada: true,
          mensaje: 'Tu producto ha sido corregido y se ha creado una apelación. Será revisado por los moderadores en la sección de apelaciones.'
        };
      } else if (deteccion.esInadecuado && (nuevoEstado !== producto.estado)) {
        if (nuevoEstado === 'peligroso') {
          mensajeRespuesta = 'Producto actualizado pero marcado como peligroso automáticamente';
          informacionAdicional = {
            estado_anterior: producto.estado,
            estado_nuevo: 'peligroso',
            motivo: motivoRechazo,
            requiere_revision: true,
            no_eliminable: true
          };
        } else if (nuevoEstado === 'pendiente_revision') {
          mensajeRespuesta = 'Producto actualizado y enviado para revisión';
          informacionAdicional = {
            estado_anterior: producto.estado,
            estado_nuevo: 'pendiente_revision',
            requiere_revision: true,
            motivo: motivoRechazo
          };
        }
      }

      res.json({
        success: true,
        message: mensajeRespuesta,
        data: productoActualizado.rows[0],
        informacion: informacionAdicional
      });

    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Eliminar producto
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el producto existe
      const productoExistente = await query(
        'SELECT * FROM items WHERE id = $1',
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const producto = productoExistente.rows[0];

      // Verificar permisos (solo el vendedor propietario o admin)
      if (req.user.id !== producto.vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este producto'
        });
      }

      // Verificar que no esté marcado como peligroso (solo admins pueden eliminar)
      if (producto.es_peligroso && req.user.tipo_usuario !== 'administrador') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar un producto marcado como peligroso. Solo los administradores pueden hacerlo.'
        });
      }

      // Verificar que no esté en revisión (solo admins pueden eliminar productos en revisión)
      if (producto.estado === 'pendiente_revision' && req.user.tipo_usuario !== 'administrador') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar un producto que está pendiente de revisión. Espera a que los moderadores lo revisen.'
        });
      }

      // Verificar que no esté suspendido (solo admins pueden eliminar productos suspendidos)
      if (producto.estado === 'suspendido' && req.user.tipo_usuario !== 'administrador') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar un producto que ha sido suspendido. Contacta con los moderadores para más información.'
        });
      }

      // Eliminar producto (CASCADE eliminará imágenes y servicios relacionados)
      await query('DELETE FROM items WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Cambiar disponibilidad del producto
  static async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const { disponibilidad } = req.body;

      // Verificar que el producto existe
      const productoExistente = await query(
        'SELECT * FROM items WHERE id = $1',
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const producto = productoExistente.rows[0];

      // Verificar permisos (solo el vendedor propietario o admin)
      if (req.user.id !== producto.vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este producto'
        });
      }

      // Actualizar disponibilidad
      const productoActualizado = await query(
        `UPDATE items SET 
          disponibilidad = $1,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *`,
        [disponibilidad, id]
      );

      res.json({
        success: true,
        message: `Producto ${disponibilidad ? 'disponible' : 'no disponible'}`,
        data: productoActualizado.rows[0]
      });

    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener productos del vendedor actual
  static async getMyProducts(req, res) {
    try {
      const vendedor_id = req.user.id;
      const { page = 1, limit = 10, estado, search_product_name } = req.query;

      // Verificar si es moderador o administrador
      const isModerator = ['moderador', 'administrador'].includes(req.user.tipo_usuario);

      let whereClause = 'i.vendedor_id = $1';
      let queryParams = [vendedor_id];
      let paramIndex = 2;

      // Ocultar productos peligrosos para vendedores normales
      // Moderadores y administradores SÍ pueden ver productos peligrosos para revisión
      if (!isModerator) {
        whereClause += ' AND i.es_peligroso = false';
      }

      if (estado) {
        queryParams.push(estado);
        whereClause += ` AND i.estado = $${paramIndex}`;
        paramIndex++;
      }

      if (search_product_name && search_product_name.trim() !== '') {
        queryParams.push(`%${search_product_name.trim()}%`);
        whereClause += ` AND i.nombre ILIKE $${paramIndex}`;
        paramIndex++;
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;
      const limitPlaceholder = `$${paramIndex}`;
      queryParams.push(parseInt(limit));
      paramIndex++;
      const offsetPlaceholder = `$${paramIndex}`;
      queryParams.push(offset);

      const productos = await query(
        `SELECT 
          i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso, i.motivo_rechazo,
          i.ubicacion_provincia, i.ubicacion_canton, i.ubicacion_distrito, i.ubicacion_direccion,
          c.nombre as categoria_nombre,
          COUNT(ii.id) as total_imagenes,
          (SELECT ii2.url_imagen FROM item_imagenes ii2 WHERE ii2.item_id = i.id ORDER BY ii2.orden LIMIT 1) as primera_imagen
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        WHERE ${whereClause}
        GROUP BY i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
                 i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso, i.motivo_rechazo,
                 i.ubicacion_provincia, i.ubicacion_canton, i.ubicacion_distrito, i.ubicacion_direccion,
                 c.nombre
        ORDER BY i.fecha_publicacion DESC
        LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
        queryParams
      );

      // Contar total (sin limit y offset)
      const countParams = queryParams.slice(0, -2);
      const totalCount = await query(
        `SELECT COUNT(*) as total
         FROM items i
         WHERE ${whereClause}`,
        countParams
      );

      const total = parseInt(totalCount.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Normalizar URLs de imágenes antes de enviar la respuesta
      const productosNormalizados = productos.rows.map(producto => {
        const primeraImagenNormalizada = producto.primera_imagen 
          ? normalizeImageUrl(
              producto.primera_imagen.startsWith('http') 
                ? producto.primera_imagen 
                : buildImageUrl(producto.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
            )
          : null;

        return {
          ...producto,
          primera_imagen: primeraImagenNormalizada
        };
      });

      res.json({
        success: true,
        data: productosNormalizados,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error al obtener mis productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Moderar producto (solo moderadores y administradores)
  static async moderateProduct(req, res) {
    try {
      const { id } = req.params;
      const { accion, motivo, decision_final } = req.body;
      const moderador_id = req.user.id;

      // Validar acción
      const accionesValidas = ['aprobar', 'rechazar', 'suspender', 'marcar_peligroso', 'marcar_revisado_detalle'];
      if (!accionesValidas.includes(accion)) {
        return res.status(400).json({
          success: false,
          message: 'Acción de moderación inválida'
        });
      }

      // Verificar que el producto existe
      const productoExistente = await query(
        'SELECT * FROM items WHERE id = $1',
        [id]
      );

      if (productoExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const producto = productoExistente.rows[0];

      // Determinar nuevo estado según la acción
      let nuevoEstado;
      let esPeligroso = producto.es_peligroso;
      let fechaDeteccionPeligroso = producto.fecha_deteccion_peligroso;

      switch (accion) {
        case 'aprobar':
          nuevoEstado = 'activo';
          esPeligroso = false; // Al aprobar, quitar flag de peligroso si lo tenía
          break;
        case 'rechazar':
          nuevoEstado = 'rechazado'; // ✅ CORREGIDO: Rechazar → estado 'rechazado' (vendedor puede editar/corregir)
          break;
        case 'suspender':
          nuevoEstado = 'suspendido'; // Suspensión temporal (no puede editar hasta resolución)
          break;
        case 'marcar_peligroso':
          nuevoEstado = 'peligroso'; // Producto oculto (no puede editar/ver, solo admin)
          esPeligroso = true;
          fechaDeteccionPeligroso = new Date();
          break;
        case 'marcar_revisado_detalle':
          // Solo actualizar la fecha de revisión, no cambiar estado
          await query(
            `UPDATE items SET fecha_revision = NOW() WHERE id = $1`,
            [id]
          );
          return res.status(200).json({ success: true, message: 'Producto marcado como revisado en detalle.' });
      
        default:
          return res.status(400).json({ success: false, message: 'Acción de moderación inválida.' });
      }

      // Determinar si se debe establecer disponibilidad como true
      let disponibilidad = producto.disponibilidad; // Mantener el valor actual por defecto
      if (accion === 'aprobar') {
        disponibilidad = true; // Cuando se aprueba, automáticamente disponible
      }

      // Actualizar producto
      const productoActualizado = await query(
        `UPDATE items SET 
          estado = $1,
          es_peligroso = $2,
          fecha_deteccion_peligroso = $3,
          moderador_revision_id = $4,
          motivo_rechazo = $5,
          fecha_revision = CURRENT_TIMESTAMP,
          disponibilidad = $7
        WHERE id = $6
        RETURNING *`,
        [nuevoEstado, esPeligroso, fechaDeteccionPeligroso, moderador_id, motivo, id, disponibilidad]
      );

      // Registrar acción de moderación
      await query(
        `INSERT INTO acciones_moderacion (moderador_id, accion, tabla_afectada, registro_id, detalles)
         VALUES ($1, $2, 'items', $3, $4)`,
        [moderador_id, `moderar_producto_${accion}`, id, decision_final || motivo]
      );

      // Si se marcó como peligroso, verificar si se debe bloquear la cuenta del vendedor
      if (esPeligroso && producto.vendedor_id) {
        const bloqueoResult = await ProductsController.verificarYBloquearCuentaPorProductosPeligrosos(producto.vendedor_id);
        if (bloqueoResult.bloqueado) {
          console.log(`⚠️ Cuenta del vendedor ${producto.vendedor_id} bloqueada automáticamente por tener ${bloqueoResult.cantidadPeligrosos} productos peligrosos`);
        }
      }

      res.json({
        success: true,
        message: `Producto ${accion} exitosamente`,
        data: productoActualizado.rows[0]
      });

    } catch (error) {
      console.error('Error al moderar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener productos pendientes de moderación
  static async getPendingModeration(req, res) {
    try {
      const { page = 1, limit = 12, estado, search_product_name, search_vendedor_name } = req.query;

      // Calcular offset para paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Construir la consulta dinámicamente según los filtros
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;
      
      if (estado && estado.trim() !== '') {
        whereConditions.push(`i.estado = $${paramIndex}`);
        queryParams.push(estado);
        paramIndex++;
      }
      
      if (search_product_name && search_product_name.trim() !== '') {
        whereConditions.push(`i.nombre ILIKE $${paramIndex}`);
        queryParams.push(`%${search_product_name.trim()}%`);
        paramIndex++;
      }
      
      if (search_vendedor_name && search_vendedor_name.trim() !== '') {
        whereConditions.push(`(u.nombre ILIKE $${paramIndex} OR u.apellido ILIKE $${paramIndex} OR u.nombre || ' ' || u.apellido ILIKE $${paramIndex})`);
        queryParams.push(`%${search_vendedor_name.trim()}%`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Construir placeholders para LIMIT y OFFSET
      const limitPlaceholder = `$${paramIndex}`;
      queryParams.push(parseInt(limit));
      paramIndex++;
      const offsetPlaceholder = `$${paramIndex}`;
      queryParams.push(offset);

      const productos = await query(
        `SELECT 
          i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso,
          i.fecha_revision, i.moderador_revision_id, i.motivo_rechazo,
          i.ubicacion_provincia, i.ubicacion_canton, i.ubicacion_distrito, i.ubicacion_direccion,
          c.nombre as categoria_nombre,
          u.nombre || ' ' || u.apellido as vendedor_nombre,
          ub.nombre as ubicacion_nombre,
          COUNT(ii.id) as total_imagenes,
          (SELECT ii2.url_imagen FROM item_imagenes ii2 WHERE ii2.item_id = i.id ORDER BY ii2.orden LIMIT 1) as primera_imagen
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        ${whereClause}
        GROUP BY i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
                 i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso,
                 i.fecha_revision, i.moderador_revision_id, i.motivo_rechazo,
                 i.ubicacion_provincia, i.ubicacion_canton, i.ubicacion_distrito, i.ubicacion_direccion,
                 c.nombre, u.nombre, u.apellido, ub.nombre
        ORDER BY i.fecha_publicacion ASC
        LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
        queryParams
      );

      // Contar total (usando los mismos filtros)
      let countWhereConditions = [];
      let countParams = [];
      let countParamIndex = 1;
      
      if (estado && estado.trim() !== '') {
        countWhereConditions.push(`i.estado = $${countParamIndex}`);
        countParams.push(estado);
        countParamIndex++;
      }
      
      if (search_product_name && search_product_name.trim() !== '') {
        countWhereConditions.push(`i.nombre ILIKE $${countParamIndex}`);
        countParams.push(`%${search_product_name.trim()}%`);
        countParamIndex++;
      }
      
      if (search_vendedor_name && search_vendedor_name.trim() !== '') {
        // Necesitamos hacer JOIN con usuarios para la búsqueda por nombre del vendedor
        countWhereConditions.push(`i.vendedor_id IN (SELECT id FROM usuarios WHERE nombre ILIKE $${countParamIndex} OR apellido ILIKE $${countParamIndex} OR nombre || ' ' || apellido ILIKE $${countParamIndex})`);
        countParams.push(`%${search_vendedor_name.trim()}%`);
        countParamIndex++;
      }
      
      const countWhereClause = countWhereConditions.length > 0 ? `WHERE ${countWhereConditions.join(' AND ')}` : '';
      const countQuery = `SELECT COUNT(*) as total FROM items i ${countWhereClause}`;
      
      const totalCount = await query(countQuery, countParams);

      const total = parseInt(totalCount.rows[0].total);
      const totalPages = Math.ceil(total / parseInt(limit));

      // Obtener estadísticas globales (independiente de paginación y filtros)
      const estadisticas = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'pendiente_revision') as pendientes,
          COUNT(*) FILTER (WHERE estado = 'activo') as aprobados,
          COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazados,
          COUNT(*) FILTER (WHERE estado = 'suspendido') as suspendidos,
          COUNT(*) FILTER (WHERE estado = 'peligroso') as peligrosos,
          COUNT(*) FILTER (WHERE estado = 'en_apelacion') as en_apelacion
        FROM items
      `);

      // Normalizar URLs de imágenes antes de enviar la respuesta
      const productosNormalizados = productos.rows.map(producto => {
        const primeraImagenNormalizada = producto.primera_imagen 
          ? normalizeImageUrl(
              producto.primera_imagen.startsWith('http') 
                ? producto.primera_imagen 
                : buildImageUrl(producto.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
            )
          : null;

        return {
          ...producto,
          primera_imagen: primeraImagenNormalizada
        };
      });

      res.json({
        success: true,
        data: productosNormalizados,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        },
        estadisticas: {
          total: parseInt(estadisticas.rows[0].total),
          pendientes: parseInt(estadisticas.rows[0].pendientes),
          aprobados: parseInt(estadisticas.rows[0].aprobados),
          rechazados: parseInt(estadisticas.rows[0].rechazados),
          suspendidos: parseInt(estadisticas.rows[0].suspendidos),
          peligrosos: parseInt(estadisticas.rows[0].peligrosos),
          en_apelacion: parseInt(estadisticas.rows[0].en_apelacion)
        }
      });

    } catch (error) {
      console.error('Error al obtener productos pendientes de moderación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // ==================== FUNCIONES PARA PRODUCTOS GUARDADOS ====================

  // Obtener productos guardados del usuario
  static async getSavedProducts(req, res) {
    try {
      // console.log('🔍 DEBUG - getSavedProducts llamado');
      // console.log('🔍 DEBUG - req.user:', req.user);
      const userId = req.user.id;

      // Verificar que el usuario sea comprador o vendedor
      if (req.user.tipo_usuario !== 'comprador' && req.user.tipo_usuario !== 'vendedor') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores y vendedores pueden ver productos guardados'
        });
      }

      const result = await query(`
        SELECT 
          sp.id as saved_id,
          sp.fecha_guardado,
          i.id,
          i.codigo,
          i.nombre,
          i.descripcion,
          i.precio,
          i.tipo,
          i.estado,
          i.disponibilidad,
          i.es_peligroso,
          i.fecha_publicacion,
          c.nombre as categoria_nombre,
          u.nombre as ubicacion_nombre,
          v.nombre as vendedor_nombre,
          v.correo as vendedor_email,
          (
            SELECT url_imagen 
            FROM item_imagenes 
            WHERE item_id = i.id 
            ORDER BY orden ASC 
            LIMIT 1
          ) as primera_imagen,
          (
            SELECT COUNT(*) 
            FROM item_imagenes 
            WHERE item_id = i.id
          ) as total_imagenes
        FROM productos_guardados sp
        JOIN items i ON sp.item_id = i.id
        LEFT JOIN categorias c ON i.categoria_id = c.id
        LEFT JOIN ubicaciones u ON i.ubicacion_id = u.id
        LEFT JOIN usuarios v ON i.vendedor_id = v.id
        WHERE sp.usuario_id = $1
        AND i.estado = 'activo'
        ORDER BY sp.fecha_guardado DESC
      `, [userId]);

      // Normalizar URLs de imágenes antes de enviar la respuesta
      const productosNormalizados = result.rows.map(producto => {
        const primeraImagenNormalizada = producto.primera_imagen 
          ? normalizeImageUrl(
              producto.primera_imagen.startsWith('http') 
                ? producto.primera_imagen 
                : buildImageUrl(producto.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
            )
          : null;

        return {
          ...producto,
          primera_imagen: primeraImagenNormalizada
        };
      });

      return res.status(200).json({
        success: true,
        data: productosNormalizados,
        message: 'Productos guardados obtenidos exitosamente'
      });

    } catch (error) {
      console.error('Error al obtener productos guardados:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener productos guardados'
      });
    }
  }

  // Guardar producto en favoritos
  static async saveProduct(req, res) {
    try {
      const { id: productoId } = req.params;
      const userId = req.user.id;

      // Verificar que el usuario sea comprador o vendedor
      if (req.user.tipo_usuario !== 'comprador' && req.user.tipo_usuario !== 'vendedor') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores y vendedores pueden guardar productos'
        });
      }

      // Verificar que el producto existe y está activo
      const productCheck = await query(
        'SELECT id, estado FROM items WHERE id = $1',
        [productoId]
      );

      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (productCheck.rows[0].estado !== 'activo') {
        return res.status(400).json({
          success: false,
          message: 'No se puede guardar un producto inactivo'
        });
      }

      // Verificar si ya está guardado
      const alreadySaved = await query(
        'SELECT id FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2',
        [userId, productoId]
      );

      if (alreadySaved.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El producto ya está en tus favoritos'
        });
      }

      // Guardar el producto
      await query(
        'INSERT INTO productos_guardados (usuario_id, item_id, fecha_guardado) VALUES ($1, $2, NOW())',
        [userId, productoId]
      );

      return res.status(201).json({
        success: true,
        message: 'Producto guardado en favoritos exitosamente'
      });

    } catch (error) {
      console.error('Error al guardar producto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al guardar el producto'
      });
    }
  }

  // Eliminar producto de favoritos
  static async unsaveProduct(req, res) {
    try {
      const { id: productoId } = req.params;
      const userId = req.user.id;

      // Verificar que el usuario sea comprador o vendedor
      if (req.user.tipo_usuario !== 'comprador' && req.user.tipo_usuario !== 'vendedor') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores y vendedores pueden eliminar productos guardados'
        });
      }

      // Verificar si está guardado
      const savedProduct = await query(
        'SELECT id FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2',
        [userId, productoId]
      );

      if (savedProduct.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'El producto no está en tus favoritos'
        });
      }

      // Eliminar de favoritos
      await query(
        'DELETE FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2',
        [userId, productoId]
      );

      return res.status(200).json({
        success: true,
        message: 'Producto eliminado de favoritos exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar producto guardado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar el producto'
      });
    }
  }

  // Verificar si un producto está guardado
  static async getSavedStatus(req, res) {
    try {
      const { id: productoId } = req.params;
      const userId = req.user.id;

      // Verificar que el usuario sea comprador o vendedor
      if (req.user.tipo_usuario !== 'comprador' && req.user.tipo_usuario !== 'vendedor') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores y vendedores pueden verificar productos guardados'
        });
      }

      const result = await query(
        'SELECT id FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2',
        [userId, productoId]
      );

      return res.status(200).json({
        success: true,
        isSaved: result.rows.length > 0,
        message: 'Estado de guardado obtenido exitosamente'
      });

    } catch (error) {
      console.error('Error al verificar estado de guardado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al verificar el estado'
      });
    }
  }

  // Obtener historial de productos peligrosos del vendedor
  static async getMyDangerousProducts(req, res) {
    try {
      const vendedor_id = req.user.id;

      // Obtener productos peligrosos del vendedor
      const result = await query(
        `SELECT 
          i.id,
          i.codigo,
          i.nombre,
          i.descripcion,
          i.tipo,
          i.fecha_deteccion_peligroso,
          i.motivo_rechazo,
          i.moderador_revision_id,
          c.nombre as categoria_nombre,
          u.nombre as moderador_nombre,
          u.apellido as moderador_apellido,
          (SELECT url_imagen FROM item_imagenes WHERE item_id = i.id ORDER BY orden LIMIT 1) as primera_imagen
        FROM items i
        LEFT JOIN categorias c ON i.categoria_id = c.id
        LEFT JOIN usuarios u ON i.moderador_revision_id = u.id
        WHERE i.vendedor_id = $1 
        AND i.es_peligroso = true
        ORDER BY i.fecha_deteccion_peligroso DESC`,
        [vendedor_id]
      );

      // Normalizar URLs de imágenes antes de enviar la respuesta
      const productosNormalizados = result.rows.map(producto => {
        const primeraImagenNormalizada = producto.primera_imagen 
          ? normalizeImageUrl(
              producto.primera_imagen.startsWith('http') 
                ? producto.primera_imagen 
                : buildImageUrl(producto.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
            )
          : null;

        return {
          ...producto,
          primera_imagen: primeraImagenNormalizada
        };
      });

      res.json({
        success: true,
        data: productosNormalizados
      });

    } catch (error) {
      console.error('Error al obtener productos peligrosos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos peligrosos',
        error: error.message
      });
    }
  }

  /**
   * Verifica si un vendedor tiene 3 o más productos peligrosos y bloquea su cuenta automáticamente
   * @param {number} vendedor_id - ID del vendedor
   * @returns {Promise<{bloqueado: boolean, cantidadPeligrosos: number}>} Resultado de la verificación
   */
  static async verificarYBloquearCuentaPorProductosPeligrosos(vendedor_id) {
    try {
      // Contar productos peligrosos del vendedor
      const countResult = await query(
        `SELECT COUNT(*) as cantidad 
         FROM items 
         WHERE vendedor_id = $1 
         AND es_peligroso = true`,
        [vendedor_id]
      );

      const cantidadPeligrosos = parseInt(countResult.rows[0].cantidad);

      // Si tiene 3 o más productos peligrosos, bloquear la cuenta
      if (cantidadPeligrosos >= 3) {
        // Verificar que el usuario existe y es vendedor
        const userResult = await query(
          `SELECT id, correo, nombre, apellido, tipo_usuario, estado 
           FROM usuarios 
           WHERE id = $1`,
          [vendedor_id]
        );

        if (userResult.rows.length === 0) {
          console.error(`❌ Usuario ${vendedor_id} no encontrado`);
          return { bloqueado: false, cantidadPeligrosos };
        }

        const user = userResult.rows[0];

        // Solo bloquear si es vendedor y no está ya suspendido
        if (user.tipo_usuario === 'vendedor' && user.estado !== 'suspendido') {
          console.log(`⚠️ Bloqueando cuenta automáticamente: Vendedor ${vendedor_id} tiene ${cantidadPeligrosos} productos peligrosos`);

          // Suspender la cuenta
          await query(
            `UPDATE usuarios 
             SET estado = 'suspendido' 
             WHERE id = $1`,
            [vendedor_id]
          );

          // Invalidar todas las sesiones activas
          await query(
            `UPDATE sesiones_usuario 
             SET activa = false 
             WHERE usuario_id = $1`,
            [vendedor_id]
          );

          // Enviar email de notificación
          try {
            const nombreCompleto = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.correo;
            await sendAccountBlockedByDangerousProductsEmail(
              user.correo,
              nombreCompleto,
              cantidadPeligrosos
            );
            console.log(`✅ Email de bloqueo automático enviado a: ${user.correo}`);
          } catch (emailError) {
            console.error(`❌ Error enviando email de bloqueo automático a ${user.correo}:`, emailError.message);
            // No fallar si el email falla
          }

          return { bloqueado: true, cantidadPeligrosos };
        }
      }

      return { bloqueado: false, cantidadPeligrosos };
    } catch (error) {
      console.error('❌ Error al verificar y bloquear cuenta por productos peligrosos:', error);
      // No lanzar error, solo registrar
      return { bloqueado: false, cantidadPeligrosos: 0, error: error.message };
    }
  }

  /**
   * Suspende automáticamente productos en estado 'pendiente_revision' que tienen más de 1 día sin revisar
   * Esta función se ejecuta mediante un cron job programado
   * @returns {Promise<{suspendidos: number, productos: Array}>} Resultado de la suspensión automática
   */
  static async suspenderProductosExpirados() {
    try {
      console.log('\n🔄 === INICIANDO SUSPENSIÓN AUTOMÁTICA DE PRODUCTOS ===');
      console.log('⏰ Fecha/Hora:', new Date().toISOString());

      // Buscar productos en pendiente_revision con más de 1 día desde su fecha_publicacion
      // Usamos fecha_publicacion porque es cuando se creó el producto
      const productosExpirados = await query(
        `SELECT 
          id, 
          codigo, 
          nombre, 
          vendedor_id,
          fecha_publicacion,
          EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - fecha_publicacion)) / 86400 as dias_pendiente
        FROM items 
        WHERE estado = 'pendiente_revision'
        AND fecha_publicacion < CURRENT_TIMESTAMP - INTERVAL '1 day'
        AND es_peligroso = false
        ORDER BY fecha_publicacion ASC`
      );

      if (productosExpirados.rows.length === 0) {
        console.log('✅ No hay productos pendientes de revisión por más de 1 día');
        console.log('===========================================================\n');
        return { suspendidos: 0, productos: [] };
      }

      console.log(`📋 Encontrados ${productosExpirados.rows.length} producto(s) pendiente(s) por más de 1 día`);

      const productosSuspendidos = [];
      const motivoSuspension = 'Producto suspendido automáticamente por exceder el tiempo límite de revisión (1 día). El producto estaba pendiente de moderación sin revisar.';

      // Obtener ID del sistema (usuario del sistema) o usar null si no existe
      // En este caso usaremos null para moderador_revision_id ya que es automático
      
      for (const producto of productosExpirados.rows) {
        try {
          // Actualizar el producto a estado 'suspendido'
          await query(
            `UPDATE items 
             SET estado = 'suspendido',
                 motivo_rechazo = $1,
                 fecha_revision = CURRENT_TIMESTAMP,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [motivoSuspension, producto.id]
          );

          // Registrar acción de moderación automática
          // Usamos moderador_id = null para indicar que fue automático
          await query(
            `INSERT INTO acciones_moderacion (moderador_id, accion, tabla_afectada, registro_id, detalles)
             VALUES (NULL, 'suspension_automatica_tiempo_expirado', 'items', $1, $2)`,
            [producto.id, `Producto suspendido automáticamente después de ${Math.round(producto.dias_pendiente)} días sin revisar`]
          );

          productosSuspendidos.push({
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            dias_pendiente: Math.round(producto.dias_pendiente)
          });

          console.log(`  ✓ Producto #${producto.id} "${producto.nombre}" suspendido (${Math.round(producto.dias_pendiente)} días pendiente)`);

        } catch (error) {
          console.error(`  ❌ Error al suspender producto #${producto.id}:`, error.message);
          // Continuar con el siguiente producto aunque uno falle
        }
      }

      console.log(`\n✅ Suspensión automática completada: ${productosSuspendidos.length} producto(s) suspendido(s)`);
      console.log('===========================================================\n');

      return {
        suspendidos: productosSuspendidos.length,
        productos: productosSuspendidos,
        fecha_ejecucion: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error en suspensión automática de productos:', error);
      // No lanzar error, solo registrar para que el cron job no se detenga
      return { 
        suspendidos: 0, 
        productos: [], 
        error: error.message,
        fecha_ejecucion: new Date().toISOString()
      };
    }
  }
}

// Exportar funciones helper para uso en otros controladores
const normalizeImageUrlHelper = normalizeImageUrl;
const buildImageUrlHelper = buildImageUrl;

module.exports = ProductsController;
module.exports.normalizeImageUrl = normalizeImageUrlHelper;
module.exports.buildImageUrl = buildImageUrlHelper;
