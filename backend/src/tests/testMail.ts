const { testEmailConfiguration, createTransporter } = require('../services/email');
const { config } = require('../config/config');

// Función para probar la configuración de email
const runEmailTests = async () => {
  console.log('📧 INICIANDO PRUEBAS DE CONFIGURACIÓN DE EMAIL');
  console.log('==============================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Verificar configuración de variables de entorno
  console.log('Test 1: Verificar configuración de variables de entorno');
  try {
    const emailConfig = config.email;
    
    if (emailConfig.host && emailConfig.user && emailConfig.password) {
      console.log('✅ PASS: Configuración de email está completa');
      console.log(`   Host: ${emailConfig.host}`);
      console.log(`   Puerto: ${emailConfig.port}`);
      console.log(`   Usuario: ${emailConfig.user}`);
      console.log(`   From: ${emailConfig.from}`);
      console.log('');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Configuración de email incompleta');
      console.log('   Verifica EMAIL_HOST, EMAIL_USER y EMAIL_PASS en .env\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al verificar configuración:', error.message, '\n');
    testsFailed++;
  }

  // Test 2: Crear transporter de email
  console.log('Test 2: Crear transporter de email');
  try {
    const transporter = createTransporter();
    
    if (transporter) {
      console.log('✅ PASS: Transporter creado exitosamente');
      console.log('   Configuración de email lista para usar\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL: No se pudo crear el transporter\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al crear transporter:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Verificar conexión con el servidor SMTP
  console.log('Test 3: Verificar conexión con servidor SMTP');
  try {
    const isConfigured = await testEmailConfiguration();
    
    if (isConfigured) {
      console.log('✅ PASS: Conexión con servidor SMTP exitosa');
      console.log('   El servidor de email está funcionando correctamente\n');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Error al conectar con servidor SMTP');
      console.log('   Verifica las credenciales en el archivo .env\n');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error al conectar con servidor SMTP:', error.message);
    console.log('   Verifica las credenciales en el archivo .env\n');
    testsFailed++;
  }

  // Test 4: Crear template de email de prueba
  console.log('Test 4: Crear template de email de prueba');
  try {
    const emailTemplate = {
      from: config.email.from,
      to: 'test@example.com',
      subject: 'Prueba del Sistema de Ventas Multiempresa',
      html: `
        <h2>Prueba de Email - Sistema de Ventas Multiempresa</h2>
        <p>Este es un email de prueba para verificar la configuración del sistema.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Sistema:</strong> Sistema de Ventas Multiempresa</p>
        <p><strong>Estado:</strong> Configuración de email funcionando correctamente</p>
        <p><strong>Servidor:</strong> ${config.server.host}:${config.server.port}</p>
      `
    };
    
    console.log('✅ PASS: Template de email creado exitosamente');
    console.log('   Template listo para envío de emails del sistema\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAIL: Error al crear template:', error.message, '\n');
    testsFailed++;
  }

  // Resumen final
  console.log('==============================================');
  console.log('RESUMEN DE PRUEBAS DE EMAIL');
  console.log('==============================================');
  console.log(`✅ Pruebas exitosas: ${testsPassed}`);
  console.log(`❌ Pruebas fallidas: ${testsFailed}`);
  console.log(`📊 Total de pruebas: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 CONFIGURACIÓN DE EMAIL LISTA');
    console.log('El sistema puede enviar emails de verificación y notificaciones');
  } else {
    console.log('\n⚠️  REVISAR CONFIGURACIÓN DE EMAIL');
    console.log('Configura las variables EMAIL_* en el archivo .env');
  }

  return {
    passed: testsPassed,
    failed: testsFailed,
    total: testsPassed + testsFailed,
    success: testsFailed === 0
  };
};

// Ejecutar pruebas
runEmailTests()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error fatal en las pruebas de email:', error);
    process.exit(1);
  });
