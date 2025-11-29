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
 * Envía un email profesional cuando se suspende una cuenta
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} motivo - Motivo de la suspensión (opcional)
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendAccountSuspendedEmail = async (to, name, motivo = '') => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: '⚠️ Cuenta Suspendida - Sistema de Ventas',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cuenta Suspendida</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
            
            <!-- Header con gradiente rojo -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 50px 30px; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              
              <!-- Icono de advertencia -->
              <div style="font-size: 64px; line-height: 1; margin: 0 auto 20px auto; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">🚫</div>
              
              <h1 style="color: white; font-size: 30px; font-weight: 700; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">
                Cuenta Suspendida
              </h1>
              <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0; font-weight: 400; line-height: 1.4;">
                Tu cuenta ha sido temporalmente suspendida
              </p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 40px 30px;">
              <!-- Saludo personalizado -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 15px 0;">
                  Hola ${name},
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                  Lamentamos informarte que tu cuenta en el <strong>Sistema de Ventas</strong> ha sido <strong>suspendida</strong> por incumplimiento de nuestras políticas de uso.
                </p>
              </div>
              
              <!-- Banner de alerta -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; border-radius: 16px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.1);">
                <div style="display: flex; align-items: flex-start;">
                  <div style="font-size: 32px; margin-right: 15px; flex-shrink: 0;">⚠️</div>
                  <div>
                    <h3 style="color: #991b1b; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                      Estado de la cuenta
                    </h3>
                    <p style="color: #7f1d1d; font-size: 15px; line-height: 1.6; margin: 0;">
                      Tu cuenta está <strong>suspendida</strong> y no podrás acceder al sistema hasta que el administrador revise tu situación.
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Motivo (si existe) -->
              ${motivo ? `
              <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 20px 25px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #9a3412; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                  📋 Motivo de la suspensión
                </h4>
                <p style="color: #7c2d12; font-size: 15px; line-height: 1.6; margin: 0;">
                  ${motivo}
                </p>
              </div>
              ` : ''}
              
              <!-- Qué puedes hacer -->
              <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 16px; padding: 25px; margin: 30px 0;">
                <h4 style="color: #0c4a6e; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; text-align: left;">
                  <span style="margin-right: 12px; font-size: 24px;">💡</span>¿Qué puedes hacer?
                </h4>
                <div style="color: #0c4a6e; font-size: 15px; line-height: 1.6;">
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">1</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;"><strong>Contacta al administrador</strong> del sistema para conocer más detalles sobre tu suspensión</div>
                  </div>
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">2</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Revisa las <strong>políticas de uso</strong> de la plataforma</div>
                  </div>
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">3</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Si crees que es un error, <strong>solicita una apelación</strong> explicando tu situación</div>
                  </div>
                  <div style="display: table; width: 100%;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">4</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Espera la respuesta del equipo de moderación</div>
                  </div>
                </div>
              </div>
              
              <!-- Información importante -->
              <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; display: flex; align-items: flex-start;">
                  <span style="margin-right: 10px; margin-top: 2px; flex-shrink: 0; font-size: 18px;">ℹ️</span>
                  <span><strong>Importante:</strong> Mientras tu cuenta esté suspendida, no podrás iniciar sesión ni recuperar tu contraseña. Debes resolver esta situación con el administrador primero.</span>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%); padding: 30px; border-top: 2px solid #f87171;">
              <div style="text-align: center;">
                <div style="margin-bottom: 20px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 10px 20px; border-radius: 25px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                    🚫 Sistema de Ventas
                  </div>
                </div>
                <p style="color: #7f1d1d; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6; font-weight: 500;">
                  Este es un email automático del sistema.
                </p>
                <p style="color: #991b1b; font-size: 12px; margin: 0;">
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
    console.log('✅ Email de cuenta suspendida enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de cuenta suspendida:', error.message);
    throw error;
  }
};

/**
 * Envía un email profesional cuando se reactiva una cuenta
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} motivo - Motivo de la reactivación (opcional)
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendAccountReactivatedEmail = async (to, name, motivo = '') => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: '✅ ¡Cuenta Reactivada! - Sistema de Ventas',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cuenta Reactivada</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
            
            <!-- Header con gradiente verde -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              
              <!-- Icono de éxito -->
              <div style="font-size: 64px; line-height: 1; margin: 0 auto 20px auto; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">✅</div>
              
              <h1 style="color: white; font-size: 30px; font-weight: 700; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">
                ¡Cuenta Reactivada!
              </h1>
              <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0; font-weight: 400; line-height: 1.4;">
                Tu acceso al sistema ha sido restaurado
              </p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 40px 30px;">
              <!-- Saludo personalizado -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 15px 0;">
                  ¡Hola ${name}! 👋
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                  Nos complace informarte que tu cuenta en el <strong>Sistema de Ventas</strong> ha sido <strong>reactivada exitosamente</strong>. Ya puedes acceder nuevamente a todas las funcionalidades del sistema.
                </p>
              </div>
              
              <!-- Banner de éxito -->
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #6ee7b7; border-radius: 16px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);">
                <div style="display: flex; align-items: flex-start;">
                  <div style="font-size: 32px; margin-right: 15px; flex-shrink: 0;">🎉</div>
                  <div>
                    <h3 style="color: #065f46; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                      ¡Bienvenido de vuelta!
                    </h3>
                    <p style="color: #047857; font-size: 15px; line-height: 1.6; margin: 0;">
                      Tu cuenta está ahora <strong>activa</strong> y puedes iniciar sesión con tus credenciales habituales. Todas tus funcionalidades han sido restauradas.
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Motivo (si existe) -->
              ${motivo ? `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px 25px; margin: 25px 0; border-radius: 8px;">
                <h4 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
                  📝 Nota del administrador
                </h4>
                <p style="color: #1e3a8a; font-size: 15px; line-height: 1.6; margin: 0;">
                  ${motivo}
                </p>
              </div>
              ` : ''}
              
              <!-- Qué puedes hacer ahora -->
              <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 16px; padding: 25px; margin: 30px 0;">
                <h4 style="color: #0c4a6e; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; text-align: left;">
                  <span style="margin-right: 12px; font-size: 24px;">🚀</span>¿Qué puedes hacer ahora?
                </h4>
                <div style="color: #0c4a6e; font-size: 15px; line-height: 1.6;">
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">1</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;"><strong>Inicia sesión</strong> con tu correo y contraseña en el sistema</div>
                  </div>
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">2</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Accede a todas las <strong>funcionalidades</strong> de tu cuenta</div>
                  </div>
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">3</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Recuerda cumplir con las <strong>políticas de uso</strong> del sistema</div>
                  </div>
                  <div style="display: table; width: 100%;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">4</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Si tienes dudas, contacta con <strong>soporte</strong></div>
                  </div>
                </div>
              </div>
              
              <!-- Botón de acción -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">
                  🔓 Iniciar Sesión Ahora
                </a>
              </div>
              
              <!-- Información importante -->
              <div style="background: #dbeafe; border: 2px solid #60a5fa; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <p style="color: #1e40af; font-size: 14px; margin: 0; display: flex; align-items: flex-start;">
                  <span style="margin-right: 10px; margin-top: 2px; flex-shrink: 0; font-size: 18px;">💡</span>
                  <span><strong>Recuerda:</strong> Mantén tu cuenta segura y respeta las políticas de uso para evitar futuras suspensiones. Si tienes alguna duda, nuestro equipo está aquí para ayudarte.</span>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%); padding: 30px; border-top: 2px solid #34d399;">
              <div style="text-align: center;">
                <div style="margin-bottom: 20px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px 20px; border-radius: 25px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
                    ✅ Sistema de Ventas
                  </div>
                </div>
                <p style="color: #065f46; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6; font-weight: 500;">
                  Este es un email automático del sistema.
                </p>
                <p style="color: #047857; font-size: 12px; margin: 0;">
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
    console.log('✅ Email de cuenta reactivada enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de cuenta reactivada:', error.message);
    throw error;
  }
};

/**
 * Envía un email específico cuando una cuenta se bloquea automáticamente por tener 3 o más productos peligrosos
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {number} cantidadPeligrosos - Cantidad de productos peligrosos
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendAccountBlockedByDangerousProductsEmail = async (to, name, cantidadPeligrosos) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: '🚫 Cuenta Bloqueada - Productos Peligrosos Detectados',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cuenta Bloqueada</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
            
            <!-- Header con gradiente rojo -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 50px 30px; text-align: center; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              
              <!-- Icono de advertencia -->
              <div style="font-size: 64px; line-height: 1; margin: 0 auto 20px auto; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">🚫</div>
              
              <h1 style="color: white; font-size: 30px; font-weight: 700; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">
                Cuenta Bloqueada Automáticamente
              </h1>
              <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0; font-weight: 400; line-height: 1.4;">
                Bloqueo por múltiples productos peligrosos
              </p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 40px 30px;">
              <!-- Saludo personalizado -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 15px 0;">
                  Hola ${name},
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                  Lamentamos informarte que tu cuenta en el <strong>Sistema de Ventas</strong> ha sido <strong>bloqueada automáticamente</strong> debido a que tienes <strong>${cantidadPeligrosos} productos marcados como peligrosos</strong>.
                </p>
              </div>
              
              <!-- Banner de alerta -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; border-radius: 16px; padding: 25px; margin: 30px 0; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.1);">
                <div style="display: flex; align-items: flex-start;">
                  <div style="font-size: 32px; margin-right: 15px; flex-shrink: 0;">⚠️</div>
                  <div>
                    <h3 style="color: #991b1b; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                      Política de Bloqueo Automático
                    </h3>
                    <p style="color: #7f1d1d; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
                      De acuerdo con nuestras políticas de uso, cuando un vendedor tiene <strong>3 o más productos marcados como peligrosos</strong>, su cuenta se bloquea automáticamente para proteger la integridad de la plataforma y sus usuarios.
                    </p>
                    <p style="color: #7f1d1d; font-size: 15px; line-height: 1.6; margin: 0;">
                      Actualmente tienes <strong style="font-size: 18px; color: #dc2626;">${cantidadPeligrosos} productos peligrosos</strong> en tu cuenta.
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Qué significa esto -->
              <div style="background: #fffbeb; border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h4 style="color: #92400e; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; display: flex; align-items: center;">
                  <span style="margin-right: 12px; font-size: 24px;">ℹ️</span>
                  ¿Qué significa esto?
                </h4>
                <ul style="color: #92400e; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Tu cuenta está <strong>suspendida</strong> y no puedes iniciar sesión</li>
                  <li style="margin-bottom: 10px;">No podrás crear, editar o eliminar productos</li>
                  <li style="margin-bottom: 10px;">No podrás acceder a ninguna funcionalidad del sistema</li>
                  <li>Tu cuenta permanecerá bloqueada hasta que un administrador revise tu caso</li>
                </ul>
              </div>
              
              <!-- Qué puedes hacer -->
              <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 16px; padding: 25px; margin: 30px 0;">
                <h4 style="color: #0c4a6e; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; text-align: left;">
                  <span style="margin-right: 12px; font-size: 24px;">💡</span>¿Qué puedes hacer?
                </h4>
                <div style="color: #0c4a6e; font-size: 15px; line-height: 1.6;">
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">1</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;"><strong>Contacta al administrador</strong> del sistema para conocer más detalles sobre tu situación</div>
                  </div>
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">2</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Revisa las <strong>políticas de uso</strong> de la plataforma para entender qué contenidos no están permitidos</div>
                  </div>
                  <div style="display: table; width: 100%; margin-bottom: 15px;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">3</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Si crees que es un error, <strong>solicita una apelación</strong> explicando tu situación</div>
                  </div>
                  <div style="display: table; width: 100%;">
                    <div style="display: table-cell; vertical-align: top; width: 32px; padding-right: 12px;">
                      <div style="background: #0ea5e9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">4</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">Espera la respuesta del equipo de moderación</div>
                  </div>
                </div>
              </div>
              
              <!-- Información importante -->
              <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; display: flex; align-items: flex-start;">
                  <span style="margin-right: 10px; margin-top: 2px; flex-shrink: 0; font-size: 18px;">⚠️</span>
                  <span><strong>Importante:</strong> Mientras tu cuenta esté bloqueada, no podrás iniciar sesión ni recuperar tu contraseña. Debes resolver esta situación con el administrador primero.</span>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%); padding: 30px; border-top: 2px solid #f87171;">
              <div style="text-align: center;">
                <div style="margin-bottom: 20px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 10px 20px; border-radius: 25px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
                    🚫 Sistema de Ventas
                  </div>
                </div>
                <p style="color: #7f1d1d; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6; font-weight: 500;">
                  Este es un email automático del sistema.
                </p>
                <p style="color: #991b1b; font-size: 12px; margin: 0;">
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
    console.log('✅ Email de bloqueo automático por productos peligrosos enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de bloqueo automático:', error.message);
    throw error;
  }
};

/**
 * Envía un email de notificación de cambio de estado de cuenta (LEGACY - mantiene compatibilidad)
 * @param {string} to - Email del destinatario
 * @param {string} name - Nombre del usuario
 * @param {string} estado - Nuevo estado de la cuenta
 * @param {string} motivo - Motivo del cambio (opcional)
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendAccountStatusEmail = async (to, name, estado, motivo = '') => {
  try {
    // Usar funciones específicas para suspendido y activo
    if (estado === 'suspendido') {
      return await sendAccountSuspendedEmail(to, name, motivo);
    } else if (estado === 'activo') {
      return await sendAccountReactivatedEmail(to, name, motivo);
    }
    
    // Para otros estados, usar el email genérico original
    const estadoText = {
      'inactivo': 'desactivada',
      'pendiente_verificacion': 'pendiente de verificación'
    };
    
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: `Estado de cuenta ${estadoText[estado] || 'actualizado'} - Sistema de Ventas`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Estado de Cuenta Actualizado</h2>
          
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>El estado de tu cuenta ha sido actualizado a: <strong>${estadoText[estado] || estado}</strong></p>
          
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
 * Parsea el user-agent para obtener el nombre del navegador de forma amigable
 * @param {string} userAgent - User Agent string
 * @returns {string} Nombre del navegador
 */
