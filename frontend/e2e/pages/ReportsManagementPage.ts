import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Gestión de Reportes (Moderadores)
 */
export class ReportsManagementPage {
  readonly page: Page;
  readonly reportsTable: Locator;
  readonly filterTypeSelect: Locator;
  readonly filterStateSelect: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly suspendButton: Locator;
  readonly deleteButton: Locator;
  readonly resolveModal: Locator;
  readonly resolveDecisionTextarea: Locator;
  readonly markDangerousCheckbox: Locator;
  readonly confirmResolveButton: Locator;
  readonly cancelResolveButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly statisticsCards: Locator;
  readonly loadingIndicator: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    // Lista de reportes - los reportes están en Cards dentro de un div con space-y-6
    this.reportsTable = page.locator('div[class*="space-y-6"]').filter({ has: page.locator('h3:has-text(/.+/), [class*="Card"]') }).first();
    // Selector de filtro por tipo - buscar por el label "Tipo de Reporte"
    this.filterTypeSelect = page.locator('label:has-text("Tipo de Reporte") + select, label:has-text("Tipo de Reporte") ~ select, select').filter({ 
      has: page.locator('option:has-text("Contenido Inapropiado"), option:has-text("Producto Prohibido")') 
    }).first();
    // Selector de filtro por estado - buscar por el label "Estado"
    this.filterStateSelect = page.locator('label:has-text("Estado") + select, label:has-text("Estado") ~ select, select').filter({ 
      has: page.locator('option:has-text("Pendiente"), option:has-text("Resuelto")') 
    }).first();
    // Botones de acción - texto exacto según el componente
    this.approveButton = page.locator('button:has-text("Producto Válido")').first();
    this.rejectButton = page.locator('button:has-text("Rechazar Producto")').first();
    this.suspendButton = page.locator('button:has-text("Suspender")').first();
    this.deleteButton = page.locator('button:has-text("Marcar Peligroso")').first();
    // Modal de resolución - buscar por el título "Resolver Reporte"
    this.resolveModal = page.locator('div.fixed.inset-0[class*="z-50"]').filter({ has: page.locator('h2:has-text("Resolver Reporte")') }).first();
    // Textarea para decisión final - buscar por id o name
    this.resolveDecisionTextarea = page.locator('textarea#decision, textarea[name="decision"], textarea[placeholder*="Explicación"], textarea[placeholder*="decisión"]').first();
    // Checkbox para marcar como peligroso - dentro del modal, dentro de un label
    this.markDangerousCheckbox = page.locator('label').filter({ hasText: /Marcar como peligroso/i }).locator('input[type="checkbox"]').first();
    // Botones del modal - el botón confirmar tiene el texto "✅ Confirmar Decisión"
    this.confirmResolveButton = page.locator('button:has-text("Confirmar Decisión"), button:has-text("Confirmar")').first();
    this.cancelResolveButton = page.locator('button:has-text("Cancelar")').filter({ 
      hasNot: page.locator('text=/Confirmar|Resolver/')
    }).first();
    // Mensajes
    this.successMessage = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') }).first();
    this.errorMessage = page.locator('div[class*="from-red-500"], div[class*="via-red-600"]').filter({ has: page.locator('text=/Error|error/i') }).first();
    // Estadísticas
    this.statisticsCards = page.locator('[class*="stat"], div:has-text("Pendientes"), div:has-text("Resueltos")');
    // Loading
    this.loadingIndicator = page.locator('text=/Cargando|Loading/i, [class*="spinner"], [class*="animate-spin"]');
    // Estado vacío
    this.emptyState = page.locator('text=/No hay reportes|No se encontraron/i');
  }

  /**
   * Navegar a la página de gestión de reportes
   */
  async goto() {
    await this.page.goto('/moderation/reports');
    // Esperar a que la página cargue - usar 'domcontentloaded' como fallback si networkidle tarda mucho
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      // Si networkidle no se alcanza, al menos esperar DOM y un tiempo corto
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Filtrar por tipo de reporte
   */
  async filterByType(type: string) {
    await this.filterTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.filterTypeSelect.selectOption(type);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1500); // Esperar carga de resultados
  }

  /**
   * Filtrar por estado
   */
  async filterByState(state: string) {
    await this.filterStateSelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.filterStateSelect.selectOption(state);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  /**
   * Seleccionar un reporte (por índice o por texto)
   */
  async selectReport(reportId?: number, reportText?: string) {
    // Esperar a que la página cargue completamente
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
    
    // Buscar Cards que contienen reportes - deben tener h3 (nombre del producto) y botones de acción
    let reportCards = this.page.locator('[class*="Card"]').filter({ 
      has: this.page.locator('h3:has-text(/.+/)'),
      has: this.page.locator('button:has-text("Producto Válido"), button:has-text("Rechazar Producto"), button:has-text("Suspender"), button:has-text("Marcar Peligroso")')
    });
    
    const count = await reportCards.count();
    
    if (count === 0) {
      // Si no hay reportes con botones, buscar solo Cards con h3
      reportCards = this.page.locator('[class*="Card"]').filter({ 
        has: this.page.locator('h3:has-text(/.+/)')
      });
      const fallbackCount = await reportCards.count();
      if (fallbackCount === 0) {
        throw new Error('No se encontró ningún reporte visible en la página');
      }
    }
    
    // Si se especifica un ID o texto, buscar ese específico
    if (reportId) {
      // Buscar por ID (puede estar en un atributo data-* o en el texto)
      const specificCard = reportCards.filter({ 
        has: this.page.locator(`text="${reportId}"`)
      }).first();
      const visible = await specificCard.isVisible({ timeout: 5000 }).catch(() => false);
      if (visible) {
        await specificCard.waitFor({ state: 'visible', timeout: 10000 });
        return specificCard;
      }
    }
    
    if (reportText) {
      // Buscar por texto del producto (en el h3)
      const specificCard = reportCards.filter({ 
        has: this.page.locator(`h3:has-text("${reportText}")`)
      }).first();
      const visible = await specificCard.isVisible({ timeout: 5000 }).catch(() => false);
      if (visible) {
        await specificCard.waitFor({ state: 'visible', timeout: 10000 });
        return specificCard;
      }
    }
    
    // Retornar el primer reporte disponible
    const firstCard = reportCards.first();
    await firstCard.waitFor({ state: 'visible', timeout: 10000 });
    return firstCard;
  }

  /**
   * Aprobar un reporte
   */
  async approveReport(reportId?: number, decision?: string) {
    const reportCard = await this.selectReport(reportId);
    // Buscar botón "Producto Válido" dentro del Card
    const approveBtn = reportCard.locator('button:has-text("Producto Válido")').first();
    await approveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await approveBtn.scrollIntoViewIfNeeded();
    await approveBtn.click();
    
    // Esperar a que aparezca el modal
    await this.resolveModal.waitFor({ state: 'visible', timeout: 10000 });
    
    if (decision) {
      await this.enterDecision(decision);
      await this.confirmResolve();
    }
  }

  /**
   * Rechazar un reporte
   */
  async rejectReport(reportId?: number, decision?: string) {
    const reportCard = await this.selectReport(reportId);
    // Buscar botón "Rechazar Producto" dentro del Card
    const rejectBtn = reportCard.locator('button:has-text("Rechazar Producto")').first();
    await rejectBtn.waitFor({ state: 'visible', timeout: 10000 });
    await rejectBtn.scrollIntoViewIfNeeded();
    await rejectBtn.click();
    
    // Esperar a que aparezca el modal
    await this.resolveModal.waitFor({ state: 'visible', timeout: 10000 });
    
    if (decision) {
      await this.enterDecision(decision);
      await this.confirmResolve();
    }
  }

  /**
   * Suspender producto desde reporte
   */
  async suspendProductFromReport(reportId?: number, decision?: string) {
    const reportCard = await this.selectReport(reportId);
    // Buscar botón "Suspender" dentro del Card
    const suspendBtn = reportCard.locator('button:has-text("Suspender")').first();
    await suspendBtn.waitFor({ state: 'visible', timeout: 10000 });
    await suspendBtn.scrollIntoViewIfNeeded();
    await suspendBtn.click();
    
    // Esperar a que aparezca el modal
    await this.resolveModal.waitFor({ state: 'visible', timeout: 10000 });
    
    if (decision) {
      await this.enterDecision(decision);
      await this.confirmResolve();
    }
  }

  /**
   * Eliminar producto (marcar como peligroso) desde reporte
   */
  async deleteProductFromReport(reportId?: number, decision?: string, markDangerous: boolean = true) {
    const reportCard = await this.selectReport(reportId);
    // Buscar botón "Marcar Peligroso" dentro del Card
    const deleteBtn = reportCard.locator('button:has-text("Marcar Peligroso")').first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click();
    
    // Esperar a que aparezca el modal
    await this.resolveModal.waitFor({ state: 'visible', timeout: 10000 });
    
    if (decision) {
      await this.enterDecision(decision);
      
      if (markDangerous && await this.markDangerousCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await this.markDangerousCheckbox.check();
      }
      
      await this.confirmResolve();
    }
  }

  /**
   * Ingresar decisión final en el modal
   */
  async enterDecision(decision: string) {
    // Buscar el textarea dentro del modal visible
    const textarea = this.resolveModal.locator('textarea#decision, textarea[name="decision"], textarea[placeholder*="Explicación"]').first();
    await textarea.waitFor({ state: 'visible', timeout: 10000 });
    await textarea.scrollIntoViewIfNeeded();
    await textarea.fill(decision);
    await this.page.waitForTimeout(500);
  }

  /**
   * Confirmar resolución
   */
  async confirmResolve() {
    await this.confirmResolveButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmResolveButton.click();
    await this.resolveModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  /**
   * Cancelar resolución
   */
  async cancelResolve() {
    await this.cancelResolveButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.cancelResolveButton.click();
    await this.resolveModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Verificar si hay reportes visibles
   */
  async hasReports(): Promise<boolean> {
    // Esperar a que el DOM esté listo
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (error) {
      // Si hay timeout, continuar de todas formas
    }
    
    // Pequeña espera para que el contenido se renderice
    try {
      await this.page.waitForTimeout(1500);
    } catch (error) {
      // Si hay timeout del test, simplemente continuar
      return false;
    }
    
    // Verificar si hay estado vacío
    const hasEmpty = await this.emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasEmpty) return false;
    
    // Verificar si hay Cards con reportes - buscar Cards que tienen h3 (nombre del producto) y botones de acción
    const reportCards = this.page.locator('[class*="Card"]').filter({ 
      has: this.page.locator('h3:has-text(/.+/)'),
      has: this.page.locator('button:has-text("Producto Válido"), button:has-text("Rechazar Producto")')
    });
    
    const count = await reportCards.count().catch(() => 0);
    return count > 0;
  }

  /**
   * Verificar mensaje de éxito
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Verificar mensaje de error
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Obtener cantidad de reportes pendientes de las estadísticas
   */
  async getPendingCount(): Promise<number> {
    try {
      const pendingCard = this.page.locator('div:has-text("Pendientes")').or(
        this.statisticsCards.filter({ hasText: /Pendientes/i })
      ).first();
      if (await pendingCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        const text = await pendingCard.textContent();
        const match = text?.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
    } catch {}
    return 0;
  }
}

