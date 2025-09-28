const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate, authorize, requireEmailVerification } = require('../middlewares/auth');

const router = express.Router();

// Rutas de autenticación
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/request-password-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// Ruta protegida para obtener perfil
router.get('/profile', authenticate, AuthController.getProfile);

// Rutas de administración (solo para administradores)
router.get('/admin/users', authenticate, authorize('administrador'), (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de administración de usuarios',
    user: req.user
  });
});

// Ruta de prueba para verificar autenticación
router.get('/test', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: {
      id: req.user.id,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      tipo_usuario: req.user.tipo_usuario
    }
  });
});

module.exports = router;
