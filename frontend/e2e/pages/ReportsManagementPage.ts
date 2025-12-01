import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Gestión de Reportes
 */
export class ReportsManagementPage {
  readonly page: Page;
  
  // Elementos principales
  readonly headerTitle: Locator;
  readonly reportsList: Locator;
  readonly loadingSpinner: Locator;
  readonly emptyState: Locator;
  
  // Estadísticas
  readonly pendingCount: Locator;
  readonly inReviewCount: Locator;
  readonly resolvedCount: Locator;
  readonly totalCount: Locator;
  
  // Filtros
  readonly tipoReporteFilter: Locator;
  readonly estadoFilter: Locator;
  
  // Acciones de reporte
  readonly productValidButton: Locator;
  readonly rejectProductButton: Locator;
  readonly suspendProductButton: Locator;
  readonly markDangerousButton: Locator;
  
  // Dialog de resolución
  readonly resolveDialog: Locator;
  readonly decisionTextarea: Locator;
  readonly markDangerousCheckbox: Locator;
  readonly confirmDecisionButton: Locator;
  readonly cancelDecisionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header - buscar el h1 que contiene "Gestión de Reportes" (puede tener otros elementos)
    this.headerTitle = page.locator('h1:has-text("Gestión de Reportes")')
      .or(page.locator('h1').filter({ hasText: /Gestión de Reportes/i }))
      .first();
    
    // Estadísticas
    this.pendingCount = page.locator('text=/Pendientes/').locator('..').locator('text=/\\d+/').first();
    this.inReviewCount = page.locator('text=/En Revisión/').locator('..').locator('text=/\\d+/').first();
    this.resolvedCount = page.locator('text=/Resueltos/').locator('..').locator('text=/\\d+/').first();
    this.totalCount = page.locator('text=/Total/').locator('..').locator('text=/\\d+/').first();
    
    // Filtros - Buscar por label primero, luego por contexto del select
    this.tipoReporteFilter = page.locator('label:has-text("Tipo de Reporte")')
      .locator('..')
      .locator('select')
      .or(page.locator('label:has-text("Tipo de Reporte") + select'))
      .or(page.locator('select').filter({ has: page.locator('option:has-text("Contenido Inapropiado")') }))
      .first();
      
    this.estadoFilter = page.locator('label:has-text("Estado")')
      .locator('..')
      .locator('select')
      .or(page.locator('label:has-text("Estado") + select'))
      .or(page.locator('select').nth(1))
      .first();
    
    // Lista de reportes
    this.reportsList = page.locator('[class*="space-y"]').filter({ has: page.locator('[class*="Card"]') });
    this.loadingSpinner = page.locator('text=/Cargando reportes/');
    this.emptyState = page.locator('text=/No hay reportes/');
    
