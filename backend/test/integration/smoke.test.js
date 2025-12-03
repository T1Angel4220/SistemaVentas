/**
 * Smoke Test - Prueba básica para verificar que la configuración funciona
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { checkDatabaseConnection } = require('../helpers/db.helpers');

describe('🔥 Smoke Tests - Verificación de Configuración', () => {
  
  it('CF0001: Verificación de conexión a base de datos', async () => {
    const isConnected = await checkDatabaseConnection();
    expect(isConnected).to.be.true;
  });

  it('CF0002: Verificación de respuesta en rutas principales', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('message');
  });

  it('CF0003: Verificación de variables de entorno esenciales', () => {
    expect(process.env.NODE_ENV).to.exist;
    expect(process.env.DB_HOST).to.exist;
    expect(process.env.DB_NAME).to.exist;
    expect(process.env.JWT_SECRET).to.exist;
  });

  it('CF0004: Verificación de helpers de prueba disponibles', () => {
    const dbHelpers = require('../helpers/db.helpers');
    const authHelpers = require('../helpers/auth.helpers');
    
    expect(dbHelpers).to.have.property('cleanAuthTables');
    expect(authHelpers).to.have.property('createTestUser');
    expect(authHelpers).to.have.property('getAuthHeaders');
  });

});

