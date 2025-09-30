const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireAdmin, requireModerator } = require('../middlewares/auth');
const Joi = require('joi');

// Esquemas de validación
const registerSchema = Joi.object({
  cedula: Joi.string().min(9).max(20).required().messages({
    'string.min': 'La cédula debe tener al menos 9 caracteres',
    'string.max': 'La cédula no puede tener más de 20 caracteres',
    'any.required': 'La cédula es requerida'
  }),
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede tener más de 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  apellido: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede tener más de 100 caracteres',
    'any.required': 'El apellido es requerido'
  }),
  correo: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un email válido',
    'any.required': 'El correo es requerido'
  }),
  telefono: Joi.string().min(8).max(20).optional().messages({
    'string.min': 'El teléfono debe tener al menos 8 caracteres',
    'string.max': 'El teléfono no puede tener más de 20 caracteres'
  }),
  direccion: Joi.string().max(500).optional().messages({
    'string.max': 'La dirección no puede tener más de 500 caracteres'
  }),
  genero: Joi.string().valid('masculino', 'femenino', 'otro').optional().messages({
    'any.only': 'El género debe ser masculino, femenino u otro'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'string.max': 'La contraseña no puede tener más de 100 caracteres',
    'any.required': 'La contraseña es requerida'
  }),
  tipo_usuario: Joi.string().valid('comprador', 'vendedor').default('comprador').messages({
    'any.only': 'El tipo de usuario debe ser comprador o vendedor'
  })
});

const loginSchema = Joi.object({
  correo: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un email válido',
    'any.required': 'El correo es requerido'
  }),
  password: Joi.string().required().messages({
    'any.required': 'La contraseña es requerida'
  })
});

const requestPasswordResetSchema = Joi.object({
  correo: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un email válido',
    'any.required': 'El correo es requerido'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'El token es requerido'
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
    'string.max': 'La nueva contraseña no puede tener más de 100 caracteres',
    'any.required': 'La nueva contraseña es requerida'
  })
});

const verifyEmailSchema = Joi.object({
  code: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'El código debe tener exactamente 6 dígitos',
    'string.pattern.base': 'El código debe contener solo números',
    'any.required': 'El código de verificación es requerido'
  })
});

// Middleware de validación
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};

// Rutas públicas
/**
 * @route POST /api/auth/register
 * @desc Registro de usuarios (compradores y vendedores)
 * @access Public
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login con email y contraseña
 * @access Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route POST /api/auth/verify-email
 * @desc Verificación de email con código
 * @access Public
 */
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);

/**
 * @route POST /api/auth/request-password-reset
 * @desc Solicitar recuperación de contraseña
 * @access Public
 */
router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), authController.requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Resetear contraseña
 * @access Public
 */
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

// Rutas protegidas
/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route POST /api/auth/logout
 * @desc Logout - Invalidar sesión
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route GET /api/auth/test
 * @desc Probar autenticación
 * @access Private
 */
router.get('/test', authenticate, authController.testAuth);

// Rutas de administración (solo administradores)
/**
 * @route POST /api/auth/register-moderator
 * @desc Registro de moderadores (solo administrador)
 * @access Private (Admin only)
 */
router.post('/register-moderator', authenticate, requireAdmin, validateRequest(registerSchema), authController.register);

/**
 * @route PUT /api/auth/activate-user/:userId
 * @desc Activar cuenta de usuario
 * @access Private (Moderator/Admin)
 */
