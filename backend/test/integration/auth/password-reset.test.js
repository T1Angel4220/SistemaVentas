/**
 * Pruebas de Integración - Recuperación de Contraseña
 * Casos 19-23: Reset de Contraseña
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables, getUserByEmail } = require('../../helpers/db.helpers');
const { createTestUser, createSuspendedUser } = require('../../helpers/auth.helpers');
const bcrypt = require('bcrypt');

describe('C. Recuperación de Contraseña', () => {
  
  beforeEach(async () => {
    await cleanAuthTables();
  });

  describe('Caso 19: Solicitar reset con correo válido', () => {
    it('debe aceptar solicitud con correo existente', async () => {
      await createTestUser({
        correo: 'reset@test.com',
        password: 'OldPassword123!'
      });

      const res = await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset@test.com' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('correo');
    });

    it('debe generar código de recuperación de 6 dígitos', async () => {
      await createTestUser({
        correo: 'reset-code@test.com',
        password: 'OldPassword123!'
      });

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-code@test.com' })
        .expect(200);

      const user = await getUserByEmail('reset-code@test.com');
      expect(user.token_recuperacion).to.exist;
      expect(user.token_recuperacion).to.match(/^\d{6}$/);
    });

    it('debe actualizar el token si se solicita nuevamente', async () => {
      await createTestUser({
        correo: 'reset-update@test.com',
        password: 'Password123!'
      });

      // Primera solicitud
      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-update@test.com' })
        .expect(200);

      const user1 = await getUserByEmail('reset-update@test.com');
      const firstToken = user1.token_recuperacion;

      // Segunda solicitud (después de un pequeño delay para asegurar timestamp diferente)
      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-update@test.com' })
        .expect(200);

      const user2 = await getUserByEmail('reset-update@test.com');
      const secondToken = user2.token_recuperacion;

      expect(secondToken).to.not.equal(firstToken);
    });
  });

  describe('Caso 20: Solicitar reset con correo no existente', () => {
    it('debe responder genéricamente por seguridad', async () => {
      const res = await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'noexiste@test.com' })
        .expect(200);

      // No debe revelar si el correo existe o no
      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('correo');
    });

    it('no debe generar token para correo inexistente', async () => {
      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'noexiste2@test.com' })
        .expect(200);

      const user = await getUserByEmail('noexiste2@test.com');
      expect(user).to.be.null;
    });
  });

  describe('Caso 21: Reset exitoso con código válido', () => {
    it('debe cambiar contraseña con código válido', async () => {
      await createTestUser({
        correo: 'reset-success@test.com',
        password: 'OldPassword123!'
      });

      // Solicitar reset
      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-success@test.com' })
        .expect(200);

      // Obtener código
      const user = await getUserByEmail('reset-success@test.com');
      const resetCode = user.token_recuperacion;

      // Reset con código válido
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetCode,
          newPassword: 'NewPassword456!'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('restablecida');
    });

    it('debe limpiar el token de recuperación después del reset', async () => {
      await createTestUser({
        correo: 'reset-clean@test.com',
        password: 'OldPassword123!'
      });

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-clean@test.com' })
        .expect(200);

      const userBefore = await getUserByEmail('reset-clean@test.com');
      const resetCode = userBefore.token_recuperacion;

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetCode,
          newPassword: 'NewPassword456!'
        })
        .expect(200);

      const userAfter = await getUserByEmail('reset-clean@test.com');
      expect(userAfter.token_recuperacion).to.be.null;
    });

    it('debe permitir login con nueva contraseña', async () => {
      await createTestUser({
        correo: 'reset-login@test.com',
        password: 'OldPassword123!'
      });

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-login@test.com' })
        .expect(200);

      const user = await getUserByEmail('reset-login@test.com');
      const resetCode = user.token_recuperacion;

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetCode,
          newPassword: 'NewPassword456!'
        })
        .expect(200);

      // Intentar login con nueva contraseña
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'reset-login@test.com',
          password: 'NewPassword456!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);
    });

    it('debe invalidar todas las sesiones activas', async () => {
      const testUser = await createTestUser({
        correo: 'reset-sessions@test.com',
        password: 'OldPassword123!',
        createSession: false // No crear sesión automática, el login la creará
      });

      // Crear sesión activa (login)
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'reset-sessions@test.com',
          password: 'OldPassword123!'
        })
        .expect(200);

      const oldToken = loginRes.body.data.tokens.accessToken;

      // Solicitar y ejecutar reset
      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-sessions@test.com' })
        .expect(200);

      const user = await getUserByEmail('reset-sessions@test.com');
      const resetCode = user.token_recuperacion;

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetCode,
          newPassword: 'NewPassword456!'
        })
        .expect(200);

      // Intentar usar token viejo
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${oldToken}`)
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });

    it('no debe permitir usar misma contraseña', async () => {
      await createTestUser({
        correo: 'reset-same@test.com',
        password: 'SamePassword123!'
      });

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-same@test.com' })
        .expect(200);

      const user = await getUserByEmail('reset-same@test.com');
      const resetCode = user.token_recuperacion;

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetCode,
          newPassword: 'SamePassword123!'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('igual');
    });
  });

  describe('Caso 22: Reset fallido con código inválido', () => {
    it('debe rechazar código inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: '000000',
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('inválido');
    });

    it('debe rechazar código con formato incorrecto', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: 'ABC123',
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('debe rechazar contraseña muy corta', async () => {
      await createTestUser({
        correo: 'reset-short@test.com',
        password: 'OldPassword123!'
      });

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'reset-short@test.com' })
        .expect(200);

      const user = await getUserByEmail('reset-short@test.com');
      const resetCode = user.token_recuperacion;

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetCode,
          newPassword: '123'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      // El mensaje puede ser de validación general o específico
      expect(res.body.message.toLowerCase()).to.match(/inválido|caracteres/);
    });
  });

  describe('Caso 23: Reset bloqueado para usuario suspendido', () => {
    it('debe rechazar solicitud de reset de usuario suspendido', async () => {
      await createSuspendedUser({
        correo: 'suspended-reset@test.com',
        password: 'Password123!'
      });

      const res = await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'suspended-reset@test.com' })
        .expect(403);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('suspendida');
      expect(res.body).to.have.property('accountStatus', 'suspendido');
    });

    it('no debe generar token para usuario suspendido', async () => {
      await createSuspendedUser({
        correo: 'suspended-reset2@test.com',
        password: 'Password123!'
      });

      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ correo: 'suspended-reset2@test.com' })
        .expect(403);

      const user = await getUserByEmail('suspended-reset2@test.com');
      expect(user.token_recuperacion).to.be.null;
    });
  });

});

