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

  describe('CF0014: Login exitoso', () => {
    it('CF0014: Login exitoso con usuario activo y creación de sesión', async () => {
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

  describe('CF0015-CF0016: Login fallido', () => {
    it('CF0015: Rechazo de login con contraseña incorrecta', async () => {
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

    it('CF0016: Rechazo de login con email no registrado', async () => {
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

  describe('CF0017: Login bloqueado para usuario suspendido', () => {
    it('CF0017: Bloqueo de login para usuario suspendido', async () => {
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

  describe('CF0018: Login bloqueado sin verificar email', () => {
    it('CF0018: Bloqueo de login para usuario sin verificar email', async () => {
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

  describe('CF0019: Sesiones y tokens', () => {
    it('CF0019: Múltiples sesiones simultáneas y acceso con token válido', async () => {
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

  describe('CF0020: Token inválido rechazado', () => {
    it('CF0020: Rechazo de token malformado o ausente', async () => {
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

  describe('CF0021: Logout', () => {
    it('CF0021: Cierre de sesión e invalidación de token', async () => {
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

  describe('CF0022: Login con datos de sesión', () => {
    it('CF0022: Almacenamiento de IP y User-Agent en sesión creada', async () => {
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
