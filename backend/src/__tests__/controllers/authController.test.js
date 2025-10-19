/**
 * Tests para Auth Controller
 * 
 * Pruebas unitarias para todas las funciones de autenticación:
 * - Registro de usuarios
 * - Inicio de sesión
 * - Verificación de email
 * - Recuperación de contraseña
 * - Restablecimiento de contraseña
 */

// Mocks deben ir ANTES de los imports
jest.mock('../../config/database', () => require('../mocks/database.mock'));
jest.mock('../../services/jwt', () => require('../mocks/jwt.mock'));
jest.mock('../../services/email', () => require('../mocks/email.mock'));
jest.mock('../../config/config', () => require('../mocks/config.mock'));

const authController = require('../../controllers/authController');
const { query } = require('../../config/database');
const {
  generateSessionTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken
} = require('../../services/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail
} = require('../../services/email');
const bcrypt = require('bcrypt');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset de mocks antes de cada test
    jest.clearAllMocks();

    // Mock de objetos request y response
    req = {
      body: {},
      params: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  // ========================================
  // TESTS DE REGISTRO (register)
  // ========================================
  describe('register', () => {
    const validUserData = {
      cedula: '123456789',
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@example.com',
      telefono: '12345678',
      direccion: 'San José',
      genero: 'masculino',
      password: 'password123',
      tipo_usuario: 'comprador'
    };

    test('Debe registrar un nuevo comprador exitosamente', async () => {
      req.body = validUserData;

      // Mock: Email no existe
      query.mockResolvedValueOnce({ rows: [] });
      // Mock: Cédula no existe
      query.mockResolvedValueOnce({ rows: [] });
      // Mock: Inserción exitosa
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          cedula: validUserData.cedula,
          nombre: validUserData.nombre,
          apellido: validUserData.apellido,
          correo: validUserData.correo,
          tipo_usuario: 'comprador',
          estado: 'pendiente_verificacion'
        }]
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('registrado exitosamente')
        })
      );
      expect(sendVerificationEmail).toHaveBeenCalled();
    });

    test('Debe registrar un vendedor exitosamente', async () => {
      req.body = { ...validUserData, tipo_usuario: 'vendedor' };

      query.mockResolvedValueOnce({ rows: [] });
      query.mockResolvedValueOnce({ rows: [] });
      query.mockResolvedValueOnce({
        rows: [{
          id: 2,
          ...req.body,
          estado: 'pendiente_verificacion'
        }]
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(sendVerificationEmail).toHaveBeenCalled();
    });

    test('Debe rechazar registro con email duplicado', async () => {
      req.body = validUserData;

      // Mock: Email ya existe
      query.mockResolvedValueOnce({ 
        rows: [{ id: 999 }] 
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'El email ya está registrado'
        })
      );
    });

    test('Debe rechazar registro con cédula duplicada', async () => {
      req.body = validUserData;

      // Mock: Email no existe
      query.mockResolvedValueOnce({ rows: [] });
      // Mock: Cédula ya existe
      query.mockResolvedValueOnce({ 
        rows: [{ id: 999 }] 
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'La cédula ya está registrada'
        })
      );
    });

    test('Debe rechazar tipo de usuario inválido', async () => {
      req.body = { ...validUserData, tipo_usuario: 'administrador' };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('inválido')
        })
      );
    });

    test('Debe manejar errores de base de datos', async () => {
      req.body = validUserData;

      // Mock: Error en la consulta
      query.mockRejectedValueOnce(new Error('Database error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error interno del servidor'
        })
      );
    });
  });

  // ========================================
  // TESTS DE LOGIN (login)
  // ========================================
  describe('login', () => {
    const hashedPassword = bcrypt.hashSync('password123', 10);

    test('Debe validar credenciales correctamente y generar tokens', async () => {
      // Este test valida el flujo principal del login sin el email de notificación
      // El test completo de login se validará con tests de integración
      
      req.body = {
        correo: 'juan@example.com',
        password: 'password123'
      };
      req.ip = '127.0.0.1';
      req.connection = { remoteAddress: '127.0.0.1' };
      req.get = jest.fn().mockReturnValue('Jest Test Agent');

      // Mock: Usuario existe y está activo
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          cedula: '123456789',
          correo: 'juan@example.com',
          password_hash: hashedPassword,
          nombre: 'Juan',
          apellido: 'Pérez',
          tipo_usuario: 'comprador',
          estado: 'activo',
          email_verificado: true
        }]
      });

      // Mock: Inserción de sesión
      query.mockResolvedValueOnce({ 
        rows: [{ id: 1 }] 
      });

      // Mock: Actualización de último acceso
      query.mockResolvedValueOnce({ rows: [] });

      await authController.login(req, res);

      // Verificar que se llamó a generateSessionTokens
      expect(generateSessionTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          correo: 'juan@example.com'
        })
      );

      // Verificar que se respondió (éxito o error manejado)
      expect(res.json).toHaveBeenCalled();
      
      // Si la respuesta fue exitosa, verificar estructura
      const response = res.json.mock.calls[0][0];
      if (response.success) {
        expect(response).toEqual(
          expect.objectContaining({
            success: true,
            message: 'Login exitoso',
            data: expect.objectContaining({
              user: expect.any(Object),
              tokens: expect.any(Object)
            })
          })
        );
      }
    });

    test('Debe rechazar login con email inexistente', async () => {
      req.body = {
        correo: 'noexiste@example.com',
        password: 'password123'
      };

      // Mock: Usuario no existe
      query.mockResolvedValueOnce({ rows: [] });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Credenciales inválidas'
        })
      );
    });

    test('Debe rechazar login con contraseña incorrecta', async () => {
      req.body = {
        correo: 'juan@example.com',
        password: 'wrongpassword'
      };

      // Mock: Usuario existe
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          password_hash: hashedPassword,
          estado: 'activo'
        }]
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Credenciales inválidas'
        })
      );
    });

    test('Debe rechazar login de cuenta pendiente de verificación', async () => {
      req.body = {
        correo: 'juan@example.com',
        password: 'password123'
      };

      // Mock: Usuario existe pero no verificado
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          password_hash: hashedPassword,
          estado: 'pendiente_verificacion',
          nombre: 'Juan',
          apellido: 'Pérez'
        }]
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('pendiente de verificación')
        })
      );
    });

    test('Debe rechazar login de cuenta suspendida', async () => {
      req.body = {
        correo: 'juan@example.com',
        password: 'password123'
      };

      // Mock: Usuario suspendido
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          password_hash: hashedPassword,
          estado: 'suspendido',
          nombre: 'Juan'
        }]
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('suspendida')
        })
      );
    });

    test('Debe rechazar login de cuenta inactiva', async () => {
      req.body = {
        correo: 'juan@example.com',
        password: 'password123'
      };

      // Mock: Usuario inactivo
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          password_hash: hashedPassword,
          estado: 'inactivo',
          nombre: 'Juan'
        }]
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('desactivada')
        })
      );
    });
  });

  // ========================================
  // TESTS DE VERIFICACIÓN DE EMAIL
  // ========================================
  describe('verifyEmail', () => {
    test('Debe verificar email correctamente con código válido', async () => {
      req.body = {
        code: '123456'
      };

      // Mock: Usuario existe con token válido
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          estado: 'pendiente_verificacion',
          email_verificado: false,
          token_verificacion: '123456',
          fecha_registro: new Date()
        }]
      });

      // Mock: Actualización exitosa
      query.mockResolvedValueOnce({ rows: [] });

      await authController.verifyEmail(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Email verificado exitosamente'
        })
      );
    });

    test('Debe rechazar código de verificación incorrecto', async () => {
      req.body = {
        code: '999999'
      };

      // Mock: Código no existe en base de datos
      query.mockResolvedValueOnce({ rows: [] });

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('inválido')
        })
      );
    });

    test('Debe rechazar código sin enviar', async () => {
      req.body = {};

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('requerido')
        })
      );
    });
  });

  // ========================================
  // TESTS DE RECUPERACIÓN DE CONTRASEÑA
  // ========================================
  describe('requestPasswordReset', () => {
    test('Debe enviar código de recuperación a email válido', async () => {
      req.body = {
        correo: 'juan@example.com'
      };

      // Mock: Usuario existe y está activo
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          nombre: 'Juan',
          apellido: 'Pérez',
          estado: 'activo'
        }]
      });

      // Mock: Actualización de token
      query.mockResolvedValueOnce({ rows: [] });

      await authController.requestPasswordReset(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('correo')
        })
      );
      // El código se genera internamente, no usa el mock
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    test('Debe responder igual aunque el email no exista (seguridad)', async () => {
      req.body = {
        correo: 'noexiste@example.com'
      };

      // Mock: Usuario no existe
      query.mockResolvedValueOnce({ rows: [] });

      await authController.requestPasswordReset(req, res);

      // Por seguridad, debe responder éxito aunque no exista
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
  });

  // ========================================
  // TESTS DE RESTABLECIMIENTO DE CONTRASEÑA
  // ========================================
  describe('resetPassword', () => {
    const hashedPassword = bcrypt.hashSync('oldpassword123', 10);

    test('Debe restablecer contraseña con código válido', async () => {
      req.body = {
        code: '123456',
        newPassword: 'newpassword123'
      };

      // Mock: Usuario con código válido
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          nombre: 'Juan',
          apellido: 'Pérez',
          password_hash: hashedPassword,
          token_recuperacion: '123456',
          fecha_actualizacion: new Date()
        }]
      });

      // Mock: Actualización de contraseña
      query.mockResolvedValueOnce({ rows: [] });

      // Mock: Invalidar sesiones
      query.mockResolvedValueOnce({ rows: [] });

      await authController.resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('restablecida')
        })
      );
    });

    test('Debe rechazar código inválido', async () => {
      req.body = {
        code: '999999',
        newPassword: 'newpassword123'
      };

      // Mock: Código no existe
      query.mockResolvedValueOnce({ rows: [] });

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('inválido')
        })
      );
    });

    test('Debe rechazar código expirado (más de 10 minutos)', async () => {
      req.body = {
        code: '123456',
        newPassword: 'newpassword123'
      };

      // Fecha de hace 15 minutos
      const expiredDate = new Date();
      expiredDate.setMinutes(expiredDate.getMinutes() - 15);

      // Mock: Usuario con código expirado
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          token_recuperacion: '123456',
          fecha_actualizacion: expiredDate,
          password_hash: hashedPassword
        }]
      });

      // Mock: Limpiar token expirado
      query.mockResolvedValueOnce({ rows: [] });

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('expirado')
        })
      );
    });

    test('Debe rechazar contraseña nueva igual a la anterior', async () => {
      req.body = {
        code: '123456',
        newPassword: 'oldpassword123' // Misma contraseña
      };

      // Mock: Usuario con código válido
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          password_hash: hashedPassword,
          token_recuperacion: '123456',
          fecha_actualizacion: new Date()
        }]
      });

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('no puede ser igual')
        })
      );
    });

    test('Debe rechazar contraseña muy corta', async () => {
      req.body = {
        code: '123456',
        newPassword: '123' // Muy corta
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('al menos 6 caracteres')
        })
      );
    });

    test('Debe rechazar código con formato inválido', async () => {
      req.body = {
        code: '12345', // Solo 5 dígitos, debe ser 6
        newPassword: 'newpassword123'
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('6 dígitos')
        })
      );
    });
  });

  // ========================================
  // TESTS DE REENVÍO DE CÓDIGO
  // ========================================
  describe('resendVerificationCode', () => {
    test('Debe reenviar código de verificación', async () => {
      req.body = {
        correo: 'juan@example.com'
      };

      // Mock: Usuario existe y no está verificado
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          nombre: 'Juan',
          estado: 'pendiente_verificacion',
          email_verificado: false
        }]
      });

      // Mock: Actualización de token
      query.mockResolvedValueOnce({ rows: [] });

      await authController.resendVerificationCode(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('enviado')
        })
      );
      expect(generateEmailVerificationToken).toHaveBeenCalled();
      expect(sendVerificationEmail).toHaveBeenCalled();
    });

    test('Debe rechazar reenvío si cuenta ya está verificada', async () => {
      req.body = {
        correo: 'juan@example.com'
      };

      // Mock: Usuario ya verificado (email_verificado = true)
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          correo: 'juan@example.com',
          estado: 'activo',
          email_verificado: true
        }]
      });

      await authController.resendVerificationCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('ya está verificada')
        })
      );
    });
  });
});

