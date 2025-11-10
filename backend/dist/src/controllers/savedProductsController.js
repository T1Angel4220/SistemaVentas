"use strict";
const { query } = require('../config/database');
const { config } = require('../config/config');
// Controlador de productos guardados (favoritos)
class SavedProductsController {
    // Guardar producto como favorito
    static async saveProduct(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            // Verificar que el producto existe
            const productoExistente = await query('SELECT * FROM items WHERE id = $1 AND estado = $2', [id, 'activo']);
            if (productoExistente.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado o no disponible'
                });
            }
            // Verificar que no esté ya guardado
            const yaGuardado = await query('SELECT id FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2', [usuario_id, id]);
            if (yaGuardado.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El producto ya está en tus favoritos'
                });
            }
            // Guardar producto
            const productoGuardado = await query(`INSERT INTO productos_guardados (usuario_id, item_id)
         VALUES ($1, $2)
         RETURNING *`, [usuario_id, id]);
            res.status(201).json({
                success: true,
                message: 'Producto guardado en favoritos',
                data: productoGuardado.rows[0]
            });
        }
        catch (error) {
            console.error('Error al guardar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Quitar producto de favoritos
    static async unsaveProduct(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            // Verificar que el producto esté guardado
            const productoGuardado = await query('SELECT * FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2', [usuario_id, id]);
            if (productoGuardado.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'El producto no está en tus favoritos'
                });
            }
            // Eliminar de favoritos
            await query('DELETE FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2', [usuario_id, id]);
            res.json({
                success: true,
                message: 'Producto eliminado de favoritos'
            });
        }
        catch (error) {
            console.error('Error al quitar producto de favoritos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Obtener productos guardados del usuario
    static async getSavedProducts(req, res) {
        try {
            const usuario_id = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            // Calcular offset para paginación
            const offset = (page - 1) * limit;
            const productosGuardados = await query(`SELECT 
          pg.id as favorito_id,
          pg.fecha_guardado,
          i.id, i.codigo, i.nombre, i.descripcion, i.precio, 
          i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion,
          c.nombre as categoria_nombre,
          u.nombre || ' ' || u.apellido as vendedor_nombre,
          ub.nombre as ubicacion_nombre,
          COUNT(ii.id) as total_imagenes
        FROM productos_guardados pg
        JOIN items i ON pg.item_id = i.id
        JOIN categorias c ON i.categoria_id = c.id
        JOIN usuarios u ON i.vendedor_id = u.id
        LEFT JOIN ubicaciones ub ON i.ubicacion_id = ub.id
        LEFT JOIN item_imagenes ii ON i.id = ii.item_id
        WHERE pg.usuario_id = $1 AND i.estado = 'activo'
        GROUP BY pg.id, pg.fecha_guardado, i.id, i.codigo, i.nombre, i.descripcion, 
                 i.precio, i.tipo, i.estado, i.disponibilidad, i.fecha_publicacion,
                 c.nombre, u.nombre, u.apellido, ub.nombre
        ORDER BY pg.fecha_guardado DESC
        LIMIT $2 OFFSET $3`, [usuario_id, limit, offset]);
            // Contar total para paginación
            const totalCount = await query(`SELECT COUNT(*) as total
         FROM productos_guardados pg
         JOIN items i ON pg.item_id = i.id
         WHERE pg.usuario_id = $1 AND i.estado = 'activo'`, [usuario_id]);
            const total = parseInt(totalCount.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            res.json({
                success: true,
                data: productosGuardados.rows,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: parseInt(limit),
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            });
        }
        catch (error) {
            console.error('Error al obtener productos guardados:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Verificar si un producto está guardado
    static async checkIfSaved(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            const productoGuardado = await query('SELECT id, fecha_guardado FROM productos_guardados WHERE usuario_id = $1 AND item_id = $2', [usuario_id, id]);
            res.json({
                success: true,
                data: {
                    is_saved: productoGuardado.rows.length > 0,
                    saved_at: productoGuardado.rows.length > 0 ? productoGuardado.rows[0].fecha_guardado : null
                }
            });
        }
        catch (error) {
            console.error('Error al verificar producto guardado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Obtener estadísticas de productos guardados
    static async getSavedProductsStats(req, res) {
        try {
            const usuario_id = req.user.id;
            const estadisticas = await query(`SELECT 
          COUNT(*) as total_favoritos,
          COUNT(CASE WHEN i.tipo = 'producto' THEN 1 END) as productos_fisicos,
          COUNT(CASE WHEN i.tipo = 'servicio' THEN 1 END) as servicios,
          COUNT(CASE WHEN i.disponibilidad = true THEN 1 END) as disponibles,
          COUNT(CASE WHEN i.disponibilidad = false THEN 1 END) as no_disponibles,
          AVG(i.precio) as precio_promedio,
          MIN(i.precio) as precio_minimo,
          MAX(i.precio) as precio_maximo
        FROM productos_guardados pg
        JOIN items i ON pg.item_id = i.id
        WHERE pg.usuario_id = $1 AND i.estado = 'activo'`, [usuario_id]);
            res.json({
                success: true,
                data: estadisticas.rows[0]
            });
        }
        catch (error) {
            console.error('Error al obtener estadísticas de favoritos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
}
module.exports = SavedProductsController;
