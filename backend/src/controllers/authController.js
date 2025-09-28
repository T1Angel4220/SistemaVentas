const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateTokenPair, verifyToken } = require('../services/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email');
const { config } = require('../config/config');

// Controlador de autenticación
class AuthController {
  
  // Registro de usuario
  static async register(req, res) {
    try {
      const { cedula, nombre, apellido, correo, telefono, direccion, genero, password, tipo_usuario } = req.body;

      // Validar datos requeridos
      if (!cedula || !nombre || !apellido || !correo || !password) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await query(
        'SELECT id FROM usuarios WHERE correo = $1 OR cedula = $2',
        [correo, cedula]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya existe con este email o cédula'
        });
      }

      // Hash de la contraseña
      const saltRounds = config.security.bcryptRounds;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generar token de verificación
      const verificationToken = require('crypto').randomBytes(32).toString('hex');

      // Crear usuario
      const result = await query(`
        INSERT INTO usuarios (cedula, nombre, apellido, correo, telefono, direccion, genero, password_hash, tipo_usuario, token_verificacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, cedula, nombre, apellido, correo, tipo_usuario, estado
      `, [cedula, nombre, apellido, correo, telefono, direccion, genero, passwordHash, tipo_usuario || 'comprador', verificationToken]);

      const user = result.rows[0];

      // Enviar email de verificación
      try {
        await sendVerificationEmail(correo, verificationToken);
      } catch (emailError) {
        console.error('Error al enviar email de verificación:', emailError.message);
        // No fallar el registro si el email falla
      }

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Revisa tu email para verificar la cuenta.',
        user: {
          id: user.id,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          tipo_usuario: user.tipo_usuario,
          estado: user.estado
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Login de usuario
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const result = await query(
        'SELECT * FROM usuarios WHERE correo = $1',
        [correo]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      const user = result.rows[0];

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (user.estado !== 'activo') {
        return res.status(403).json({
          success: false,
          message: 'Cuenta no activa. Contacta al administrador.'
        });
      }

      // Actualizar último acceso
      await query(
        'UPDATE usuarios SET fecha_ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generar tokens
      const tokens = generateTokenPair(user);

      res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          tipo_usuario: user.tipo_usuario,
          estado: user.estado,
          email_verificado: user.email_verificado
        },
        tokens
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de verificación requerido'
        });
      }

      // Buscar usuario con el token
      const result = await query(
        'SELECT id, correo FROM usuarios WHERE token_verificacion = $1 AND email_verificado = FALSE',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Token de verificación inválido o expirado'
        });
      }

      const user = result.rows[0];

      // Verificar email
      await query(
        'UPDATE usuarios SET email_verificado = TRUE, token_verificacion = NULL, estado = $1 WHERE id = $2',
        ['activo', user.id]
      );

      res.json({
        success: true,
        message: 'Email verificado exitosamente'
      });

    } catch (error) {
      console.error('Error en verificación de email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Solicitar recuperación de contraseña
  static async requestPasswordReset(req, res) {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
      }

      // Buscar usuario
      const result = await query(
        'SELECT id, correo FROM usuarios WHERE correo = $1 AND estado = $2',
        [correo, 'activo']
      );

      if (result.rows.length === 0) {
        // Por seguridad, no revelar si el email existe o no
        return res.json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
        });
      }

      const user = result.rows[0];

      // Generar token de recuperación
      const resetToken = require('crypto').randomBytes(32).toString('hex');

      // Guardar token en la base de datos
      await query(
        'UPDATE usuarios SET token_recuperacion = $1 WHERE id = $2',
        [resetToken, user.id]
      );

      // Enviar email de recuperación
      try {
        await sendPasswordResetEmail(user.correo, resetToken);
      } catch (emailError) {
        console.error('Error al enviar email de recuperación:', emailError.message);
        return res.status(500).json({
          success: false,
          message: 'Error al enviar email de recuperación'
        });
      }

      res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });

    } catch (error) {
      console.error('Error en solicitud de recuperación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Resetear contraseña
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token y nueva contraseña son requeridos'
        });
      }

      // Buscar usuario con el token
      const result = await query(
        'SELECT id FROM usuarios WHERE token_recuperacion = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Token de recuperación inválido o expirado'
        });
      }

      const user = result.rows[0];

      // Hash de la nueva contraseña
      const saltRounds = config.security.bcryptRounds;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await query(
        'UPDATE usuarios SET password_hash = $1, token_recuperacion = NULL WHERE id = $2',
        [passwordHash, user.id]
      );

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error en reset de contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener perfil del usuario
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await query(
        'SELECT id, cedula, nombre, apellido, correo, telefono, direccion, genero, tipo_usuario, estado, email_verificado, fecha_registro FROM usuarios WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = AuthController;
