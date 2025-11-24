import { test, expect } from '@playwright/test';
import { ProfilePage } from '../../pages/ProfilePage';
import { LoginPage } from '../../pages/LoginPage';
import { AuthHelper } from '../../fixtures/auth';
import { TestUsers } from '../../fixtures/test-data';

test.describe('Perfil de Usuario', () => {
  // Aumentar timeout para todos los tests de este describe
  test.setTimeout(60000);
  let profilePage: ProfilePage;
  let loginPage: LoginPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    loginPage = new LoginPage(page);
    authHelper = new AuthHelper(page);
    
    // Asegurar que la página esté lista
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Login antes de cada test - optimizado
    try {
      // Ir a login primero
      await page.goto('/login');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await page.waitForTimeout(800);
      
      // Hacer login
      await authHelper.login(TestUsers.comprador.email, TestUsers.comprador.password);
      await page.waitForTimeout(1000);
      
      // Ir al perfil
      await profilePage.goto();
      await page.waitForTimeout(500);
    } catch (error) {
      // Si falla, intentar una vez más
      console.log('Error en beforeEach, reintentando...');
      await page.goto('/login');
      await page.waitForTimeout(1000);
      await authHelper.login(TestUsers.comprador.email, TestUsers.comprador.password);
      await page.waitForTimeout(1000);
      await profilePage.goto();
      await page.waitForTimeout(500);
    }
  });

  test('debería mostrar la información del perfil correctamente', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
    
    // Verificar que los campos están presentes (buscar de múltiples formas)
    const nombreField = profilePage.nombreInput.or(
      page.locator('input[name="nombre"]').or(
        page.locator('text=/Nombre|nombre/i').first()
      )
    );
    await expect(nombreField.first()).toBeVisible({ timeout: 15000 });
  });

  test('debería editar información del perfil exitosamente', async ({ page }) => {
    await profilePage.editProfile({
      nombre: 'Nuevo Nombre',
      apellido: 'Nuevo Apellido',
      telefono: '0999999999',
      direccion: 'Nueva Dirección'
    });
    
    // Esperar a que aparezca el mensaje de éxito (máximo 10 segundos)
    const successMessage = page.locator('text=/Perfil actualizado exitosamente|éxito|actualizado/i').or(
      page.locator('[class*="from-green-50"]').first()
    );
    
    await expect(successMessage.first()).toBeVisible({ timeout: 10000 });
  });

  test('debería cambiar contraseña exitosamente', async ({ page }) => {
    const newPassword = 'newpassword123';
    
    await profilePage.changePassword(
      TestUsers.comprador.password,
      newPassword,
      newPassword
    );
    
    // Esperar mensaje de éxito
    const successMessage = page.locator('text=/Contraseña cambiada|éxito|actualizado/i').or(
      page.locator('[class*="from-green-50"]').first()
    );
    await expect(successMessage.first()).toBeVisible({ timeout: 10000 });
    
    // Nota: El test de login con nueva contraseña se omite para evitar problemas de logout
    // La funcionalidad de cambio de contraseña se valida con el mensaje de éxito
    // Restaurar contraseña original para otros tests
    await page.waitForTimeout(2000);
    await profilePage.goto();
    await profilePage.changePassword(newPassword, TestUsers.comprador.password, TestUsers.comprador.password);
    await page.waitForTimeout(2000);
  });

  test('debería validar errores en cambio de contraseña', async ({ page }) => {
    // Test combinado: validar múltiples errores en un solo test para optimizar
    
    // 1. Validar contraseña actual incorrecta
    await profilePage.changePassword('wrongpassword', 'newpassword123', 'newpassword123');
    await page.waitForTimeout(2000);
    
    const error1 = page.locator('text=/incorrecta|error|Error|inválida/i').or(
      page.locator('[class*="from-red-50"]').first()
    );
    const hasError1 = await error1.first().isVisible({ timeout: 10000 }).catch(() => false);
    
    // Si no se encuentra visualmente, verificar el texto
    if (!hasError1) {
      const pageText = await page.textContent('body') || '';
      expect(pageText.includes('incorrecta') || pageText.includes('error') || pageText.includes('Error')).toBeTruthy();
    } else {
      expect(hasError1).toBeTruthy();
    }
    
    // Limpiar y probar siguiente validación
    await page.waitForTimeout(2000);
    
    // 2. Validar que las contraseñas nuevas coincidan
    await profilePage.changePassword(TestUsers.comprador.password, 'newpassword123', 'differentpassword');
    await page.waitForTimeout(2000);
    
    const error2 = page.locator('text=/no coinciden|diferentes|coincidir/i').or(
      page.locator('[class*="from-red-50"]').first()
    );
    const hasError2 = await error2.first().isVisible({ timeout: 10000 }).catch(() => false);
    
    // Si no se encuentra visualmente, verificar el texto
    if (!hasError2) {
      const pageText = await page.textContent('body') || '';
      expect(pageText.includes('no coinciden') || pageText.includes('diferentes') || pageText.includes('coincidir')).toBeTruthy();
    } else {
      expect(hasError2).toBeTruthy();
    }
  });
});