    // Dialog de resolución - buscar por el h2 "Resolver Reporte"
    this.resolveDialog = page.locator('h2:has-text("Resolver Reporte")')
      .locator('..')
      .locator('..')
      .or(page.locator('div[class*="fixed"]:has(h2:has-text("Resolver Reporte"))'))
      .first();
    this.decisionTextarea = page.locator('textarea[id="decision"]')
      .or(page.locator('textarea[placeholder*="explicación"], textarea[placeholder*="decisión"]'))
      .first();
    this.markDangerousCheckbox = page.locator('input[type="checkbox"]')
      .filter({ has: page.locator('text=/Marcar como peligroso/i') })
      .first();
    this.confirmDecisionButton = page.locator('button:has-text("Confirmar Decisión"), button:has-text("✅ Confirmar Decisión")')
      .or(page.locator('button').filter({ has: page.locator('text=/Confirmar Decisión/i') }))
      .first();
    this.cancelDecisionButton = page.locator('button:has-text("Cancelar")')
      .filter({ has: this.resolveDialog })
      .first();
  }

  /**
   * Navegar a la página de gestión de reportes
   */
  async goto() {
    await this.page.goto('/moderation/reports');
    // Usar 'domcontentloaded' en lugar de 'networkidle' para evitar timeouts
    await this.page.waitForLoadState('domcontentloaded');
    // Esperar a que los elementos principales estén visibles
    await this.page.waitForTimeout(2000);
    // Esperar a que se carguen los datos (pero no bloquear si hay peticiones pendientes)
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // Si hay timeout, continuar de todas formas
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Esperar a que la página cargue completamente
   */
  async waitForPageLoad() {
    // Simplificado: solo esperar un tiempo corto sin verificar networkidle
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch {
      // Continuar de todas formas
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Obtener número de reportes pendientes
   */
  async getPendingCount(): Promise<number> {
    try {
      const text = await this.pendingCount.textContent({ timeout: 5000 });
      return parseInt(text?.trim() || '0');
    } catch {
      return 0;
    }
  }

  /**
   * Obtener número de reportes resueltos
   */
  async getResolvedCount(): Promise<number> {
    try {
      const text = await this.resolvedCount.textContent({ timeout: 5000 });
      return parseInt(text?.trim() || '0');
    } catch {
      return 0;
    }
  }

  /**
   * Filtrar por tipo de reporte
   */
  async filterByTipoReporte(tipo: string) {
    await this.tipoReporteFilter.waitFor({ state: 'visible', timeout: 10000 });
    await this.tipoReporteFilter.selectOption(tipo);
    await this.page.waitForTimeout(2000); // Esperar a que se carguen los resultados
  }

  /**
   * Filtrar por estado
   */
  async filterByEstado(estado: string) {
    await this.estadoFilter.waitFor({ state: 'visible', timeout: 10000 });
    await this.estadoFilter.selectOption(estado);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Obtener todos los reportes visibles
   */
  async getVisibleReports() {
    await this.waitForPageLoad();
    const reportCards = this.page.locator('[class*="Card"]').filter({ 
      has: this.page.locator('[class*="producto_nombre"], h3') 
    });
    return reportCards;
  }

  /**
   * Obtener primer reporte visible
   */
  async getFirstReport() {
    const reports = await this.getVisibleReports();
    if (await reports.count() === 0) {
      throw new Error('No hay reportes visibles');
    }
    return reports.first();
  }

  /**
   * Abrir dialog de resolución para un reporte
   */
  async openResolveDialog(reportIndex: number = 0, action: 'aprobar' | 'rechazar' | 'suspender' | 'eliminar') {
    const reports = await this.getVisibleReports();
    const report = reports.nth(reportIndex);
    
    let buttonSelector: string;
    switch (action) {
      case 'aprobar':
        buttonSelector = 'button:has-text("Producto Válido"), button:has-text("aprobar")';
        break;
      case 'rechazar':
        buttonSelector = 'button:has-text("Rechazar Producto"), button:has-text("rechazar")';
        break;
      case 'suspender':
        buttonSelector = 'button:has-text("Suspender"), button:has-text("suspender")';
        break;
      case 'eliminar':
        buttonSelector = 'button:has-text("Marcar Peligroso"), button:has-text("eliminar")';
        break;
    }
    
    const button = report.locator(buttonSelector).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
    await this.page.waitForTimeout(1000);
    
    // Esperar a que el dialog aparezca
    await this.resolveDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Resolver un reporte
   */
  async resolveReport(
    reportIndex: number,
    action: 'aprobar' | 'rechazar' | 'suspender' | 'eliminar',
    decision: string,
    markDangerous: boolean = false
  ) {
    // Abrir dialog
    await this.openResolveDialog(reportIndex, action);
    
    // Ingresar decisión
    await this.decisionTextarea.waitFor({ state: 'visible', timeout: 5000 });
    await this.decisionTextarea.fill(decision);
    
    // Marcar como peligroso si es necesario
    if (markDangerous) {
      const checkbox = await this.markDangerousCheckbox.isVisible();
      if (checkbox) {
        await this.markDangerousCheckbox.check();
      }
    }
    
    // Confirmar
    await this.confirmDecisionButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDecisionButton.click();
    
    // Esperar a que se cierre el dialog y se actualice la lista
    await this.page.waitForTimeout(3000);
    await this.waitForPageLoad();
  }

  /**
   * Verificar que hay reportes visibles
   */
  async hasReports(): Promise<boolean> {
    await this.waitForPageLoad();
    const reports = await this.getVisibleReports();
    return (await reports.count()) > 0;
  }

  /**
   * Obtener información de un reporte
   */
  async getReportInfo(reportIndex: number = 0) {
    const reports = await this.getVisibleReports();
    const report = reports.nth(reportIndex);
    
    const nombre = await report.locator('h3, [class*="producto_nombre"]').first().textContent();
    const tipoReporte = await report.locator('text=/⚠️|🚫|❌|📧|🔖/').first().textContent();
    const estado = await report.locator('[class*="Badge"]').first().textContent();
    
    return {
      nombre: nombre?.trim() || '',
      tipoReporte: tipoReporte?.trim() || '',
      estado: estado?.trim() || ''
    };
  }

  /**
   * Verificar que el reporte tiene un estado específico
   */
  async reportHasEstado(reportIndex: number, estado: string): Promise<boolean> {
    const info = await this.getReportInfo(reportIndex);
    return info.estado.toLowerCase().includes(estado.toLowerCase());
  }
}


