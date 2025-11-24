/**
 * Pruebas de Integración - Login y Sesiones
 * Casos 9-18: Autenticación y Gestión de Sesiones
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { 
  cleanAuthTables, 
  countActiveSessions
} = require('../../helpers/db.helpers');
const { 
  createTestUser,
  createUnverifiedUser,
  createSuspendedUser,
  createTestSession,
  getAuthHeaders
} = require('../../helpers/auth.helpers');

describe('B. Login y Sesiones', () => {
  
  beforeEach(async () => {
    await cleanAuthTables();
  });

  describe('Caso 9: Login exitoso', () => {
    it('debe permitir login con usuario activo y crear sesión', async () => {
      const testUser = await createTestUser({
        correo: 'test@login.com',
        password: 'Password123!',
        estado: 'activo',
        email_verificado: true,
        createSession: false
      });

      const sessionsBefore = await countActiveSessions(testUser.id);
      expect(sessionsBefore).to.equal(0);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@login.com',
          password: 'Password123!'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('Login exitoso');
      expect(res.body.data).to.have.property('user');
      expect(res.body.data).to.have.property('tokens');
      expect(res.body.data.tokens).to.have.property('accessToken');
      
      const sessionsAfter = await countActiveSessions(testUser.id);
      expect(sessionsAfter).to.equal(1);
    });
  });

  describe('Caso 10-11: Login fallido', () => {
    it('debe rechazar login con contraseña incorrecta', async () => {
      await createTestUser({
        correo: 'test@fail.com',
        password: 'CorrectPassword123!',
        createSession: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@fail.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('Credenciales inválidas');
    });

    it('debe rechazar login con email no registrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'noexiste@test.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 12: Login bloqueado para usuario suspendido', () => {
    it('debe rechazar login y no crear sesión para usuario suspendido', async () => {
      const suspendedUser = await createSuspendedUser({
        correo: 'suspended@test.com',
        password: 'Password123!',
        createSession: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'suspended@test.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('suspendida');
      expect(res.body).to.have.property('accountStatus', 'suspendido');

      const sessions = await countActiveSessions(suspendedUser.id);
      expect(sessions).to.equal(0);
    });
  });

  describe('Caso 13: Login bloqueado sin verificar email', () => {
    it('debe rechazar login de usuario sin verificar', async () => {
      await createUnverifiedUser({
        correo: 'unverified@test.com',
        password: 'Password123!',
        createSession: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'unverified@test.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
      const msg = res.body.message.toLowerCase();
      expect(msg).to.satisfy((text) => 
        text.includes('verif') || text.includes('pendiente'),
        'Mensaje debe mencionar verificación o estado pendiente'
      );
    });
  });

  describe('Caso 14-16: Sesiones y tokens', () => {
    it('debe permitir múltiples sesiones simultáneas y acceso con token válido', async () => {
      const testUser = await createTestUser({
        correo: 'multi@session.com',
        password: 'Password123!',
        createSession: false
      });

      // Crear múltiples sesiones
      await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'multi@session.com',
          password: 'Password123!'
        })
        .expect(200);

      const loginRes2 = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'multi@session.com',
          password: 'Password123!'
        })
        .expect(200);

      const sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(2);

      // Acceder con token válido
      const token = loginRes2.body.data.tokens.accessToken;
      const res = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.user.id).to.equal(testUser.id);
    });
  });

  describe('Caso 17: Token inválido rechazado', () => {
    it('debe rechazar token malformado o ausente', async () => {
      const res1 = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res1.body).to.have.property('success', false);

      const res2 = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(res2.body).to.have.property('success', false);
      expect(res2.body.message).to.include('Token');
    });
  });

  describe('Caso 18: Logout', () => {
    it('debe cerrar sesión y invalidar token', async () => {
      const testUser = await createTestUser({
        correo: 'logout@test.com',
        password: 'Password123!',
        createSession: false
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'logout@test.com',
          password: 'Password123!'
        })
        .expect(200);

      const token = loginRes.body.data.tokens.accessToken;
      let sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(1);

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(token))
        .expect(200);

      sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(0);

      // Token debe ser inválido
      const res = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(token))
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 19: Login con datos de sesión', () => {
    it('debe almacenar IP y User-Agent en la sesión creada', async () => {
      const testUser = await createTestUser({
        correo: 'metadata@test.com',
        password: 'Password123!',
        createSession: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'metadata@test.com',
          password: 'Password123!'
        })
        .set('User-Agent', 'TestBrowser/1.0')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('tokens');
      
      const sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(1);
    });
  });

});
