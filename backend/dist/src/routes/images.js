"use strict";
const express = require('express');
const multer = require('multer');
const router = express.Router();
const ImageController = require('../controllers/imageController');
const { authenticate } = require('../middlewares/auth');
// Middleware de multer para subida de archivos
const uploadMiddleware = ImageController.getUploadMiddleware();
// Middleware para manejar errores de multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 5MB por imagen.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Demasiados archivos. Máximo 5 imágenes por producto.'
            });
        }
    }
    if (err.message.includes('Solo se permiten archivos de imagen')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};
// Todas las rutas requieren autenticación
router.use(authenticate);
// Rutas de imágenes
router.post('/products/:id', uploadMiddleware, handleUploadError, ImageController.uploadImages); // POST /api/images/products/:id - Subir imágenes
router.get('/products/:id', ImageController.getProductImages); // GET /api/images/products/:id - Obtener imágenes
router.delete('/products/:id/:imageId', ImageController.deleteImage); // DELETE /api/images/products/:id/:imageId - Eliminar imagen
router.patch('/products/:id/:imageId/main', ImageController.setMainImage); // PATCH /api/images/products/:id/:imageId/main - Marcar como principal
router.patch('/products/:id/reorder', ImageController.reorderImages); // PATCH /api/images/products/:id/reorder - Reordenar imágenes
module.exports = router;
