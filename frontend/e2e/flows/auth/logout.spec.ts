import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AuthHelper } from '../../fixtures/auth';
import { TestUsers } from '../../fixtures/test-data';

test.describe('Cerrar Sesión', () => {
  let loginPage: LoginPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    authHelper = new AuthHelper(page);
  });

  test('debería cerrar sesión exitosamente', async ({ page }) => {
    // Login primero
    await authHelper.login(TestUsers.comprador.email, TestUsers.comprador.password);
    
    // Verificar que está logueado
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    
    // Logout
    await authHelper.logout();
    
    // Verificar redirección a login
    await expect(page).toHaveURL(/.*login/);
    
    // Verificar que no puede acceder a rutas protegidas
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('debería requerir login después de cerrar sesión', async ({ page }) => {
    // Login
    await authHelper.login(TestUsers.comprador.email, TestUsers.comprador.password);
    
    // Logout
    await authHelper.logout();
    
    // Intentar acceder a perfil - esperar la redirección a login
    await page.goto('/profile', { waitUntil: 'networkidle' }).catch(() => {
      // Si la navegación es interrumpida por la redirección, está bien
    });
    
    // Verificar que fue redirigido a login
    await page.waitForURL(/.*login/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*login/);
  });
});

