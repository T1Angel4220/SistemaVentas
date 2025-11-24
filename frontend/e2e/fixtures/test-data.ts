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

