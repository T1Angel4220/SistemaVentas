const { verifyToken, extractTokenFromHeader } = require('../services/jwt');
const { query } = require('../config/database');

/**
 * Middleware para verificar autenticación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // Solo loguear si no es la ruta de logout (caso esperado en algunos escenarios)
      if (!req.path.includes('/logout')) {
        console.log('❌ Error en autenticación: Token no encontrado');
      }
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }
    
    // Verificar el token
    const decoded = verifyToken(token);
    
    // Verificar que el usuario existe y está activo
    const userResult = await query(
      'SELECT id, correo, tipo_usuario, estado, email_verificado FROM usuarios WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verificar que el usuario está activo
    if (user.estado !== 'activo') {
      // Mensaje específico si el usuario está suspendido
      if (user.estado === 'suspendido') {
        console.log(`⚠️ Usuario suspendido ${user.correo} intentó acceder al sistema`);
        return res.status(401).json({
          success: false,
          message: 'Tu cuenta ha sido suspendida por incumplimiento de las políticas de uso',
          code: 'ACCOUNT_SUSPENDED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Cuenta inactiva o suspendida'
      });
    }
    
    // ✅ NUEVO: Verificar que el usuario tiene al menos una sesión activa
    // Esto asegura que si un admin/moderador cierra las sesiones, el usuario sea deslogueado
    const sessionResult = await query(
      'SELECT id FROM sesiones_usuario WHERE usuario_id = $1 AND activa = true AND fecha_expiracion > NOW() LIMIT 1',
      [decoded.id]
    );
    
    if (sessionResult.rows.length === 0) {
      console.log(`⚠️ Usuario ${user.correo} intentó acceder con token válido pero sin sesión activa`);
      return res.status(401).json({
        success: false,
        message: 'Tu sesión ha sido cerrada. Por favor, inicia sesión nuevamente.',
        code: 'SESSION_CLOSED'
      });
    }
    
    // Nota: No bloqueamos el acceso si el email no está verificado
    // El frontend se encargará de mostrar el mensaje apropiado
    
    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      email: user.correo,
      tipo_usuario: user.tipo_usuario,
      estado: user.estado
    };
    
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {Array} allowedRoles - Roles permitidos
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }
    
    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar que el usuario es administrador
 */
const requireAdmin = authorize(['administrador']);

/**
 * Middleware para verificar que el usuario es moderador o administrador
 */
const requireModerator = authorize(['moderador', 'administrador']);

/**
 * Middleware para verificar que el usuario es vendedor, moderador o administrador
 */
const requireVendor = authorize(['vendedor', 'moderador', 'administrador']);

/**
 * Middleware específico para productos - verifica permisos según el rol
 * @param {string} action - Acción que se quiere realizar (create, read, update, delete, moderate)
 * @returns {Function} Middleware function
 */
