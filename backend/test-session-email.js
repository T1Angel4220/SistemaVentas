/**
 * Script para probar el email de nueva sesión
 * 
 * Uso:
 *   node test-session-email.js <email> <nombre>
 * 
 * Ejemplo:
 *   node test-session-email.js test@example.com "Johan"
 */

require('dotenv').config();
const { sendNewSessionEmail } = require('./src/services/email');

// Obtener argumentos de línea de comandos
const email = process.argv[2];
const nombre = process.argv[3];

if (!email || !nombre) {
  console.error('❌ Error: Debes proporcionar email y nombre');
  console.log('\n📖 Uso:');
  console.log('  node test-session-email.js <email> <nombre>');
  console.log('\n📝 Ejemplo:');
  console.log('  node test-session-email.js test@example.com "Johan"');
  process.exit(1);
}

// Simular diferentes navegadores y IPs para pruebas
const testScenarios = [
  {
    name: 'Chrome en localhost',
    ip: '::1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
  },
  {
    name: 'Edge en localhost',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
  },
  {
    name: 'Firefox en red local',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
  },
  {
    name: 'Safari en IP pública',
    ip: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
  }
];

async function testEmails() {
  console.log('\n🧪 Iniciando prueba de emails de nueva sesión...');
  console.log(`📧 Email de prueba: ${email}`);
  console.log(`👤 Nombre: ${nombre}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    
    console.log(`\n📨 PRUEBA ${i + 1}: ${scenario.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Navegador: ${scenario.userAgent.substring(0, 60)}...`);
    console.log(`📍 IP: ${scenario.ip}`);
    
    try {
      await sendNewSessionEmail(email, nombre, scenario.ip, scenario.userAgent);
      console.log(`✅ Email "${scenario.name}" enviado exitosamente`);
      
      // Esperar 2 segundos entre emails
      if (i < testScenarios.length - 1) {
        console.log('⏳ Esperando 2 segundos antes del siguiente email...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error al enviar email "${scenario.name}":`, error.message);
      console.error('   Stack:', error.stack);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Prueba completada');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📬 Revisa tu bandeja de entrada (y spam) en: ${email}`);
  console.log('\n📋 Deberías haber recibido 4 emails mostrando:');
  console.log('   1️⃣  Google Chrome + localhost (::1)');
  console.log('   2️⃣  Microsoft Edge + localhost (127.0.0.1)');
  console.log('   3️⃣  Firefox + 192.168.1.100 (Red local)');
  console.log('   4️⃣  Safari + 203.0.113.45 (IP pública)');
  console.log('\n✅ Script finalizado correctamente');
}

// Ejecutar las pruebas
testEmails()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });

