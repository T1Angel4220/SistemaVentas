const { query } = require('../config/database');
const { config } = require('../config/config');
const { normalizeImageUrl, buildImageUrl } = require('./productsController');

// Controlador de Apelaciones
class AppealsController {
  
  // Crear una nueva apelación para un producto rechazado
  static async createAppeal(req, res) {
    try {
      const { id: item_id } = req.params;
      const { motivo_apelacion, informacion_adicional } = req.body;
      const usuario_apelante_id = req.user.id;

      // Validar datos requeridos
      if (!motivo_apelacion || motivo_apelacion.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: 'El motivo de la apelación debe tener al menos 20 caracteres'
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

      // Verificar que el usuario es el propietario del producto
      if (producto.vendedor_id !== usuario_apelante_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para apelar este producto'
        });
      }

      // Verificar que el producto está rechazado o suspendido (NO peligroso)
      // Los productos peligrosos NO pueden ser apelados debido a la gravedad de la violación
      if (producto.es_peligroso || producto.estado === 'peligroso') {
        return res.status(400).json({
          success: false,
          message: 'Los productos marcados como peligrosos no pueden ser apelados debido a la gravedad de la violación'
        });
      }

      if (producto.estado !== 'rechazado' && producto.estado !== 'suspendido') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden apelar productos rechazados o suspendidos'
        });
      }

      // Verificar si ya existe una apelación pendiente para este producto
      const apelacionExistente = await query(
        'SELECT * FROM apelaciones WHERE item_id = $1 AND estado IN ($2, $3)',
        [item_id, 'en_apelacion', 'pendiente']
      );

      if (apelacionExistente.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una apelación pendiente para este producto'
        });
      }

      // Crear la apelación
      const result = await query(
        `INSERT INTO apelaciones 
        (item_id, usuario_apelante_id, motivo_apelacion, informacion_adicional, estado, fecha_apelacion)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *`,
        [item_id, usuario_apelante_id, motivo_apelacion, informacion_adicional || null, 'en_apelacion']
      );

      // Actualizar el estado del producto a "en_apelacion" si estaba rechazado o suspendido
      if (producto.estado === 'rechazado' || producto.estado === 'suspendido') {
        await query(
          'UPDATE items SET estado = $1 WHERE id = $2',
          ['en_apelacion', item_id]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Apelación creada exitosamente. Será revisada por un moderador.',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error al crear apelación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la apelación',
        error: error.message
      });
    }
  }

  // Obtener apelaciones de un producto específico
  static async getAppealsByProduct(req, res) {
    try {
      const { id: item_id } = req.params;
      const usuario_id = req.user.id;

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
      const esPropietario = producto.vendedor_id === usuario_id;
      const esModerador = ['moderador', 'administrador'].includes(req.user.tipo_usuario);

      if (!esPropietario && !esModerador) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las apelaciones de este producto'
        });
      }

      // Obtener apelaciones del producto con información del apelante y revisor
      const result = await query(
        `SELECT 
          a.*,
          u_apelante.nombre as apelante_nombre,
          u_apelante.apellido as apelante_apellido,
          u_apelante.correo as apelante_correo,
          u_revisor.nombre as revisor_nombre,
          u_revisor.apellido as revisor_apellido
        FROM apelaciones a
        LEFT JOIN usuarios u_apelante ON a.usuario_apelante_id = u_apelante.id
        LEFT JOIN usuarios u_revisor ON a.moderador_revisor_id = u_revisor.id
        WHERE a.item_id = $1
        ORDER BY a.fecha_apelacion DESC`,
        [item_id]
      );

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error al obtener apelaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las apelaciones',
        error: error.message
      });
    }
  }

  // Obtener todas las apelaciones pendientes (para moderadores)
  static async getPendingAppeals(req, res) {
    try {
      // Primero, buscar productos en estado 'en_apelacion' que no tienen apelación
      // y crear apelaciones automáticamente para ellos
      const productosSinApelacion = await query(
        `SELECT i.id, i.vendedor_id
         FROM items i
         WHERE i.estado = 'en_apelacion'
         AND NOT EXISTS (
           SELECT 1 FROM apelaciones a 
           WHERE a.item_id = i.id 
           AND a.estado IN ('en_apelacion', 'pendiente')
         )`
      );

      // Crear apelaciones automáticas para productos que están en en_apelacion pero no tienen registro
      for (const producto of productosSinApelacion.rows) {
        try {
          // Verificar si ya existe una apelación para evitar duplicados
          const existeApelacion = await query(
            'SELECT id FROM apelaciones WHERE item_id = $1',
            [producto.id]
          );

          if (existeApelacion.rows.length === 0) {
            // Solo crear si no existe
            await query(
              `INSERT INTO apelaciones 
              (item_id, usuario_apelante_id, motivo_apelacion, informacion_adicional, estado, fecha_apelacion)
              VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
              [
                producto.id,
                producto.vendedor_id,
                'Producto corregido - requiere revisión',
                'Este producto fue corregido por el vendedor y está en proceso de apelación.',
                'en_apelacion'
              ]
            );
            console.log(`✅ Apelación automática creada para producto ${producto.id}`);
          }
        } catch (error) {
          console.error(`Error al crear apelación automática para producto ${producto.id}:`, error);
        }
      }

      // Ahora obtener todas las apelaciones pendientes (incluyendo las recién creadas)
      const result = await query(
        `SELECT 
          a.*,
          i.nombre as producto_nombre,
          i.descripcion as producto_descripcion,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          i.motivo_rechazo,
          u_apelante.nombre as apelante_nombre,
          u_apelante.apellido as apelante_apellido,
          u_apelante.correo as apelante_correo,
          u_apelante.telefono as apelante_telefono,
          u_vendedor.nombre as vendedor_nombre,
          u_vendedor.apellido as vendedor_apellido,
          u_vendedor.correo as vendedor_correo,
          cat.nombre as categoria_nombre,
          (SELECT url_imagen FROM item_imagenes WHERE item_id = i.id ORDER BY es_principal DESC, orden ASC LIMIT 1) as primera_imagen,
          (SELECT COUNT(*) FROM item_imagenes WHERE item_id = i.id) as total_imagenes
        FROM apelaciones a
        INNER JOIN items i ON a.item_id = i.id
        INNER JOIN usuarios u_apelante ON a.usuario_apelante_id = u_apelante.id
        INNER JOIN usuarios u_vendedor ON i.vendedor_id = u_vendedor.id
        LEFT JOIN categorias cat ON i.categoria_id = cat.id
        WHERE a.estado IN ('en_apelacion', 'pendiente')
        AND i.estado = 'en_apelacion'
        ORDER BY a.fecha_apelacion ASC`
      );

      // Normalizar URLs de imágenes antes de enviar la respuesta
      const apelacionesNormalizadas = result.rows.map(apelacion => {
        const primeraImagenNormalizada = apelacion.primera_imagen 
          ? normalizeImageUrl(
              apelacion.primera_imagen.startsWith('http') 
                ? apelacion.primera_imagen 
                : buildImageUrl(apelacion.primera_imagen.replace('/uploads/', '').replace('/uploads/products/', ''))
            )
          : null;

        return {
          ...apelacion,
          primera_imagen: primeraImagenNormalizada
        };
      });

      res.json({
        success: true,
        data: apelacionesNormalizadas,
        count: apelacionesNormalizadas.length
      });

    } catch (error) {
      console.error('Error al obtener apelaciones pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las apelaciones pendientes',
        error: error.message
      });
    }
  }

  // Resolver una apelación (aprobar o rechazar)
  static async resolveAppeal(req, res) {
    try {
      const { id: appeal_id } = req.params;
      const { decision, decision_apelacion, nuevo_estado_producto } = req.body;
      const moderador_revisor_id = req.user.id;

      // Validar datos requeridos
      if (!decision || !['aprobar', 'rechazar'].includes(decision)) {
        return res.status(400).json({
          success: false,
          message: 'La decisión debe ser "aprobar" o "rechazar"'
        });
      }

      if (!decision_apelacion || decision_apelacion.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar una explicación de al menos 10 caracteres'
        });
      }

      // Verificar que la apelación existe
      const apelacionResult = await query(
        'SELECT * FROM apelaciones WHERE id = $1',
        [appeal_id]
      );

      if (apelacionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Apelación no encontrada'
        });
      }

      const apelacion = apelacionResult.rows[0];

      // Verificar que la apelación está pendiente
      if (!['en_apelacion', 'pendiente'].includes(apelacion.estado)) {
        return res.status(400).json({
          success: false,
          message: 'Esta apelación ya fue resuelta'
        });
      }

      // Determinar nuevo estado
      let nuevoEstadoApelacion = decision === 'aprobar' ? 'resuelto' : 'rechazado';
      let nuevoEstadoProducto = nuevo_estado_producto || (decision === 'aprobar' ? 'activo' : 'rechazado');

      // Actualizar la apelación
      await query(
        `UPDATE apelaciones 
        SET estado = $1,
            decision_apelacion = $2,
            moderador_revisor_id = $3,
            fecha_revision_apelacion = CURRENT_TIMESTAMP,
            fecha_resolucion_apelacion = CURRENT_TIMESTAMP
        WHERE id = $4`,
        [nuevoEstadoApelacion, decision_apelacion, moderador_revisor_id, appeal_id]
      );

      // Actualizar el estado del producto
      // Si se aprueba, también activar la disponibilidad
      const disponibilidad = decision === 'aprobar' ? true : null;
      
      if (decision === 'aprobar') {
        // Al aprobar: cambiar estado, limpiar errores, y activar disponibilidad
        await query(
          `UPDATE items 
          SET estado = $1, 
              moderador_revision_id = $2, 
              fecha_revision = CURRENT_TIMESTAMP,
              motivo_rechazo = NULL,
              es_peligroso = FALSE,
              disponibilidad = TRUE
          WHERE id = $3`,
          [nuevoEstadoProducto, moderador_revisor_id, apelacion.item_id]
        );
      } else {
        // Al rechazar: solo cambiar estado
        await query(
          `UPDATE items 
          SET estado = $1, 
              moderador_revision_id = $2, 
              fecha_revision = CURRENT_TIMESTAMP
          WHERE id = $3`,
          [nuevoEstadoProducto, moderador_revisor_id, apelacion.item_id]
        );
      }

      // Obtener información actualizada
      const apelacionActualizada = await query(
        `SELECT 
          a.*,
          i.nombre as producto_nombre,
          i.estado as producto_estado,
          u_apelante.nombre as apelante_nombre,
          u_apelante.apellido as apelante_apellido,
          u_apelante.correo as apelante_correo
        FROM apelaciones a
        INNER JOIN items i ON a.item_id = i.id
        INNER JOIN usuarios u_apelante ON a.usuario_apelante_id = u_apelante.id
        WHERE a.id = $1`,
        [appeal_id]
      );

      res.json({
        success: true,
        message: `Apelación ${decision === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`,
        data: apelacionActualizada.rows[0]
      });

    } catch (error) {
      console.error('Error al resolver apelación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al resolver la apelación',
        error: error.message
      });
    }
  }

  // Obtener apelaciones de un usuario (vendedor)
  static async getMyAppeals(req, res) {
    try {
      const usuario_id = req.user.id;

      const result = await query(
        `SELECT 
          a.*,
          i.nombre as producto_nombre,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          u_revisor.nombre as revisor_nombre,
          u_revisor.apellido as revisor_apellido
        FROM apelaciones a
        INNER JOIN items i ON a.item_id = i.id
        LEFT JOIN usuarios u_revisor ON a.moderador_revisor_id = u_revisor.id
        WHERE a.usuario_apelante_id = $1
        ORDER BY a.fecha_apelacion DESC`,
        [usuario_id]
      );

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Error al obtener mis apelaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tus apelaciones',
        error: error.message
      });
    }
  }
}

module.exports = AppealsController;