const requireProductPermission = (action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const { tipo_usuario } = req.user;
    
    // Definir permisos por rol y acción
    const permissions = {
      // Compradores
      comprador: {
        read: true,           // Pueden ver productos
        create: false,        // No pueden crear productos
        update: false,       // No pueden actualizar productos
        delete: false,       // No pueden eliminar productos
        moderate: false      // No pueden moderar productos
      },
      
      // Vendedores
      vendedor: {
        read: true,          // Pueden ver productos
        create: true,        // Pueden crear productos
        update: 'own',      // Solo pueden actualizar sus propios productos
        delete: 'own',      // Solo pueden eliminar sus propios productos
        moderate: false     // No pueden moderar productos de otros
      },
      
      // Moderadores
      moderador: {
        read: true,         // Pueden ver todos los productos
        create: true,       // Pueden crear productos
        update: true,       // Pueden actualizar cualquier producto
        delete: true,       // Pueden eliminar cualquier producto
        moderate: true      // Pueden moderar productos
      },
      
      // Administradores
      administrador: {
        read: true,         // Pueden ver todos los productos
        create: true,       // Pueden crear productos
        update: 'own',     // Solo pueden actualizar sus propios productos (NO pueden editar productos de vendedores)
        delete: 'own',     // Solo pueden eliminar sus propios productos (NO pueden eliminar productos de vendedores)
        moderate: true      // Pueden moderar productos (aprobar/rechazar/suspender)
      }
    };

    const userPermissions = permissions[tipo_usuario];
    
    if (!userPermissions || !userPermissions[action]) {
      return res.status(403).json({
        success: false,
        message: `No tienes permisos para ${action} productos`
      });
    }

    // Para acciones 'own', verificar que es el propietario del producto
    if (userPermissions[action] === 'own') {
      const productId = req.params.id;
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'ID de producto requerido'
        });
      }

      // Verificar que el producto pertenece al usuario
      return query(
        'SELECT vendedor_id FROM items WHERE id = $1',
        [productId]
      ).then(result => {
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
          });
        }

        const productOwnerId = result.rows[0].vendedor_id;
        if (productOwnerId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Solo puedes modificar tus propios productos'
          });
        }

        next();
      }).catch(error => {
        console.error('❌ Error verificando propiedad del producto:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario puede crear productos
 */
const requireProductCreate = requireProductPermission('create');

/**
 * Middleware para verificar que el usuario puede leer productos
 */
const requireProductRead = requireProductPermission('read');

/**
 * Middleware para verificar que el usuario puede actualizar productos
 */
const requireProductUpdate = requireProductPermission('update');

/**
 * Middleware para verificar que el usuario puede eliminar productos
 */
const requireProductDelete = requireProductPermission('delete');

/**
 * Middleware para verificar que el usuario puede moderar productos
 */
const requireProductModerate = requireProductPermission('moderate');

/**
 * Middleware para verificar que el usuario puede acceder a su propio recurso
 * @param {string} userIdParam - Nombre del parámetro que contiene el ID del usuario
 * @returns {Function} Middleware function
 */
const requireOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }
    
    // Los administradores pueden acceder a cualquier recurso
    if (req.user.tipo_usuario === 'administrador') {
      return next();
    }
    
    // Los moderadores pueden acceder a recursos de usuarios que no sean administradores
    if (req.user.tipo_usuario === 'moderador') {
      const targetUserId = req.params[userIdParam];
      if (targetUserId && targetUserId !== req.user.id.toString()) {
        // Verificar que el usuario objetivo no es administrador
        return query(
          'SELECT tipo_usuario FROM usuarios WHERE id = $1',
          [targetUserId]
        ).then(result => {
          if (result.rows.length > 0 && result.rows[0].tipo_usuario === 'administrador') {
            return res.status(403).json({
              success: false,
              message: 'No puedes acceder a recursos de administradores'
            });
          }
          next();
        }).catch(error => {
          console.error('❌ Error verificando permisos:', error.message);
          return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
          });
        });
      }
    }
    
    // Verificar que el usuario accede a su propio recurso
    const targetUserId = req.params[userIdParam];
    if (targetUserId && targetUserId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes acceder a tus propios recursos'
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar que la sesión está activa
 */
const requireActiveSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }
    
    // Verificar que la sesión está activa en la base de datos
    const sessionResult = await query(
      'SELECT id FROM sesiones_usuario WHERE usuario_id = $1 AND activa = true AND fecha_expiracion > NOW()',
      [req.user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada o inactiva'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Error verificando sesión:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return next();
    }
    
    const decoded = verifyToken(token);
    
    const userResult = await query(
      'SELECT id, correo, tipo_usuario, estado, email_verificado FROM usuarios WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        email: user.correo,
        tipo_usuario: user.tipo_usuario,
        estado: user.estado
      };
    }
    
    next();
  } catch (error) {
    // Si hay error en el token, continuar sin autenticación
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireModerator,
  requireVendor,
  requireOwnership,
  requireActiveSession,
  optionalAuth,
  requireProductPermission,
  requireProductCreate,
  requireProductRead,
  requireProductUpdate,
  requireProductDelete,
  requireProductModerate
};
