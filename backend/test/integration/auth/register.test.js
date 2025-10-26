/**
 * Pruebas de Integración - Registro de Usuarios
 * Casos 1-8: Registro y Verificación de Email
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables, userExists, getUserByEmail } = require('../../helpers/db.helpers');
const { testUsers } = require('../../helpers/fixtures');

describe('A. Registro y Verificación de Email', () => {
  
  // Limpiar base de datos antes de cada suite
  before(async () => {
    await cleanAuthTables();
  });

  // Limpiar después de cada test para independencia
  afterEach(async () => {
    await cleanAuthTables();
  });

  describe('Caso 1: Registro exitoso de comprador', () => {
    it('debe registrar un comprador con datos válidos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message').that.includes('registrado exitosamente');
      expect(res.body.data).to.have.property('user');
      expect(res.body.data.user).to.have.property('tipo_usuario', 'comprador');
      expect(res.body.data.user).to.have.property('estado', 'pendiente_verificacion');
      
      // Verificar que el usuario existe en la BD
      const exists = await userExists(testUsers.validBuyer.correo);
      expect(exists).to.be.true;
    });

    it('debe crear el usuario con email_verificado = false', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      const user = await getUserByEmail(testUsers.validBuyer.correo);
      expect(user.email_verificado).to.be.false;
      expect(user.token_verificacion).to.exist;
      expect(user.token_verificacion).to.have.lengthOf(6);
    });
  });

  describe('Caso 2: Registro exitoso de vendedor', () => {
    it('debe registrar un vendedor con datos válidos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validSeller)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.user).to.have.property('tipo_usuario', 'vendedor');
      expect(res.body.data.user).to.have.property('estado', 'pendiente_verificacion');
      
      const exists = await userExists(testUsers.validSeller.correo);
      expect(exists).to.be.true;
    });
  });

  describe('Caso 3: Email de verificación enviado', () => {
    it('debe generar un código de verificación de 6 dígitos', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      const user = await getUserByEmail(testUsers.validBuyer.correo);
      expect(user.token_verificacion).to.match(/^\d{6}$/);
    });

    it('debe incluir mensaje sobre verificación de email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      expect(res.body.message).to.include('email');
      expect(res.body.message.toLowerCase()).to.include('verif');
    });
  });

  describe('Caso 4: Verificación con código válido', () => {
    it('debe verificar el email con código correcto', async () => {
      // Primero registrar
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      // Obtener el código de verificación
      const user = await getUserByEmail(testUsers.validBuyer.correo);
      const verificationCode = user.token_verificacion;

      // Verificar con el código
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: verificationCode })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('verificado');

      // Verificar cambios en BD
      const updatedUser = await getUserByEmail(testUsers.validBuyer.correo);
      expect(updatedUser.email_verificado).to.be.true;
      expect(updatedUser.estado).to.equal('activo');
      expect(updatedUser.token_verificacion).to.be.null;
    });
  });

  describe('Caso 5: Verificación con código inválido', () => {
    it('debe rechazar código inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: '000000' })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('inválido');
    });

    it('debe rechazar código con formato incorrecto', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: 'ABC123' })
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('debe rechazar código muy corto', async () => {
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: '123' })
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 6: Intento de registro con correo duplicado', () => {
    it('debe rechazar registro con email ya existente', async () => {
      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      // Intento de segundo registro con mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('email');
      expect(res.body.message.toLowerCase()).to.include('registrado');
    });

    it('debe rechazar registro con cédula duplicada', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      // Intento con misma cédula pero diferente email
      const duplicateCedula = {
        ...testUsers.validBuyer,
        correo: 'otro@test.com'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(duplicateCedula)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('cédula');
    });
  });

  describe('Caso 7: Registro sin correo (validación)', () => {
    it('debe rechazar registro sin correo', async () => {
      const incompleteData = { ...testUsers.validBuyer };
      delete incompleteData.correo;

      const res = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('inválidos');
    });

    it('debe rechazar registro con correo inválido', async () => {
      const invalidEmail = {
        ...testUsers.validBuyer,
        correo: 'correo-invalido'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidEmail)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });
  });

  describe('Caso 8: Validación de datos requeridos', () => {
    it('debe rechazar registro sin cédula', async () => {
      const withoutCedula = { ...testUsers.validBuyer };
      delete withoutCedula.cedula;

      const res = await request(app)
        .post('/api/auth/register')
        .send(withoutCedula)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('debe rechazar registro sin nombre', async () => {
      const withoutName = { ...testUsers.validBuyer };
      delete withoutName.nombre;

      const res = await request(app)
        .post('/api/auth/register')
        .send(withoutName)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('debe rechazar registro sin contraseña', async () => {
      const withoutPassword = { ...testUsers.validBuyer };
      delete withoutPassword.password;

      const res = await request(app)
        .post('/api/auth/register')
        .send(withoutPassword)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('debe rechazar contraseña muy corta', async () => {
      const shortPassword = {
        ...testUsers.validBuyer,
        password: '123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(shortPassword)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });
  });

});

