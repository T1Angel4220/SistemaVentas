const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { 
  generateSessionTokens, 
  generateEmailVerificationToken, 
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken
} = require('../services/jwt');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendAccountStatusEmail,
  sendNewSessionEmail
} = require('../services/email');
const { config } = require('../config/config');

/**
 * Registro de usuarios (compradores y vendedores)
 */
const register = async (req, res) => {
  try {
    const { cedula, nombre, apellido, correo, telefono, direccion, genero, password, tipo_usuario = 'comprador' } = req.body;
    
    // Validar que el tipo de usuario sea válido para registro
    if (!['comprador', 'vendedor'].includes(tipo_usuario)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuario inválido para registro'
      });
    }
    
    // Verificar si el email ya existe
    const existingEmail = await query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [correo]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Verificar si la cédula ya existe
    const existingCedula = await query(
      'SELECT id FROM usuarios WHERE cedula = $1',
      [cedula]
    );
    
    if (existingCedula.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'La cédula ya está registrada'
      });
    }
    
    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    
    // Generar token de verificación
    const verificationToken = generateEmailVerificationToken(null, correo);
    
    // Insertar usuario
    const result = await query(`
      INSERT INTO usuarios (
        cedula, nombre, apellido, correo, telefono, direccion, genero, 
        password_hash, tipo_usuario, estado, token_verificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, cedula, nombre, apellido, correo, tipo_usuario, estado
    `, [
      cedula, nombre, apellido, correo, telefono, direccion, genero,
      passwordHash, tipo_usuario, 'pendiente_verificacion', verificationToken
    ]);
    
    const user = result.rows[0];
    
    // Enviar email de verificación
    try {
      await sendVerificationEmail(correo, nombre, verificationToken);
    } catch (emailError) {
      console.error('❌ Error enviando email de verificación:', emailError.message);
      // No fallar el registro si el email falla
    }
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu email para verificar la cuenta.',
      data: {
        user: {
          id: user.id,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          tipo_usuario: user.tipo_usuario,
          estado: user.estado
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Login con email y contraseña
 */
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    // Buscar usuario por email
    const userResult = await query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar que el usuario esté activo
    if (user.estado !== 'activo') {
      return res.status(401).json({
        success: false,
        message: `Cuenta ${user.estado}. Contacta al administrador.`
      });
    }
    
    // Verificar que el email esté verificado
    if (!user.email_verificado) {
      return res.status(401).json({
        success: false,
        message: 'Email no verificado. Revisa tu correo para verificar la cuenta.'
      });
    }
    
    // Generar tokens de sesión
    const tokens = generateSessionTokens(user);
    
    // Crear sesión en la base de datos
    const sessionResult = await query(`
      INSERT INTO sesiones_usuario (
        usuario_id, token_sesion, fecha_expiracion, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      user.id,
      tokens.accessToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    ]);
    
    // Actualizar último acceso
    await query(
      'UPDATE usuarios SET fecha_ultimo_acceso = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Enviar notificación de nueva sesión (opcional)
    try {
      await sendNewSessionEmail(
        user.correo, 
        user.nombre, 
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      );
    } catch (emailError) {
      console.error('❌ Error enviando notificación de sesión:', emailError.message);
      // No fallar el login si el email falla
    }
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          tipo_usuario: user.tipo_usuario,
          estado: user.estado
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Verificación de email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    console.log('🔍 Token recibido:', token);
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación requerido'
      });
    }
    
    // Buscar usuario por token de verificación
    let userResult = await query(
      'SELECT * FROM usuarios WHERE token_verificacion = $1',
      [token]
    );
    
    console.log('🔍 Usuarios encontrados por token:', userResult.rows.length);
    
    // Si no se encuentra por token, buscar usuarios pendientes de verificación
    if (userResult.rows.length === 0) {
      console.log('🔍 Buscando usuarios pendientes de verificación...');
      userResult = await query(
        'SELECT * FROM usuarios WHERE estado = $1 AND email_verificado = $2',
        ['pendiente_verificacion', false]
      );
      console.log('🔍 Usuarios pendientes encontrados:', userResult.rows.length);
    }
    
    if (userResult.rows.length === 0) {
      // Verificar si el usuario ya está verificado
      const alreadyVerifiedResult = await query(
        'SELECT * FROM usuarios WHERE correo = $1 AND email_verificado = true',
        [req.query.email || '']
      );
      
      if (alreadyVerifiedResult.rows.length > 0) {
        return res.json({
          success: true,
          message: 'Email ya verificado previamente'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado o token inválido'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verificar si ya está verificado
    if (user.email_verificado) {
      return res.json({
        success: true,
        message: 'Email ya verificado previamente'
      });
    }
    
    // Actualizar usuario
    await query(`
      UPDATE usuarios 
      SET email_verificado = true, estado = 'activo', token_verificacion = NULL
      WHERE id = $1
    `, [user.id]);
    
    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en verificación de email:', error.message);
    res.status(400).json({
      success: false,
      message: 'Token de verificación inválido o expirado'
    });
  }
};

/**
 * Solicitar recuperación de contraseña
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;
    
    // Buscar usuario
    const userResult = await query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );
    
    if (userResult.rows.length === 0) {
      // Por seguridad, no revelar si el email existe
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });
    }
    
    const user = userResult.rows[0];
    
    // Generar token de recuperación
    const resetToken = generatePasswordResetToken(user.id, user.correo);
    
    // Actualizar token en la base de datos
    await query(
      'UPDATE usuarios SET token_recuperacion = $1 WHERE id = $2',
      [resetToken, user.id]
    );
    
    // Enviar email de recuperación
    try {
      await sendPasswordResetEmail(user.correo, user.nombre, resetToken);
    } catch (emailError) {
      console.error('❌ Error enviando email de recuperación:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Error enviando email de recuperación'
      });
    }
    
    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
    });
    
  } catch (error) {
    console.error('❌ Error en solicitud de recuperación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Resetear contraseña
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña requeridos'
      });
    }
    
    // Verificar token
    const decoded = verifyPasswordResetToken(token);
    
    // Buscar usuario
    const userResult = await query(
      'SELECT * FROM usuarios WHERE id = $1 AND token_recuperacion = $2',
      [decoded.userId, token]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token de recuperación inválido'
      });
    }
    
    const user = userResult.rows[0];
    
    // Encriptar nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    
    // Actualizar contraseña y limpiar token
    await query(`
      UPDATE usuarios 
      SET password_hash = $1, token_recuperacion = NULL
      WHERE id = $2
    `, [passwordHash, user.id]);
    
    // Invalidar todas las sesiones del usuario
    await query(
      'UPDATE sesiones_usuario SET activa = false WHERE usuario_id = $1',
      [user.id]
    );
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en reset de contraseña:', error.message);
    res.status(400).json({
      success: false,
      message: 'Token de recuperación inválido o expirado'
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🔍 Obteniendo perfil para usuario ID:', userId);
    
    const userResult = await query(`
      SELECT id, cedula, nombre, apellido, correo, telefono, direccion, genero,
             tipo_usuario, estado, email_verificado, fecha_registro, fecha_ultimo_acceso
      FROM usuarios 
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    console.log('📊 Datos del usuario desde BD:', {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      direccion: user.direccion,
      genero: user.genero,
      tipo_usuario: user.tipo_usuario,
      estado: user.estado,
      email_verificado: user.email_verificado,
      fecha_registro: user.fecha_registro,
      fecha_ultimo_acceso: user.fecha_ultimo_acceso
    });
    
    const responseData = {
      success: true,
      data: {
        user: {
          id: user.id,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          telefono: user.telefono,
          direccion: user.direccion,
          genero: user.genero,
          tipo_usuario: user.tipo_usuario,
          estado: user.estado,
          email_verificado: user.email_verificado,
          fecha_registro: user.fecha_registro,
          fecha_ultimo_acceso: user.fecha_ultimo_acceso
        }
      }
    };
    
    console.log('📤 Enviando respuesta al frontend:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Logout - Invalidar sesión
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(' ')[1];
    
    // Invalidar sesión específica
    if (token) {
      await query(
        'UPDATE sesiones_usuario SET activa = false WHERE usuario_id = $1 AND token_sesion = $2',
        [userId, token]
      );
    }
    
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
    
  } catch (error) {
    console.error('❌ Error en logout:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Probar autenticación
 */
const testAuth = async (req, res) => {
  res.json({
    success: true,
    message: 'Autenticación exitosa',
    data: {
      user: req.user,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getProfile,
  logout,
  testAuth
};
