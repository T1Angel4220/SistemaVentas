const { query } = require('../config/database');
const { config } = require('../config/config');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + random + extensión
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5 // Máximo 5 archivos por request
  },
  fileFilter: fileFilter
});

// Controlador de imágenes
class ImageController {
  
  // Subir imágenes para un producto
  static async uploadImages(req, res) {
    try {
      const { id } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron archivos'
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

      // Verificar permisos (solo el vendedor propietario o admin)
      if (req.user.id !== producto.vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir imágenes a este producto'
        });
      }

      // Verificar límite de imágenes (máximo 5)
      const imagenesExistentes = await query(
        'SELECT COUNT(*) as total FROM item_imagenes WHERE item_id = $1',
        [id]
      );

      const totalExistentes = parseInt(imagenesExistentes.rows[0].total);
      const totalNuevas = files.length;

      if (totalExistentes + totalNuevas > 5) {
        return res.status(400).json({
          success: false,
          message: `El producto ya tiene ${totalExistentes} imágenes. Solo puedes agregar ${5 - totalExistentes} más.`
        });
      }

      // Procesar cada archivo
      const imagenesSubidas = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const urlImagen = `/uploads/products/${file.filename}`;
        const orden = totalExistentes + i + 1;
        const esPrincipal = totalExistentes === 0 && i === 0; // Primera imagen es principal si no hay otras

        const imagenGuardada = await query(
          `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [id, urlImagen, orden, esPrincipal]
        );

        imagenesSubidas.push({
          ...imagenGuardada.rows[0],
          filename: file.filename,
          originalname: file.originalname,
          size: file.size
        });
      }

      res.status(201).json({
        success: true,
        message: `${imagenesSubidas.length} imagen(es) subida(s) exitosamente`,
        data: imagenesSubidas
      });

    } catch (error) {
      console.error('Error al subir imágenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Obtener imágenes de un producto
  static async getProductImages(req, res) {
    try {
      const { id } = req.params;

      const imagenes = await query(
        'SELECT * FROM item_imagenes WHERE item_id = $1 ORDER BY orden',
        [id]
      );

      res.json({
        success: true,
        data: imagenes.rows
      });

    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Eliminar imagen específica
  static async deleteImage(req, res) {
    try {
      const { id, imageId } = req.params;

      // Verificar que la imagen existe
      const imagenExistente = await query(
        'SELECT * FROM item_imagenes WHERE id = $1 AND item_id = $2',
        [imageId, id]
      );

      if (imagenExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const imagen = imagenExistente.rows[0];

      // Verificar permisos
      const producto = await query(
        'SELECT vendedor_id FROM items WHERE id = $1',
        [id]
      );

      if (producto.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (req.user.id !== producto.rows[0].vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta imagen'
        });
      }

      // Eliminar archivo físico
      const filePath = path.join(__dirname, '../../uploads/products', path.basename(imagen.url_imagen));
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('No se pudo eliminar el archivo físico:', fileError.message);
      }

      // Eliminar registro de la base de datos
      await query('DELETE FROM item_imagenes WHERE id = $1', [imageId]);

      // Si era la imagen principal, asignar otra como principal
      if (imagen.es_principal) {
        const siguienteImagen = await query(
          'SELECT id FROM item_imagenes WHERE item_id = $1 ORDER BY orden LIMIT 1',
          [id]
        );

        if (siguienteImagen.rows.length > 0) {
          await query(
            'UPDATE item_imagenes SET es_principal = true WHERE id = $1',
            [siguienteImagen.rows[0].id]
          );
        }
      }

      // Reordenar las imágenes restantes
      await query(
        `UPDATE item_imagenes 
         SET orden = orden - 1 
         WHERE item_id = $1 AND orden > $2`,
        [id, imagen.orden]
      );

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Marcar imagen como principal
  static async setMainImage(req, res) {
    try {
      const { id, imageId } = req.params;

      // Verificar que la imagen existe
      const imagenExistente = await query(
        'SELECT * FROM item_imagenes WHERE id = $1 AND item_id = $2',
        [imageId, id]
      );

      if (imagenExistente.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      // Verificar permisos
      const producto = await query(
        'SELECT vendedor_id FROM items WHERE id = $1',
        [id]
      );

      if (req.user.id !== producto.rows[0].vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este producto'
        });
      }

      // Quitar principal de todas las imágenes del producto
      await query(
        'UPDATE item_imagenes SET es_principal = false WHERE item_id = $1',
        [id]
      );

      // Marcar la imagen seleccionada como principal
      await query(
        'UPDATE item_imagenes SET es_principal = true WHERE id = $1',
        [imageId]
      );

      res.json({
        success: true,
        message: 'Imagen principal actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error al marcar imagen principal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Reordenar imágenes
  static async reorderImages(req, res) {
    try {
      const { id } = req.params;
      const { imageIds } = req.body; // Array de IDs en el orden deseado

      if (!imageIds || !Array.isArray(imageIds)) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de IDs de imágenes'
        });
      }

      // Verificar permisos
      const producto = await query(
        'SELECT vendedor_id FROM items WHERE id = $1',
        [id]
      );

      if (producto.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (req.user.id !== producto.rows[0].vendedor_id && req.user.tipo_usuario !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este producto'
        });
      }

      // Actualizar el orden de las imágenes
      for (let i = 0; i < imageIds.length; i++) {
        await query(
          'UPDATE item_imagenes SET orden = $1 WHERE id = $2 AND item_id = $3',
          [i + 1, imageIds[i], id]
        );
      }

      res.json({
        success: true,
        message: 'Orden de imágenes actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error al reordenar imágenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: config.server.nodeEnv === 'development' ? error.message : {}
      });
    }
  }

  // Middleware de multer para subida de archivos
  static getUploadMiddleware() {
    return upload.array('images', 5); // Máximo 5 archivos con campo 'images'
  }
}

module.exports = ImageController;
