const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { query } = require('../../../src/config/database');
const { createTestUser } = require('../../helpers/auth.helpers');

// Datos de prueba
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

  describe('Caso 40: Obtener perfil', () => {
    it('debe obtener perfil del usuario autenticado', async () => {
      // Crear usuario
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('user');
      expect(res.body.data.user).to.have.property('id', testUser.id);
      expect(res.body.data.user).to.have.property('correo', testUserData.comprador.correo);
      expect(res.body.data.user).to.have.property('nombre', testUserData.comprador.nombre);
      expect(res.body.data.user).to.have.property('apellido', testUserData.comprador.apellido);
      expect(res.body.data.user).to.have.property('tipo_usuario', testUserData.comprador.tipo_usuario);
      expect(res.body.data.user).to.have.property('estado', testUserData.comprador.estado);
    });

    it('debe rechazar acceso sin token de autenticación', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message.toLowerCase()).to.include('token');
    });

    it('debe rechazar acceso con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido_12345')
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 41: Actualizar perfil - Campos individuales', () => {
    it('debe actualizar solo el nombre', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'NuevoNombre' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message');
      expect(res.body.user).to.have.property('nombre', 'NuevoNombre');
      expect(res.body.user).to.have.property('apellido', testUserData.comprador.apellido); // No cambió
    });

    it('debe actualizar solo el teléfono', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ telefono: '0999888777' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('telefono', '0999888777');
    });

    it('debe actualizar solo la dirección', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ direccion: 'Nueva Dirección 456' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('direccion', 'Nueva Dirección 456');
    });
  });

  describe('Caso 42: Actualizar perfil - Múltiples campos', () => {
    it('debe actualizar múltiples campos a la vez', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const updates = {
        nombre: 'NuevoNombre',
        apellido: 'NuevoApellido',
        telefono: '0991112233',
        direccion: 'Avenida Nueva 789',
        genero: 'otro'
      };

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('nombre', updates.nombre);
      expect(res.body.user).to.have.property('apellido', updates.apellido);
      expect(res.body.user).to.have.property('telefono', updates.telefono);
      expect(res.body.user).to.have.property('direccion', updates.direccion);
      expect(res.body.user).to.have.property('genero', updates.genero);
    });

    it('debe actualizar algunos campos y mantener otros sin cambios', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'NombreModificado',
          telefono: '0987654321'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('nombre', 'NombreModificado');
      expect(res.body.user).to.have.property('telefono', '0987654321');
      expect(res.body.user).to.have.property('apellido', testUserData.comprador.apellido); // Sin cambios
      expect(res.body.user).to.have.property('direccion', testUserData.comprador.direccion); // Sin cambios
    });
  });

  describe('Caso 43: Validaciones de actualización de perfil', () => {
    it('debe rechazar actualización sin ningún campo', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('al menos un campo');
    });

    it('debe rechazar actualización sin autenticación', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ nombre: 'NuevoNombre' })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });

    it('no debe permitir cambiar la cédula (campo inmutable)', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;
      const cedulaOriginal = testUser.cedula;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cedula: '9999999999', // Intento de cambio
          nombre: 'NuevoNombre'
        })
        .expect(200);

      // Verificar en BD que la cédula no cambió
      const userInDb = await query('SELECT cedula FROM usuarios WHERE id = $1', [testUser.id]);
      expect(userInDb.rows[0].cedula).to.equal(cedulaOriginal);
    });

    it('no debe permitir cambiar el correo (campo inmutable)', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;
      const correoOriginal = testUser.correo;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          correo: 'nuevo@correo.com', // Intento de cambio
          nombre: 'NuevoNombre'
        })
        .expect(200);

      // Verificar en BD que el correo no cambió
      const userInDb = await query('SELECT correo FROM usuarios WHERE id = $1', [testUser.id]);
      expect(userInDb.rows[0].correo).to.equal(correoOriginal);
    });

    it('no debe permitir cambiar el tipo de usuario', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;
      const tipoOriginal = testUser.tipo_usuario;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo_usuario: 'administrador', // Intento de escalamiento de privilegios
          nombre: 'NuevoNombre'
        })
        .expect(200);

      // Verificar en BD que el tipo no cambió
      const userInDb = await query('SELECT tipo_usuario FROM usuarios WHERE id = $1', [testUser.id]);
      expect(userInDb.rows[0].tipo_usuario).to.equal(tipoOriginal);
    });
  });

  describe('Caso 44: Cambiar contraseña - Casos exitosos', () => {
    it('debe cambiar contraseña con credenciales válidas', async () => {
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

      // Verificar que puede hacer login con la nueva contraseña
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUserData.comprador.correo,
          password: 'NuevaPassword123!'
        })
        .expect(200);

      expect(loginRes.body).to.have.property('success', true);
    });

    it('debe invalidar la contraseña anterior después del cambio', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      // Cambiar contraseña
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: 'NuevaPassword123!'
        })
        .expect(200);

      // Intentar login con contraseña antigua debe fallar
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUserData.comprador.correo,
          password: testUserData.comprador.password // Contraseña antigua
        })
        .expect(401);

      expect(loginRes.body).to.have.property('success', false);
    });
  });

  describe('Caso 45: Cambiar contraseña - Validaciones', () => {
    it('debe rechazar con contraseña actual incorrecta', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'PasswordIncorrecta123',
          newPassword: 'NuevaPassword123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message.toLowerCase()).to.include('incorrecta');
    });

    it('debe rechazar nueva contraseña igual a la actual', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: testUserData.comprador.password // Misma contraseña
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('diferente');
    });

    it('debe rechazar contraseña muy corta (<6 caracteres)', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: '12345' // Solo 5 caracteres
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message.toLowerCase()).to.match(/6 caracteres|caracteres/);
    });

    it('debe rechazar sin contraseña actual', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'NuevaPassword123!'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.match(/actual|proporcionar/);
    });

    it('debe rechazar sin nueva contraseña', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.match(/nueva|proporcionar/);
    });

    it('debe rechazar cambio sin autenticación', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'NuevaPassword123!'
        })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 46: Seguridad de perfil', () => {
    it('debe permitir a cada usuario ver solo su propio perfil', async () => {
      // Crear dos usuarios
      const user1 = await createTestUser(testUserData.comprador);
      const user2 = await createTestUser(testUserData.vendedor);

      const token1 = user1.token;

      // User1 obtiene su perfil
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(res.body.data.user).to.have.property('id', user1.id);
      expect(res.body.data.user).to.have.property('correo', user1.correo);
      // No debe ver datos de user2
      expect(res.body.data.user.id).to.not.equal(user2.id);
    });

    it('un usuario no puede actualizar el perfil de otro usuario', async () => {
      const user1 = await createTestUser(testUserData.comprador);
      const user2 = await createTestUser(testUserData.vendedor);

      const token1 = user1.token;

      // User1 intenta actualizar su propio perfil (esto funciona)
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send({ nombre: 'NombreModificado' })
        .expect(200);

      // Verificar que solo cambió el perfil de user1
      const user1InDb = await query('SELECT nombre FROM usuarios WHERE id = $1', [user1.id]);
      const user2InDb = await query('SELECT nombre FROM usuarios WHERE id = $1', [user2.id]);

      expect(user1InDb.rows[0].nombre).to.equal('NombreModificado');
      expect(user2InDb.rows[0].nombre).to.equal(testUserData.vendedor.nombre); // Sin cambios
    });

    it('token expirado no debe permitir actualizar perfil', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const tokenInvalido = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OTksImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.invalid';

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${tokenInvalido}`)
        .send({ nombre: 'NuevoNombre' })
        .expect(401);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 47: Persistencia de datos', () => {
    it('los cambios de perfil deben persistir en la base de datos', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const updates = {
        nombre: 'NombrePersistente',
        telefono: '0999777666'
      };

      // Actualizar perfil
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      // Verificar en BD directamente
      const userInDb = await query(
        'SELECT nombre, telefono FROM usuarios WHERE id = $1',
        [testUser.id]
      );

      expect(userInDb.rows[0].nombre).to.equal(updates.nombre);
      expect(userInDb.rows[0].telefono).to.equal(updates.telefono);
    });

    it('debe actualizar fecha_actualizacion al modificar perfil', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      // Obtener fecha actual
      const beforeUpdate = await query(
        'SELECT fecha_actualizacion FROM usuarios WHERE id = $1',
        [testUser.id]
      );

      // Esperar un momento para asegurar diferencia de tiempo
      await new Promise(resolve => setTimeout(resolve, 100));

      // Actualizar perfil
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'NuevoNombre' })
        .expect(200);

      // Verificar que fecha_actualizacion cambió
      const afterUpdate = await query(
        'SELECT fecha_actualizacion FROM usuarios WHERE id = $1',
        [testUser.id]
      );

      const dateBefore = new Date(beforeUpdate.rows[0].fecha_actualizacion);
      const dateAfter = new Date(afterUpdate.rows[0].fecha_actualizacion);

      expect(dateAfter.getTime()).to.be.greaterThan(dateBefore.getTime());
    });
  });

  describe('Caso 48: Casos extremos', () => {
    it('debe manejar nombres muy largos correctamente', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const nombreLargo = 'A'.repeat(100);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: nombreLargo })
        .expect(200);

      expect(res.body.user.nombre).to.have.lengthOf.at.most(100);
    });

    it('debe manejar caracteres especiales en nombre', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      const token = testUser.token;

      const nombreEspecial = "María José O'Brien-García";

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: nombreEspecial })
        .expect(200);

      expect(res.body.user.nombre).to.equal(nombreEspecial);
    });

    it('debe permitir cambiar contraseña múltiples veces', async () => {
      const testUser = await createTestUser(testUserData.comprador);
      let token = testUser.token;

      // Primer cambio
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUserData.comprador.password,
          newPassword: 'Password2!'
        })
        .expect(200);

      // Login con nueva contraseña
      const loginRes1 = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUserData.comprador.correo,
          password: 'Password2!'
        })
        .expect(200);
      
      token = loginRes1.body.data.tokens.accessToken;

      // Segundo cambio
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password2!',
          newPassword: 'Password3!'
        })
        .expect(200);

      // Verificar login con la última contraseña
      const finalLogin = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUserData.comprador.correo,
          password: 'Password3!'
        })
        .expect(200);

      expect(finalLogin.body).to.have.property('success', true);
    });
  });
});

