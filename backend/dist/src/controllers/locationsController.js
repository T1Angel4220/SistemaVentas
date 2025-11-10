"use strict";
const { query } = require('../config/database');
const { config } = require('../config/config');
// Controlador de ubicaciones
class LocationsController {
    // Obtener todas las ubicaciones activas
    static async getLocations(req, res) {
        try {
            const { provincia, canton, activa = true, page = 1, limit = 20, search } = req.query;
            let whereConditions = ['activa = $1'];
            let queryParams = [activa];
            let paramCount = 1;
            // Construir condiciones dinámicas
            if (provincia) {
                paramCount++;
                whereConditions.push(`provincia ILIKE $${paramCount}`);
                queryParams.push(`%${provincia}%`);
            }
            if (canton) {
                paramCount++;
                whereConditions.push(`canton ILIKE $${paramCount}`);
                queryParams.push(`%${canton}%`);
            }
            if (search) {
                paramCount++;
                whereConditions.push(`(nombre ILIKE $${paramCount} OR provincia ILIKE $${paramCount} OR canton ILIKE $${paramCount})`);
                queryParams.push(`%${search}%`);
            }
            const whereClause = whereConditions.join(' AND ');
            // Calcular offset para paginación
            const offset = (page - 1) * limit;
            paramCount++;
            queryParams.push(limit);
            paramCount++;
            queryParams.push(offset);
            const ubicaciones = await query(`SELECT id, nombre, provincia, canton, activa, fecha_creacion
         FROM ubicaciones 
         WHERE ${whereClause}
         ORDER BY provincia, canton, nombre
         LIMIT $${paramCount - 1} OFFSET $${paramCount}`, queryParams);
            // Contar total para paginación
            const totalCount = await query(`SELECT COUNT(*) as total
         FROM ubicaciones 
         WHERE ${whereClause}`, queryParams.slice(0, -2));
            const total = parseInt(totalCount.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            res.json({
                success: true,
                data: ubicaciones.rows,
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
            console.error('Error al obtener ubicaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Obtener ubicación específica por ID
    static async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const ubicacion = await query('SELECT * FROM ubicaciones WHERE id = $1', [id]);
            if (ubicacion.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ubicación no encontrada'
                });
            }
            res.json({
                success: true,
                data: ubicacion.rows[0]
            });
        }
        catch (error) {
            console.error('Error al obtener ubicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Crear nueva ubicación (solo administradores)
    static async createLocation(req, res) {
        try {
            const { nombre, provincia, canton } = req.body;
            // Validar datos requeridos
            if (!nombre || !provincia) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre y la provincia son requeridos'
                });
            }
            // Verificar que no exista una ubicación similar
            const ubicacionExistente = await query(`SELECT id FROM ubicaciones 
         WHERE nombre = $1 AND provincia = $2 
         AND (canton = $3 OR canton IS NULL)`, [nombre, provincia, canton]);
            if (ubicacionExistente.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una ubicación similar'
                });
            }
            // Crear ubicación
            const nuevaUbicacion = await query(`INSERT INTO ubicaciones (nombre, provincia, canton, activa)
         VALUES ($1, $2, $3, true)
         RETURNING *`, [nombre, provincia, canton]);
            res.status(201).json({
                success: true,
                message: 'Ubicación creada exitosamente',
                data: nuevaUbicacion.rows[0]
            });
        }
        catch (error) {
            console.error('Error al crear ubicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Actualizar ubicación (solo administradores)
    static async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const { nombre, provincia, canton, activa } = req.body;
            // Verificar que la ubicación existe
            const ubicacionExistente = await query('SELECT * FROM ubicaciones WHERE id = $1', [id]);
            if (ubicacionExistente.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ubicación no encontrada'
                });
            }
            // Si se están cambiando datos, verificar que no exista otra similar
            if (nombre || provincia || canton) {
                const ubicacionSimilar = await query(`SELECT id FROM ubicaciones 
           WHERE nombre = $1 AND provincia = $2 
           AND (canton = $3 OR canton IS NULL)
           AND id != $4`, [nombre || ubicacionExistente.rows[0].nombre,
                    provincia || ubicacionExistente.rows[0].provincia,
                    canton || ubicacionExistente.rows[0].canton,
                    id]);
                if (ubicacionSimilar.rows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe una ubicación similar'
                    });
                }
            }
            // Actualizar ubicación
            const ubicacionActualizada = await query(`UPDATE ubicaciones SET 
          nombre = COALESCE($1, nombre),
          provincia = COALESCE($2, provincia),
          canton = COALESCE($3, canton),
          activa = COALESCE($4, activa)
        WHERE id = $5
        RETURNING *`, [nombre, provincia, canton, activa, id]);
            res.json({
                success: true,
                message: 'Ubicación actualizada exitosamente',
                data: ubicacionActualizada.rows[0]
            });
        }
        catch (error) {
            console.error('Error al actualizar ubicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Eliminar ubicación (solo administradores)
    static async deleteLocation(req, res) {
        try {
            const { id } = req.params;
            // Verificar que la ubicación existe
            const ubicacionExistente = await query('SELECT * FROM ubicaciones WHERE id = $1', [id]);
            if (ubicacionExistente.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ubicación no encontrada'
                });
            }
            // Verificar que no haya productos usando esta ubicación
            const productosConUbicacion = await query('SELECT COUNT(*) as total FROM items WHERE ubicacion_id = $1', [id]);
            if (parseInt(productosConUbicacion.rows[0].total) > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar una ubicación que tiene productos asociados'
                });
            }
            // Eliminar ubicación
            await query('DELETE FROM ubicaciones WHERE id = $1', [id]);
            res.json({
                success: true,
                message: 'Ubicación eliminada exitosamente'
            });
        }
        catch (error) {
            console.error('Error al eliminar ubicación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Obtener estadísticas de ubicaciones
    static async getLocationStats(req, res) {
        try {
            const estadisticas = await query(`SELECT 
          provincia,
          COUNT(*) as total_ubicaciones,
          COUNT(CASE WHEN activa = true THEN 1 END) as ubicaciones_activas,
          COUNT(DISTINCT canton) as cantones_distintos
        FROM ubicaciones
        GROUP BY provincia
        ORDER BY total_ubicaciones DESC`);
            res.json({
                success: true,
                data: estadisticas.rows
            });
        }
        catch (error) {
            console.error('Error al obtener estadísticas de ubicaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Obtener provincias disponibles
    static async getProvinces(req, res) {
        try {
            const provincias = await query(`SELECT DISTINCT provincia 
         FROM ubicaciones 
         WHERE provincia IS NOT NULL AND activa = true
         ORDER BY provincia`);
            res.json({
                success: true,
                data: provincias.rows.map(row => row.provincia)
            });
        }
        catch (error) {
            console.error('Error al obtener provincias:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
    // Obtener cantones por provincia
    static async getCantonsByProvince(req, res) {
        try {
            const { provincia } = req.params;
            const cantones = await query(`SELECT DISTINCT canton 
         FROM ubicaciones 
         WHERE provincia = $1 AND canton IS NOT NULL AND activa = true
         ORDER BY canton`, [provincia]);
            res.json({
                success: true,
                data: cantones.rows.map(row => row.canton)
            });
        }
        catch (error) {
            console.error('Error al obtener cantones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: config.server.nodeEnv === 'development' ? error.message : {}
            });
        }
    }
}
module.exports = LocationsController;