router.put('/activate-user/:userId', authenticate, requireModerator, async (req, res) => {
  try {
    const { userId } = req.params;
    const { motivo } = req.body;
    
    // Verificar que el usuario existe
    const userResult = await require('../config/database').query(
      'SELECT * FROM usuarios WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    // Actualizar estado del usuario
    await require('../config/database').query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2',
      ['activo', userId]
    );
    
    // Registrar acción de moderación
    await require('../config/database').query(`
      INSERT INTO acciones_moderacion (moderador_id, accion, tabla_afectada, registro_id, detalles)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'activar_usuario',
      'usuarios',
      userId,
      motivo || 'Usuario activado por moderador'
    ]);
    
    // Enviar email de notificación
    try {
      await require('../services/email').sendAccountStatusEmail(
        user.correo,
        user.nombre,
        'activo',
        motivo || 'Tu cuenta ha sido activada'
      );
    } catch (emailError) {
      console.error('❌ Error enviando email de activación:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Usuario activado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error activando usuario:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PUT /api/auth/deactivate-user/:userId
 * @desc Desactivar cuenta de usuario
 * @access Private (Moderator/Admin)
 */
router.put('/deactivate-user/:userId', authenticate, requireModerator, async (req, res) => {
  try {
    const { userId } = req.params;
    const { motivo } = req.body;
    
    // Verificar que el usuario existe
    const userResult = await require('../config/database').query(
      'SELECT * FROM usuarios WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    // No permitir desactivar administradores
    if (user.tipo_usuario === 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No se puede desactivar un administrador'
      });
    }
    
    // Actualizar estado del usuario
    await require('../config/database').query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2',
      ['inactivo', userId]
    );
    
    // Invalidar todas las sesiones del usuario
    await require('../config/database').query(
      'UPDATE sesiones_usuario SET activa = false WHERE usuario_id = $1',
      [userId]
    );
    
    // Registrar acción de moderación
    await require('../config/database').query(`
      INSERT INTO acciones_moderacion (moderador_id, accion, tabla_afectada, registro_id, detalles)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'desactivar_usuario',
      'usuarios',
      userId,
      motivo || 'Usuario desactivado por moderador'
    ]);
    
    // Enviar email de notificación
    try {
      await require('../services/email').sendAccountStatusEmail(
        user.correo,
        user.nombre,
        'inactivo',
        motivo || 'Tu cuenta ha sido desactivada'
      );
    } catch (emailError) {
      console.error('❌ Error enviando email de desactivación:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error desactivando usuario:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route PUT /api/auth/suspend-user/:userId
 * @desc Suspender cuenta de usuario
 * @access Private (Moderator/Admin)
 */
router.put('/suspend-user/:userId', authenticate, requireModerator, async (req, res) => {
  try {
    const { userId } = req.params;
    const { motivo } = req.body;
    
    // Verificar que el usuario existe
    const userResult = await require('../config/database').query(
      'SELECT * FROM usuarios WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    // No permitir suspender administradores
    if (user.tipo_usuario === 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No se puede suspender un administrador'
      });
    }
    
    // Actualizar estado del usuario
    await require('../config/database').query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2',
      ['suspendido', userId]
    );
    
    // Invalidar todas las sesiones del usuario
    await require('../config/database').query(
      'UPDATE sesiones_usuario SET activa = false WHERE usuario_id = $1',
      [userId]
    );
    
    // Registrar acción de moderación
    await require('../config/database').query(`
      INSERT INTO acciones_moderacion (moderador_id, accion, tabla_afectada, registro_id, detalles)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'suspender_usuario',
      'usuarios',
      userId,
      motivo || 'Usuario suspendido por moderador'
    ]);
    
    // Enviar email de notificación
    try {
      await require('../services/email').sendAccountStatusEmail(
        user.correo,
        user.nombre,
        'suspendido',
        motivo || 'Tu cuenta ha sido suspendida'
      );
    } catch (emailError) {
      console.error('❌ Error enviando email de suspensión:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Usuario suspendido exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error suspendiendo usuario:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route GET /api/auth/sessions
 * @desc Obtener sesiones activas del usuario
 * @access Private
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sessionsResult = await require('../config/database').query(`
      SELECT id, fecha_inicio, fecha_expiracion, ip_address, user_agent, activa
      FROM sesiones_usuario 
      WHERE usuario_id = $1 
      ORDER BY fecha_inicio DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: {
        sessions: sessionsResult.rows
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo sesiones:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @route DELETE /api/auth/sessions/:sessionId
 * @desc Cerrar sesión específica
 * @access Private
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    // Verificar que la sesión pertenece al usuario
    const sessionResult = await require('../config/database').query(
      'SELECT id FROM sesiones_usuario WHERE id = $1 AND usuario_id = $2',
      [sessionId, userId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }
    
    // Cerrar sesión
    await require('../config/database').query(
      'UPDATE sesiones_usuario SET activa = false WHERE id = $1',
      [sessionId]
    );
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;

