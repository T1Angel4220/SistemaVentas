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
const sendVerificationEmail = async (to, name, verificationCode) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: 'Código de Verificación - Sistema de Ventas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">¡Bienvenido al Sistema de Ventas!</h2>
          
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Gracias por registrarte en nuestro sistema. Para activar tu cuenta, utiliza el siguiente código de verificación:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              ${verificationCode}
            </div>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 16px; font-weight: bold;">
            Ingresa este código en la página de verificación para activar tu cuenta.
          </p>
          
          <p><strong>Importante:</strong> Este código expirará en 10 minutos.</p>
          
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
const sendPasswordResetEmail = async (to, name, resetCode) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: 'Código de Recuperación - Sistema de Ventas',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            
            <!-- Header con gradiente -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; position: relative;">
              
              <!-- Icono de seguridad -->
              <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 2px solid rgba(255,255,255,0.3);">
                <div style="font-size: 40px; color: white;">🔐</div>
              </div>
              
              <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Recuperación de Contraseña
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 400;">
                Código de seguridad para restablecer tu cuenta
              </p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 40px 30px;">
              <!-- Saludo personalizado -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
                  ¡Hola ${name}! 👋
                </h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                  Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el <strong>Sistema de Ventas</strong>.
                </p>
              </div>
              
              <!-- Código de recuperación -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                    Tu código de recuperación
                  </h3>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Ingresa este código en la página de recuperación
                  </p>
                </div>
                
                <!-- Código destacado -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 25px 40px; border-radius: 12px; display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 12px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3); border: 3px solid rgba(255,255,255,0.2); position: relative;">
                  <div style="position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 12px; z-index: -1; opacity: 0.3;"></div>
                  ${resetCode}
                </div>
                
                <!-- Información de expiración -->
                <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
                  <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="margin-right: 8px;">⏰</span>
                    Este código expira en 10 minutos por seguridad
                  </p>
                </div>
              </div>
              
              <!-- Instrucciones -->
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #0c4a6e; font-size: 16px; font-weight: 600; margin: 0 0 15px 0; display: flex; align-items: center;">
                  <span style="margin-right: 10px; font-size: 18px;">⭐</span>
                  ¿Cómo usar este código?
                </h4>
                <ol style="color: #0c4a6e; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Ve a la página de recuperación de contraseña</li>
                  <li style="margin-bottom: 8px;">Ingresa el código de 6 dígitos mostrado arriba</li>
                  <li style="margin-bottom: 8px;">Crea tu nueva contraseña segura</li>
                  <li>¡Listo! Ya puedes acceder con tu nueva contraseña</li>
                </ol>
              </div>
              
              <!-- Advertencia de seguridad -->
              <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; display: flex; align-items: flex-start;">
                  <span style="margin-right: 8px; margin-top: 2px; flex-shrink: 0; font-size: 16px;">⚠️</span>
                  <span><strong>Importante:</strong> Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá sin cambios.</span>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
              <div style="text-align: center;">
                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                    Sistema de Ventas
                  </div>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                  Este es un email automático del sistema. Por favor, no respondas a este mensaje.
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
                  © 2024 Sistema de Ventas. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
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
