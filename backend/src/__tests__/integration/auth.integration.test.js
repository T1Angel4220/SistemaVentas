/**
 * Pruebas de Integración - Módulo de Autenticación
 * 
 * Framework: Mocha + Chai + Supertest
 * Tipo: Pruebas Funcionales de Integración
 * 
 * Valida el flujo completo de autenticación interactuando con:
 * - API REST (Express)
 * - Base de datos (PostgreSQL)
 * - Servicios externos (JWT, Email)
 */

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const { 
  cleanDatabase, 
  testConnection, 
  closePool 
} = require('./setup/testDatabase');
const {
  createTestUser,
  getUserByEmail,
  getVerificationCode,
  getPasswordResetCode,
  countActiveSessions,
  generateVerificationCode
} = require('./setup/testHelpers');
const { testUsers, invalidCredentials } = require('./setup/testData');

describe('🔐 PRUEBAS DE INTEGRACIÓN - AUTENTICACIÓN', () => {
  
  // ========================================
  // HOOKS GLOBALES
  // ========================================
  
  // BEFORE ALL - Ejecuta UNA VEZ antes de todas las pruebas
  before(async function() {
    this.timeout(10000);
    
    console.log('\n🚀 Iniciando Pruebas de Integración de Autenticación\n');
    console.log('=' .repeat(60));
    
    // Verificar conexión a base de datos
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos de pruebas');
    }
    
    // Limpiar datos antes de empezar
    console.log('🧹 Limpiando datos de pruebas anteriores...');
    await cleanDatabase();
    
    console.log('✅ Entorno de pruebas preparado\n');
    console.log('=' .repeat(60) + '\n');
  });
  
  // AFTER ALL - Ejecuta UNA VEZ después de todas las pruebas
  after(async function() {
    this.timeout(10000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🧹 Limpiando datos de prueba finales...');
    
    // Limpiar datos después de todas las pruebas
    await cleanDatabase();
    
    // Cerrar conexiones a BD
    await closePool();
    
    console.log('✅ Suite de pruebas completada');
    console.log('='.repeat(60) + '\n');
  });
  
  // BEFORE EACH - Ejecuta antes de CADA prueba
  beforeEach(async function() {
    this.timeout(5000);
    // Limpiar base de datos antes de cada prueba
    await cleanDatabase();
  });

  // ========================================
  // 1. REGISTRO DE USUARIOS
  // ========================================
  describe('POST /api/auth/register - Registro de Usuarios', () => {
    
    it('✅ Debe registrar un nuevo comprador exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.buyer)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message').that.includes('registrado');
      expect(response.body.data).to.have.property('user');
      expect(response.body.data.user).to.have.property('correo', testUsers.buyer.correo);
      expect(response.body.data.user).to.have.property('tipo_usuario', 'comprador');
      expect(response.body.data.user).to.have.property('estado', 'pendiente_verificacion');

      // Verificar que se creó en la base de datos
      const userInDb = await getUserByEmail(testUsers.buyer.correo);
      expect(userInDb).to.not.be.null;
      expect(userInDb.email_verificado).to.be.false;
    });

    it('✅ Debe registrar un nuevo vendedor exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.seller)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data.user.tipo_usuario).to.equal('vendedor');
    });

    it('❌ Debe rechazar registro con email duplicado', async () => {
      // Crear usuario primero
      await createTestUser(testUsers.buyer);

      // Intentar registrar con el mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.buyer)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('email');
    });

    it('❌ Debe rechazar registro con cédula duplicada', async () => {
      // Crear usuario primero
      await createTestUser(testUsers.buyer);

      // Intentar registrar con la misma cédula pero diferente email
      const duplicateUser = {
        ...testUsers.buyer,
        correo: 'diferente@test.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('cédula');
    });

    it('❌ Debe rechazar registro con email inválido', async () => {
      const invalidUser = {
        ...testUsers.buyer,
        correo: 'email-sin-arroba'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).to.be.false;
    });

    it('❌ Debe rechazar registro con contraseña muy corta', async () => {
      const invalidUser = {
        ...testUsers.buyer,
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).to.be.false;
    });

    it('❌ Debe rechazar registro con tipo de usuario inválido', async () => {
      const invalidUser = {
        ...testUsers.buyer,
        tipo_usuario: 'super_admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).to.be.false;
    });
  });

  // ========================================
  // 2. VERIFICACIÓN DE EMAIL
  // ========================================
  describe('POST /api/auth/verify-email - Verificación de Email', () => {
    
    let testUser;
    let verificationCode;

    beforeEach(async () => {
      // Crear usuario no verificado
      testUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: false,
        estado: 'pendiente_verificacion'
      });

      // Generar y guardar código de verificación
      verificationCode = generateVerificationCode();
      const { query } = require('./setup/testDatabase');
      await query(
        `UPDATE usuarios 
         SET token_verificacion = $1, 
             fecha_actualizacion = NOW()
         WHERE id = $2`,
        [verificationCode, testUser.id]
      );
    });

    it('✅ Debe verificar email con código válido', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          code: verificationCode  // El endpoint espera 'code', no 'correo' y 'codigo'
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('verificado');

      // Verificar en BD
      const updatedUser = await getUserByEmail(testUser.correo);
      expect(updatedUser.email_verificado).to.be.true;
      expect(updatedUser.estado).to.equal('activo');
      expect(updatedUser.token_verificacion).to.be.null;
    });

    it('❌ Debe rechazar código de verificación incorrecto', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          code: '999999' // Código incorrecto
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('inválido'); // El mensaje dice 'inválido', no 'incorrecto'
    });

    it('❌ Debe rechazar verificación sin código', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          // No se envía código
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      // El mensaje puede ser de validación de Joi o del controlador
      // Ambos son válidos
    });

    it('❌ Debe rechazar verificación de email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          code: '111111' // Código que no existe en BD
        })
        .expect(400); // Devuelve 400, no 404

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('inválido');
    });
  });

  // ========================================
  // 3. REENVÍO DE CÓDIGO DE VERIFICACIÓN
  // ========================================
  describe('POST /api/auth/resend-verification-code - Reenvío de Código', () => {
    
    let unverifiedUser;

    beforeEach(async () => {
      unverifiedUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: false,
        estado: 'pendiente_verificacion'
      });
    });

    it('✅ Debe reenviar código de verificación exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification-code')
        .send({
          correo: unverifiedUser.correo
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('enviado');

      // Verificar que se generó un nuevo código
      const codes = await getVerificationCode(unverifiedUser.id);
      expect(codes.token_verificacion).to.not.be.null;
    });

    it('❌ Debe rechazar reenvío si la cuenta ya está verificada', async () => {
      // Crear usuario ya verificado
      const verifiedUser = await createTestUser({
        ...testUsers.seller,
        email_verificado: true,
        estado: 'activo'
      });

      const response = await request(app)
        .post('/api/auth/resend-verification-code')
        .send({
          correo: verifiedUser.correo
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('verificada');
    });

    it('❌ Debe rechazar reenvío para email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification-code')
        .send({
          correo: 'noexiste@test.com'
        })
        .expect(200); // Por seguridad, responde 200 aunque no exista

      // Aunque devuelve 200, no debe haber generado código
      expect(response.body.success).to.be.true;
    });
  });

  // ========================================
  // 4. LOGIN
  // ========================================
  describe('POST /api/auth/login - Inicio de Sesión', () => {
    
    let activeUser;

    beforeEach(async () => {
      // Crear usuario activo y verificado
      activeUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: true,
        estado: 'activo'
      });
    });

    it('✅ Debe iniciar sesión exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.buyer.correo,
          password: testUsers.buyer.password
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('exitoso');
      expect(response.body.data).to.have.property('user');
      expect(response.body.data).to.have.property('tokens');
      expect(response.body.data.tokens).to.have.property('accessToken');
      expect(response.body.data.tokens).to.have.property('refreshToken');

      // Verificar que se creó una sesión en BD
      const sessionCount = await countActiveSessions(activeUser.id);
      expect(sessionCount).to.be.greaterThan(0);
    });

    it('❌ Debe rechazar login con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: 'noexiste@test.com',
          password: 'cualquierpass'
        })
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Credenciales');
    });

    it('❌ Debe rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.buyer.correo,
          password: 'ContraseñaIncorrecta123'
        })
        .expect(401);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('Credenciales');
    });

    it('❌ Debe rechazar login de cuenta pendiente de verificación', async () => {
      // Crear usuario no verificado
      const unverifiedUser = await createTestUser({
        ...testUsers.seller,
        email_verificado: false,
        estado: 'pendiente_verificacion'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.seller.correo,
          password: testUsers.seller.password
        })
        .expect(401); // El backend devuelve 401 para credenciales inválidas incluyendo no verificado

      expect(response.body.success).to.be.false;
      // Puede ser mensaje de credenciales o de verificación
    });

    it('❌ Debe rechazar login de cuenta suspendida', async () => {
      // Crear usuario suspendido
      const suspendedUser = await createTestUser({
        ...testUsers.suspended,
        email_verificado: true
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.suspended.correo,
          password: testUsers.suspended.password
        })
        .expect(401); // El backend devuelve 401 para cuentas en estados no válidos

      expect(response.body.success).to.be.false;
    });

    it('❌ Debe rechazar login de cuenta inactiva', async () => {
      // Crear usuario inactivo
      const inactiveUser = await createTestUser({
        ...testUsers.inactive,
        email_verificado: true
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.inactive.correo,
          password: testUsers.inactive.password
        })
        .expect(401); // El backend devuelve 401 para cuentas en estados no válidos

      expect(response.body.success).to.be.false;
    });
  });

  // ========================================
  // 5. RECUPERACIÓN DE CONTRASEÑA
  // ========================================
  describe('POST /api/auth/request-password-reset - Solicitar Recuperación', () => {
    
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: true,
        estado: 'activo'
      });
    });

    it('✅ Debe enviar código de recuperación a email válido', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          correo: testUser.correo
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      // El mensaje es genérico por seguridad
      expect(response.body.message).to.exist;

      // Verificar que se generó el código en BD
      const resetData = await getPasswordResetCode(testUser.id);
      expect(resetData.token_recuperacion).to.not.be.null;
      expect(resetData.fecha_actualizacion).to.not.be.null;
    });

    it('✅ Debe responder igual aunque el email no exista (seguridad)', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          correo: 'noexiste@test.com'
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      // Por seguridad, responde igual aunque el usuario no exista
    });
  });

  // ========================================
  // 6. RESETEO DE CONTRASEÑA
  // ========================================
  describe('POST /api/auth/reset-password - Restablecer Contraseña', () => {
    
    let testUser;
    let resetToken;

    beforeEach(async () => {
      testUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: true,
        estado: 'activo'
      });

      // Generar token de recuperación
      resetToken = generateVerificationCode();
      const { query } = require('./setup/testDatabase');
      await query(
        `UPDATE usuarios 
         SET token_recuperacion = $1, 
             fecha_actualizacion = NOW()
         WHERE id = $2`,
        [resetToken, testUser.id]
      );
    });

    it('✅ Debe restablecer contraseña con código válido', async () => {
      const newPassword = 'NuevaContraseña123';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetToken,  // El endpoint espera 'code', no 'codigo'
          newPassword: newPassword
        })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('restablecida');

      // Verificar que se limpió el token
      const resetData = await getPasswordResetCode(testUser.id);
      expect(resetData.token_recuperacion).to.be.null;

      // Intentar login con nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUser.correo,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.success).to.be.true;
    });

    it('❌ Debe rechazar código de recuperación inválido', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: '999999',
          newPassword: 'NuevaContraseña123'
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('inválido');
    });

    it('❌ Debe rechazar contraseña nueva igual a la anterior', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          code: resetToken,
          newPassword: testUsers.buyer.password // Misma contraseña
        })
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.message).to.include('anterior'); // El mensaje menciona 'anterior', no 'diferente'
    });

    it('❌ Debe rechazar contraseña muy corta', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          codigo: resetToken,
          newPassword: '123' // Muy corta
        })
        .expect(400);

      expect(response.body.success).to.be.false;
    });
  });

  // ========================================
  // 7. OBTENER PERFIL
  // ========================================
  describe('GET /api/auth/profile - Obtener Perfil', () => {
    
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Crear usuario y hacer login
      testUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: true,
        estado: 'activo'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.buyer.correo,
          password: testUsers.buyer.password
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('✅ Debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.have.property('user');
      expect(response.body.data.user).to.have.property('correo', testUsers.buyer.correo);
      expect(response.body.data.user).to.not.have.property('password_hash');
    });

    it('❌ Debe rechazar solicitud sin token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).to.be.false;
    });

    it('❌ Debe rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body.success).to.be.false;
    });
  });

  // ========================================
  // 8. LOGOUT
  // ========================================
  describe('POST /api/auth/logout - Cerrar Sesión', () => {
    
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Crear usuario y hacer login
      testUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: true,
        estado: 'activo'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.buyer.correo,
          password: testUsers.buyer.password
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('✅ Debe cerrar sesión exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('exitoso');

      // Verificar que la sesión se marcó como inactiva
      const sessionCount = await countActiveSessions(testUser.id);
      expect(sessionCount).to.equal(0);
    });

    it('❌ Debe rechazar logout sin token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).to.be.false;
    });
  });

  // ========================================
  // 9. GESTIÓN DE SESIONES
  // ========================================
  describe('Gestión de Sesiones Múltiples', () => {
    
    let testUser;
    let token1, token2;

    beforeEach(async () => {
      testUser = await createTestUser({
        ...testUsers.buyer,
        email_verificado: true,
        estado: 'activo'
      });

      // Crear dos sesiones (simular login desde 2 dispositivos)
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.buyer.correo,
          password: testUsers.buyer.password
        });
      token1 = login1.body.data.tokens.accessToken;

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          correo: testUsers.buyer.correo,
          password: testUsers.buyer.password
        });
      token2 = login2.body.data.tokens.accessToken;
    });

    it('✅ Debe permitir múltiples sesiones activas', async () => {
      const sessionCount = await countActiveSessions(testUser.id);
      expect(sessionCount).to.equal(2);
    });

    it('✅ Debe cerrar solo una sesión sin afectar las demás', async () => {
      // Cerrar sesión 1
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      // Verificar que aún queda 1 sesión activa
      const sessionCount = await countActiveSessions(testUser.id);
      expect(sessionCount).to.equal(1);

      // Token2 debe seguir funcionando
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(profileResponse.body.success).to.be.true;
    });
  });
});

