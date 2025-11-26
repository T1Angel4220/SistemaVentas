const { query } = require('../config/database');
const { normalizeImageUrl, buildImageUrl } = require('./productsController');

// Controlador de Reportes/Denuncias
class ReportsController {
  
  // Crear un nuevo reporte de producto
  static async createReport(req, res) {
    try {
      const { id: item_id } = req.params;
      const { tipo_reporte, motivo_reporte, informacion_adicional } = req.body;
      const usuario_reportador_id = req.user.id;

      // Validar datos requeridos
      if (!tipo_reporte) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de reporte es requerido'
        });
      }

      const tiposValidos = ['contenido_inapropiado', 'producto_prohibido', 'informacion_falsa', 'spam', 'otro'];
      if (!tiposValidos.includes(tipo_reporte)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de reporte inválido. Debe ser uno de: ${tiposValidos.join(', ')}`
        });
      }

      if (!motivo_reporte || motivo_reporte.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: 'El motivo del reporte debe tener al menos 20 caracteres'
        });
      }

      // Verificar que el producto existe
      const productoResult = await query(
        'SELECT * FROM items WHERE id = $1',
        [item_id]
      );

      if (productoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const producto = productoResult.rows[0];

      // Verificar que el usuario no está reportando su propio producto (solo si es comprador)
      if (producto.vendedor_id === usuario_reportador_id && req.user.tipo_usuario === 'comprador') {
        return res.status(400).json({
          success: false,
          message: 'No puedes reportar tu propio producto'
        });
      }

      // Verificar si el usuario ya reportó este producto
      const reporteExistente = await query(
        'SELECT * FROM reportes WHERE item_id = $1 AND usuario_reportador_id = $2',
        [item_id, usuario_reportador_id]
      );

      if (reporteExistente.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya has reportado este producto anteriormente'
        });
      }

      // Crear el reporte (todos los reportes quedan pendientes de revisión)
      const result = await query(
        `INSERT INTO reportes 
        (item_id, usuario_reportador_id, tipo_reporte, descripcion, comentario_opcional, estado)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [item_id, usuario_reportador_id, tipo_reporte, motivo_reporte, informacion_adicional || null, 'pendiente']
      );

      // Mensaje diferenciado según el tipo de usuario
      const esModerador = ['moderador', 'administrador'].includes(req.user.tipo_usuario);
      
      res.status(201).json({
        success: true,
        message: esModerador 
          ? 'Reporte creado exitosamente. Será revisado por otro moderador o administrador.' 
          : 'Reporte creado exitosamente. Será revisado por un moderador.',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error al crear reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el reporte',
        error: error.message
      });
    }
  }

  // Obtener reportes de un producto específico
  static async getReportsByProduct(req, res) {
    try {
      const { id: item_id } = req.params;

      // Verificar que el producto existe
      const productoResult = await query(
        'SELECT * FROM items WHERE id = $1',
        [item_id]
      );

      if (productoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const producto = productoResult.rows[0];

      // Verificar permisos: propietario, moderador o admin
      const esPropietario = producto.vendedor_id === req.user.id;
      const esModerador = ['moderador', 'administrador'].includes(req.user.tipo_usuario);

      if (!esPropietario && !esModerador) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver los reportes de este producto'
        });
      }

      // Obtener reportes del producto con información del reportante y revisor
      const result = await query(
        `SELECT 
          r.*,
          u_reportante.nombre as reportante_nombre,
          u_reportante.apellido as reportante_apellido,
          u_reportante.tipo_usuario as reportante_tipo,
          u_revisor.nombre as revisor_nombre,
          u_revisor.apellido as revisor_apellido
        FROM reportes r
        LEFT JOIN usuarios u_reportante ON r.usuario_reportador_id = u_reportante.id
        LEFT JOIN usuarios u_revisor ON r.moderador_resolutor_id = u_revisor.id
        WHERE r.item_id = $1
        ORDER BY r.fecha_reporte DESC`,
        [item_id]
      );

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Error al obtener reportes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los reportes',
        error: error.message
      });
    }
  }

  // Obtener todos los reportes pendientes (para moderadores)
  static async getPendingReports(req, res) {
    try {
      const { tipo_reporte, estado } = req.query;

      let whereConditions = ["r.estado IN ('pendiente', 'en_revision')"];
      let queryParams = [];
      let paramIndex = 1;

      if (tipo_reporte) {
        whereConditions.push(`r.tipo_reporte = $${paramIndex}`);
        queryParams.push(tipo_reporte);
        paramIndex++;
      }

      if (estado) {
        whereConditions.push(`r.estado = $${paramIndex}`);
        queryParams.push(estado);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');

      const result = await query(
        `SELECT 
          r.*,
          i.nombre as producto_nombre,
          i.descripcion as producto_descripcion,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          i.precio as producto_precio,
          u_reportante.nombre as reportante_nombre,
          u_reportante.apellido as reportante_apellido,
          u_reportante.correo as reportante_correo,
          u_reportante.tipo_usuario as reportante_tipo,
          u_vendedor.nombre as vendedor_nombre,
          u_vendedor.apellido as vendedor_apellido,
          u_vendedor.correo as vendedor_correo,
          cat.nombre as categoria_nombre,
          (SELECT COUNT(*) FROM reportes WHERE item_id = r.item_id) as total_reportes_producto,
          (SELECT url_imagen FROM item_imagenes WHERE item_id = i.id ORDER BY orden ASC LIMIT 1) as primera_imagen,
          (SELECT COUNT(*) FROM item_imagenes WHERE item_id = i.id) as total_imagenes
        FROM reportes r
        INNER JOIN items i ON r.item_id = i.id
        INNER JOIN usuarios u_reportante ON r.usuario_reportador_id = u_reportante.id
        INNER JOIN usuarios u_vendedor ON i.vendedor_id = u_vendedor.id
        LEFT JOIN categorias cat ON i.categoria_id = cat.id
        WHERE ${whereClause}
        ORDER BY r.fecha_reporte ASC`,
        queryParams
      );

      // Normalizar URLs de imágenes antes de enviar la respuesta
      const reportesNormalizados = result.rows.map(reporte => {
        const primeraImagenNormalizada = reporte.primera_imagen 
          ? normalizeImageUrl(
              reporte.primera_imagen.startsWith('http') 
                ? reporte.primera_imagen 
                : buildImageUrl(reporte.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
            )
          : null;

        return {
          ...reporte,
          primera_imagen: primeraImagenNormalizada
        };
      });

      res.json({
        success: true,
        data: reportesNormalizados,
        count: reportesNormalizados.length
      });

    } catch (error) {
      console.error('Error al obtener reportes pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los reportes pendientes',
        error: error.message
      });
    }
  }

  // Resolver un reporte (tomar acción sobre el producto)
  static async resolveReport(req, res) {
    try {
      const { id: report_id } = req.params;
      const { accion, decision_final, nuevo_estado_producto, marcar_peligroso } = req.body;
      const moderador_resolutor_id = req.user.id;

      // Validar datos requeridos
      if (!accion || !['aprobar', 'rechazar', 'suspender', 'eliminar'].includes(accion)) {
        return res.status(400).json({
          success: false,
          message: 'La acción debe ser "aprobar", "rechazar", "suspender" o "eliminar"'
        });
      }

      if (!decision_final || decision_final.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar una explicación de al menos 10 caracteres'
        });
      }

      // Verificar que el reporte existe
      const reporteResult = await query(
        'SELECT * FROM reportes WHERE id = $1',
        [report_id]
      );

      if (reporteResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado'
        });
      }

      const reporte = reporteResult.rows[0];

      // Verificar que el reporte está pendiente
      if (!['pendiente', 'en_revision'].includes(reporte.estado)) {
        return res.status(400).json({
          success: false,
          message: 'Este reporte ya fue resuelto'
        });
      }

      // Determinar nuevo estado del producto según la acción
      let nuevoEstadoProducto;
      let esPeligroso = false;

      switch (accion) {
        case 'aprobar':
          nuevoEstadoProducto = 'activo'; // El reporte era infundado, producto OK
          break;
        case 'rechazar':
          nuevoEstadoProducto = nuevo_estado_producto || 'rechazado';
          break;
        case 'suspender':
          nuevoEstadoProducto = 'suspendido';
          break;
        case 'eliminar':
          nuevoEstadoProducto = 'peligroso';
          esPeligroso = true;
          break;
        default:
          nuevoEstadoProducto = 'suspendido';
      }

      if (marcar_peligroso) {
        esPeligroso = true;
        nuevoEstadoProducto = 'peligroso';
      }

      // Actualizar el reporte
      const nuevoEstadoReporte = accion === 'aprobar' ? 'resuelto' : 'resuelto';
      
      await query(
        `UPDATE reportes 
        SET estado = $1,
            decision_final = $2,
            moderador_resolutor_id = $3,
            fecha_revision = CURRENT_TIMESTAMP,
            fecha_resolucion = CURRENT_TIMESTAMP
        WHERE id = $4`,
        [nuevoEstadoReporte, decision_final, moderador_resolutor_id, report_id]
      );

      // Actualizar el estado del producto
      await query(
        `UPDATE items 
        SET estado = $1, 
            es_peligroso = $2, 
            moderador_revision_id = $3, 
            fecha_revision = CURRENT_TIMESTAMP,
            motivo_rechazo = $4,
            fecha_deteccion_peligroso = ${esPeligroso ? 'CURRENT_TIMESTAMP' : 'NULL'}
        WHERE id = $5`,
        [nuevoEstadoProducto, esPeligroso, moderador_resolutor_id, accion !== 'aprobar' ? decision_final : null, reporte.item_id]
      );

      // Obtener información del producto para obtener el vendedor_id
      const productoResult = await query(
        'SELECT vendedor_id FROM items WHERE id = $1',
        [reporte.item_id]
      );

      // Si se marcó como peligroso, verificar si se debe bloquear la cuenta del vendedor
      if (esPeligroso && productoResult.rows.length > 0 && productoResult.rows[0].vendedor_id) {
        const ProductsController = require('./productsController');
        const bloqueoResult = await ProductsController.verificarYBloquearCuentaPorProductosPeligrosos(productoResult.rows[0].vendedor_id);
        if (bloqueoResult.bloqueado) {
          console.log(`⚠️ Cuenta del vendedor ${productoResult.rows[0].vendedor_id} bloqueada automáticamente por tener ${bloqueoResult.cantidadPeligrosos} productos peligrosos`);
        }
      }

      // Obtener información actualizada
      const reporteActualizado = await query(
        `SELECT 
          r.*,
          i.nombre as producto_nombre,
          i.estado as producto_estado,
          i.es_peligroso,
          u_reportante.nombre as reportante_nombre,
          u_reportante.apellido as reportante_apellido,
          u_reportante.correo as reportante_correo
        FROM reportes r
        INNER JOIN items i ON r.item_id = i.id
        INNER JOIN usuarios u_reportante ON r.usuario_reportador_id = u_reportante.id
        WHERE r.id = $1`,
        [report_id]
      );

      res.json({
        success: true,
        message: `Reporte procesado exitosamente. Producto: ${nuevoEstadoProducto}`,
        data: reporteActualizado.rows[0]
      });

    } catch (error) {
      console.error('Error al resolver reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error al resolver el reporte',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de reportes (para moderadores)
  static async getReportStatistics(req, res) {
    try {
      const stats = await query(`
        SELECT 
          COUNT(*) as total_reportes,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
          COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) as resueltos,
          COUNT(CASE WHEN tipo_reporte = 'contenido_inapropiado' THEN 1 END) as contenido_inapropiado,
          COUNT(CASE WHEN tipo_reporte = 'producto_prohibido' THEN 1 END) as producto_prohibido,
          COUNT(CASE WHEN tipo_reporte = 'informacion_falsa' THEN 1 END) as informacion_falsa
        FROM reportes
      `);

      res.json({
        success: true,
        data: stats.rows[0]
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // Obtener mis reportes (usuario)
  static async getMyReports(req, res) {
    try {
      const usuario_id = req.user.id;

      const result = await query(
        `SELECT 
          r.*,
          i.nombre as producto_nombre,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          u_revisor.nombre as revisor_nombre,
          u_revisor.apellido as revisor_apellido
        FROM reportes r
        INNER JOIN items i ON r.item_id = i.id
        LEFT JOIN usuarios u_revisor ON r.moderador_resolutor_id = u_revisor.id
        WHERE r.usuario_reportador_id = $1
        ORDER BY r.fecha_reporte DESC`,
        [usuario_id]
      );

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Error al obtener mis reportes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tus reportes',
        error: error.message
      });
    }
  }
}

module.exports = ReportsController;

