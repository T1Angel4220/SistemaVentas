import { test, expect } from '@playwright/test';
import { UserManagementPage } from '../../pages/UserManagementPage';
import { AuthHelper } from '../../fixtures/auth';
import { TestUsers } from '../../fixtures/test-data';

test.describe('Gestión de Usuarios - Admin', () => {
  let userManagementPage: UserManagementPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    userManagementPage = new UserManagementPage(page);
    authHelper = new AuthHelper(page);
    
    // Login como administrador
    await authHelper.loginAs('administrador');
    await userManagementPage.goto();
  });

  test('debería mostrar la lista de usuarios correctamente', async ({ page }) => {
    await expect(userManagementPage.usersTable).toBeVisible();
    await expect(userManagementPage.searchInput).toBeVisible();
  });

  test('debería buscar usuarios por email', async ({ page }) => {
    await userManagementPage.searchUser(TestUsers.comprador.email);
    
    // Verificar que la tabla muestra resultados
    // await page.waitForTimeout(1000); // COMENTADO
    await expect(page.locator(`text=${TestUsers.comprador.email}`)).toBeVisible();
  });


  test('debería suspender un usuario exitosamente', async ({ page }) => {
    const motivo = 'Prueba de suspensión E2E';
    
    // Buscar usuario de prueba
    await userManagementPage.searchUser(TestUsers.comprador.email);
    // await page.waitForTimeout(1000); // COMENTADO
    
    // Suspender usuario
    await userManagementPage.suspendUser(TestUsers.comprador.email, motivo);
    
    // Verificar mensaje de éxito - puede tardar en aparecer
    // El mensaje usa gradiente from-emerald-500 via-green-600 to-teal-600
    const successMessage = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') });
    await expect(successMessage.first()).toBeVisible({ timeout: 10000 });
    
    // Verificar que el usuario aparece como suspendido
    await page.reload();
    await userManagementPage.searchUser(TestUsers.comprador.email);
    // Buscar el estado "SUSPENDIDO" en la fila del usuario (más específico)
    const userRow = page.locator(`tr:has-text("${TestUsers.comprador.email}")`);
    await expect(userRow.locator('text=SUSPENDIDO')).toBeVisible({ timeout: 10000 });
  });

  test('debería activar un usuario suspendido exitosamente', async ({ page }) => {
    const motivo = 'Prueba de reactivación E2E';
    
    // Buscar usuario suspendido
    await userManagementPage.filterByStatus('suspendido');
    await userManagementPage.searchUser(TestUsers.comprador.email);
    // await page.waitForTimeout(1000); // COMENTADO
    
    // Activar usuario
    await userManagementPage.activateUser(TestUsers.comprador.email, motivo);
    
    // Verificar mensaje de éxito - puede tardar en aparecer
    const successMessage = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') });
    await expect(successMessage.first()).toBeVisible({ timeout: 10000 });
    
    // Verificar que el usuario aparece como activo
    await page.reload();
    await userManagementPage.searchUser(TestUsers.comprador.email);
    // Buscar el estado "ACTIVO" en la fila del usuario (más específico)
    const userRow = page.locator(`tr:has-text("${TestUsers.comprador.email}")`);
    await expect(userRow.locator('text=ACTIVO')).toBeVisible({ timeout: 10000 });
  });

});

