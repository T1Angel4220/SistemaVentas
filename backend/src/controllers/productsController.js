const { query } = require('../config/database');
const { config } = require('../config/config');
const { detectarContenidoInadecuado, obtenerMensajeRechazo } = require('../services/contentDetection');

// Función helper para construir URLs completas de imágenes
const buildImageUrl = (filename) => {
  const baseUrl = `${config.server.host}:${config.server.port}`;
  return `http://${baseUrl}/uploads/${filename}`;
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
      
      // Si se proporcionan los campos separados de ubicación, crear o buscar ubicación
      if (ubicacion_provincia && ubicacion_canton && ubicacion_direccion) {
        try {
          // Buscar si ya existe una ubicación con estos datos exactos
          const ubicacionExistente = await query(
            'SELECT id FROM ubicaciones WHERE nombre = $1 AND provincia = $2 AND canton = $3 AND (distrito = $4 OR ($4 IS NULL AND distrito IS NULL))',
            [ubicacion_direccion, ubicacion_provincia, ubicacion_canton, ubicacion_distrito || null]
          );
          
          if (ubicacionExistente.rows.length > 0) {
            ubicacionIdFinal = ubicacionExistente.rows[0].id;
          } else {
            // Crear nueva ubicación con todos los campos
            const nuevaUbicacion = await query(
              'INSERT INTO ubicaciones (nombre, provincia, canton, distrito) VALUES ($1, $2, $3, $4) RETURNING id',
              [ubicacion_direccion, ubicacion_provincia, ubicacion_canton, ubicacion_distrito || null]
            );
            ubicacionIdFinal = nuevaUbicacion.rows[0].id;
          }
        } catch (error) {
          console.error('Error al manejar ubicación:', error);
          // Si hay error, usar null para ubicación
          ubicacionIdFinal = null;
        }
      }

      // Crear el producto
      // La disponibilidad debe ser false inicialmente (sin stock hasta que el vendedor lo configure)
      // Solo se puede cambiar a true cuando el producto esté aprobado (estado: 'activo')
      const disponibilidad = false;
      const nuevoProducto = await query(
        `INSERT INTO items (
          codigo, nombre, descripcion, precio, ubicacion_id, 
          tipo, categoria_id, vendedor_id, estado, disponibilidad, es_peligroso, motivo_rechazo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [codigo, nombre, descripcion, precio, ubicacionIdFinal, tipo, categoria_id, vendedor_id, estadoInicial, disponibilidad, esPeligroso, motivoRechazo]
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
          
          await query(
            `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
             VALUES ($1, $2, $3, $4)`,
            [producto.id, buildImageUrl(file.filename), i + 1, esPrincipal]
          );
        }
        
        console.log('✅ Imágenes guardadas exitosamente');
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
        estado = 'activo',
        disponibilidad = true,
        page = 1,
        limit = 10,
        search
      } = req.query;

      let whereConditions = ['i.estado = $1', 'i.disponibilidad = $2'];
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

      res.json({
        success: true,
        data: productos.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit),
          has_next: page < totalPages,
          has_prev: page > 1
        }
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
          ub.provincia, ub.canton, ub.distrito
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

      // Convertir URLs relativas a absolutas
      const imagenesConUrlsCompletas = imagenes.rows.map(imagen => ({
        ...imagen,
        url_imagen: imagen.url_imagen.startsWith('http') 
          ? imagen.url_imagen 
          : buildImageUrl(imagen.url_imagen.replace('/uploads/', ''))
      }));

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
          ub.provincia, ub.canton, ub.distrito
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        WHERE i.id = $1 AND i.estado IN ('activo', 'pendiente_revision', 'inactivo')`,
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

      // Convertir URLs relativas a absolutas
      const imagenesConUrlsCompletas = imagenes.rows.map(imagen => ({
        ...imagen,
        url_imagen: imagen.url_imagen.startsWith('http') 
          ? imagen.url_imagen 
          : buildImageUrl(imagen.url_imagen.replace('/uploads/', ''))
      }));

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
        categoria_id,
        horario_atencion, 
        dias_disponibles, 
        duracion_estimada 
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

      // Detectar contenido inadecuado en los campos actualizados
      const nombreParaDetectar = nombre || producto.nombre;
      const descripcionParaDetectar = descripcion || producto.descripcion;
      
      const deteccion = detectarContenidoInadecuado(nombreParaDetectar, descripcionParaDetectar);
      console.log('Detección de contenido en actualización:', deteccion);
      
      // Determinar si se debe cambiar el estado
      let nuevoEstado = producto.estado;
      let esPeligroso = producto.es_peligroso;
      let motivoRechazo = producto.motivo_rechazo;

      if (deteccion.esInadecuado) {
        if (deteccion.nivelRiesgo === 'alto') {
          nuevoEstado = 'peligroso';
          esPeligroso = true;
          motivoRechazo = obtenerMensajeRechazo(deteccion.categoria, deteccion.palabrasDetectadas);
        } else if (deteccion.nivelRiesgo === 'medio' && producto.estado === 'activo') {
          nuevoEstado = 'pendiente_revision';
          motivoRechazo = obtenerMensajeRechazo(deteccion.categoria, deteccion.palabrasDetectadas);
        }
      }

      // Manejar ubicación con campos separados
      let ubicacionIdFinal = ubicacion_id;
      
      // Si se proporcionan los campos separados de ubicación, crear o buscar ubicación
      if (ubicacion_provincia && ubicacion_canton && ubicacion_direccion) {
        try {
          // Buscar si ya existe una ubicación con estos datos exactos
          const ubicacionExistente = await query(
            'SELECT id FROM ubicaciones WHERE nombre = $1 AND provincia = $2 AND canton = $3 AND (distrito = $4 OR ($4 IS NULL AND distrito IS NULL))',
            [ubicacion_direccion, ubicacion_provincia, ubicacion_canton, ubicacion_distrito || null]
          );
          
          if (ubicacionExistente.rows.length > 0) {
            ubicacionIdFinal = ubicacionExistente.rows[0].id;
          } else {
            // Crear nueva ubicación con todos los campos
            const nuevaUbicacion = await query(
              'INSERT INTO ubicaciones (nombre, provincia, canton, distrito) VALUES ($1, $2, $3, $4) RETURNING id',
              [ubicacion_direccion, ubicacion_provincia, ubicacion_canton, ubicacion_distrito || null]
            );
            ubicacionIdFinal = nuevaUbicacion.rows[0].id;
          }
        } catch (error) {
          console.error('Error al manejar ubicación:', error);
          // Si hay error, usar null para ubicación
          ubicacionIdFinal = null;
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
          categoria_id = COALESCE($5, categoria_id),
          disponibilidad = COALESCE($6, disponibilidad),
          estado = COALESCE($7, estado),
          es_peligroso = COALESCE($8, es_peligroso),
          motivo_rechazo = COALESCE($9, motivo_rechazo),
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *`,
        [nombre, descripcion, precio, ubicacionIdFinal, categoria_id, disponibilidadFinal, nuevoEstado, esPeligroso, motivoRechazo, id]
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
          
          await query(
            `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
             VALUES ($1, $2, $3, $4)`,
            [id, buildImageUrl(file.filename), nextOrder.rows[0].next_order, false]
          );
        }
      }

      // Determinar mensaje de respuesta basado en cambios de estado
      let mensajeRespuesta = 'Producto actualizado exitosamente';
      let informacionAdicional = null;

      if (deteccion.esInadecuado && (nuevoEstado !== producto.estado)) {
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

      // Verificar que no esté marcado como peligroso
      if (producto.es_peligroso) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar un producto marcado como peligroso'
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
      const { page = 1, limit = 10, estado } = req.query;

      let whereClause = 'i.vendedor_id = $1';
      let queryParams = [vendedor_id];

      if (estado) {
        whereClause += ' AND i.estado = $2';
        queryParams.push(estado);
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;
      queryParams.push(limit, offset);

      const productos = await query(
        `SELECT 
          i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso,
          c.nombre as categoria_nombre,
          COUNT(ii.id) as total_imagenes,
          (SELECT ii2.url_imagen FROM item_imagenes ii2 WHERE ii2.item_id = i.id ORDER BY ii2.orden LIMIT 1) as primera_imagen
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        WHERE ${whereClause}
        GROUP BY i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
                 i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso, c.nombre
        ORDER BY i.fecha_publicacion DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
      );

      // Contar total
      const totalCount = await query(
        `SELECT COUNT(*) as total
         FROM items i
         WHERE ${whereClause}`,
        queryParams.slice(0, -2)
      );

      const total = parseInt(totalCount.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: productos.rows,
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
          break;
        case 'rechazar':
          nuevoEstado = 'suspendido';
          break;
        case 'suspender':
          nuevoEstado = 'suspendido';
          break;
        case 'marcar_peligroso':
          nuevoEstado = 'peligroso';
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
      const { page = 1, limit = 12, estado } = req.query;

      // Calcular offset para paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Construir la consulta dinámicamente según si hay filtro de estado
      let whereClause = '';
      let queryParams = [];
      let limitPlaceholder = '';
      let offsetPlaceholder = '';
      
      if (estado && estado.trim() !== '') {
        whereClause = 'WHERE i.estado = $1';
        limitPlaceholder = '$2';
        offsetPlaceholder = '$3';
        queryParams = [estado, parseInt(limit), offset];
      } else {
        limitPlaceholder = '$1';
        offsetPlaceholder = '$2';
        queryParams = [parseInt(limit), offset];
      }

      const productos = await query(
        `SELECT 
          i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, i.es_peligroso,
          i.fecha_revision, i.moderador_revision_id, i.motivo_rechazo,
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
                 c.nombre, u.nombre, u.apellido, ub.nombre
        ORDER BY i.fecha_publicacion ASC
        LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
        queryParams
      );

      // Contar total
      let countQuery = `SELECT COUNT(*) as total FROM items i`;
      let countParams = [];
      
      if (estado && estado.trim() !== '') {
        countQuery += ` WHERE i.estado = $1`;
        countParams = [estado];
      }
      
      const totalCount = await query(countQuery, countParams);

      const total = parseInt(totalCount.rows[0].total);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: productos.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
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

      // Verificar que el usuario sea comprador
      if (req.user.tipo_usuario !== 'comprador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores pueden ver productos guardados'
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

      return res.status(200).json({
        success: true,
        data: result.rows,
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

      // Verificar que el usuario sea comprador
      if (req.user.tipo_usuario !== 'comprador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores pueden guardar productos'
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

      // Verificar que el usuario sea comprador
      if (req.user.tipo_usuario !== 'comprador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores pueden eliminar productos guardados'
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

      // Verificar que el usuario sea comprador
      if (req.user.tipo_usuario !== 'comprador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los compradores pueden verificar productos guardados'
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
}

module.exports = ProductsController;
