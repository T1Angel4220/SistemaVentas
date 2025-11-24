import { test, expect } from '@playwright/test';
import { UserManagementPage } from '../../pages/UserManagementPage';
import { LoginPage } from '../../pages/LoginPage';
import { AuthHelper } from '../../fixtures/auth';
import { TestUsers, generateUniqueEmail, generateUniqueCedula } from '../../fixtures/test-data';
import { RegisterPage } from '../../pages/RegisterPage';
import { DBHelper } from '../../utils/db-helper';

test.describe('Flujo Completo: Suspensión y Reactivación de Usuario', () => {
  // Aumentar timeout para este test completo ya que puede tardar más
  test.setTimeout(120000); // 2 minutos
  let userManagementPage: UserManagementPage;
  let loginPage: LoginPage;
  let authHelper: AuthHelper;
  let registerPage: RegisterPage;

  test('flujo completo: crear usuario, suspender, intentar login, reactivar', async ({ page }) => {
    userManagementPage = new UserManagementPage(page);
    loginPage = new LoginPage(page);
    authHelper = new AuthHelper(page);
    registerPage = new RegisterPage(page);

    // Paso 1: Crear un nuevo usuario
    const email = generateUniqueEmail('suspension-test');
    const cedula = generateUniqueCedula();
    const password = 'password123';

    await registerPage.goto();
    await registerPage.fillForm({
      cedula,
      nombre: 'Usuario',
      apellido: 'Suspension',
      correo: email,
      password,
      confirmPassword: password,
      telefono: '88888888',
      direccion: 'Dirección de prueba 123',
      genero: 'masculino',
      tipo_usuario: 'comprador'
    });
    await registerPage.submit();

    // Esperar a que el registro se complete (puede redirigir a verificación)
    await page.waitForTimeout(2000);
    
    // Verificar si el registro redirigió a verificación
    const isRedirectedToVerification = await registerPage.isRegistrationSuccessful();
    
    if (isRedirectedToVerification) {
      // Esperar un poco más para asegurar que el usuario se guardó en la BD
      await page.waitForTimeout(2000);
      
      // Si redirigió a verificación, verificar el email directamente en la BD
      // Esto permite que el usuario aparezca en la tabla de gestión sin necesidad
      // de verificar manualmente el email (que ya se prueba en otros tests)
      const dbHelper = new DBHelper();
      
      // Primero verificar que el usuario existe en la BD
      let usuarioExiste = false;
      let intentosExistencia = 0;
      while (!usuarioExiste && intentosExistencia < 5) {
        const estado = await dbHelper.getUserStatus(email);
        if (estado !== null) {
          usuarioExiste = true;
          break;
        }
        await page.waitForTimeout(1000);
        intentosExistencia++;
      }
      
      if (!usuarioExiste) {
        await dbHelper.disconnect();
        throw new Error(`Usuario no se encontró en la BD después de ${intentosExistencia} intentos`);
      }
      
      // Ahora verificar el email
      const verified = await dbHelper.verifyUserEmail(email);
      
      // Verificar que la actualización funcionó
      if (!verified) {
        await dbHelper.disconnect();
        throw new Error('No se pudo verificar el email del usuario en la BD');
      }
      
      // Verificar directamente en la BD que el usuario está activo
      let usuarioActivo = false;
      let intentosBD = 0;
      while (!usuarioActivo && intentosBD < 5) {
        const estado = await dbHelper.getUserStatus(email);
        
        if (estado === 'activo') {
          usuarioActivo = true;
          break;
        }
        
        // Si no está activo, esperar un poco y verificar de nuevo
        await page.waitForTimeout(1000);
        intentosBD++;
      }
      
      if (!usuarioActivo) {
        const estadoActual = await dbHelper.getUserStatus(email);
        await dbHelper.disconnect();
        throw new Error(`Usuario no está en estado activo en la BD después de ${intentosBD} intentos. Estado actual: ${estadoActual}`);
      }
      
      await dbHelper.disconnect();
      
      // Esperar más tiempo para que la BD se actualice y se propague el cambio
      await page.waitForTimeout(3000);
    }

    // Paso 2: Login como admin y suspender el usuario
    await authHelper.loginAs('administrador');
    await userManagementPage.goto();
    
    // Esperar a que la página se cargue completamente
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await userManagementPage.usersTable.waitFor({ state: 'visible', timeout: 10000 });
    
    // Buscar el usuario
    await userManagementPage.searchUser(email);
    
    // Esperar a que la búsqueda se complete (la página recarga automáticamente con debounce)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Esperar a que aparezca el usuario en la tabla
    let userRow = page.locator(`tr:has-text("${email}")`);
    await userRow.waitFor({ state: 'visible', timeout: 15000 });
    
    // Verificar que el usuario está en estado activo esperando a que el botón aparezca
    // El botón solo aparece si el usuario está activo
    // Ya verificamos el estado en el paso anterior, pero podemos verificar una vez más con reintentos
    let estadoBD = null;
    let intentosEstado = 0;
    const dbHelper = new DBHelper();
    
    while (intentosEstado < 3 && estadoBD !== 'activo') {
      estadoBD = await dbHelper.getUserStatus(email);
      if (estadoBD === 'activo') {
        break;
      }
      await page.waitForTimeout(1000);
      intentosEstado++;
    }
    
    await dbHelper.disconnect();
    
    if (estadoBD !== 'activo') {
      throw new Error(`Usuario no está en estado activo en la BD después de ${intentosEstado} intentos. Estado actual: ${estadoBD}`);
    }
    
    // Esperar un poco más para que la UI se actualice
    await page.waitForTimeout(2000);
    
    // Recargar la página para forzar que cargue los datos actualizados
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await userManagementPage.usersTable.waitFor({ state: 'visible', timeout: 10000 });
    await userManagementPage.searchUser(email);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    userRow = page.locator(`tr:has-text("${email}")`);
    await userRow.waitFor({ state: 'visible', timeout: 15000 });
    
    // Verificar que el botón de suspender está visible
    const suspendBtn = userRow.locator('button[title="Suspender usuario"], button[title*="Suspender"]');
    
    // Esperar hasta que el botón aparezca (puede tardar si el usuario acaba de ser activado)
    let suspendBtnVisible = false;
    let intentos = 0;
    const maxIntentos = 3; // Reducir intentos ya que verificamos en BD
    
    while (!suspendBtnVisible && intentos < maxIntentos) {
      suspendBtnVisible = await suspendBtn.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (suspendBtnVisible) {
        break;
      }
      
      // Si no está visible, recargar la página y buscar de nuevo
      await page.reload();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await userManagementPage.usersTable.waitFor({ state: 'visible', timeout: 10000 });
      await userManagementPage.searchUser(email);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      userRow = page.locator(`tr:has-text("${email}")`);
      await userRow.waitFor({ state: 'visible', timeout: 10000 });
      
      intentos++;
    }
    
    // Si después de varios intentos el botón no aparece, lanzar error descriptivo
    if (!suspendBtnVisible) {
      // Verificar el estado del usuario en la UI
      const estadoText = await userRow.locator('span, td').filter({ hasText: /ACTIVO|PENDIENTE|SUSPENDIDO/i }).first().textContent().catch(() => 'desconocido');
      throw new Error(`El botón de suspender no apareció después de ${maxIntentos} intentos. Estado del usuario en la UI: ${estadoText}. Estado en BD: ${estadoBD}`);
    }
    
    const motivoSuspension = 'Prueba E2E de suspensión';
    await userManagementPage.suspendUser(email, motivoSuspension);

    // Verificar mensaje de éxito - puede tardar en aparecer
    const successMessage1 = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') });
    await expect(successMessage1.first()).toBeVisible({ timeout: 10000 });

    // Paso 3: Logout y intentar login con el usuario suspendido
    await authHelper.logout();
    await loginPage.login(email, password);

    // Verificar que muestra error de cuenta suspendida
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('suspendida');

    // Paso 4: Login como admin y reactivar el usuario
    await authHelper.loginAs('administrador');
    await userManagementPage.goto();
    await userManagementPage.filterByStatus('suspendido');
    await userManagementPage.searchUser(email);
    // await page.waitForTimeout(1000); // COMENTADO

    const motivoReactivacion = 'Prueba E2E de reactivación';
    await userManagementPage.activateUser(email, motivoReactivacion);

    // Verificar mensaje de éxito - puede tardar en aparecer
    const successMessage2 = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') });
    await expect(successMessage2.first()).toBeVisible({ timeout: 10000 });

    // Paso 5: Verificar que el usuario puede hacer login nuevamente
    await authHelper.logout();
    await loginPage.login(email, password);

    // Verificar que el login es exitoso
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });
});

