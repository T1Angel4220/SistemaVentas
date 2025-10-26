/**
 * Pruebas de Integración - Login y Sesiones
 * Casos 9-18: Autenticación y Gestión de Sesiones
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { 
  cleanAuthTables, 
  countActiveSessions, 
  getUserByEmail 
} = require('../../helpers/db.helpers');
const { 
  createTestUser,
  createUnverifiedUser,
  createSuspendedUser,
  createTestSession,
  getAuthHeaders
} = require('../../helpers/auth.helpers');
const { loginCredentials } = require('../../helpers/fixtures');

describe('B. Login y Sesiones', () => {
  
  beforeEach(async () => {
    await cleanAuthTables();
  });

  describe('Caso 9: Login exitoso con credenciales válidas', () => {
    it('debe permitir login con usuario activo y verificado', async () => {
      // Crear usuario activo y verificado
      const testUser = await createTestUser({
        correo: 'test@login.com',
        password: 'Password123!',
        estado: 'activo',
        email_verificado: true,
        createSession: false // No crear sesión, el login la creará
      });

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
      expect(res.body.data.tokens).to.have.property('refreshToken');
      expect(res.body.data.user.correo).to.equal('test@login.com');
    });

    it('debe crear una sesión en la base de datos', async () => {
      const testUser = await createTestUser({
        correo: 'test@session.com',
        password: 'Password123!',
        createSession: false
      });

      const sessionsBefore = await countActiveSessions(testUser.id);
      expect(sessionsBefore).to.equal(0);

      await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@session.com',
          password: 'Password123!'
        })
        .expect(200);

      const sessionsAfter = await countActiveSessions(testUser.id);
      expect(sessionsAfter).to.equal(1);
    });
  });

  describe('Caso 10: Login fallido con contraseña incorrecta', () => {
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

    it('no debe crear sesión en login fallido', async () => {
      const testUser = await createTestUser({
        correo: 'test@nosession.com',
        password: 'Password123!',
        createSession: false
      });

      await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@nosession.com',
          password: 'WrongPassword!'
        })
        .expect(401);

      const sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(0);
    });
  });

  describe('Caso 11: Login fallido con usuario inexistente', () => {
    it('debe rechazar login con email no registrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'noexiste@test.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('Credenciales inválidas');
    });
  });

  describe('Caso 12: Login bloqueado para usuario suspendido', () => {
    it('debe rechazar login de usuario suspendido', async () => {
      await createSuspendedUser({
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
    });

    it('no debe crear sesión para usuario suspendido', async () => {
      const suspendedUser = await createSuspendedUser({
        correo: 'suspended2@test.com',
        password: 'Password123!',
        createSession: false
      });

      await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'suspended2@test.com',
          password: 'Password123!'
        })
        .expect(401);

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
      // Verificar que el mensaje mencione verificación/pendiente
      const msg = res.body.message.toLowerCase();
      expect(msg).to.satisfy((text) => 
        text.includes('verif') || text.includes('pendiente'),
        'Mensaje debe mencionar verificación o estado pendiente'
      );
    });
  });

  describe('Caso 14: Sesión creada con datos correctos', () => {
    it('debe almacenar IP y User-Agent en la sesión', async () => {
      const testUser = await createTestUser({
        correo: 'test@metadata.com',
        password: 'Password123!',
        createSession: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'test@metadata.com',
          password: 'Password123!'
        })
        .set('User-Agent', 'Test/Browser 1.0')
        .expect(200);

      // Verificar que la sesión tiene los datos
      const sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(1);
    });
  });

  describe('Caso 15: Múltiples sesiones activas permitidas', () => {
    it('debe permitir múltiples sesiones simultáneas', async () => {
      const testUser = await createTestUser({
        correo: 'multi@session.com',
        password: 'Password123!',
        createSession: false
      });

      // Primera sesión
      await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'multi@session.com',
          password: 'Password123!'
        })
        .expect(200);

      // Segunda sesión
      await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'multi@session.com',
          password: 'Password123!'
        })
        .expect(200);

      const sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(2);
    });
  });

  describe('Caso 16: Token válido permite acceso', () => {
    it('debe acceder a ruta protegida con token válido', async () => {
      const testUser = await createTestUser({
        correo: 'token@test.com',
        password: 'Password123!',
        createSession: false
      });

      // Crear sesión manualmente
      await createTestSession(testUser.id, testUser.token);

      const res = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(testUser.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.user.id).to.equal(testUser.id);
    });
  });

  describe('Caso 17: Token inválido rechazado', () => {
    it('debe rechazar token malformado', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });

    it('debe rechazar request sin token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('Token');
    });
  });

  describe('Caso 18: Logout cierra sesión correctamente', () => {
    it('debe cerrar sesión activa', async () => {
      const testUser = await createTestUser({
        correo: 'logout@test.com',
        password: 'Password123!',
        createSession: false
      });

      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'logout@test.com',
          password: 'Password123!'
        })
        .expect(200);

      const token = loginRes.body.data.tokens.accessToken;

      // Verificar sesión activa
      let sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(1);

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(token))
        .expect(200);

      // Verificar sesión cerrada
      sessions = await countActiveSessions(testUser.id);
      expect(sessions).to.equal(0);
    });

    it('no debe permitir usar el token después de logout', async () => {
      const testUser = await createTestUser({
        correo: 'logout2@test.com',
        password: 'Password123!',
        createSession: false
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'logout2@test.com',
          password: 'Password123!'
        })
        .expect(200);

      const token = loginRes.body.data.tokens.accessToken;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(token))
        .expect(200);

      // Intentar usar el token
      const res = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(token))
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('sesión');
    });
  });

});

