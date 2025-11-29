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
    if (!['comprador', 'vendedor', 'moderador'].includes(tipo_usuario)) {
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
    
    // Determinar estado inicial según el tipo de usuario
    const estadoInicial = tipo_usuario === 'moderador' ? 'activo' : 'pendiente_verificacion';
    const tokenVerificacion = tipo_usuario === 'moderador' ? null : verificationToken;
    
    // Insertar usuario
    const result = await query(`
      INSERT INTO usuarios (
        cedula, nombre, apellido, correo, telefono, direccion, genero, 
        password_hash, tipo_usuario, estado, token_verificacion, email_verificado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, cedula, nombre, apellido, correo, tipo_usuario, estado
    `, [
      cedula, nombre, apellido, correo, telefono, direccion, genero,
      passwordHash, tipo_usuario, estadoInicial, tokenVerificacion, tipo_usuario === 'moderador'
    ]);
    
    const user = result.rows[0];
    
    // Enviar email de verificación solo si no es moderador
    if (tipo_usuario !== 'moderador') {
      try {
        await sendVerificationEmail(correo, nombre, verificationToken);
      } catch (emailError) {
        console.error('❌ Error enviando email de verificación:', emailError.message);
        // No fallar el registro si el email falla
      }
    }
    
    const mensaje = tipo_usuario === 'moderador' 
      ? 'Moderador registrado exitosamente. Puede iniciar sesión inmediatamente.'
      : 'Usuario registrado exitosamente. Revisa tu email para verificar la cuenta.';
    
    res.status(201).json({
      success: true,
      message: mensaje,
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
      const estadosMensajes = {
        'pendiente_verificacion': 'Tu cuenta está pendiente de verificación. Por favor, revisa tu correo electrónico.',
        'inactivo': 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.',
        'suspendido': 'Tu cuenta ha sido suspendida por incumplimiento de las políticas de uso. No puedes acceder al sistema en este momento. Por favor, contacta al administrador para obtener más información sobre tu situación.'
      };
      
      const mensaje = estadosMensajes[user.estado] || 'Tu cuenta no está activa. Contacta al administrador.';
      
      return res.status(401).json({
        success: false,
        message: mensaje,
        accountStatus: user.estado
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
    
    // Obtener la IP real del cliente (considerando proxies)
    const getClientIp = (req) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
      }
      return req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.ip ||
             'IP desconocida';
    };
    
    let clientIp = getClientIp(req);

    // 🔧 LIMPIAR la IP: eliminar ::ffff: y puerto (si existe)
    clientIp = clientIp.replace('::ffff:', '').split(':')[0];
    
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
      clientIp,
      req.get('User-Agent') || 'User-Agent desconocido'
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
        clientIp,
        req.get('User-Agent') || 'User-Agent desconocido'
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
    const { code } = req.body;
    
    console.log('🔍 Código recibido:', code);
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación requerido'
      });
    }

    // Verificar el formato del código
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Código debe tener 6 dígitos'
      });
    }
    
    // Buscar usuario por código de verificación
    const userResult = await query(`
      SELECT id, correo, estado, email_verificado, token_verificacion, fecha_registro
      FROM usuarios 
      WHERE token_verificacion = $1
    `, [code]);
    
    console.log('🔍 Usuarios encontrados por código:', userResult.rows.length);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación inválido'
      });
    }
    
    const user = userResult.rows[0];
    console.log('👤 Usuario encontrado:', {
      id: user.id,
      correo: user.correo,
      estado: user.estado,
      email_verificado: user.email_verificado
    });
    
    // Verificar si ya está verificado
    if (user.email_verificado) {
      return res.json({
        success: true,
        message: 'Email ya verificado previamente'
      });
    }

    // Verificar que el código no haya expirado (10 minutos)
    const now = new Date();
    const registrationTime = new Date(user.fecha_registro);
    const timeDiff = (now - registrationTime) / 1000 / 60; // diferencia en minutos
    
    if (timeDiff > 10) {
      console.log('❌ Código expirado. Tiempo transcurrido:', timeDiff, 'minutos');
      return res.status(400).json({
        success: false,
        message: 'Código de verificación expirado. Solicita uno nuevo.'
      });
    }
    
    // Actualizar usuario
    await query(`
      UPDATE usuarios 
      SET email_verificado = true, 
          estado = 'activo', 
          token_verificacion = NULL,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [user.id]);
    
    console.log('✅ Email verificado exitosamente para usuario:', user.id);
    
    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en verificación de email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};


/**
 * Reenviar código de verificación de email
 */
const resendVerificationCode = async (req, res) => {
  try {
    const { correo } = req.body;
    
    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es requerido'
      });
    }
    
    // Buscar usuario por email
    const userResult = await query(
      'SELECT id, correo, nombre, estado, email_verificado FROM usuarios WHERE correo = $1',
      [correo]
    );
    
    if (userResult.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás un nuevo código de verificación.'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verificar si ya está verificado
    if (user.email_verificado) {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta ya está verificada. Puedes iniciar sesión.'
      });
    }
    
    // Verificar que el usuario esté pendiente de verificación
    if (user.estado !== 'pendiente_verificacion') {
      return res.json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás un nuevo código de verificación.'
      });
    }
    
    // Generar nuevo código de verificación
    const verificationToken = generateEmailVerificationToken(null, correo);
    
    // Actualizar código en la base de datos
    await query(
      'UPDATE usuarios SET token_verificacion = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2',
      [verificationToken, user.id]
    );
    
    // Enviar email de verificación
    try {
      await sendVerificationEmail(correo, user.nombre, verificationToken);
      console.log('✅ Código de verificación reenviado a:', correo);
    } catch (emailError) {
      console.error('❌ Error enviando email de verificación:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo. Intenta nuevamente más tarde.'
      });
    }
    
    res.json({
      success: true,
      message: 'Se ha enviado un nuevo código de verificación a tu correo electrónico.'
    });
    
  } catch (error) {
    console.error('❌ Error reenviando código de verificación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener lista de usuarios (solo para moderadores y administradores)
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 1000, search = '', role = 'all', status = 'all' } = req.query;
    const offset = (page - 1) * limit;
    
    // Construir query base
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;
    
    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereConditions.push(`(nombre ILIKE $${paramCount} OR apellido ILIKE $${paramCount} OR correo ILIKE $${paramCount} OR cedula ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }
    
    // Filtro de rol
    if (role !== 'all') {
      paramCount++;
      whereConditions.push(`tipo_usuario = $${paramCount}`);
      queryParams.push(role);
    }
    
    // Filtro de estado
    if (status !== 'all') {
      paramCount++;
      whereConditions.push(`estado = $${paramCount}`);
      queryParams.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Query para obtener usuarios
    const usersQuery = `
      SELECT id, cedula, nombre, apellido, correo, telefono, direccion, genero,
             tipo_usuario, estado, email_verificado, fecha_registro, fecha_ultimo_acceso
      FROM usuarios 
      ${whereClause}
      ORDER BY fecha_registro DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const usersResult = await query(usersQuery, queryParams);
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios 
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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

/**
 * Solicitar recuperación de contraseña
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { correo } = req.body;
    
    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'Correo electrónico requerido'
      });
    }
    
    // Buscar usuario por email
    const userResult = await query(
      'SELECT id, correo, nombre, apellido, estado FROM usuarios WHERE correo = $1',
      [correo]
    );
    
    if (userResult.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás un email con las instrucciones para restablecer tu contraseña'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verificar que el usuario esté activo
    if (user.estado !== 'activo') {
      // Mensaje específico para cuentas suspendidas
      if (user.estado === 'suspendido') {
        return res.status(403).json({
          success: false,
          message: 'No puedes recuperar tu contraseña porque tu cuenta ha sido suspendida por incumplimiento de las políticas de uso. Por favor, contacta al administrador del sistema para obtener más información sobre tu situación.',
          accountStatus: 'suspendido'
        });
      }
      
      // Para otros estados (inactivo, pendiente), mensaje genérico por seguridad
      return res.json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás un email con las instrucciones para restablecer tu contraseña'
      });
    }
    
    // Generar código de recuperación de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('🔐 Generando código de recuperación:');
    console.log('   → Usuario:', user.correo);
    console.log('   → Código generado:', resetCode);
    console.log('   → Longitud del código:', resetCode.length);
    
    // Guardar código en la base de datos (asegurar que no tenga espacios)
    await query(
      'UPDATE usuarios SET token_recuperacion = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2',
      [resetCode.trim(), user.id]
    );
    
    console.log('✅ Código guardado en BD para usuario:', user.id);
    
    // Enviar email de recuperación
    try {
      await sendPasswordResetEmail(user.correo, user.nombre, resetCode);
      console.log('✅ Email de recuperación enviado a:', user.correo);
    } catch (emailError) {
      console.error('❌ Error enviando email de recuperación:', emailError.message);
      // No fallar la operación si el email falla
    }
    
    res.json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás un email con las instrucciones para restablecer tu contraseña'
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
 * Restablecer contraseña
 */
const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    
    if (!code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Código y nueva contraseña requeridos'
      });
    }
    
    // Limpiar y normalizar el código (eliminar espacios)
    const cleanCode = code.toString().trim();
    
    // Verificar formato del código
    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: 'Código debe tener 6 dígitos'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Buscar usuario por código de recuperación (incluir password_hash para comparación)
    // Usar TRIM y CAST para asegurar que la comparación sea correcta
    // También verificar que el token no sea NULL
    const userResult = await query(
      `SELECT id, correo, nombre, apellido, password_hash, token_recuperacion, fecha_actualizacion 
       FROM usuarios 
       WHERE token_recuperacion IS NOT NULL 
       AND TRIM(CAST(token_recuperacion AS VARCHAR)) = $1`,
      [cleanCode]
    );
    
    console.log('🔍 Búsqueda de código de recuperación:');
    console.log('   → Código buscado:', cleanCode);
    console.log('   → Usuarios encontrados:', userResult.rows.length);
    
    if (userResult.rows.length === 0) {
      // Intentar buscar sin TRIM para debug
      const debugResult = await query(
        'SELECT id, correo, token_recuperacion, LENGTH(token_recuperacion) as code_length FROM usuarios WHERE token_recuperacion IS NOT NULL LIMIT 5'
      );
      console.log('🔍 Debug - Primeros 5 códigos en BD:');
      debugResult.rows.forEach(row => {
        console.log(`   → Usuario ${row.id}: código="${row.token_recuperacion}", longitud=${row.code_length}`);
      });
      
      return res.status(400).json({
        success: false,
        message: 'Código de recuperación inválido o expirado'
      });
    }
    
    const user = userResult.rows[0];
    
    // Verificar que el código no haya expirado (10 minutos)
    // Usar la zona horaria de Ecuador para la comparación
    // Comparar directamente en la base de datos usando EXTRACT para evitar problemas de zona horaria
    const expirationCheck = await query(
      `SELECT 
        EXTRACT(EPOCH FROM (NOW() - fecha_actualizacion)) / 60 as minutos_transcurridos
       FROM usuarios 
       WHERE id = $1`,
      [user.id]
    );
    
    const minutosTranscurridos = parseFloat(expirationCheck.rows[0].minutos_transcurridos);
    
    console.log('🔍 Verificación de código de recuperación:');
    console.log('   → Código recibido:', cleanCode);
    console.log('   → Código en BD:', user.token_recuperacion);
    console.log('   → Fecha actualización:', user.fecha_actualizacion);
    console.log('   → Tiempo transcurrido (calculado en BD):', minutosTranscurridos.toFixed(2), 'minutos');
    
    if (minutosTranscurridos > 10) {
      // Limpiar código expirado
      await query(
        'UPDATE usuarios SET token_recuperacion = NULL WHERE id = $1',
        [user.id]
      );
      
      return res.status(400).json({
        success: false,
        message: 'Código de recuperación expirado. Solicita uno nuevo.'
      });
    }
    
    // Verificar que la nueva contraseña no sea igual a la anterior
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no puede ser igual a la contraseña anterior. Por favor, elige una contraseña diferente.'
      });
    }
    
    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    
    // Actualizar contraseña y limpiar token
    await query(
      'UPDATE usuarios SET password_hash = $1, token_recuperacion = NULL, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, user.id]
    );
    
    // Invalidar todas las sesiones activas del usuario
    await query(
      'UPDATE sesiones_usuario SET activa = false WHERE usuario_id = $1',
      [user.id]
    );
    
    console.log('✅ Contraseña restablecida para usuario:', user.id);
    
    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Inicia sesión con tu nueva contraseña.'
    });
    
  } catch (error) {
    console.error('❌ Error en restablecimiento de contraseña:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualizar perfil de usuario
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellido, telefono, direccion, genero } = req.body;

    console.log('🔄 Actualizando perfil del usuario ID:', userId);

    // Validar que al menos un campo esté presente
    if (!nombre && !apellido && !telefono && !direccion && !genero) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    // Construir la consulta de actualización dinámicamente
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nombre) {
      updates.push(`nombre = $${paramIndex}`);
      values.push(nombre);
      paramIndex++;
    }
    if (apellido) {
      updates.push(`apellido = $${paramIndex}`);
      values.push(apellido);
      paramIndex++;
    }
    if (telefono) {
      updates.push(`telefono = $${paramIndex}`);
      values.push(telefono);
      paramIndex++;
    }
    if (direccion) {
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion);
      paramIndex++;
    }
    if (genero) {
      updates.push(`genero = $${paramIndex}`);
      values.push(genero);
      paramIndex++;
    }

    values.push(userId);

    const updateQuery = `
      UPDATE usuarios 
      SET ${updates.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, cedula, nombre, apellido, correo, telefono, direccion, genero,
                tipo_usuario, estado, email_verificado, fecha_registro, fecha_ultimo_acceso
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ Perfil actualizado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: config.server.nodeEnv === 'development' ? error.message : {}
    });
  }
};

/**
 * Cambiar contraseña del usuario
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    console.log('🔒 Cambiando contraseña para usuario ID:', userId);

    // Validar que se proporcionen ambas contraseñas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar la contraseña actual y la nueva contraseña'
      });
    }

    // Validar longitud mínima de la nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener el usuario con su contraseña actual
    const userResult = await query(
      'SELECT id, password_hash FROM usuarios WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    // Verificar que la contraseña actual sea correcta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Verificar que la nueva contraseña sea diferente de la actual
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente de la contraseña actual'
      });
    }

    // Encriptar la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    // Actualizar la contraseña en la base de datos
    await query(
      'UPDATE usuarios SET password_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    console.log('✅ Contraseña cambiada exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error cambiando contraseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: config.server.nodeEnv === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  logout,
  testAuth
};
