const Joi = require('joi');

/**
 * Esquemas de validación para usuarios
 */
const userSchemas = {
  // Registro de usuario
  register: Joi.object({
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
    tipo_usuario: Joi.string().valid('comprador', 'vendedor', 'moderador', 'administrador').default('comprador').messages({
      'any.only': 'El tipo de usuario debe ser comprador, vendedor, moderador o administrador'
    })
  }),

  // Login
  login: Joi.object({
    correo: Joi.string().email().required().messages({
      'string.email': 'El correo debe ser un email válido',
      'any.required': 'El correo es requerido'
    }),
    password: Joi.string().required().messages({
      'any.required': 'La contraseña es requerida'
    })
  }),

  // Solicitar recuperación de contraseña
  requestPasswordReset: Joi.object({
    correo: Joi.string().email().required().messages({
      'string.email': 'El correo debe ser un email válido',
      'any.required': 'El correo es requerido'
    })
  }),

  // Resetear contraseña
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'El token es requerido'
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'string.max': 'La nueva contraseña no puede tener más de 100 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    })
  }),

  // Actualizar perfil
  updateProfile: Joi.object({
    nombre: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres'
    }),
    apellido: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede tener más de 100 caracteres'
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
    })
  }),

  // Cambiar contraseña
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'La contraseña actual es requerida'
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'string.max': 'La nueva contraseña no puede tener más de 100 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    })
  })
};

/**
 * Esquemas de validación para productos/servicios
 */
const itemSchemas = {
  // Crear producto/servicio
  create: Joi.object({
    codigo: Joi.string().min(3).max(50).required().messages({
      'string.min': 'El código debe tener al menos 3 caracteres',
      'string.max': 'El código no puede tener más de 50 caracteres',
      'any.required': 'El código es requerido'
    }),
    nombre: Joi.string().min(3).max(200).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede tener más de 200 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    descripcion: Joi.string().min(10).max(2000).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede tener más de 2000 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    precio: Joi.number().min(0).max(999999999.99).required().messages({
      'number.min': 'El precio debe ser mayor o igual a 0',
      'number.max': 'El precio no puede ser mayor a 999,999,999.99',
      'any.required': 'El precio es requerido'
    }),
    ubicacion_id: Joi.number().integer().positive().required().messages({
      'number.base': 'La ubicación debe ser un número',
      'number.integer': 'La ubicación debe ser un número entero',
      'number.positive': 'La ubicación debe ser un número positivo',
      'any.required': 'La ubicación es requerida'
    }),
    categoria_id: Joi.number().integer().positive().required().messages({
      'number.base': 'La categoría debe ser un número',
      'number.integer': 'La categoría debe ser un número entero',
      'number.positive': 'La categoría debe ser un número positivo',
      'any.required': 'La categoría es requerida'
    }),
    tipo: Joi.string().valid('producto', 'servicio').required().messages({
      'any.only': 'El tipo debe ser producto o servicio',
      'any.required': 'El tipo es requerido'
    }),
    disponibilidad: Joi.boolean().default(true)
  }),

  // Actualizar producto/servicio
  update: Joi.object({
    nombre: Joi.string().min(3).max(200).optional().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede tener más de 200 caracteres'
    }),
    descripcion: Joi.string().min(10).max(2000).optional().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede tener más de 2000 caracteres'
    }),
    precio: Joi.number().min(0).max(999999999.99).optional().messages({
      'number.min': 'El precio debe ser mayor o igual a 0',
      'number.max': 'El precio no puede ser mayor a 999,999,999.99'
    }),
    ubicacion_id: Joi.number().integer().positive().optional().messages({
      'number.base': 'La ubicación debe ser un número',
      'number.integer': 'La ubicación debe ser un número entero',
      'number.positive': 'La ubicación debe ser un número positivo'
    }),
    categoria_id: Joi.number().integer().positive().optional().messages({
      'number.base': 'La categoría debe ser un número',
      'number.integer': 'La categoría debe ser un número entero',
      'number.positive': 'La categoría debe ser un número positivo'
    }),
    disponibilidad: Joi.boolean().optional()
  })
};

