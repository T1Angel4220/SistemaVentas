const { query } = require('../config/database');
const { config } = require('../config/config');

// Controlador de categorías
class CategoriesController {
  
  // Obtener todas las categorías activas
  static async getCategories(req, res) {
    try {
      const { activa = true } = req.query;

      const categorias = await query(
        `SELECT id, nombre, descripcion, activa, fecha_creacion, 
                categoria_padre_id, nivel, orden
         FROM categorias 
         WHERE activa = $1
         ORDER BY nivel ASC, orden ASC, nombre ASC`,
        [activa]
      );

      res.json({
        success: true,
        data: categorias.rows
      });

    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener categoría específica por ID
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const categoria = await query(
        'SELECT * FROM categorias WHERE id = $1',
        [id]
      );

      if (categoria.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      res.json({
        success: true,
        data: categoria.rows[0]
      });

    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Crear nueva categoría (solo administradores)
  static async createCategory(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      // Validar datos requeridos
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la categoría es requerido'
        });
      }

      // Verificar que el nombre sea único
      const categoriaExistente = await query(
        'SELECT id FROM categorias WHERE nombre = $1',
        [nombre]
      );

      if (categoriaExistente.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }

      // Crear categoría
      const nuevaCategoria = await query(
        `INSERT INTO categorias (nombre, descripcion, activa)
         VALUES ($1, $2, true)
         RETURNING *`,
        [nombre, descripcion]
      );

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: nuevaCategoria.rows[0]
      });

    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Actualizar categoría (solo administradores)
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activa } = req.body;

      // Verificar que la categoría existe
      const categoriaExistente = await query(
        'SELECT * FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Si se está cambiando el nombre, verificar que sea único
      if (nombre && nombre !== categoriaExistente.rows[0].nombre) {
        const nombreExistente = await query(
          'SELECT id FROM categorias WHERE nombre = $1 AND id != $2',
          [nombre, id]
        );

        if (nombreExistente.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con ese nombre'
          });
        }
      }

      // Actualizar categoría
      const categoriaActualizada = await query(
        `UPDATE categorias SET 
          nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          activa = COALESCE($3, activa)
        WHERE id = $4
        RETURNING *`,
        [nombre, descripcion, activa, id]
      );

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoriaActualizada.rows[0]
      });

    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Eliminar categoría (solo administradores)
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la categoría existe
      const categoriaExistente = await query(
        'SELECT * FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Verificar que no haya productos usando esta categoría
      const productosConCategoria = await query(
        'SELECT COUNT(*) as total FROM items WHERE categoria_id = $1',
        [id]
      );

      if (parseInt(productosConCategoria.rows[0].total) > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar una categoría que tiene productos asociados'
        });
      }

      // Eliminar categoría
      await query('DELETE FROM categorias WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener estadísticas de categorías
  static async getCategoryStats(req, res) {
    try {
      const estadisticas = await query(
        `SELECT 
          c.id,
          c.nombre,
          c.descripcion,
          COUNT(i.id) as total_productos,
          COUNT(CASE WHEN i.estado = 'activo' THEN 1 END) as productos_activos,
          COUNT(CASE WHEN i.tipo = 'producto' THEN 1 END) as productos_fisicos,
          COUNT(CASE WHEN i.tipo = 'servicio' THEN 1 END) as servicios,
          AVG(i.precio) as precio_promedio,
          MIN(i.precio) as precio_minimo,
          MAX(i.precio) as precio_maximo
        FROM categorias c
        LEFT JOIN items i ON c.id = i.categoria_id
        WHERE c.activa = true
        GROUP BY c.id, c.nombre, c.descripcion
        ORDER BY total_productos DESC`
      );

      res.json({
        success: true,
        data: estadisticas.rows
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }
}

module.exports = CategoriesController;
