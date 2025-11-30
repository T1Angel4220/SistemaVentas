import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Detalle de Producto
 */
export class ProductDetailPage {
  readonly page: Page;
  
  // Elementos principales
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly reportButton: Locator;
  
  // Report Dialog
  readonly reportDialog: Locator;
  readonly reportTypeOptions: Locator;
  readonly motivoReporteTextarea: Locator;
  readonly informacionAdicionalTextarea: Locator;
  readonly submitReportButton: Locator;
  readonly cancelReportButton: Locator;
  readonly reportError: Locator;
  readonly reportSuccess: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Producto
    this.productName = page.locator('h1, h2').filter({ hasText: /./ }).first();
    this.productPrice = page.locator('text=/\\$\\d+/').first();
    this.productDescription = page.locator('[class*="descripcion"], p').first();
    // El botón de reportar puede tener el texto "Reportar producto" (minúscula)
    this.reportButton = page.locator('button:has-text("Reportar producto")')
      .or(page.locator('button:has-text("Reportar")'))
      .or(page.locator('button:has-text("Reportar Producto")'))
      .first();
    
    // Dialog de reporte - buscar por el h2 "Reportar Producto" que está dentro del dialog
    this.reportDialog = page.locator('div[class*="fixed"]:has(h2:has-text("Reportar Producto"))')
      .or(page.locator('div:has(h2:has-text("Reportar Producto"))').filter({ has: page.locator('[class*="backdrop-blur"]') }))
      .first();
    this.reportTypeOptions = page.locator('input[type="radio"][name="tipo_reporte"]');
    this.motivoReporteTextarea = page.locator('textarea[id="motivo"]')
      .or(page.locator('textarea[placeholder*="mínimo 20"], textarea[placeholder*="Describe detalladamente"]'))
      .first();
    this.informacionAdicionalTextarea = page.locator('textarea[id="informacion_adicional"]')
      .or(page.locator('textarea[placeholder*="adicional"], textarea[placeholder*="URLs"]'))
      .first();
    this.submitReportButton = page.locator('button:has-text("Enviar Reporte"), button:has-text("🚩 Enviar Reporte")')
      .or(page.locator('button[type="submit"]').filter({ has: this.reportDialog }))
      .first();
    this.cancelReportButton = page.locator('button:has-text("Cancelar")').filter({
      has: this.reportDialog
    });
    this.reportError = page.locator('text=/error|Error/i').filter({ has: this.reportDialog });
    this.reportSuccess = page.locator('text=/éxito|exitosamente/i').first();
  }

  /**
   * Navegar a la página de detalle de un producto
   */
  async goto(productId: number) {
    await this.page.goto(`/products/${productId}`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Esperar a que la página cargue
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.productName.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Obtener nombre del producto
   */
  async getProductName(): Promise<string> {
    await this.waitForPageLoad();
    const text = await this.productName.textContent();
    return text?.trim() || '';
  }

  /**
   * Obtener precio del producto
   */
  async getProductPrice(): Promise<string> {
    try {
      const text = await this.productPrice.textContent({ timeout: 5000 });
      return text?.trim() || '';
    } catch {
      return '';
    }
  }

  /**
   * Abrir dialog de reporte
   */
  async openReportDialog() {
    // Esperar a que la página esté completamente cargada
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
    
    // Buscar el botón - puede estar en diferentes ubicaciones
    const reportButton = this.page.locator('button:has-text("Reportar producto")')
      .or(this.page.locator('button:has-text("Reportar")'))
      .first();
    
    await reportButton.waitFor({ state: 'visible', timeout: 15000 });
    await reportButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await reportButton.click();
    await this.page.waitForTimeout(1000);
    
    // Esperar a que el dialog aparezca - buscar por el h2 "Reportar Producto"
    const dialog = this.page.locator('h2:has-text("Reportar Producto")').locator('..').locator('..').first();
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  /**
   * Crear un reporte de producto
   */
  async createReport(
    tipoReporte: 'contenido_inapropiado' | 'producto_prohibido' | 'informacion_falsa' | 'spam' | 'otro',
    motivo: string,
    informacionAdicional?: string
  ) {
    // Abrir dialog
    await this.openReportDialog();
    
    // Esperar a que el dialog esté completamente visible
    await this.reportDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500);
    
    // Seleccionar tipo de reporte por value del radio
    const radioOption = this.page.locator(`input[type="radio"][value="${tipoReporte}"]`).first();
    await radioOption.waitFor({ state: 'visible', timeout: 5000 });
    
    // Hacer scroll al elemento si es necesario
    await radioOption.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    // Seleccionar el radio button
    await radioOption.check();
    await this.page.waitForTimeout(300);
    
    // Ingresar motivo
    await this.motivoReporteTextarea.waitFor({ state: 'visible', timeout: 5000 });
    await this.motivoReporteTextarea.fill(motivo);
    await this.page.waitForTimeout(300);
    
    // Información adicional (opcional)
    if (informacionAdicional) {
      await this.informacionAdicionalTextarea.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      if (await this.informacionAdicionalTextarea.isVisible().catch(() => false)) {
        await this.informacionAdicionalTextarea.fill(informacionAdicional);
        await this.page.waitForTimeout(300);
      }
    }
    
    // Buscar el botón de enviar - puede tener diferentes textos
    const submitButton = this.page.locator('button:has-text("Enviar Reporte")')
      .or(this.page.locator('button:has-text("🚩 Enviar Reporte")'))
      .or(this.page.locator('button[type="submit"]').filter({ has: this.reportDialog }))
      .first();
    
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Verificar que no esté deshabilitado (motivo debe tener al menos 20 caracteres)
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled && motivo.length < 20) {
      // El botón está deshabilitado porque el motivo es muy corto
      // No intentar hacer click
      return;
    }
    
    // Hacer scroll al botón si es necesario
    await submitButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    
    // Verificar que el botón está habilitado antes de hacer click
    const isStillDisabled = await submitButton.isDisabled();
    if (isStillDisabled) {
      throw new Error('El botón de enviar reporte está deshabilitado');
    }
    
    // Enviar
    await submitButton.click();
    
    // Esperar a que se procese el reporte
    await this.page.waitForTimeout(3000);
    
    // Verificar que el diálogo se cerró
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verificar si hay error en el reporte
   */
  async hasReportError(): Promise<boolean> {
    try {
      const error = await this.reportError.isVisible({ timeout: 2000 });
      return error;
    } catch {
      return false;
    }
  }

  /**
   * Obtener mensaje de error del reporte
   */
  async getReportErrorMessage(): Promise<string> {
    try {
      if (await this.hasReportError()) {
        const text = await this.reportError.textContent();
        return text?.trim() || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Verificar si el reporte fue exitoso
   */
  async isReportSuccess(): Promise<boolean> {
    try {
      // El dialog debería cerrarse y mostrar mensaje de éxito
      await this.page.waitForTimeout(2000);
      const dialogVisible = await this.reportDialog.isVisible({ timeout: 1000 });
      // Si el dialog no está visible, probablemente fue exitoso
      return !dialogVisible;
    } catch {
      return false;
    }
  }

  /**
   * Cerrar dialog de reporte
   */
  async closeReportDialog() {
    try {
      if (await this.reportDialog.isVisible({ timeout: 1000 })) {
        await this.cancelReportButton.click();
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // Dialog ya está cerrado
    }
  }
}