const parseBrowserFromUserAgent = (userAgent) => {
  if (!userAgent || userAgent === 'User-Agent desconocido') {
    return 'Navegador desconocido';
  }
  
  // Orden importante: verificar primero los navegadores más específicos
  if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
    return 'Microsoft Edge';
  }
  if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
    return 'Opera';
  }
  if (userAgent.includes('Brave')) {
    return 'Brave';
  }
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
    return 'Google Chrome';
  }
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('Firefox/')) {
    return 'Firefox';
  }
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    return 'Internet Explorer';
  }
  
  return 'Otro navegador';
};

/**
 * Formatea la dirección IP de forma amigable
 * @param {string} ip - Dirección IP
 * @returns {string} IP formateada
 */
const formatIpAddress = (ip) => {
  if (!ip || ip === 'IP desconocida') {
    return 'IP desconocida';
  }
  
  // Localhost IPv6
  if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') {
    return 'localhost (::1)';
  }
  
  // Localhost IPv4
  if (ip === '127.0.0.1') {
    return 'localhost (127.0.0.1)';
  }
  
  // IP privadas (red local)
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return `${ip} (Red local)`;
  }
  
  // IP pública
  return ip;
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
    // Parsear información para hacerla más amigable
    const browserName = parseBrowserFromUserAgent(userAgent);
    const formattedIp = formatIpAddress(ipAddress);
    const formattedDate = new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const mailOptions = {
      from: config.email.from,
      to: to,
      subject: '🔐 Nueva sesión detectada en tu cuenta - Sistema de Ventas',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Sesión Detectada</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          
          <!-- Contenedor Principal -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 20px;">
            <tr>
              <td align="center">
                
                <!-- Tarjeta Principal -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                  
                  <!-- Encabezado con Gradiente -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 72px; line-height: 1; margin-bottom: 20px; text-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                        🔐
          </div>
                      <h1 style="margin: 0; padding: 0; color: white; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">
                        Nueva Sesión Detectada
                      </h1>
                      <p style="margin: 15px 0 0 0; padding: 0; color: rgba(255,255,255,0.95); font-size: 16px; line-height: 1.4;">
                        Alerta de acceso a tu cuenta
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Contenido Principal -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <!-- Saludo -->
                      <p style="margin: 0 0 20px 0; font-size: 18px; color: #2d3748; line-height: 1.6;">
                        Hola <strong style="color: #667eea;">${name}</strong>,
                      </p>
                      
                      <!-- Mensaje Principal -->
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Se ha detectado un <strong>nuevo inicio de sesión</strong> en tu cuenta. A continuación, te mostramos los detalles:
                      </p>
                      
                      <!-- Tarjeta de Detalles -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 30px;">
                            
                            <!-- Título de Detalles -->
                            <h2 style="margin: 0 0 25px 0; font-size: 18px; color: #2d3748; font-weight: 600;">
                              📋 Información de la Sesión
                            </h2>
                            
                            <!-- Lista de Detalles -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              
                              <!-- Navegador -->
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                                        <span style="font-size: 24px;">🌐</span>
                                      </td>
                                      <td style="vertical-align: top;">
                                        <div style="font-size: 13px; color: #718096; margin-bottom: 4px;">Navegador</div>
                                        <div style="font-size: 16px; color: #2d3748; font-weight: 600;">${browserName}</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <!-- Dirección IP -->
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                                        <span style="font-size: 24px;">📍</span>
                                      </td>
                                      <td style="vertical-align: top;">
                                        <div style="font-size: 13px; color: #718096; margin-bottom: 4px;">Dirección IP</div>
                                        <div style="font-size: 16px; color: #2d3748; font-weight: 600;">${formattedIp}</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <!-- Fecha y Hora -->
                              <tr>
                                <td style="padding: 12px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                                        <span style="font-size: 24px;">🕒</span>
                                      </td>
                                      <td style="vertical-align: top;">
                                        <div style="font-size: 13px; color: #718096; margin-bottom: 4px;">Fecha y Hora</div>
                                        <div style="font-size: 16px; color: #2d3748; font-weight: 600;">${formattedDate}</div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Panel de Alerta de Seguridad -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border-left: 4px solid #f56565; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                                  <span style="font-size: 28px;">⚠️</span>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="margin: 0; font-size: 15px; color: #742a2a; line-height: 1.6; font-weight: 500;">
                                    <strong>¿No reconoces esta actividad?</strong><br>
                                    Si no fuiste tú quien inició esta sesión, es posible que tu cuenta esté comprometida. Te recomendamos:
                                  </p>
                                  <ol style="margin: 15px 0 0 0; padding-left: 20px; color: #742a2a; font-size: 14px; line-height: 1.8;">
                                    <li>Cambiar tu contraseña inmediatamente</li>
                                    <li>Contactar a nuestro equipo de soporte</li>
                                  </ol>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Botón de Acción -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                          <td align="center">
            
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Nota Informativa -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #edf2f7; border-radius: 8px; padding: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                              <strong>💡 Nota:</strong> Este correo es una medida de seguridad para proteger tu cuenta. Si reconoces esta sesión, puedes ignorar este mensaje.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #718096; line-height: 1.6;">
                        Sistema de Ventas Multiempresa
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #a0aec0; line-height: 1.6;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                      </p>
                    </td>
                  </tr>
                  
                </table>
                
              </td>
            </tr>
          </table>
          
        </body>
        </html>
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

/**
 * Envía un email de contacto de comprador a vendedor
 * @param {string} vendorEmail - Email del vendedor
 * @param {string} vendorName - Nombre del vendedor
 * @param {string} buyerName - Nombre del comprador
 * @param {string} buyerEmail - Email del comprador
 * @param {string} buyerPhone - Teléfono del comprador
 * @param {string} productName - Nombre del producto
 * @param {number} productPrice - Precio del producto
 * @param {string} message - Mensaje del comprador
 * @returns {Promise<boolean>} True si se envió correctamente
 */
const sendBuyerContactEmail = async (vendorEmail, vendorName, buyerName, buyerEmail, buyerPhone, productName, productPrice, message) => {
  try {
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(price);
    };

    const mailOptions = {
      from: config.email.from,
      to: vendorEmail,
      subject: `Interés en tu producto: ${productName}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interés en tu Producto</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          
          <!-- Contenedor Principal -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 40px 20px;">
            <tr>
              <td align="center">
                
                <!-- Tarjeta Principal -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                  
                  <!-- Encabezado con Gradiente -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 72px; line-height: 1; margin-bottom: 20px; text-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                        📧
                      </div>
                      <h1 style="margin: 0; padding: 0; color: white; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">
                        Interés en tu Producto
                      </h1>
                      <p style="margin: 15px 0 0 0; padding: 0; color: rgba(255,255,255,0.95); font-size: 16px; line-height: 1.4;">
                        Un comprador está interesado en tu producto
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Contenido Principal -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <!-- Saludo -->
                      <p style="margin: 0 0 20px 0; font-size: 18px; color: #2d3748; line-height: 1.6;">
                        Hola <strong style="color: #667eea;">${vendorName}</strong>,
                      </p>
                      
                      <!-- Mensaje Principal -->
                      <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                        Tienes un nuevo mensaje de un comprador interesado en tu producto:
                      </p>
                      
                      <!-- Tarjeta de Producto -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 30px;">
                            <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #2d3748; font-weight: 600;">
                              📦 ${productName}
                            </h2>
                            <p style="margin: 0; font-size: 24px; color: #667eea; font-weight: bold;">
                              ${formatPrice(productPrice)}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Información del Comprador -->
                      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #2d3748; font-weight: 600;">
                        👤 Información del Comprador
                      </h2>
                      
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f7fafc; border-radius: 12px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 10px 0; font-size: 15px; color: #4a5568;">
                              <strong style="color: #2d3748;">Nombre:</strong> ${buyerName}
                            </p>
                            ${buyerEmail ? `<p style="margin: 0 0 10px 0; font-size: 15px; color: #4a5568;">
                              <strong style="color: #2d3748;">Email:</strong> <a href="mailto:${buyerEmail}" style="color: #667eea; text-decoration: none;">${buyerEmail}</a>
                            </p>` : ''}
                            ${buyerPhone ? `<p style="margin: 0; font-size: 15px; color: #4a5568;">
                              <strong style="color: #2d3748;">Teléfono:</strong> <a href="tel:${buyerPhone}" style="color: #667eea; text-decoration: none;">${buyerPhone}</a>
                            </p>` : ''}
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Mensaje del Comprador -->
                      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748; font-weight: 600;">
                        💬 Mensaje
                      </h2>
                      
                      <div style="background: #fff; border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <p style="margin: 0; font-size: 15px; color: #4a5568; line-height: 1.8; white-space: pre-wrap;">
                          ${message}
                        </p>
                      </div>
                      
                      <!-- Información de Contacto -->
                      <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 25px 0;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>💡 Tip:</strong> Puedes responder directamente al comprador usando su email o teléfono proporcionados arriba.
                        </p>
                      </div>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 13px; margin: 0;">
                        Este es un email automático del Sistema de Ventas.
                      </p>
                      <p style="color: #a0aec0; font-size: 12px; margin: 10px 0 0 0;">
                        © 2024 Sistema de Ventas. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                  
                </table>
                
              </td>
            </tr>
          </table>
          
        </body>
        </html>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de contacto de comprador enviado a:', vendorEmail);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de contacto:', error.message);
    throw error;
  }
};

module.exports = {
  verifyEmailConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountStatusEmail,
  sendAccountSuspendedEmail,
  sendAccountReactivatedEmail,
  sendAccountBlockedByDangerousProductsEmail,
  sendNewSessionEmail,
  sendBuyerContactEmail
};
