const { query } = require('../config/database');
const { config } = require('../config/config');

// Controlador de productos y servicios
class ProductsController {
  
  // Crear nuevo producto/servicio
  static async createProduct(req, res) {
    try {
      const { 
        codigo, 
        nombre, 
        descripcion, 
        precio, 
        ubicacion_id, 
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

      // Crear el producto
      const nuevoProducto = await query(
        `INSERT INTO items (
          codigo, nombre, descripcion, precio, ubicacion_id, 
          tipo, categoria_id, vendedor_id, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente_revision')
        RETURNING *`,
        [codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id, vendedor_id]
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

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: producto
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
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion,
          c.nombre as categoria_nombre,
          u.nombre || ' ' || u.apellido as vendedor_nombre,
          ub.nombre as ubicacion_nombre,
          COUNT(ii.id) as total_imagenes
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        WHERE ${whereClause}
        GROUP BY i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
                 i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion,
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
          u.nombre || ' ' || u.apellido as vendedor_nombre,
          u.correo as vendedor_email,
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
          imagenes: imagenes.rows,
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

  // Actualizar producto
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre, 
        descripcion, 
        precio, 
        ubicacion_id, 
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

      // Actualizar producto
      const productoActualizado = await query(
        `UPDATE items SET 
          nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          ubicacion_id = COALESCE($4, ubicacion_id),
          categoria_id = COALESCE($5, categoria_id),
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *`,
        [nombre, descripcion, precio, ubicacion_id, categoria_id, id]
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

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: productoActualizado.rows[0]
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
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion,
          c.nombre as categoria_nombre,
          COUNT(ii.id) as total_imagenes
        FROM items i
        JOIN categorias c ON i.categoria_id = c.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        WHERE ${whereClause}
        GROUP BY i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
                 i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion, c.nombre
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
}

module.exports = ProductsController;
