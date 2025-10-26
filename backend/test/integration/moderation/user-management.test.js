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

    // Crear usuarios de prueba para todas las pruebas
    adminUser = await createTestAdmin({
      correo: 'admin@test.com',
      password: 'AdminPass123!'
    });
    // Ya no necesitamos createTestSession - se crea automáticamente

    moderatorUser = await createTestModerator({
      correo: 'moderator@test.com',
      password: 'ModPass123!'
    });
    // Ya no necesitamos createTestSession - se crea automáticamente

    buyerUser = await createTestBuyer({
      correo: 'buyer@test.com',
      password: 'BuyerPass123!'
    });

    sellerUser = await createTestSeller({
      correo: 'seller@test.com',
      password: 'SellerPass123!'
    });
  });

  describe('Caso 24: Admin registra moderador exitosamente', () => {
    it('debe permitir al admin crear un moderador', async () => {
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

      // Verificar que está en la BD
      const user = await getUserByEmail('nuevo-mod@test.com');
      expect(user).to.exist;
      expect(user.tipo_usuario).to.equal('moderador');
      expect(user.email_verificado).to.be.true; // Moderadores no necesitan verificar
    });

    it('moderador creado debe poder iniciar sesión inmediatamente', async () => {
      const newModerator = {
        cedula: '888888888',
        nombre: 'Test',
        apellido: 'Mod',
        correo: 'testmod@test.com',
        telefono: '77777777',
        direccion: 'Dir Test',
        genero: 'femenino',
        password: 'ModPass123!',
        tipo_usuario: 'moderador'
      };

      await request(app)
        .post('/api/auth/register-moderator')
        .set(getAuthHeaders(adminUser.token))
        .send(newModerator)
        .expect(201);

      // Intentar login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'testmod@test.com',
          password: 'ModPass123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);
    });
  });

  describe('Caso 25: Moderador suspende cuenta de usuario', () => {
    it('debe permitir al moderador suspender un comprador', async () => {
      const res = await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Violación de políticas' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('suspendido');

      // Verificar estado en BD
      const user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('suspendido');
    });

    it('debe permitir al moderador suspender un vendedor', async () => {
      const res = await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Comportamiento inapropiado' })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      const user = await getUserByEmail(sellerUser.correo);
      expect(user.estado).to.equal('suspendido');
    });

    it('debe cerrar todas las sesiones al suspender', async () => {
      // Sesión ya creada automáticamente en beforeEach
      
      let sessions = await countActiveSessions(buyerUser.id);
      expect(sessions).to.equal(1);

      // Suspender usuario
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test' })
        .expect(200);

      // Verificar sesiones cerradas
      sessions = await countActiveSessions(buyerUser.id);
      expect(sessions).to.equal(0);
    });
  });

  describe('Caso 26: Usuario suspendido no puede hacer login', () => {
    it('debe rechazar login de usuario suspendido', async () => {
      // Suspender usuario
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test suspensión' })
        .expect(200);

      // Intentar login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          correo: buyerUser.correo,
          password: 'BuyerPass123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('suspendida');
      expect(res.body).to.have.property('accountStatus', 'suspendido');
    });
  });

  describe('Caso 27: Moderador reactiva cuenta suspendida', () => {
    it('debe permitir al moderador reactivar cuenta', async () => {
      // Primero suspender
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Suspensión temporal' })
        .expect(200);

      // Verificar suspensión
      let user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('suspendido');

      // Reactivar
      const res = await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Revisión completada' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('activado');

      // Verificar reactivación en BD
      user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('activo');
    });

    it('usuario reactivado debe poder iniciar sesión', async () => {
      // Suspender
      await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test' })
        .expect(200);

      // Reactivar
      await request(app)
        .put(`/api/auth/activate-user/${sellerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Revisión OK' })
        .expect(200);

      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: sellerUser.correo,
          password: 'SellerPass123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);
    });
  });

  describe('Caso 28: Admin lista todos los usuarios', () => {
    it('debe permitir al admin ver lista de usuarios', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('users');
      expect(res.body.data.users).to.be.an('array');
      expect(res.body.data.users.length).to.be.at.least(4); // admin, mod, buyer, seller
    });

    it('debe permitir al moderador ver lista de usuarios', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set(getAuthHeaders(moderatorUser.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.users).to.be.an('array');
    });

    it('debe soportar paginación', async () => {
      const res = await request(app)
        .get('/api/auth/users?page=1&limit=2')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res.body.data).to.have.property('pagination');
      expect(res.body.data.pagination.limit).to.equal(2);
      expect(res.body.data.users.length).to.be.at.most(2);
    });

    it('debe soportar filtros por tipo de usuario', async () => {
      const res = await request(app)
        .get('/api/auth/users?role=comprador')
        .set(getAuthHeaders(adminUser.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      // Todos los usuarios deben ser compradores
      res.body.data.users.forEach(user => {
        if (user.tipo_usuario !== 'comprador') {
          throw new Error('Filtro de rol no funciona correctamente');
        }
      });
    });
  });

  describe('Caso 29: Email de suspensión enviado', () => {
    it('debe registrar acción de suspensión en auditoría', async () => {
      const actionsBefore = await countModerationActions(moderatorUser.id);

      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test suspensión' })
        .expect(200);

      const actionsAfter = await countModerationActions(moderatorUser.id);
      expect(actionsAfter).to.be.greaterThan(actionsBefore);
    });
  });

  describe('Caso 30: Email de reactivación enviado', () => {
    it('debe registrar acción de reactivación en auditoría', async () => {
      // Suspender primero
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test' })
        .expect(200);

      const actionsBefore = await countModerationActions(moderatorUser.id);

      // Reactivar
      await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Reactivación' })
        .expect(200);

      const actionsAfter = await countModerationActions(moderatorUser.id);
      expect(actionsAfter).to.be.greaterThan(actionsBefore);
    });
  });

  // ===================================================================
  // CASOS ADICIONALES CRÍTICOS (31-39)
  // ===================================================================

  describe('Caso 31: Admin suspende cuenta de comprador', () => {
    it('debe permitir al admin suspender comprador', async () => {
      const res = await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Admin suspendiendo' })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      const user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('suspendido');
    });
  });

  describe('Caso 32: Admin suspende cuenta de vendedor', () => {
    it('debe permitir al admin suspender vendedor', async () => {
      const res = await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Admin acción' })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      const user = await getUserByEmail(sellerUser.correo);
      expect(user.estado).to.equal('suspendido');
    });
  });

  describe('Caso 33: Admin reactiva cuenta suspendida', () => {
    it('debe permitir al admin reactivar cuenta', async () => {
      // Suspender
      await updateUserStatus(buyerUser.id, 'suspendido');

      // Reactivar
      const res = await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Admin reactivando' })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      const user = await getUserByEmail(buyerUser.correo);
      expect(user.estado).to.equal('activo');
    });
  });

  describe('Caso 34: Comprador intenta suspender usuario → 403', () => {
    it('debe rechazar intento de comprador de suspender', async () => {
      // Sesión ya creada automáticamente en beforeEach

      const res = await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(buyerUser.token))
        .send({ motivo: 'No permitido' })
        .expect(403);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('permisos');
    });
  });

  describe('Caso 35: Vendedor intenta suspender usuario → 403', () => {
    it('debe rechazar intento de vendedor de suspender', async () => {
      // Sesión ya creada automáticamente en beforeEach

      const res = await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(sellerUser.token))
        .send({ motivo: 'No permitido' })
        .expect(403);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('permisos');
    });
  });

  describe('Caso 36: Moderador intenta suspender admin → 403', () => {
    it('debe rechazar que moderador suspenda administrador', async () => {
      const res = await request(app)
        .put(`/api/auth/suspend-user/${adminUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'No debería permitirse' })
        .expect(403);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('administrador');
    });

    it('admin debe seguir activo después del intento', async () => {
      await request(app)
        .put(`/api/auth/suspend-user/${adminUser.id}`)
        .set(getAuthHeaders(moderatorUser.token))
        .send({ motivo: 'Test' })
        .expect(403);

      const admin = await getUserByEmail(adminUser.correo);
      expect(admin.estado).to.equal('activo');
    });
  });

  describe('Caso 37: Usuario suspendido pierde acceso inmediato → 401', () => {
    it('token debe ser rechazado inmediatamente después de suspensión', async () => {
      // Sesión ya creada automáticamente en beforeEach

      // Verificar que funciona
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

      // Intentar usar token inmediatamente
      const res = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(buyerUser.token))
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 38: Token de usuario suspendido rechazado en endpoint protegido → 401', () => {
    it('debe rechazar token en cualquier endpoint protegido', async () => {
      // Sesión ya creada automáticamente en beforeEach

      // Suspender
      await request(app)
        .put(`/api/auth/suspend-user/${sellerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Test' })
        .expect(200);

      // Intentar acceder a diferentes endpoints
      const endpoints = [
        '/api/auth/profile',
        '/api/auth/test',
        '/api/auth/users'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set(getAuthHeaders(sellerUser.token));
        
        expect(res.status).to.be.oneOf([401, 403]);
        expect(res.body.success).to.be.false;
      }
    });
  });

  describe('Caso 39: Sesiones cerradas automáticamente al suspender', () => {
    it('debe marcar sesiones como inactivas en BD', async () => {
      // Ya hay 1 sesión automática, crear una adicional para verificar múltiples
      await createTestSession(buyerUser.id, 'additional-token-123');
      
      let activeSessions = await countActiveSessions(buyerUser.id);
      expect(activeSessions).to.equal(2);

      // Suspender
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Cierre de sesiones' })
        .expect(200);

      // Verificar sesiones cerradas
      activeSessions = await countActiveSessions(buyerUser.id);
      expect(activeSessions).to.equal(0);
    });

    it('sesiones deben permanecer cerradas después de reactivación', async () => {
      // Sesión ya creada automáticamente en beforeEach

      // Suspender (cierra sesiones)
      await request(app)
        .put(`/api/auth/suspend-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Test' })
        .expect(200);

      // Reactivar
      await request(app)
        .put(`/api/auth/activate-user/${buyerUser.id}`)
        .set(getAuthHeaders(adminUser.token))
        .send({ motivo: 'Reactivado' })
        .expect(200);

      // Las sesiones antiguas NO deben reactivarse automáticamente
      const sessions = await countActiveSessions(buyerUser.id);
      expect(sessions).to.equal(0);

      // Usuario debe hacer login nuevamente
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: buyerUser.correo,
          password: 'BuyerPass123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);

      // Ahora sí debe haber una sesión nueva
      const newSessions = await countActiveSessions(buyerUser.id);
      expect(newSessions).to.equal(1);
    });
  });

});

