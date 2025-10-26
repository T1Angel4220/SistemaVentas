/**
 * Datos de prueba (fixtures) para las pruebas
 */

/**
 * Datos de usuarios de prueba
 */
const testUsers = {
  // Comprador válido
  validBuyer: {
    cedula: '123456789',
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@test.com',
    telefono: '88888888',
    direccion: 'San José, Costa Rica',
    genero: 'masculino',
    password: 'Password123!',
    tipo_usuario: 'comprador'
  },

  // Vendedor válido
  validSeller: {
    cedula: '987654321',
    nombre: 'María',
    apellido: 'González',
    correo: 'maria.gonzalez@test.com',
    telefono: '77777777',
    direccion: 'Heredia, Costa Rica',
    genero: 'femenino',
    password: 'Password456!',
    tipo_usuario: 'vendedor'
  },

  // Moderador válido
  validModerator: {
    cedula: '456789123',
    nombre: 'Carlos',
    apellido: 'Ramírez',
    correo: 'carlos.ramirez@test.com',
    telefono: '66666666',
    direccion: 'Cartago, Costa Rica',
    genero: 'masculino',
    password: 'Password789!',
    tipo_usuario: 'moderador'
  },

  // Administrador válido
  validAdmin: {
    cedula: '321654987',
    nombre: 'Ana',
    apellido: 'Rodríguez',
    correo: 'ana.rodriguez@test.com',
    telefono: '55555555',
    direccion: 'Alajuela, Costa Rica',
    genero: 'femenino',
    password: 'AdminPassword123!',
    tipo_usuario: 'administrador'
  },

  // Usuario con datos inválidos
  invalidUser: {
    cedula: '123', // Muy corto
    nombre: 'A', // Muy corto
    apellido: 'B', // Muy corto
    correo: 'invalid-email', // Email inválido
    telefono: '123', // Muy corto
    direccion: 'AB', // Muy corto
    genero: 'invalido', // Género inválido
    password: '123', // Contraseña muy corta
    tipo_usuario: 'invalido' // Tipo inválido
  },

  // Usuario sin datos requeridos
  incompleteUser: {
    nombre: 'Pedro'
    // Faltan campos requeridos
  }
};

/**
 * Credenciales de login de prueba
 */
const loginCredentials = {
  valid: {
    correo: 'test@test.com',
    password: 'Password123!'
  },

  invalidEmail: {
    correo: 'noexiste@test.com',
    password: 'Password123!'
  },

  invalidPassword: {
    correo: 'test@test.com',
    password: 'WrongPassword123!'
  },

  missingFields: {
    correo: 'test@test.com'
    // Falta password
  },

  invalidFormat: {
    correo: 'invalid-email',
    password: '123'
  }
};

/**
 * Códigos de verificación de prueba
 */
const verificationCodes = {
  valid: '123456',
  invalid: '000000',
  expired: '999999',
  malformed: 'ABC123',
  short: '123',
  long: '1234567'
};

/**
 * Tokens de prueba
 */
const tokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwidGlwb191c3VhcmlvIjoiY29tcHJhZG9yIiwiZXN0YWRvIjoiYWN0aXZvIiwiaWF0IjoxNTE2MjM5MDIyfQ.example',
  invalid: 'invalid.token.here',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiZXhwIjoxfQ.example',
  malformed: 'not.a.jwt'
};

/**
 * Datos de actualización de perfil
 */
const profileUpdates = {
  valid: {
    nombre: 'Nombre Actualizado',
    apellido: 'Apellido Actualizado',
    telefono: '99999999',
    direccion: 'Nueva Dirección de Prueba',
    genero: 'otro'
  },

  invalid: {
    nombre: 'A', // Muy corto
    apellido: 'B', // Muy corto
    telefono: '123', // Muy corto
    direccion: 'AB', // Muy corto
    genero: 'invalido' // Género inválido
  },

  partial: {
    nombre: 'Solo Nombre Actualizado'
    // Solo actualiza un campo
  }
};

/**
 * Datos de cambio de contraseña
 */
const passwordChanges = {
  valid: {
    currentPassword: 'Password123!',
    newPassword: 'NewPassword456!'
  },

  invalidCurrent: {
    currentPassword: 'WrongPassword',
    newPassword: 'NewPassword456!'
  },

  samePassword: {
    currentPassword: 'Password123!',
    newPassword: 'Password123!'
  },

  weakPassword: {
    currentPassword: 'Password123!',
    newPassword: '123'
  }
};

/**
 * Motivos de moderación
 */
const moderationReasons = {
  suspension: 'Usuario suspendido por violación de políticas de uso',
  activation: 'Usuario reactivado tras revisión',
  deactivation: 'Usuario desactivado por inactividad',
  warning: 'Advertencia por comportamiento inapropiado',
  ban: 'Prohibición permanente por infracciones graves'
};

/**
 * Parámetros de paginación
 */
const pagination = {
  default: {
    page: 1,
    limit: 10
  },

  custom: {
    page: 2,
    limit: 25
  },

  invalid: {
    page: -1,
    limit: 0
  },

  large: {
    page: 1,
    limit: 1000
  }
};

/**
 * Filtros de búsqueda de usuarios
 */
const userFilters = {
  byRole: {
    role: 'comprador',
    status: 'all'
  },

  byStatus: {
    role: 'all',
    status: 'activo'
  },

  bySearch: {
    search: 'Juan',
    role: 'all',
    status: 'all'
  },

  combined: {
    search: 'María',
    role: 'vendedor',
    status: 'activo'
  }
};

/**
 * Headers HTTP comunes
 */
const headers = {
  json: {
    'Content-Type': 'application/json'
  },

  withAuth: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }),

  formData: {
    'Content-Type': 'multipart/form-data'
  }
};

/**
 * Mensajes de error esperados
 */
const errorMessages = {
  auth: {
    tokenRequired: 'Token de acceso requerido',
    invalidToken: 'Token inválido',
    expiredToken: 'Token expirado',
    invalidCredentials: 'Credenciales inválidas',
    accountSuspended: 'Tu cuenta ha sido suspendida por incumplimiento de las políticas de uso',
    accountInactive: 'Cuenta inactiva o suspendida',
    emailNotVerified: 'Email no verificado. Revisa tu correo para verificar la cuenta.',
    sessionClosed: 'Tu sesión ha sido cerrada. Por favor, inicia sesión nuevamente.'
  },

  validation: {
    requiredField: 'es requerido',
    invalidEmail: 'debe ser un email válido',
    minLength: 'debe tener al menos',
    maxLength: 'no puede tener más de',
    invalidType: 'Tipo de usuario inválido'
  },

  permissions: {
    forbidden: 'No tienes permisos para realizar esta acción',
    unauthorized: 'Autenticación requerida',
    cannotModifyAdmin: 'No se puede modificar un administrador',
    cannotModifyOwnAccount: 'No puedes modificar tu propia cuenta'
  },

  database: {
    notFound: 'no encontrado',
    alreadyExists: 'ya está registrado',
    duplicateEmail: 'El email ya está registrado',
    duplicateCedula: 'La cédula ya está registrada'
  }
};

module.exports = {
  testUsers,
  loginCredentials,
  verificationCodes,
  tokens,
  profileUpdates,
  passwordChanges,
  moderationReasons,
  pagination,
  userFilters,
  headers,
  errorMessages
};

