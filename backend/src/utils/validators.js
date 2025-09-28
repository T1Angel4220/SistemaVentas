const Joi = require('joi');

// Esquemas de validación para usuarios
const userSchemas = {
  register: Joi.object({
    cedula: Joi.string().min(8).max(20).required().messages({
      'string.min': 'La cédula debe tener al menos 8 caracteres',
      'string.max': 'La cédula no puede tener más de 20 caracteres',
      'any.required': 'La cédula es requerida'
    }),
    nombre: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    apellido: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede tener más de 50 caracteres',
      'any.required': 'El apellido es requerido'
    }),
    correo: Joi.string().email().required().messages({
      'string.email': 'Debe proporcionar un email válido',
      'any.required': 'El email es requerido'
    }),
    telefono: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional().messages({
      'string.pattern.base': 'El teléfono debe contener solo números y caracteres válidos'
    }),
    direccion: Joi.string().max(200).optional().messages({
      'string.max': 'La dirección no puede tener más de 200 caracteres'
    }),
    genero: Joi.string().valid('masculino', 'femenino', 'otro').optional(),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede tener más de 100 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    tipo_usuario: Joi.string().valid('comprador', 'vendedor').optional()
  }),

  login: Joi.object({
    correo: Joi.string().email().required().messages({
      'string.email': 'Debe proporcionar un email válido',
      'any.required': 'El email es requerido'
    }),
    password: Joi.string().required().messages({
      'any.required': 'La contraseña es requerida'
    })
  }),

  passwordReset: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'El token es requerido'
    }),
    newPassword: Joi.string().min(6).max(100).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede tener más de 100 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    })
  })
};

// Esquemas de validación para productos/servicios
const itemSchemas = {
  create: Joi.object({
    nombre: Joi.string().min(2).max(200).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 200 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede tener más de 1000 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    precio: Joi.number().positive().max(999999999).required().messages({
      'number.positive': 'El precio debe ser un número positivo',
      'number.max': 'El precio no puede ser mayor a 999,999,999',
      'any.required': 'El precio es requerido'
    }),
    categoria_id: Joi.number().integer().positive().required().messages({
      'number.integer': 'El ID de categoría debe ser un número entero',
      'number.positive': 'El ID de categoría debe ser positivo',
      'any.required': 'La categoría es requerida'
    }),
    ubicacion_id: Joi.number().integer().positive().optional().messages({
      'number.integer': 'El ID de ubicación debe ser un número entero',
      'number.positive': 'El ID de ubicación debe ser positivo'
    }),
    tipo: Joi.string().valid('producto', 'servicio').required().messages({
      'any.only': 'El tipo debe ser "producto" o "servicio"',
      'any.required': 'El tipo es requerido'
    }),
    disponibilidad: Joi.boolean().optional()
  }),

  update: Joi.object({
    nombre: Joi.string().min(2).max(200).optional(),
    descripcion: Joi.string().min(10).max(1000).optional(),
    precio: Joi.number().positive().max(999999999).optional(),
    categoria_id: Joi.number().integer().positive().optional(),
    ubicacion_id: Joi.number().integer().positive().optional(),
    disponibilidad: Joi.boolean().optional()
  })
};

// Esquemas de validación para reportes
const reportSchemas = {
  create: Joi.object({
    item_id: Joi.number().integer().positive().required().messages({
      'number.integer': 'El ID del item debe ser un número entero',
      'number.positive': 'El ID del item debe ser positivo',
      'any.required': 'El ID del item es requerido'
    }),
    tipo_reporte: Joi.string().valid(
      'contenido_inapropiado',
      'producto_prohibido',
      'informacion_falsa',
      'spam',
      'otro'
    ).required().messages({
      'any.only': 'Tipo de reporte inválido',
      'any.required': 'El tipo de reporte es requerido'
    }),
    descripcion: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede tener más de 500 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    comentario_opcional: Joi.string().max(200).optional().messages({
      'string.max': 'El comentario no puede tener más de 200 caracteres'
    })
  })
};

// Esquemas de validación para apelaciones
const appealSchemas = {
  create: Joi.object({
    reporte_id: Joi.number().integer().positive().optional().messages({
      'number.integer': 'El ID del reporte debe ser un número entero',
      'number.positive': 'El ID del reporte debe ser positivo'
    }),
    item_id: Joi.number().integer().positive().optional().messages({
      'number.integer': 'El ID del item debe ser un número entero',
      'number.positive': 'El ID del item debe ser positivo'
    }),
    motivo_apelacion: Joi.string().min(20).max(1000).required().messages({
      'string.min': 'El motivo debe tener al menos 20 caracteres',
      'string.max': 'El motivo no puede tener más de 1000 caracteres',
      'any.required': 'El motivo de apelación es requerido'
    }),
    informacion_adicional: Joi.string().max(1000).optional().messages({
      'string.max': 'La información adicional no puede tener más de 1000 caracteres'
    })
  })
};

// Esquemas de validación para mensajes de chat
const chatSchemas = {
  createMessage: Joi.object({
    mensaje: Joi.string().min(1).max(1000).required().messages({
      'string.min': 'El mensaje no puede estar vacío',
      'string.max': 'El mensaje no puede tener más de 1000 caracteres',
      'any.required': 'El mensaje es requerido'
    })
  })
};

// Esquemas de validación para valoraciones
const ratingSchemas = {
  create: Joi.object({
    evaluado_id: Joi.number().integer().positive().required().messages({
      'number.integer': 'El ID del evaluado debe ser un número entero',
      'number.positive': 'El ID del evaluado debe ser positivo',
      'any.required': 'El ID del evaluado es requerido'
    }),
    item_id: Joi.number().integer().positive().optional().messages({
      'number.integer': 'El ID del item debe ser un número entero',
      'number.positive': 'El ID del item debe ser positivo'
    }),
    chat_id: Joi.number().integer().positive().optional().messages({
      'number.integer': 'El ID del chat debe ser un número entero',
      'number.positive': 'El ID del chat debe ser positivo'
    }),
    calificacion: Joi.number().integer().min(1).max(5).required().messages({
      'number.integer': 'La calificación debe ser un número entero',
      'number.min': 'La calificación debe ser al menos 1',
      'number.max': 'La calificación no puede ser mayor a 5',
      'any.required': 'La calificación es requerida'
    }),
    comentario: Joi.string().max(500).optional().messages({
      'string.max': 'El comentario no puede tener más de 500 caracteres'
    })
  })
};

// Función para validar parámetros de consulta
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Esquemas para parámetros de consulta
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sort: Joi.string().valid('fecha_publicacion', 'precio', 'nombre').optional(),
    order: Joi.string().valid('asc', 'desc').optional()
  }),

  itemFilters: Joi.object({
    categoria_id: Joi.number().integer().positive().optional(),
    ubicacion_id: Joi.number().integer().positive().optional(),
    tipo: Joi.string().valid('producto', 'servicio').optional(),
    precio_min: Joi.number().min(0).optional(),
    precio_max: Joi.number().min(0).optional(),
    estado: Joi.string().valid('activo', 'inactivo', 'pendiente_revision').optional(),
    vendedor_id: Joi.number().integer().positive().optional()
  })
};

module.exports = {
  userSchemas,
  itemSchemas,
  reportSchemas,
  appealSchemas,
  chatSchemas,
  ratingSchemas,
  querySchemas,
  validateQueryParams
};
