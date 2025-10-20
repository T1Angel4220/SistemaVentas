/**
 * Datos de Prueba Predefinidos
 * 
 * Conjuntos de datos reutilizables para diferentes escenarios de prueba
 */

/**
 * Usuarios de prueba para diferentes roles
 */
const testUsers = {
  // Comprador estándar
  buyer: {
    cedula: '111111111',
    nombre: 'Comprador',
    apellido: 'Test',
    correo: 'comprador@test.com',
    telefono: '1111-1111',
    direccion: 'San José, Costa Rica',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'comprador'
  },

  // Vendedor estándar
  seller: {
    cedula: '222222222',
    nombre: 'Vendedor',
    apellido: 'Test',
    correo: 'vendedor@test.com',
    telefono: '2222-2222',
    direccion: 'Alajuela, Costa Rica',
    genero: 'femenino',
    password: 'Test123456',
    tipo_usuario: 'vendedor'
  },

  // Moderador
  moderator: {
    cedula: '333333333',
    nombre: 'Moderador',
    apellido: 'Test',
    correo: 'moderador@test.com',
    telefono: '3333-3333',
    direccion: 'Cartago, Costa Rica',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'moderador'
  },

  // Administrador
  admin: {
    cedula: '444444444',
    nombre: 'Administrador',
    apellido: 'Test',
    correo: 'administrador@test.com',
    telefono: '4444-4444',
    direccion: 'Heredia, Costa Rica',
    genero: 'femenino',
    password: 'Test123456',
    tipo_usuario: 'administrador'
  },

  // Usuario no verificado
  unverified: {
    cedula: '555555555',
    nombre: 'No Verificado',
    apellido: 'Test',
    correo: 'noverificado@test.com',
    telefono: '5555-5555',
    direccion: 'Puntarenas, Costa Rica',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'comprador',
    email_verificado: false,
    estado: 'pendiente_verificacion'
  },

  // Usuario suspendido
  suspended: {
    cedula: '666666666',
    nombre: 'Suspendido',
    apellido: 'Test',
    correo: 'suspendido@test.com',
    telefono: '6666-6666',
    direccion: 'Guanacaste, Costa Rica',
    genero: 'femenino',
    password: 'Test123456',
    tipo_usuario: 'comprador',
    estado: 'suspendido'
  },

  // Usuario inactivo
  inactive: {
    cedula: '777777777',
    nombre: 'Inactivo',
    apellido: 'Test',
    correo: 'inactivo@test.com',
    telefono: '7777-7777',
    direccion: 'Limón, Costa Rica',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'comprador',
    estado: 'inactivo'
  }
};

/**
 * Productos de prueba
 */
const testProducts = {
  laptop: {
    nombre: 'Laptop HP Pavilion',
    descripcion: 'Laptop en excelente estado, 8GB RAM, 256GB SSD',
    precio: 350000,
    cantidad_disponible: 5,
    categoria_id: 1, // Electrónica
    ubicacion_id: 1
  },

  phone: {
    nombre: 'iPhone 12',
    descripcion: 'iPhone 12 de 64GB, color negro',
    precio: 450000,
    cantidad_disponible: 3,
    categoria_id: 1,
    ubicacion_id: 1
  },

  book: {
    nombre: 'Libro de Programación',
    descripcion: 'Clean Code - Robert Martin',
    precio: 25000,
    cantidad_disponible: 10,
    categoria_id: 2, // Libros
    ubicacion_id: 1
  }
};

/**
 * Credenciales inválidas para pruebas negativas
 */
const invalidCredentials = {
  // Email no válido
  invalidEmail: {
    correo: 'email-invalido',
    password: 'Test123456'
  },

  // Contraseña muy corta
  shortPassword: {
    correo: 'usuario@test.com',
    password: '123'
  },

  // Campos vacíos
  emptyFields: {
    correo: '',
    password: ''
  },

  // Email inexistente
  nonExistent: {
    correo: 'noexiste@test.com',
    password: 'Test123456'
  },

  // Contraseña incorrecta
  wrongPassword: {
    correo: 'comprador@test.com',
    password: 'ContraseñaIncorrecta123'
  }
};

/**
 * Datos de registro inválidos
 */
const invalidRegistrationData = {
  // Cédula duplicada
  duplicateCedula: {
    cedula: '111111111', // Ya existe
    nombre: 'Usuario',
    apellido: 'Nuevo',
    correo: 'nuevo@test.com',
    telefono: '9999-9999',
    direccion: 'San José',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'comprador'
  },

  // Email duplicado
  duplicateEmail: {
    cedula: '999999999',
    nombre: 'Usuario',
    apellido: 'Nuevo',
    correo: 'comprador@test.com', // Ya existe
    telefono: '9999-9999',
    direccion: 'San José',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'comprador'
  },

  // Tipo de usuario inválido
  invalidUserType: {
    cedula: '999999999',
    nombre: 'Usuario',
    apellido: 'Nuevo',
    correo: 'nuevo@test.com',
    telefono: '9999-9999',
    direccion: 'San José',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'super_admin' // No válido
  },

  // Email inválido
  invalidEmailFormat: {
    cedula: '999999999',
    nombre: 'Usuario',
    apellido: 'Nuevo',
    correo: 'email-sin-arroba',
    telefono: '9999-9999',
    direccion: 'San José',
    genero: 'masculino',
    password: 'Test123456',
    tipo_usuario: 'comprador'
  }
};

module.exports = {
  testUsers,
  testProducts,
  invalidCredentials,
  invalidRegistrationData
};

