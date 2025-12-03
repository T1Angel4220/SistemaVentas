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
  
  beforeEach(async () => {
    await cleanAuthTables();
  });

  describe('CF0005-CF0006: Registro exitoso', () => {
    it('CF0005: Registro exitoso de comprador con código de verificación', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('registrado exitosamente');
      expect(res.body.data.user).to.have.property('tipo_usuario', 'comprador');
      expect(res.body.data.user).to.have.property('estado', 'pendiente_verificacion');
      
      const exists = await userExists(testUsers.validBuyer.correo);
      expect(exists).to.be.true;

      const user = await getUserByEmail(testUsers.validBuyer.correo);
      expect(user.email_verificado).to.be.false;
      expect(user.token_verificacion).to.match(/^\d{6}$/);
      expect(res.body.message.toLowerCase()).to.include('verif');
    });

    it('CF0006: Registro exitoso de vendedor', async () => {
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

  describe('CF0007: Verificación con código válido', () => {
    it('CF0007: Verificación de email con código válido', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      const user = await getUserByEmail(testUsers.validBuyer.correo);
      const verificationCode = user.token_verificacion;

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: verificationCode })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('verificado');

      const updatedUser = await getUserByEmail(testUsers.validBuyer.correo);
      expect(updatedUser.email_verificado).to.be.true;
      expect(updatedUser.estado).to.equal('activo');
      expect(updatedUser.token_verificacion).to.be.null;
    });
  });

  describe('CF0008: Verificación con código inválido', () => {
    it('CF0008: Rechazo de códigos de verificación inválidos', async () => {
      const invalidCodes = [
        { code: '000000', desc: 'inexistente' },
        { code: 'ABC123', desc: 'formato incorrecto' },
        { code: '123', desc: 'muy corto' }
      ];

      for (const { code, desc } of invalidCodes) {
        const res = await request(app)
          .post('/api/auth/verify-email')
          .send({ code })
          .expect(400);

        expect(res.body).to.have.property('success', false);
      }
    });
  });

  describe('CF0009-CF0010: Registro con datos duplicados', () => {
    it('CF0009: Rechazo de registro con email duplicado', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message.toLowerCase()).to.satisfy((msg) => 
        msg.includes('email') || msg.includes('registrado')
      );
    });

    it('CF0010: Rechazo de registro con cédula duplicada', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

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

  describe('CF0011: Validación de correo', () => {
    it('CF0011: Rechazo de registro sin correo o con correo inválido', async () => {
      const withoutEmail = { ...testUsers.validBuyer };
      delete withoutEmail.correo;

      const res1 = await request(app)
        .post('/api/auth/register')
        .send(withoutEmail)
        .expect(400);

      expect(res1.body).to.have.property('success', false);

      const invalidEmail = {
        ...testUsers.validBuyer,
        correo: 'correo-invalido'
      };

      const res2 = await request(app)
        .post('/api/auth/register')
        .send(invalidEmail)
        .expect(400);

      expect(res2.body).to.have.property('success', false);
    });
  });

  describe('CF0012: Validación de campos requeridos', () => {
    it('CF0012: Rechazo de registro sin campos requeridos o contraseña muy corta', async () => {
      const requiredFields = ['cedula', 'nombre', 'password'];
      
      for (const field of requiredFields) {
        const incompleteData = { ...testUsers.validBuyer };
        delete incompleteData[field];

        const res = await request(app)
          .post('/api/auth/register')
          .send(incompleteData)
          .expect(400);

        expect(res.body).to.have.property('success', false);
      }

      // Contraseña muy corta
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

  describe('CF0013: Verificación con código ya usado', () => {
    it('CF0013: Rechazo de código de verificación ya utilizado', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUsers.validBuyer)
        .expect(201);

      const user = await getUserByEmail(testUsers.validBuyer.correo);
      const verificationCode = user.token_verificacion;

      // Primera verificación (exitosa)
      await request(app)
        .post('/api/auth/verify-email')
        .send({ code: verificationCode })
        .expect(200);

      // Intentar usar el mismo código nuevamente
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ code: verificationCode })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message.toLowerCase()).to.satisfy((msg) => 
        msg.includes('inválido') || msg.includes('usado') || msg.includes('ya')
      );
    });
  });

});
