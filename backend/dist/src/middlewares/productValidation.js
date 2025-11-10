"use strict";
const Joi = require('joi');
// Esquemas de validación para productos
const productSchemas = {
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
        precio: Joi.number().positive().precision(2).max(999999.99).required().messages({
            'number.positive': 'El precio debe ser un número positivo',
            'number.max': 'El precio no puede ser mayor a 999,999.99',
            'any.required': 'El precio es requerido'
        }),
        ubicacion_id: Joi.number().integer().positive().optional().messages({
            'number.base': 'La ubicación debe ser un número válido',
            'number.positive': 'La ubicación debe ser un ID válido'
        }),
        ubicacion_provincia: Joi.string().min(3).max(100).required().messages({
            'string.min': 'La provincia debe tener al menos 3 caracteres',
            'string.max': 'La provincia no puede tener más de 100 caracteres',
            'any.required': 'La provincia es requerida'
        }),
        ubicacion_canton: Joi.string().min(3).max(100).required().messages({
            'string.min': 'El cantón debe tener al menos 3 caracteres',
            'string.max': 'El cantón no puede tener más de 100 caracteres',
            'any.required': 'El cantón es requerido'
        }),
        ubicacion_distrito: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'El distrito debe tener al menos 3 caracteres',
            'string.max': 'El distrito no puede tener más de 100 caracteres'
        }),
        ubicacion_direccion: Joi.string().min(5).max(200).required().messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede tener más de 200 caracteres',
            'any.required': 'La dirección es requerida'
        }),
        coordenadas: Joi.string().max(50).optional().allow('').messages({
            'string.max': 'Las coordenadas no pueden tener más de 50 caracteres'
        }),
        disponibilidad: Joi.boolean().optional().default(true).messages({
            'boolean.base': 'La disponibilidad debe ser verdadero o falso'
        }),
        tipo: Joi.string().valid('producto', 'servicio').required().messages({
            'any.only': 'El tipo debe ser "producto" o "servicio"',
            'any.required': 'El tipo es requerido'
        }),
        categoria_id: Joi.number().integer().positive().required().messages({
            'number.base': 'La categoría debe ser un número válido',
            'number.positive': 'La categoría debe ser un ID válido',
            'any.required': 'La categoría es requerida'
        }),
        // Campos específicos para servicios
        horario_atencion: Joi.string().max(500).when('tipo', {
            is: 'servicio',
            then: Joi.required(),
            otherwise: Joi.optional()
        }).messages({
            'string.max': 'El horario de atención no puede tener más de 500 caracteres',
            'any.required': 'El horario de atención es requerido para servicios'
        }),
        dias_disponibles: Joi.string().max(100).optional().messages({
            'string.max': 'Los días disponibles no pueden tener más de 100 caracteres'
        }),
        duracion_estimada: Joi.string().max(50).optional().messages({
            'string.max': 'La duración estimada no puede tener más de 50 caracteres'
        })
    }),
    update: Joi.object({
        nombre: Joi.string().min(3).max(200).optional().messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 200 caracteres'
        }),
        descripcion: Joi.string().min(10).max(2000).optional().messages({
            'string.min': 'La descripción debe tener al menos 10 caracteres',
            'string.max': 'La descripción no puede tener más de 2000 caracteres'
        }),
        precio: Joi.number().positive().precision(2).max(999999.99).optional().messages({
            'number.positive': 'El precio debe ser un número positivo',
            'number.max': 'El precio no puede ser mayor a 999,999.99'
        }),
        ubicacion_id: Joi.number().integer().positive().optional().messages({
            'number.base': 'La ubicación debe ser un número válido',
            'number.positive': 'La ubicación debe ser un ID válido'
        }),
        ubicacion_provincia: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'La provincia debe tener al menos 3 caracteres',
            'string.max': 'La provincia no puede tener más de 100 caracteres'
        }),
        ubicacion_canton: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'El cantón debe tener al menos 3 caracteres',
            'string.max': 'El cantón no puede tener más de 100 caracteres'
        }),
        ubicacion_distrito: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'El distrito debe tener al menos 3 caracteres',
            'string.max': 'El distrito no puede tener más de 100 caracteres'
        }),
        ubicacion_direccion: Joi.string().min(5).max(200).optional().messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede tener más de 200 caracteres'
        }),
        coordenadas: Joi.string().max(50).optional().allow('').messages({
            'string.max': 'Las coordenadas no pueden tener más de 50 caracteres'
        }),
        disponibilidad: Joi.boolean().optional().messages({
            'boolean.base': 'La disponibilidad debe ser verdadero o falso'
        }),
        categoria_id: Joi.number().integer().positive().optional().messages({
            'number.base': 'La categoría debe ser un número válido',
            'number.positive': 'La categoría debe ser un ID válido'
        }),
        // Campos específicos para servicios
        horario_atencion: Joi.string().max(500).optional().messages({
            'string.max': 'El horario de atención no puede tener más de 500 caracteres'
        }),
        dias_disponibles: Joi.string().max(100).optional().messages({
            'string.max': 'Los días disponibles no pueden tener más de 100 caracteres'
        }),
        duracion_estimada: Joi.string().max(50).optional().messages({
            'string.max': 'La duración estimada no puede tener más de 50 caracteres'
        }),
        // Campo para imágenes eliminadas (solo en actualización)
        deleted_images: Joi.string().optional().messages({
            'string.base': 'deleted_images debe ser una cadena JSON válida'
        })
    }),
    availability: Joi.object({
        disponibilidad: Joi.boolean().required().messages({
            'boolean.base': 'La disponibilidad debe ser verdadero o falso',
            'any.required': 'La disponibilidad es requerida'
        })
    }),
    filters: Joi.object({
        categoria_id: Joi.number().integer().positive().optional().messages({
            'number.base': 'La categoría debe ser un número válido',
            'number.positive': 'La categoría debe ser un ID válido'
        }),
        tipo: Joi.string().valid('producto', 'servicio').optional().messages({
            'any.only': 'El tipo debe ser "producto" o "servicio"'
        }),
        precio_min: Joi.number().positive().precision(2).optional().messages({
            'number.positive': 'El precio mínimo debe ser un número positivo'
        }),
        precio_max: Joi.number().positive().precision(2).optional().messages({
            'number.positive': 'El precio máximo debe ser un número positivo'
        }),
        ubicacion_id: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string().max(200)).optional().messages({
            'alternatives.match': 'La ubicación debe ser un ID válido o texto descriptivo'
        }),
        estado: Joi.string().valid('activo', 'inactivo', 'pendiente_revision', 'rechazado', 'peligroso', 'suspendido').optional().messages({
            'any.only': 'El estado debe ser uno de: activo, inactivo, pendiente_revision, rechazado, peligroso, suspendido'
        }),
        disponibilidad: Joi.boolean().optional().messages({
            'boolean.base': 'La disponibilidad debe ser verdadero o falso'
        }),
        page: Joi.number().integer().min(1).optional().messages({
            'number.base': 'La página debe ser un número',
            'number.min': 'La página debe ser mayor a 0'
        }),
        limit: Joi.number().integer().min(1).max(100).optional().messages({
            'number.base': 'El límite debe ser un número',
            'number.min': 'El límite debe ser mayor a 0',
            'number.max': 'El límite no puede ser mayor a 100'
        }),
        search: Joi.string().max(100).optional().messages({
            'string.max': 'La búsqueda no puede tener más de 100 caracteres'
        })
    })
};
// Esquemas de validación para categorías
const categorySchemas = {
    create: Joi.object({
        nombre: Joi.string().min(3).max(100).required().messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        descripcion: Joi.string().max(500).optional().messages({
            'string.max': 'La descripción no puede tener más de 500 caracteres'
        })
    }),
    update: Joi.object({
        nombre: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres'
        }),
        descripcion: Joi.string().max(500).optional().messages({
            'string.max': 'La descripción no puede tener más de 500 caracteres'
        }),
        activa: Joi.boolean().optional().messages({
            'boolean.base': 'El estado activo debe ser verdadero o falso'
        })
    })
};
// Esquemas de validación para ubicaciones
const locationSchemas = {
    create: Joi.object({
        nombre: Joi.string().min(3).max(100).required().messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        provincia: Joi.string().min(3).max(100).required().messages({
            'string.min': 'La provincia debe tener al menos 3 caracteres',
            'string.max': 'La provincia no puede tener más de 100 caracteres',
            'any.required': 'La provincia es requerida'
        }),
        canton: Joi.string().max(100).optional().messages({
            'string.max': 'El cantón no puede tener más de 100 caracteres'
        }),
        distrito: Joi.string().max(100).optional().messages({
            'string.max': 'El distrito no puede tener más de 100 caracteres'
        })
    }),
    update: Joi.object({
        nombre: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede tener más de 100 caracteres'
        }),
        provincia: Joi.string().min(3).max(100).optional().messages({
            'string.min': 'La provincia debe tener al menos 3 caracteres',
            'string.max': 'La provincia no puede tener más de 100 caracteres'
        }),
        canton: Joi.string().max(100).optional().messages({
            'string.max': 'El cantón no puede tener más de 100 caracteres'
        }),
        distrito: Joi.string().max(100).optional().messages({
            'string.max': 'El distrito no puede tener más de 100 caracteres'
        }),
        activa: Joi.boolean().optional().messages({
            'boolean.base': 'El estado activo debe ser verdadero o falso'
        })
    })
};
// Middleware de validación genérico
const validateSchema = (schema) => {
    return (req, res, next) => {
        // Si req.body está vacío o undefined, no validar
        if (!req.body || Object.keys(req.body).length === 0) {
            return next();
        }
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errorMessages
            });
        }
        // Reemplazar req.body con los datos validados y sanitizados
        req.body = value;
        next();
    };
};
// Middleware de validación para query parameters
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Parámetros de consulta inválidos',
                errors: errorMessages
            });
        }
        // Reemplazar req.query con los datos validados y sanitizados
        req.query = value;
        next();
    };
};
// Validaciones específicas para productos
const validateProductCreate = validateSchema(productSchemas.create);
const validateProductUpdate = validateSchema(productSchemas.update);
const validateProductAvailability = validateSchema(productSchemas.availability);
const validateProductFilters = validateQuery(productSchemas.filters);
// Validaciones específicas para categorías
const validateCategoryCreate = validateSchema(categorySchemas.create);
const validateCategoryUpdate = validateSchema(categorySchemas.update);
// Validaciones específicas para ubicaciones
const validateLocationCreate = validateSchema(locationSchemas.create);
const validateLocationUpdate = validateSchema(locationSchemas.update);
module.exports = {
    validateProductCreate,
    validateProductUpdate,
    validateProductAvailability,
    validateProductFilters,
    validateCategoryCreate,
    validateCategoryUpdate,
    validateLocationCreate,
    validateLocationUpdate,
    productSchemas,
    categorySchemas,
    locationSchemas
};
