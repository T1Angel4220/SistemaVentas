/**
 * Datos de prueba centralizados para tests E2E
 */

export const TestUsers = {
  comprador: {
    email: 'comprador@test.com',
    password: 'password123',
    cedula: '1234567890',
    nombre: 'Test',
    apellido: 'Comprador'
  },
  vendedor: {
    email: 'vendedor@test.com',
    password: 'password123',
    cedula: '0987654321',
    nombre: 'Test',
    apellido: 'Vendedor'
  },
  moderador: {
    email: 'moderador@test.com',
    password: 'password123',
    cedula: '1122334455',
    nombre: 'Test',
    apellido: 'Moderador'
  },
  administrador: {
    email: 'admin@test.com',
    password: 'password123',
    cedula: '5566778899',
    nombre: 'Test',
    apellido: 'Admin'
  }
};

/**
 * IDs de productos de prueba disponibles en la BD
 * Actualizados según datos reales de la base de datos
 */
export const TestProducts = {
  // Productos de otros vendedores (para pruebas de reporte)
  otroVendedor: {
    macbook: { id: 2, nombre: 'MacBook Air M1' },
    samsung: { id: 3, nombre: 'Samsung Galaxy S21' },
    ipad: { id: 4, nombre: 'iPad Pro 11"' }
  },
  // Producto con reporte pendiente
  conReporte: {
    iphone: { id: 1, nombre: 'iPhone 13 Pro Max' }
  }
};

/**
 * IDs de reportes de prueba
 */
export const TestReports = {
  pendiente: { id: 1, itemId: 1, tipo: 'informacion_falsa' }
};

/**
 * Generar email único para tests
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}@test.com`;
}

/**
 * Generar cédula única para tests
 */
export function generateUniqueCedula(): string {
  return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}
