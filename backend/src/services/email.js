const nodemailer = require('nodemailer');
const { config } = require('../config/config');

// Crear transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Función para enviar email de verificación
const sendVerificationEmail = async (userEmail, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${config.server.host}:${config.server.port}/api/auth/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: config.email.from,
    to: userEmail,
    subject: 'Verificación de Email - Sistema de Ventas Multiempresa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Verificación de Email</h2>
        <p>Hola,</p>
        <p>Gracias por registrarte en el Sistema de Ventas Multiempresa. Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar Email</a>
        </div>
        <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Sistema de Ventas Multiempresa<br>
          Este es un email automático, por favor no respondas.
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificación enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de verificación:', error.message);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

// Función para enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${config.server.host}:${config.server.port}/api/auth/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: config.email.from,
    to: userEmail,
    subject: 'Recuperación de Contraseña - Sistema de Ventas Multiempresa',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Ventas Multiempresa.</p>
        <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
        </div>
        <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p><strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será modificada.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Sistema de Ventas Multiempresa<br>
          Este es un email automático, por favor no respondas.
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de recuperación enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email de recuperación:', error.message);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

// Función para enviar notificación de moderación
const sendModerationNotification = async (userEmail, notificationType, details) => {
  const transporter = createTransporter();
  
  let subject, message;
  
  switch (notificationType) {
    case 'product_approved':
      subject = 'Producto Aprobado - Sistema de Ventas Multiempresa';
      message = `
        <p>Tu producto "${details.productName}" ha sido aprobado y ya está visible en la plataforma.</p>
        <p>¡Gracias por usar nuestro sistema!</p>
      `;
      break;
    case 'product_rejected':
      subject = 'Producto Rechazado - Sistema de Ventas Multiempresa';
      message = `
        <p>Tu producto "${details.productName}" ha sido rechazado por la siguiente razón:</p>
        <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
          ${details.reason}
        </p>
        <p>Puedes modificar tu producto y volver a enviarlo para revisión.</p>
      `;
      break;
    case 'account_suspended':
      subject = 'Cuenta Suspendida - Sistema de Ventas Multiempresa';
      message = `
        <p>Tu cuenta ha sido suspendida temporalmente por violación de nuestras políticas.</p>
        <p>Razón: ${details.reason}</p>
        <p>Para más información, contacta a nuestro equipo de soporte.</p>
      `;
      break;
    default:
      subject = 'Notificación - Sistema de Ventas Multiempresa';
      message = `<p>${details.message || 'Has recibido una notificación del sistema.'}</p>`;
  }
  
  const mailOptions = {
    from: config.email.from,
    to: userEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Notificación del Sistema</h2>
        <p>Hola,</p>
        ${message}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Sistema de Ventas Multiempresa<br>
          Este es un email automático, por favor no respondas.
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Notificación enviada:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error.message);
    throw new Error(`Error al enviar notificación: ${error.message}`);
  }
};

// Función para probar la configuración de email
const testEmailConfiguration = async () => {
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
    return false;
  }
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendModerationNotification,
  testEmailConfiguration
};
