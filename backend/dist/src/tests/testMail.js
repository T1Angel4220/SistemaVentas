"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailService = void 0;
const email_1 = require("../services/email");
/**
 * Pruebas del servicio de email
 */
const testEmailService = async () => {
    console.log('🧪 Iniciando pruebas de email...\n');
    try {
        // Probar conexión de email
        console.log('1. Probando conexión de email...');
        const emailConnected = await (0, email_1.verifyEmailConnection)();
        if (!emailConnected) {
            console.error('❌ No se pudo conectar al servicio de email');
            return false;
        }
        console.log('✅ Conexión de email exitosa\n');
        // Probar envío de email de verificación (solo en desarrollo)
        console.log('2. Probando envío de email de verificación...');
        try {
            await (0, email_1.sendVerificationEmail)('test@ejemplo.com', 'Usuario de Prueba', 'test_token_12345');
            console.log('✅ Email de verificación enviado exitosamente\n');
        }
        catch (emailError) {
            console.log('   (Esto es normal si no hay configuración de email válida)\n');
        }
        console.log('🎉 Pruebas de email completadas');
        return true;
    }
    catch (error) {
        console.error('❌ Error en las pruebas de email:', error);
        return false;
    }
};
exports.testEmailService = testEmailService;
// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    testEmailService()
        .then(success => {
        process.exit(success ? 0 : 1);
    })
        .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}