/**
 * Esquemas de validación para reportes
 */
const reportSchemas = {
  // Crear reporte
  create: Joi.object({
    item_id: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del item debe ser un número',
      'number.integer': 'El ID del item debe ser un número entero',
      'number.positive': 'El ID del item debe ser un número positivo',
      'any.required': 'El ID del item es requerido'
    }),
    tipo_reporte: Joi.string().valid(
      'contenido_inapropiado', 
      'producto_prohibido', 
      'informacion_falsa', 
      'spam', 
      'otro'
    ).required().messages({
      'any.only': 'El tipo de reporte debe ser uno de los valores permitidos',
      'any.required': 'El tipo de reporte es requerido'
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede tener más de 1000 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    comentario_opcional: Joi.string().max(500).optional().messages({
      'string.max': 'El comentario no puede tener más de 500 caracteres'
    })
  })
};

/**
 * Esquemas de validación para chat
 */
const chatSchemas = {
  // Crear mensaje
  createMessage: Joi.object({
    mensaje: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'El mensaje no puede estar vacío',
      'string.max': 'El mensaje no puede tener más de 1000 caracteres',
      'any.required': 'El mensaje es requerido'
    })
  })
};

/**
 * Esquemas de validación para valoraciones
 */
const ratingSchemas = {
  // Crear valoración
  create: Joi.object({
    evaluado_id: Joi.number().integer().positive().required().messages({
      'number.base': 'El ID del evaluado debe ser un número',
      'number.integer': 'El ID del evaluado debe ser un número entero',
      'number.positive': 'El ID del evaluado debe ser un número positivo',
      'any.required': 'El ID del evaluado es requerido'
    }),
    item_id: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del item debe ser un número',
      'number.integer': 'El ID del item debe ser un número entero',
      'number.positive': 'El ID del item debe ser un número positivo'
    }),
    chat_id: Joi.number().integer().positive().optional().messages({
      'number.base': 'El ID del chat debe ser un número',
      'number.integer': 'El ID del chat debe ser un número entero',
      'number.positive': 'El ID del chat debe ser un número positivo'
    }),
    calificacion: Joi.number().integer().min(1).max(5).required().messages({
      'number.base': 'La calificación debe ser un número',
      'number.integer': 'La calificación debe ser un número entero',
      'number.min': 'La calificación debe ser al menos 1',
      'number.max': 'La calificación debe ser máximo 5',
      'any.required': 'La calificación es requerida'
    }),
    comentario: Joi.string().max(500).optional().messages({
      'string.max': 'El comentario no puede tener más de 500 caracteres'
    })
  })
};

/**
 * Función para validar datos con un esquema
 * @param {Object} schema - Esquema de Joi
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación
 */
const validateData = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      })),
      data: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    data: value
  };
};

/**
 * Middleware de validación para Express
 * @param {Object} schema - Esquema de Joi
 * @returns {Function} Middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = validateData(schema, req.body);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: result.errors
      });
    }
    
    req.body = result.data;
    next();
  };
};

/**
 * Validar parámetros de URL
 * @param {Object} schema - Esquema de Joi
 * @returns {Function} Middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const result = validateData(schema, req.params);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de URL inválidos',
        errors: result.errors
      });
    }
    
    req.params = result.data;
    next();
  };
};

/**
 * Validar query parameters
 * @param {Object} schema - Esquema de Joi
 * @returns {Function} Middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = validateData(schema, req.query);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: result.errors
      });
    }
    
    req.query = result.data;
    next();
  };
};

module.exports = {
  userSchemas,
  itemSchemas,
  reportSchemas,
  chatSchemas,
  ratingSchemas,
  validateData,
  validateRequest,
  validateParams,
  validateQuery
};