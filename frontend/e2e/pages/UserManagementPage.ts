import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Gestión de Usuarios (Admin)
 */
export class UserManagementPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly filterRoleSelect: Locator;
  readonly filterStatusSelect: Locator;
  readonly usersTable: Locator;
  readonly suspendButton: Locator;
  readonly activateButton: Locator;
  readonly viewSessionsButton: Locator;
  readonly modal: Locator;
  readonly modalReasonInput: Locator;
  readonly modalConfirmButton: Locator;
  readonly modalCancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // El input tiene placeholder "Nombre, email, cédula..." o puede tener type="text"
    this.searchInput = page.locator('input[placeholder*="Nombre"], input[placeholder*="email"], input[placeholder*="cédula"], input[type="text"]').first();
    // Los selects no tienen name, buscar por las opciones que contienen
    this.filterRoleSelect = page.locator('select').filter({ hasText: /Todos los roles|Comprador|Vendedor|Moderador|Administrador/ }).first();
    this.filterStatusSelect = page.locator('select').filter({ hasText: /Todos los estados|Activo|Inactivo|Suspendido|Pendiente/ }).first();
    this.usersTable = page.locator('table, [role="table"]');
    // Los botones usan iconos con atributo title, no texto visible
    this.suspendButton = page.locator('button[title="Suspender usuario"], button[title*="Suspender"]');
    this.activateButton = page.locator('button[title="Reactivar usuario"], button[title*="Reactivar"], button[title*="Activar"]');
    this.viewSessionsButton = page.locator('button[title="Gestionar sesiones"], button[title*="sesiones"], button[title*="Sesiones"]');
    this.modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
    this.modalReasonInput = page.locator('textarea[name="motivo"], input[name="motivo"], textarea[placeholder*="motivo"]');
    // El botón de confirmar tiene el texto "Reactivar Usuario" o "Suspender Usuario"
    this.modalConfirmButton = page.locator('button:has-text("Reactivar Usuario"), button:has-text("Suspender Usuario")');
    this.modalCancelButton = page.locator('button:has-text("Cancelar"), button:has-text("Cerrar")');
    // El mensaje de éxito usa gradiente from-emerald-500 via-green-600 to-teal-600
    this.successMessage = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"], div[class*="to-teal-600"]').filter({ has: page.locator('text=/Éxito|éxito/i') }).or(
      page.locator('text=/Éxito|éxito|exitosamente/i').first()
    ).first();
    this.errorMessage = page.locator('div[class*="from-red-500"], div[class*="via-red-600"]').filter({ has: page.locator('text=/Error|error/i') }).or(
      page.locator('.text-red-500, [role="alert"]:has-text("error")').first()
    ).first();
  }

  /**
   * Navegar a la página de gestión de usuarios
   */
  async goto() {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    // await this.page.waitForTimeout(2000); // COMENTADO
  }

  /**
   * Buscar usuario
   */
  async searchUser(searchTerm: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill(searchTerm);
    // await this.page.waitForTimeout(1500); // COMENTADO - Esperar debounce y carga de resultados
  }

  /**
   * Filtrar por rol
   */
  async filterByRole(role: string) {
    await this.filterRoleSelect.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(500); // COMENTADO
    await this.filterRoleSelect.selectOption(role);
    // await this.page.waitForTimeout(1500); // COMENTADO - Esperar carga de resultados
  }

  /**
   * Filtrar por estado
   */
  async filterByStatus(status: string) {
    await this.filterStatusSelect.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(500); // COMENTADO
    await this.filterStatusSelect.selectOption(status);
    // Esperar a que se carguen los resultados después del filtro (el componente tiene debounce de 500ms)
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    // Esperar a que aparezca al menos una fila en la tabla o el mensaje de "no hay usuarios"
    await this.page.locator('tr, div:has-text("No hay usuarios")').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Suspender usuario por email
   */
  async suspendUser(email: string, motivo: string) {
    // Buscar el usuario en la tabla - esperar a que la tabla se cargue
    await this.usersTable.waitFor({ state: 'visible', timeout: 10000 });
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    await userRow.waitFor({ state: 'visible', timeout: 15000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    
    // Esperar a que el botón de suspender aparezca (puede tardar si el usuario acaba de ser activado)
    // Intentar varias veces con recarga si es necesario
    let suspendBtn = userRow.locator('button[title="Suspender usuario"], button[title*="Suspender"]');
    let isVisible = await suspendBtn.isVisible({ timeout: 5000 }).catch(() => false);
    let intentos = 0;
    const maxIntentos = 5;
    
    while (!isVisible && intentos < maxIntentos) {
      // Esperar un poco antes de recargar
      await this.page.waitForTimeout(2000);
      
      // Recargar y buscar de nuevo
      await this.page.reload();
      await this.usersTable.waitFor({ state: 'visible', timeout: 10000 });
      const refreshedUserRow = this.page.locator(`tr:has-text("${email}")`);
      await refreshedUserRow.waitFor({ state: 'visible', timeout: 15000 });
      suspendBtn = refreshedUserRow.locator('button[title="Suspender usuario"], button[title*="Suspender"]');
      
      isVisible = await suspendBtn.isVisible({ timeout: 5000 }).catch(() => false);
      intentos++;
    }
    
    // Si después de varios intentos no está visible, lanzar error descriptivo
    if (!isVisible) {
      // Verificar el estado del usuario en la fila
      const estadoText = await userRow.locator('span, td').filter({ hasText: /ACTIVO|PENDIENTE|SUSPENDIDO/i }).first().textContent().catch(() => 'desconocido');
      throw new Error(`El botón de suspender no está visible. El usuario puede no estar en estado activo. Estado actual: ${estadoText}`);
    }
    
    // Asegurarse de que el botón está visible antes de hacer clic
    await suspendBtn.waitFor({ state: 'visible', timeout: 5000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await suspendBtn.click();
    // await this.page.waitForTimeout(1500); // COMENTADO
    
    // Llenar motivo en el modal
    await this.modalReasonInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.modalReasonInput.fill(motivo);
    // await this.page.waitForTimeout(800); // COMENTADO
    
    await this.modalConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await this.modalConfirmButton.click();
    
    // Esperar confirmación - esperar a que el modal se cierre
    await this.modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Activar usuario por email
   */
  async activateUser(email: string, motivo?: string) {
    // Esperar a que la tabla se cargue
    await this.usersTable.waitFor({ state: 'visible', timeout: 10000 });
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    await userRow.waitFor({ state: 'visible', timeout: 15000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    
    const activateBtn = userRow.locator('button[title="Reactivar usuario"], button[title*="Reactivar"], button[title*="Activar"]');
    await activateBtn.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await activateBtn.click();
    // await this.page.waitForTimeout(1500); // COMENTADO
    
    if (motivo && await this.modalReasonInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.modalReasonInput.fill(motivo);
      // await this.page.waitForTimeout(800); // COMENTADO
    }
    
    await this.modalConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await this.modalConfirmButton.click();
    
    // Esperar a que el modal se cierre
    await this.modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Ver sesiones de usuario
   */
  async viewUserSessions(email: string) {
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    await userRow.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    
    const sessionsBtn = userRow.locator('button[title="Gestionar sesiones"], button[title*="sesiones"], button[title*="Sesiones"]');
    await sessionsBtn.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await sessionsBtn.click();
    await this.page.waitForURL(/.*sessions/, { timeout: 10000 });
    // await this.page.waitForTimeout(1500); // COMENTADO
  }
}

