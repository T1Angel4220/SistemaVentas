const nodemailer = require('nodemailer');
const { config } = require('../config/config');

// Configurar el transporter de email
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

/**
 * Verifica la conexión del servicio de email
 * @returns {Promise<boolean>} True si la conexión es exitosa
 */
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Conexión de email verificada');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión de email:', error.message);
    return false;
  }
};

/**
 * Envía un email de verificación de cuenta
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} verificationToken - Token de verificación
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendVerificationEmail = async (to, name, verificationToken) => {
  try {
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: 'Verificación de cuenta - Sistema de Ventas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">¡Bienvenido al Sistema de Ventas!</h2>
          
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Gracias por registrarte en nuestro sistema. Para activar tu cuenta, haz clic en el botón de abajo:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              🔐 Verificar Cuenta
            </a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="word-break: break-all; color: #666; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationUrl}</p>
          
          <p><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            Si no creaste esta cuenta, puedes ignorar este email.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de verificación:', error.message);
    throw error;
  }
};

/**
 * Envía un email de recuperación de contraseña
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} resetToken - Token de recuperación
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendPasswordResetEmail = async (to, name, resetToken) => {
  try {
    const resetUrl = `${config.server.host}:${config.server.port}/api/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: 'Recuperación de contraseña - Sistema de Ventas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
          
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
          
          <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          
          <p><strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será modificada.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de recuperación:', error.message);
    throw error;
  }
};

/**
 * Envía un email de notificación de cambio de estado de cuenta
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} estado - Nuevo estado de la cuenta
 * @param {string} motivo - Motivo del cambio (opcional)
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendAccountStatusEmail = async (to, name, estado, motivo = '') => {
  try {
    const estadoText = {
      'activo': 'activada',
      'inactivo': 'desactivada',
      'suspendido': 'suspendida',
      'pendiente_verificacion': 'pendiente de verificación'
    };
    
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: `Estado de cuenta ${estadoText[estado]} - Sistema de Ventas`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Estado de Cuenta Actualizado</h2>
          
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>El estado de tu cuenta ha sido actualizado a: <strong>${estadoText[estado]}</strong></p>
          
          ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''}
          
          <p>Si tienes alguna pregunta sobre este cambio, por favor contacta a nuestro equipo de soporte.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            Sistema de Ventas Multiempresa
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de estado de cuenta enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de estado:', error.message);
    throw error;
  }
};

/**
 * Envía un email de notificación de nueva sesión
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} ipAddress - Dirección IP
 * @param {string} userAgent - User Agent del navegador
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendNewSessionEmail = async (to, name, ipAddress, userAgent) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: 'Nueva sesión iniciada - Sistema de Ventas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Nueva Sesión Detectada</h2>
          
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Se ha iniciado una nueva sesión en tu cuenta con los siguientes detalles:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Dirección IP:</strong> ${ipAddress}</p>
            <p><strong>Navegador:</strong> ${userAgent}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>Si no fuiste tú quien inició esta sesión, por favor contacta a nuestro equipo de soporte inmediatamente.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            Por seguridad, te recomendamos cambiar tu contraseña si no reconoces esta actividad.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de nueva sesión enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de nueva sesión:', error.message);
    throw error;
  }
};

module.exports = {
  verifyEmailConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountStatusEmail,
  sendNewSessionEmail
};
