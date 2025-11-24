import { test, expect } from '@playwright/test';
import { RegisterModeratorPage } from '../../pages/RegisterModeratorPage';
import { AuthHelper } from '../../fixtures/auth';
import { generateUniqueEmail, generateUniqueCedula } from '../../fixtures/test-data';

test.describe('Registro de Moderadores - Admin', () => {
  let registerModeratorPage: RegisterModeratorPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    registerModeratorPage = new RegisterModeratorPage(page);
    authHelper = new AuthHelper(page);
    
    // Login como administrador
    await authHelper.loginAs('administrador');
    // await page.waitForTimeout(2000); // COMENTADO
    await registerModeratorPage.goto();
    // await page.waitForTimeout(2000); // COMENTADO
  });

  // Test único y esencial: registrar moderador exitosamente
  test('debería registrar un nuevo moderador exitosamente', async ({ page }) => {
    const email = generateUniqueEmail('moderador');
    const cedula = generateUniqueCedula();
    
    // Verificar que el formulario está visible
    await expect(registerModeratorPage.cedulaInput).toBeVisible({ timeout: 10000 });
    
    await registerModeratorPage.fillForm({
      cedula,
      nombre: 'Test',
      apellido: 'Moderador',
      correo: email,
      password: 'password123',
      confirmPassword: 'password123',
      telefono: '0999999999'
    });
    
    await registerModeratorPage.submit();
    // await page.waitForTimeout(3000); // COMENTADO
    
    // Verificar mensaje de éxito o redirección
    // El registro exitoso puede mostrar mensaje o redirigir a /admin/users después de 3 segundos
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/admin/users');
    
    if (!isRedirected) {
      // Si no redirigió, buscar mensaje de éxito
      const successSelectors = [
        page.locator('text=/éxito|exitosamente|registrado/i'),
        page.locator('[class*="from-green-50"], [class*="to-emerald-50"]').first(),
        page.locator('.text-green-500, .text-green-600, .text-green-700').first()
      ];
      
      let hasSuccess = false;
      for (const selector of successSelectors) {
        if (await selector.first().isVisible({ timeout: 10000 }).catch(() => false)) {
          hasSuccess = true;
          break;
        }
      }
      
      // Si hay mensaje de éxito, esperar un poco más para la redirección
      if (hasSuccess) {
        await page.waitForURL(/.*admin\/users/, { timeout: 5000 }).catch(() => {});
        const finalUrl = page.url();
        expect(finalUrl.includes('/admin/users') || hasSuccess).toBeTruthy();
      } else {
        // Verificar texto de la página
        const pageText = await page.textContent('body') || '';
        const hasSuccessText = pageText.includes('éxito') || 
                               pageText.includes('exitosamente') || 
                               pageText.includes('registrado');
        expect(hasSuccessText || isRedirected).toBeTruthy();
      }
    } else {
      expect(isRedirected).toBeTruthy();
    }
  });
});

