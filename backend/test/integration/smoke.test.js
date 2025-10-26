/**
 * Smoke Test - Prueba básica para verificar que la configuración funciona
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { checkDatabaseConnection } = require('../helpers/db.helpers');

describe('🔥 Smoke Tests - Verificación de Configuración', () => {
  
  describe('Verificación de Base de Datos', () => {
    it('debe conectarse exitosamente a la base de datos', async () => {
      const isConnected = await checkDatabaseConnection();
      expect(isConnected).to.be.true;
    });
  });

  describe('Verificación del Servidor', () => {
    it('debe responder en la ruta raíz', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');
    });

    it('debe responder en /api/docs', async () => {
      const res = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('endpoints');
    });

    it('debe retornar 404 para rutas no existentes', async () => {
      const res = await request(app)
        .get('/ruta-inexistente')
        .expect(404);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Verificación de Helpers', () => {
    it('los helpers de base de datos deben estar disponibles', () => {
      const dbHelpers = require('../helpers/db.helpers');
      expect(dbHelpers).to.have.property('cleanDatabase');
      expect(dbHelpers).to.have.property('cleanAuthTables');
      expect(dbHelpers).to.have.property('userExists');
    });

    it('los helpers de autenticación deben estar disponibles', () => {
      const authHelpers = require('../helpers/auth.helpers');
      expect(authHelpers).to.have.property('createTestUser');
      expect(authHelpers).to.have.property('createTestAdmin');
      expect(authHelpers).to.have.property('getAuthHeaders');
    });

    it('los fixtures deben estar disponibles', () => {
      const fixtures = require('../helpers/fixtures');
      expect(fixtures).to.have.property('testUsers');
      expect(fixtures).to.have.property('loginCredentials');
      expect(fixtures).to.have.property('errorMessages');
    });
  });

  describe('Verificación de Variables de Entorno', () => {
    it('debe tener configurada la variable NODE_ENV', () => {
      expect(process.env.NODE_ENV).to.exist;
    });

    it('debe tener configuradas las variables de base de datos', () => {
      expect(process.env.DB_HOST).to.exist;
      expect(process.env.DB_PORT).to.exist;
      expect(process.env.DB_NAME).to.exist;
      expect(process.env.DB_USER).to.exist;
      expect(process.env.DB_PASSWORD).to.exist;
    });

    it('debe tener configurada la variable JWT_SECRET', () => {
      expect(process.env.JWT_SECRET).to.exist;
    });
  });

});

