/**
 * Pruebas de Integración - Gestión de Usuarios por Moderadores
 * Casos 24-39: Moderación y Control de Acceso
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { 
  cleanAuthTables, 
  cleanModerationTables,
  getUserByEmail,
  countActiveSessions,
  countModerationActions
} = require('../../helpers/db.helpers');
const { 
  createTestAdmin,
  createTestModerator,
  createTestBuyer,
  createTestSeller,
  createTestSession,
  getAuthHeaders,
  updateUserStatus
} = require('../../helpers/auth.helpers');

describe('D. Gestión de Usuarios (Moderadores y Admin)', () => {
  
  let adminUser, moderatorUser, buyerUser, sellerUser;

  beforeEach(async () => {
    await cleanAuthTables();
    await cleanModerationTables();

    adminUser = await createTestAdmin({
      correo: 'admin@test.com',
      password: 'AdminPass123!'
    });

    moderatorUser = await createTestModerator({
      correo: 'moderator@test.com',
      password: 'ModPass123!'
    });

    buyerUser = await createTestBuyer({
      correo: 'buyer@test.com',
      password: 'BuyerPass123!'
    });

    sellerUser = await createTestSeller({
      correo: 'seller@test.com',
      password: 'SellerPass123!'
    });
  });

  describe('CF0039: Admin registra moderador', () => {
    it('CF0039: Registro de moderador por administrador', async () => {
      const newModerator = {
        cedula: '999999999',
        nombre: 'Nuevo',
        apellido: 'Moderador',
        correo: 'nuevo-mod@test.com',
        telefono: '88888888',
        direccion: 'Dirección Test',
        genero: 'masculino',
        password: 'ModPassword123!',
        tipo_usuario: 'moderador'
      };

      const res = await request(app)
        .post('/api/auth/register-moderator')
        .set(getAuthHeaders(adminUser.token))
        .send(newModerator)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.user).to.have.property('tipo_usuario', 'moderador');
      expect(res.body.data.user).to.have.property('estado', 'activo');

      const user = await getUserByEmail('nuevo-mod@test.com');
      expect(user).to.exist;
      expect(user.email_verificado).to.be.true;

      // Login inmediato
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'nuevo-mod@test.com',
          password: 'ModPassword123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);
    });
  });

  describe('CF0040: Suspensión de usuarios', () => {
    it('CF0040: Suspensión de usuarios por moderador/admin', async () => {
      // Moderador suspende comprador
      const res1 = await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Violación de políticas' })
        .expect(200);

      expect(res1.body).to.have.property('success', true);
      let user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('suspendido');

      let sessions = await countActiveSessions(buyerUser.id);
      expect(sessions).to.equal(0);

      // Admin suspende vendedor
      const res2 = await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Admin acción' })
        .expect(200);

      expect(res2.body).to.have.property('success', true);
      user = await getUserByEmail(sellerUser.correo);
      expect(user.estado).to.equal('suspendido');
    });
  });

  describe('CF0041: Usuario suspendido y reactivación', () => {
    it('CF0041: Rechazo de login de usuario suspendido y reactivación exitosa', async () => {
      // Suspender
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Suspensión temporal' })
        .expect(200);

      let user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('suspendido');

      // Login rechazado
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: buyerUser.correo,
          password: 'BuyerPass123!'
        })
        .expect(401);

      expect(loginRes.body).to.have.property('success', false);
      expect(loginRes.body.message).to.include('suspendida');

      // Reactivar
      const res = await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Revisión completada' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('activo');

      // Login exitoso después de reactivación
      const loginRes2 = await request(app)
        .post('/api/auth/login')
        .send({
          correo: buyerUser.correo,
          password: 'BuyerPass123!'
        })
        .expect(200);

      expect(loginRes2.body).to.have.property('success', true);
    });
  });

  describe('CF0042: Listar usuarios', () => {
    it('CF0042: Lista de usuarios con paginación y filtros', async () => {
      // Admin ve lista
      const res1 = await request(app)
        .get('/api/auth/users')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res1.body).to.have.property('success', true);
      expect(res1.body.data.users).to.be.an('array');
      expect(res1.body.data.users.length).to.be.at.least(4);

      // Moderador ve lista
      const res2 = await request(app)
        .get('/api/auth/users')
        .set(getAuthHeaders(moderatorUser.token))
        .expect(200);

      expect(res2.body).to.have.property('success', true);

      // Paginación
      const res3 = await request(app)
        .get('/api/auth/users?page=1&limit=2')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res3.body.data).to.have.property('pagination');
      expect(res3.body.data.pagination.limit).to.equal(2);

      // Filtro por rol
      const res4 = await request(app)
        .get('/api/auth/users?role=comprador')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      res4.body.data.users.forEach(user => {
        expect(user.tipo_usuario).to.equal('comprador');
      });
    });
  });

  describe('CF0043: Auditoría de acciones', () => {
    it('CF0043: Registro de acciones en auditoría', async () => {
      const actionsBefore = await countModerationActions(moderatorUser.id);

      // Suspender
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test suspensión' })
        .expect(200);

      let actionsAfter = await countModerationActions(moderatorUser.id);
      expect(actionsAfter).to.be.greaterThan(actionsBefore);

      // Reactivar
      const actionsBefore2 = await countModerationActions(moderatorUser.id);
      await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Reactivación' })
        .expect(200);

      actionsAfter = await countModerationActions(moderatorUser.id);
      expect(actionsAfter).to.be.greaterThan(actionsBefore2);
    });
  });

  describe('CF0044: Admin puede suspender y reactivar', () => {
    it('CF0044: Suspensión y reactivación por administrador', async () => {
      // Admin suspende
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Admin suspendiendo' })
        .expect(200);

      let user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('suspendido');

      // Admin reactiva
      const res = await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Admin reactivando' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('activo');
    });
  });

  describe('CF0045: Usuarios regulares no pueden moderar', () => {
    it('CF0045: Rechazo de suspensión por usuarios regulares (comprador/vendedor)', async () => {
      // Comprador intenta suspender
      const res1 = await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(buyerUser.token))
        .send({ motivo: 'No permitido' })
        .expect(403);

      expect(res1.body).to.have.property('success', false);
      expect(res1.body.message).to.include('permisos');

      // Vendedor intenta suspender
      const res2 = await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(sellerUser.token))
        .send({ motivo: 'No permitido' })
        .expect(403);

      expect(res2.body).to.have.property('success', false);
    });
  });

  describe('CF0046: Moderador no puede suspender admin', () => {
    it('CF0046: Rechazo de suspensión de administrador por moderador', async () => {
      const res = await request(app)
        .put(`/api/auth/suspend-user/${adminUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'No debería permitirse' })
        .expect(403);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('administrador');

      const admin = await getUserByEmail(adminUser.correo);
      expect(admin.estado).to.equal('activo');
    });
  });

  describe('CF0047: Acceso denegado para suspendido', () => {
    it('CF0047: Acceso denegado para usuario suspendido en todos los endpoints', async () => {
      // Verificar acceso antes de suspender
      await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(buyerUser.token))
        .expect(200);

      // Suspender
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test revocación' })
        .expect(200);

      // Token debe ser rechazado en todos los endpoints
      const endpoints = ['/api/auth/profile', '/api/auth/users'];
      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set(getAuthHeaders(buyerUser.token));
        
        expect(res.status).to.be.oneOf([401, 403]);
        expect(res.body.success).to.be.false;
      }
    });
  });

  describe('CF0048: Gestión de sesiones al suspender/reactivar', () => {
    it('CF0048: Cierre de sesiones al suspender y no reactivarlas automáticamente', async () => {
      // Crear sesión adicional
      await createTestSession(buyerUser.id, 'additional-token-123');
      let activeSessions = await countActiveSessions(buyerUser.id);
      expect(activeSessions).to.equal(2);

      // Suspender (cierra sesiones)
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Cierre de sesiones' })
        .expect(200);

      activeSessions = await countActiveSessions(buyerUser.id);
      expect(activeSessions).to.equal(0);

      // Reactivar (no reactiva sesiones)
      await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Reactivado' })
        .expect(200);

      activeSessions = await countActiveSessions(buyerUser.id);
      expect(activeSessions).to.equal(0);

      // Usuario debe hacer login nuevamente
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: buyerUser.correo,
          password: 'BuyerPass123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);
      activeSessions = await countActiveSessions(buyerUser.id);
      expect(activeSessions).to.equal(1);
    });
  });

  describe('CF0049: Permisos de registro de moderador', () => {
    it('CF0049: Rechazo de registro de moderador sin permisos de admin', async () => {
      const newModerator = {
        cedula: '777777777',
        nombre: 'Intento',
        apellido: 'Moderador',
        correo: 'intento-mod@test.com',
        telefono: '66666666',
        direccion: 'Dir Test',
        genero: 'masculino',
        password: 'ModPass123!',
        tipo_usuario: 'moderador'
      };

      // Moderador intenta crear moderador
      const res1 = await request(app)
        .post('/api/auth/register-moderator')
        .set(getAuthHeaders(moderatorUser.token))
        .send(newModerator)
        .expect(403);

      expect(res1.body).to.have.property('success', false);
      expect(res1.body.message).to.include('permisos');

      // Comprador intenta crear moderador
      const res2 = await request(app)
        .post('/api/auth/register-moderator')
        .set(getAuthHeaders(buyerUser.token))
        .send(newModerator)
        .expect(403);

      expect(res2.body).to.have.property('success', false);

      // Verificar que no se creó
      const user = await getUserByEmail('intento-mod@test.com');
      expect(user).to.be.null;
    });
  });

  describe('CF0050: Validación de campos en lista de usuarios', () => {
    it('CF0050: Validación de campos en lista de usuarios y filtros combinados', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.users).to.be.an('array');

      // Verificar que cada usuario tiene campos esenciales
      if (res.body.data.users.length > 0) {
        const user = res.body.data.users[0];
        expect(user).to.have.property('id');
        expect(user).to.have.property('correo');
        expect(user).to.have.property('tipo_usuario');
        expect(user).to.have.property('estado');
      }

      // Filtro combinado: estado y rol
      const res2 = await request(app)
        .get('/api/auth/users?role=comprador&estado=activo')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res2.body).to.have.property('success', true);
      res2.body.data.users.forEach(user => {
        expect(user.tipo_usuario).to.equal('comprador');
        expect(user.estado).to.equal('activo');
      });
    });
  });

});
