const { query } = require('../config/database');

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

      // Verificar si el producto puede ser apelado
      // Puede ser apelado si está rechazado, suspendido, o si hay un reporte resuelto que resultó en rechazo/suspensión
      let puedeApelar = producto.estado === 'rechazado' || producto.estado === 'suspendido';
      
      // Verificar si hay reportes resueltos que resultaron en rechazo/suspensión
      if (!puedeApelar) {
        const reportesResueltos = await query(
          `SELECT * FROM reportes 
           WHERE item_id = $1 
           AND estado = 'resuelto' 
           AND (decision_final LIKE '%rechazado%' OR decision_final LIKE '%suspendido%' OR decision_final LIKE '%peligroso%')
           ORDER BY fecha_resolucion DESC
           LIMIT 1`,
          [item_id]
        );
        
        if (reportesResueltos.rows.length > 0) {
          puedeApelar = true;
        }
      }

      if (!puedeApelar) {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden apelar productos rechazados, suspendidos o decisiones de reportes que resultaron en rechazo/suspensión'
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

      // Buscar el reporte más reciente resuelto que resultó en rechazo/suspensión/peligroso (si aplica)
      // La estrategia es buscar reportes resueltos que:
      // 1. Tengan una acción de moderación asociada que cambió el estado del producto
      // 2. O que coincidan con el estado actual del producto por fecha y decisión
      let reporte_id = null;
      
      if (producto.estado === 'rechazado' || producto.estado === 'suspendido' || producto.estado === 'peligroso') {
        // Primero, buscar reportes resueltos que tienen una acción de moderación asociada
        // y que coincidan con el estado actual del producto
        const reporteConAccion = await query(
          `SELECT DISTINCT r.id, r.fecha_resolucion
           FROM reportes r
           INNER JOIN acciones_moderacion am ON am.registro_id = r.item_id 
           WHERE r.item_id = $1 
           AND r.estado = 'resuelto'
           AND am.tabla_afectada = 'items'
           AND (
             ($2 = 'rechazado' AND am.accion = 'moderar_producto_rechazar') OR
             ($2 = 'suspendido' AND am.accion = 'moderar_producto_suspender') OR
             ($2 = 'peligroso' AND am.accion = 'moderar_producto_marcar_peligroso')
           )
           AND am.fecha_accion >= r.fecha_resolucion - INTERVAL '1 hour'
           AND am.fecha_accion <= r.fecha_resolucion + INTERVAL '1 hour'
           ORDER BY r.fecha_resolucion DESC
           LIMIT 1`,
          [item_id, producto.estado]
        );

        if (reporteConAccion.rows.length > 0) {
          reporte_id = reporteConAccion.rows[0].id;
          console.log(`📝 Apelación asociada al reporte ID: ${reporte_id} (por acción de moderación con coincidencia de fecha)`);
        } else {
          // Si no se encuentra con fecha exacta, buscar el reporte más reciente resuelto
          // que tenga el mismo moderador_resolutor_id que el moderador_revision_id del producto
          // y que sea anterior o cercano a la fecha_revision del producto
          const reportePorModerador = await query(
            `SELECT r.id 
             FROM reportes r
             WHERE r.item_id = $1 
             AND r.estado = 'resuelto'
             AND r.moderador_resolutor_id = $2
             AND (r.fecha_resolucion <= COALESCE($3, CURRENT_TIMESTAMP))
             ORDER BY r.fecha_resolucion DESC
             LIMIT 1`,
            [item_id, producto.moderador_revision_id, producto.fecha_revision]
          );

          if (reportePorModerador.rows.length > 0) {
            reporte_id = reportePorModerador.rows[0].id;
            console.log(`📝 Apelación asociada al reporte ID: ${reporte_id} (por moderador y fecha)`);
          } else {
            // Buscar el reporte más reciente resuelto que tenga una decisión relacionada
            const reportePorDecision = await query(
              `SELECT id 
               FROM reportes 
               WHERE item_id = $1 
               AND estado = 'resuelto'
               AND (
                 decision_final ILIKE '%rechazado%' OR 
                 decision_final ILIKE '%suspendido%' OR 
                 decision_final ILIKE '%peligroso%'
               )
               ORDER BY fecha_resolucion DESC
               LIMIT 1`,
              [item_id]
            );
            
            if (reportePorDecision.rows.length > 0) {
              reporte_id = reportePorDecision.rows[0].id;
              console.log(`📝 Apelación asociada al reporte ID: ${reporte_id} (por contenido de decision_final)`);
            } else {
              // Como último recurso, buscar cualquier reporte resuelto para este producto
              // que haya sido resuelto antes o cerca de la fecha de revisión del producto
              const reporteCualquiera = await query(
                `SELECT id 
                 FROM reportes 
                 WHERE item_id = $1 
                 AND estado = 'resuelto'
                 AND (fecha_resolucion <= COALESCE($2, CURRENT_TIMESTAMP) OR fecha_resolucion <= CURRENT_TIMESTAMP)
                 ORDER BY fecha_resolucion DESC
                 LIMIT 1`,
                [item_id, producto.fecha_revision]
              );
              
              if (reporteCualquiera.rows.length > 0) {
                reporte_id = reporteCualquiera.rows[0].id;
                console.log(`📝 Apelación asociada al reporte ID: ${reporte_id} (último reporte resuelto antes/cerca de fecha_revision)`);
              } else {
                // Última opción: cualquier reporte resuelto para este producto
                const ultimoReporte = await query(
                  `SELECT id 
                   FROM reportes 
                   WHERE item_id = $1 
                   AND estado = 'resuelto'
                   ORDER BY fecha_resolucion DESC
                   LIMIT 1`,
                  [item_id]
                );
                
                if (ultimoReporte.rows.length > 0) {
                  reporte_id = ultimoReporte.rows[0].id;
                  console.log(`📝 Apelación asociada al reporte ID: ${reporte_id} (último reporte resuelto en general)`);
                }
              }
            }
          }
        }
      }

      // Crear la apelación (puede estar asociada a un reporte o directamente al producto)
      // Asegurar que reporte_id sea null si no se encontró ningún reporte
      const reporteIdFinal = reporte_id || null;
      
      console.log(`📝 Creando apelación para producto ${item_id}:`);
      console.log(`   → reporte_id: ${reporteIdFinal} ${reporteIdFinal ? '(asociado a reporte)' : '(sin reporte asociado)'}`);
      console.log(`   → usuario_apelante_id: ${usuario_apelante_id}`);
      console.log(`   → motivo_apelacion: ${motivo_apelacion.substring(0, 50)}...`);
      
      const result = await query(
        `INSERT INTO apelaciones 
        (item_id, reporte_id, usuario_apelante_id, motivo_apelacion, informacion_adicional, estado, fecha_apelacion)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *`,
        [item_id, reporteIdFinal, usuario_apelante_id, motivo_apelacion, informacion_adicional || null, 'en_apelacion']
      );
      
      console.log(`✅ Apelación creada exitosamente con ID: ${result.rows[0].id}`);
      console.log(`   → reporte_id guardado: ${result.rows[0].reporte_id || 'NULL'}`);

      // Actualizar el estado del producto a "en_apelacion" si estaba rechazado o suspendido
      if (producto.estado === 'rechazado' || producto.estado === 'suspendido') {
        try {
          await query(
            'UPDATE items SET estado = $1 WHERE id = $2',
            ['en_apelacion', item_id]
          );
        } catch (enumError) {
          if (enumError.code === '22P02') {
            console.warn('⚠️ El estado "en_apelacion" no existe en enum estado_item. Se mantiene el estado original.');
          } else {
            throw enumError;
          }
        }
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
          a.id,
          a.reporte_id,
          a.item_id,
          a.usuario_apelante_id,
          a.motivo_apelacion,
          a.informacion_adicional,
          a.estado,
          TO_CHAR(a.fecha_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') as fecha_apelacion,
          CASE WHEN a.fecha_revision_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_revision_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_revision_apelacion,
          a.moderador_revisor_id,
          a.decision_apelacion,
          CASE WHEN a.fecha_resolucion_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_resolucion_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_resolucion_apelacion,
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
  // También incluir productos rechazados/suspendidos que pueden ser apelados pero aún no tienen apelación
  static async getPendingAppeals(req, res) {
    try {
      // Primero obtener apelaciones existentes
      const apelacionesExistentes = await query(
        `        SELECT 
          a.id,
          a.reporte_id,
          a.item_id,
          a.usuario_apelante_id,
          a.motivo_apelacion,
          a.informacion_adicional,
          a.estado,
          TO_CHAR(a.fecha_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') as fecha_apelacion,
          CASE WHEN a.fecha_revision_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_revision_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_revision_apelacion,
          a.moderador_revisor_id,
          a.decision_apelacion,
          CASE WHEN a.fecha_resolucion_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_resolucion_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_resolucion_apelacion,
          i.nombre as producto_nombre,
          i.descripcion as producto_descripcion,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          i.motivo_rechazo,
          i.moderador_revision_id,
          u_apelante.nombre as apelante_nombre,
          u_apelante.apellido as apelante_apellido,
          u_apelante.correo as apelante_correo,
          u_apelante.telefono as apelante_telefono,
          u_vendedor.nombre as vendedor_nombre,
          u_vendedor.apellido as vendedor_apellido,
          u_vendedor.correo as vendedor_correo,
          u_moderador_original.nombre as moderador_original_nombre,
          u_moderador_original.apellido as moderador_original_apellido,
          cat.nombre as categoria_nombre,
          (SELECT url_imagen FROM item_imagenes WHERE item_id = i.id ORDER BY es_principal DESC, orden ASC LIMIT 1) as primera_imagen,
          (SELECT COUNT(*) FROM item_imagenes WHERE item_id = i.id) as total_imagenes,
          'apelacion_existente' as tipo_registro
        FROM apelaciones a
        INNER JOIN items i ON a.item_id = i.id
        INNER JOIN usuarios u_apelante ON a.usuario_apelante_id = u_apelante.id
        INNER JOIN usuarios u_vendedor ON i.vendedor_id = u_vendedor.id
        LEFT JOIN usuarios u_moderador_original ON i.moderador_revision_id = u_moderador_original.id
        LEFT JOIN categorias cat ON i.categoria_id = cat.id
        WHERE a.estado IN ('en_apelacion', 'pendiente')
        ORDER BY a.fecha_apelacion ASC`
      );

      // También obtener productos rechazados/suspendidos que pueden ser apelados pero aún no tienen apelación
      const productosPendientesApelacion = await query(
        `SELECT 
          NULL as id,
          NULL as reporte_id,
          i.id as item_id,
          i.vendedor_id as usuario_apelante_id,
          NULL as motivo_apelacion,
          NULL as informacion_adicional,
          'pendiente_apelacion' as estado,
          NULL as fecha_apelacion,
          NULL as fecha_revision_apelacion,
          NULL as moderador_revisor_id,
          NULL as decision_apelacion,
          NULL as fecha_resolucion_apelacion,
          i.nombre as producto_nombre,
          i.descripcion as producto_descripcion,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          i.motivo_rechazo,
          i.moderador_revision_id,
          u_vendedor.nombre as apelante_nombre,
          u_vendedor.apellido as apelante_apellido,
          u_vendedor.correo as apelante_correo,
          u_vendedor.telefono as apelante_telefono,
          u_vendedor.nombre as vendedor_nombre,
          u_vendedor.apellido as vendedor_apellido,
          u_vendedor.correo as vendedor_correo,
          u_moderador_original.nombre as moderador_original_nombre,
          u_moderador_original.apellido as moderador_original_apellido,
          cat.nombre as categoria_nombre,
          (SELECT url_imagen FROM item_imagenes WHERE item_id = i.id ORDER BY es_principal DESC, orden ASC LIMIT 1) as primera_imagen,
          (SELECT COUNT(*) FROM item_imagenes WHERE item_id = i.id) as total_imagenes,
          'producto_pendiente_apelacion' as tipo_registro
        FROM items i
        INNER JOIN usuarios u_vendedor ON i.vendedor_id = u_vendedor.id
        LEFT JOIN usuarios u_moderador_original ON i.moderador_revision_id = u_moderador_original.id
        LEFT JOIN categorias cat ON i.categoria_id = cat.id
        WHERE (i.estado = 'rechazado' OR i.estado = 'suspendido')
        AND i.es_peligroso = FALSE
        AND i.estado != 'peligroso'
        AND NOT EXISTS (
          SELECT 1 FROM apelaciones a2 
          WHERE a2.item_id = i.id 
          AND a2.estado IN ('en_apelacion', 'pendiente')
        )
        ORDER BY i.fecha_revision DESC`
      );

      // Combinar ambos resultados
      const allResults = [
        ...apelacionesExistentes.rows,
        ...productosPendientesApelacion.rows
      ];

      res.json({
        success: true,
        data: allResults,
        count: allResults.length
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

      // ✅ VALIDACIÓN CRÍTICA: Verificar que el moderador que revisa NO sea el mismo que rechazó/suspendió el producto
      // Obtener información del producto para ver quién lo rechazó/suspendió originalmente
      const productoResult = await query(
        'SELECT moderador_revision_id FROM items WHERE id = $1',
        [apelacion.item_id]
      );

      if (productoResult.rows.length > 0) {
        const producto = productoResult.rows[0];
        const moderador_original_id = producto.moderador_revision_id;

        // Si hay un moderador que rechazó/suspendió originalmente, verificar que NO sea el mismo
        if (moderador_original_id && moderador_original_id === moderador_revisor_id) {
          return res.status(403).json({
            success: false,
            message: 'No puedes revisar una apelación de un producto que tú mismo rechazaste o suspendiste. La apelación debe ser revisada por un moderador diferente.'
          });
        }
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
        // NO actualizar moderador_revision_id - debe mantener al moderador original que rechazó/suspendió
        await query(
          `UPDATE items 
          SET estado = $1, 
              fecha_revision = CURRENT_TIMESTAMP,
              motivo_rechazo = NULL,
              es_peligroso = FALSE,
              disponibilidad = TRUE
          WHERE id = $2`,
          [nuevoEstadoProducto, apelacion.item_id]
        );
      } else {
        // Al rechazar: solo cambiar estado
        // NO actualizar moderador_revision_id - debe mantener al moderador original que rechazó/suspendió
        await query(
          `UPDATE items 
          SET estado = $1, 
              fecha_revision = CURRENT_TIMESTAMP
          WHERE id = $2`,
          [nuevoEstadoProducto, apelacion.item_id]
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
          a.id,
          a.reporte_id,
          a.item_id,
          a.usuario_apelante_id,
          a.motivo_apelacion,
          a.informacion_adicional,
          a.estado,
          TO_CHAR(a.fecha_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') as fecha_apelacion,
          CASE WHEN a.fecha_revision_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_revision_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_revision_apelacion,
          a.moderador_revisor_id,
          a.decision_apelacion,
          CASE WHEN a.fecha_resolucion_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_resolucion_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_resolucion_apelacion,
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

  // Obtener historial completo de apelaciones (para moderadores - todas las apelaciones)
  static async getAllAppeals(req, res) {
    try {
      const { estado, fecha_desde, fecha_hasta } = req.query;
      
      let queryText = `
        SELECT 
          a.id,
          a.reporte_id,
          a.item_id,
          a.usuario_apelante_id,
          a.motivo_apelacion,
          a.informacion_adicional,
          a.estado,
          TO_CHAR(a.fecha_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') as fecha_apelacion,
          CASE WHEN a.fecha_revision_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_revision_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_revision_apelacion,
          a.moderador_revisor_id,
          a.decision_apelacion,
          CASE WHEN a.fecha_resolucion_apelacion IS NOT NULL THEN TO_CHAR(a.fecha_resolucion_apelacion, 'YYYY-MM-DD HH24:MI:SS.MS') ELSE NULL END as fecha_resolucion_apelacion,
          i.nombre as producto_nombre,
          i.descripcion as producto_descripcion,
          i.codigo as producto_codigo,
          i.tipo as producto_tipo,
          i.estado as producto_estado,
          i.motivo_rechazo,
          i.moderador_revision_id,
          u_apelante.nombre as apelante_nombre,
          u_apelante.apellido as apelante_apellido,
          u_apelante.correo as apelante_correo,
          u_apelante.telefono as apelante_telefono,
          u_vendedor.nombre as vendedor_nombre,
          u_vendedor.apellido as vendedor_apellido,
          u_vendedor.correo as vendedor_correo,
          u_revisor.nombre as revisor_nombre,
          u_revisor.apellido as revisor_apellido,
          u_moderador_original.nombre as moderador_original_nombre,
          u_moderador_original.apellido as moderador_original_apellido,
          cat.nombre as categoria_nombre,
          (SELECT url_imagen FROM item_imagenes WHERE item_id = i.id ORDER BY es_principal DESC, orden ASC LIMIT 1) as primera_imagen,
          (SELECT COUNT(*) FROM item_imagenes WHERE item_id = i.id) as total_imagenes
        FROM apelaciones a
        INNER JOIN items i ON a.item_id = i.id
        INNER JOIN usuarios u_apelante ON a.usuario_apelante_id = u_apelante.id
        INNER JOIN usuarios u_vendedor ON i.vendedor_id = u_vendedor.id
        LEFT JOIN usuarios u_revisor ON a.moderador_revisor_id = u_revisor.id
        LEFT JOIN usuarios u_moderador_original ON i.moderador_revision_id = u_moderador_original.id
        LEFT JOIN categorias cat ON i.categoria_id = cat.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 1;

      // Filtrar por estado si se proporciona
      if (estado) {
        queryText += ` AND a.estado = $${paramCount}`;
        params.push(estado);
        paramCount++;
      }

      // Filtrar por fecha desde
      if (fecha_desde) {
        queryText += ` AND a.fecha_apelacion >= $${paramCount}`;
        params.push(fecha_desde);
        paramCount++;
      }

      // Filtrar por fecha hasta
      if (fecha_hasta) {
        queryText += ` AND a.fecha_apelacion <= $${paramCount}`;
        params.push(fecha_hasta);
        paramCount++;
      }

      queryText += ` ORDER BY a.fecha_apelacion DESC`;

      const result = await query(queryText, params);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Error al obtener historial de apelaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el historial de apelaciones',
        error: error.message
      });
    }
  }
}

module.exports = AppealsController;

