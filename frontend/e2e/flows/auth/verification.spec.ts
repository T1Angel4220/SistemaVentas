import { test, expect } from '@playwright/test';
import { VerifyCodePage } from '../../pages/VerifyCodePage';
import { RegisterPage } from '../../pages/RegisterPage';
import { generateUniqueEmail, generateUniqueCedula } from '../../fixtures/test-data';
import { DBHelper } from '../../utils/db-helper';

test.describe('Verificación de Email', () => {
  let verifyCodePage: VerifyCodePage;

  test.beforeEach(async ({ page }) => {
    verifyCodePage = new VerifyCodePage(page);
  });

  test('debería mostrar la página de verificación correctamente', async ({ page }) => {
    await verifyCodePage.goto('test@example.com');
    await expect(verifyCodePage.codeInput).toBeVisible();
    await expect(verifyCodePage.submitButton).toBeVisible();
  });

  test('debería validar que el código tenga 6 dígitos', async ({ page }) => {
    await verifyCodePage.goto('test@example.com');
    await verifyCodePage.enterCode('12345'); // Solo 5 dígitos
    
    // Verificar que el botón está deshabilitado con código de 5 dígitos
    const isDisabled = await verifyCodePage.submitButton.isDisabled();
    expect(isDisabled).toBeTruthy();
    
    // Intentar hacer clic (puede que muestre error de validación)
    await verifyCodePage.submit();
    
    // Esperar un poco para que aparezca el error si hay validación del lado del cliente
    await page.waitForTimeout(2000);
    
    // Verificar que muestra error o que el botón sigue deshabilitado
    const errorVisible = await verifyCodePage.errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
    if (!errorVisible) {
      // Si no hay error visible, verificar que el botón sigue deshabilitado
      const stillDisabled = await verifyCodePage.submitButton.isDisabled();
      expect(stillDisabled).toBeTruthy();
    }
  });

  test('debería rechazar código inválido', async ({ page }) => {
    await verifyCodePage.goto('test@example.com');
    await verifyCodePage.enterCode('000000');
    await verifyCodePage.submit();
    
    // Verificar que muestra error
    await expect(verifyCodePage.errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('debería permitir reenviar código', async ({ page }) => {
    await verifyCodePage.goto('test@example.com');
    
    // Verificar que el botón de reenvío está visible
    await expect(verifyCodePage.resendButton).toBeVisible();
    
    // Hacer clic en reenviar
    await verifyCodePage.resendCode();
    
    // Esperar mensaje de confirmación
    await page.waitForTimeout(2000);
  });

  test('debería verificar código válido exitosamente', async ({ page }) => {
    // Registrar un nuevo usuario para obtener un código de verificación real
    const registerPage = new RegisterPage(page);
    const dbHelper = new DBHelper();
    
    const email = generateUniqueEmail('verification-test');
    const cedula = generateUniqueCedula();
    const password = 'password123';
    
    // Registrar usuario
    await registerPage.goto();
    await registerPage.fillForm({
      cedula,
      nombre: 'Test',
      apellido: 'Verification',
      correo: email,
      password,
      confirmPassword: password,
      telefono: '88888888',
      direccion: 'Dirección de prueba 123',
      genero: 'masculino',
      tipo_usuario: 'comprador'
    });
    await registerPage.submit();
    
    // Esperar a que se complete el registro
    await page.waitForTimeout(2000);
    
    // Obtener código de verificación de la BD
    const verificationCode = await dbHelper.getVerificationCode(email);
    await dbHelper.disconnect();
    
    // Si no hay código, el test falla
    expect(verificationCode).not.toBeNull();
    expect(verificationCode).toMatch(/^\d{6}$/); // Debe ser un código de 6 dígitos
    
    // Verificar el código
    await verifyCodePage.goto(email);
    await verifyCodePage.enterCode(verificationCode!);
    await verifyCodePage.submit();
    
    // Verificar que la verificación fue exitosa (redirige a login o dashboard)
    const isSuccessful = await verifyCodePage.isVerificationSuccessful();
    expect(isSuccessful).toBeTruthy();
  });
});

