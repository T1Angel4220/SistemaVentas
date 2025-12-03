const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { query } = require('../../../src/config/database');
const { createTestUser } = require('../../helpers/auth.helpers');

const testUserData = {
  comprador: {
    cedula: '1234567890',
    nombre: 'Juan',
    apellido: 'Perez',
    correo: 'buyer.profile@test.com',
    telefono: '0987654321',
    direccion: 'Calle Falsa 123',
    genero: 'masculino',
    password: 'Password123!',
    tipo_usuario: 'comprador',
    estado: 'activo',
    email_verificado: true
  },
  vendedor: {
    cedula: '0987654321',
    nombre: 'Maria',
    apellido: 'Gomez',
    correo: 'seller.profile@test.com',
    telefono: '0912345678',
    direccion: 'Avenida Siempre Viva 742',
    genero: 'femenino',
    password: 'Password123!',
    tipo_usuario: 'vendedor',
    estado: 'activo',
    email_verificado: true
  }
};

describe('E. Gestión de Perfil de Usuario', () => {
  
  beforeEach(async () => {
    await cleanAuthTables();
  });

  describe('CF0029-CF0030: Obtener perfil', () => {
    it('CF0029: Obtención de perfil del usuario autenticado', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.user).to.have.property('id', testUser.id);
      expect(res.body.data.user).to.have.property('correo', testUserData.comprador.correo);
      expect(res.body.data.user).to.have.property('tipo_usuario', testUserData.comprador.tipo_usuario);
    });

    it('CF0030: Rechazo de acceso sin token o con token inválido', async () => {
      const res1 = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(res1.body).to.have.property('success', false);

      const res2 = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido_12345')
        .expect(401);

      expect(res2.body).to.have.property('success', false);
    });
  });

  describe('CF0031: Actualizar perfil', () => {
    it('CF0031: Actualización de campos individuales y múltiples campos', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      // Actualizar campo individual
      const res1 = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'NuevoNombre' })
        .expect(200);

      expect(res1.body).to.have.property('success', true);
      expect(res1.body.user).to.have.property('nombre', 'NuevoNombre');
      expect(res1.body.user).to.have.property('apellido', testUserData.comprador.apellido);

      // Actualizar múltiples campos
      const updates = {
        apellido: 'NuevoApellido',
        telefono: '0991112233',
        direccion: 'Avenida Nueva 789',
        genero: 'otro'
      };

      const res2 = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(res2.body).to.have.property('success', true);
      expect(res2.body.user).to.have.property('nombre', 'NuevoNombre'); // Mantiene cambio anterior
      expect(res2.body.user).to.have.property('apellido', updates.apellido);
      expect(res2.body.user).to.have.property('telefono', updates.telefono);
    });
  });

  describe('CF0032-CF0033: Validaciones de actualización', () => {
    it('CF0032: Rechazo de actualización sin campos o sin autenticación', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res1 = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res1.body).to.have.property('success', false);
      expect(res1.body.message).to.include('al menos un campo');

      const res2 = await request(app)
        .put('/api/auth/profile')
        .send({ nombre: 'NuevoNombre' })
        .expect(401);

      expect(res2.body).to.have.property('success', false);
    });

    it('CF0033: Validación de campos inmutables (cédula, correo, tipo_usuario)', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;
      const cedulaOriginal = testUser.cedula;
      const correoOriginal = testUser.correo;
      const tipoOriginal = testUser.tipo_usuario;

      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cedula: '9999999999',
          correo: 'nuevo@correo.com',
          tipo_usuario: 'administrador',
          nombre: 'NuevoNombre'
        })
        .expect(200);

      // Verificar en BD que los campos inmutables no cambiaron
      const userInDb = await query(
        'SELECT cedula, correo, tipo_usuario FROM usuarios WHERE id = $1',
        [testUser.id]
      );

      expect(userInDb.rows[0].cedula).to.equal(cedulaOriginal);
      expect(userInDb.rows[0].correo).to.equal(correoOriginal);
      expect(userInDb.rows[0].tipo_usuario).to.equal(tipoOriginal);
    });
  });

  describe('CF0034: Cambiar contraseña exitoso', () => {
    it('CF0034: Cambio de contraseña exitoso e invalidación de anterior', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: 'NuevaPassword123!'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('actualizada');

      // Verificar login con nueva contraseña
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUserData.comprador.correo,
          password: 'NuevaPassword123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);

      // Verificar que contraseña antigua no funciona
      const loginRes2 = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUserData.comprador.correo,
          password: testUserData.comprador.password
        })
        .expect(401);

      expect(loginRes2.body).to.have.property('success', false);
    });
  });

  describe('CF0035: Validaciones de cambio de contraseña', () => {
    it('CF0035: Validaciones de cambio de contraseña (incorrecta, misma, corta)', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      // Contraseña actual incorrecta
      const res1 = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'PasswordIncorrecta123',
          newPassword: 'NuevaPassword123!'
        })
        .expect(401);

      expect(res1.body).to.have.property('success', false);

      // Misma contraseña
      const res2 = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: testUserData.comprador.password
        })
        .expect(400);

      expect(res2.body).to.have.property('success', false);

      // Contraseña muy corta
      const res3 = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: '12345'
        })
        .expect(400);

      expect(res3.body).to.have.property('success', false);

      // Sin campos requeridos
      const res4 = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'NuevaPassword123!'
        })
        .expect(400);

      expect(res4.body).to.have.property('success', false);
    });
  });

  describe('CF0036: Seguridad de perfil', () => {
    it('CF0036: Seguridad: usuario solo accede a su propio perfil', async () => {
      const user1 = await createTestUser(testUserData.comprador);
      const user2 = await createTestUser(testUserData.vendedor);
      const token1 = user1.token;

      // User1 obtiene su perfil
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(res.body.data.user).to.have.property('id', user1.id);
      expect(res.body.data.user.id).to.not.equal(user2.id);

      // User1 actualiza su propio perfil
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send({ nombre: 'NombreModificado' })
        .expect(200);

      // Verificar que solo cambió el perfil de user1
      const user1InDb = await query('SELECT nombre FROM usuarios WHERE id = $1', [user1.id]);
      const user2InDb = await query('SELECT nombre FROM usuarios WHERE id = $1', [user2.id]);

      expect(user1InDb.rows[0].nombre).to.equal('NombreModificado');
      expect(user2InDb.rows[0].nombre).to.equal(testUserData.vendedor.nombre);
    });
  });

  describe('CF0037: Persistencia de datos', () => {
    it('CF0037: Persistencia de datos y actualización de fecha_actualizacion', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const beforeUpdate = await query(
        'SELECT fecha_actualizacion FROM usuarios WHERE id = $1',
        [testUser.id]
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const updates = {
        nombre: 'NombrePersistente',
        telefono: '0999777666'
      };

      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      // Verificar en BD
      const userInDb = await query(
        'SELECT nombre, telefono, fecha_actualizacion FROM usuarios WHERE id = $1',
        [testUser.id]
      );

      expect(userInDb.rows[0].nombre).to.equal(updates.nombre);
      expect(userInDb.rows[0].telefono).to.equal(updates.telefono);

      const dateBefore = new Date(beforeUpdate.rows[0].fecha_actualizacion);
      const dateAfter = new Date(userInDb.rows[0].fecha_actualizacion);
      expect(dateAfter.getTime()).to.be.greaterThan(dateBefore.getTime());
    });
  });

  describe('CF0038: Validación de género', () => {
    it('CF0038: Validación de valores válidos de género', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const validGenders = ['masculino', 'femenino', 'otro'];
      
      for (const gender of validGenders) {
        const res = await request(app)
          .put('/api/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({ genero: gender })
          .expect(200);

        expect(res.body).to.have.property('success', true);
        expect(res.body.user).to.have.property('genero', gender);
      }
    });
  });

});
