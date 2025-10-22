/**
 * Script para probar el envío del email de reactivación de cuenta
 */

require('dotenv').config();
const { sendAccountReactivatedEmail, sendAccountSuspendedEmail } = require('./src/services/email');

async function testEmails() {
  console.log('🧪 Iniciando prueba de emails de suspensión y reactivación...\n');
  
  const testEmail = process.argv[2] || 'tu@email.com';
  const testName = process.argv[3] || 'Usuario de Prueba';
  
  console.log(`📧 Email de prueba: ${testEmail}`);
  console.log(`👤 Nombre: ${testName}\n`);
  
  // Probar email de suspensión
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚫 PRUEBA 1: Email de Cuenta Suspendida');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    await sendAccountSuspendedEmail(
      testEmail,
      testName,
      'Esta es una prueba del sistema. Tu cuenta no está realmente suspendida.'
    );
    console.log('✅ Email de suspensión enviado exitosamente\n');
  } catch (error) {
    console.error('❌ Error enviando email de suspensión:', error.message);
    console.error('Stack:', error.stack);
    console.log('');
  }
  
  // Esperar 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Probar email de reactivación
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PRUEBA 2: Email de Cuenta Reactivada');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    await sendAccountReactivatedEmail(
      testEmail,
      testName,
      'Esta es una prueba del sistema. ¡Bienvenido de vuelta!'
    );
    console.log('✅ Email de reactivación enviado exitosamente\n');
  } catch (error) {
    console.error('❌ Error enviando email de reactivación:', error.message);
    console.error('Stack:', error.stack);
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Prueba completada');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📬 Revisa tu bandeja de entrada (y spam) en:', testEmail);
  console.log('');
}

// Ejecutar prueba
testEmails()
  .then(() => {
    console.log('✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });

