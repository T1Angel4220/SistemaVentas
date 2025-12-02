import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Detalle de Producto
 */
export class ProductDetailPage {
  readonly page: Page;
  readonly reportButton: Locator;
  readonly reportModal: Locator;
  readonly reportTypeRadio: Locator;
  readonly reportReasonTextarea: Locator;
  readonly reportAdditionalInfoTextarea: Locator;
  readonly submitReportButton: Locator;
  readonly cancelReportButton: Locator;
  readonly productTitle: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Botón para reportar producto - buscar por texto "Reportar producto" (minúscula) o variantes
    this.reportButton = page.locator('button:has-text("Reportar producto"), button:has-text("Reportar"), button:has-text("Reportar Producto")').first();
    // Modal de reporte - buscar por el div con z-50 y el h2 con "Reportar Producto"
    this.reportModal = page.locator('div.fixed.inset-0[class*="z-50"]').filter({ has: page.locator('h2:has-text("Reportar Producto")') }).first();
    // Radio buttons para tipo de reporte
    this.reportTypeRadio = page.locator('input[type="radio"][name="tipo_reporte"]');
    // Textarea para motivo del reporte - buscar por id="motivo" primero
    this.reportReasonTextarea = page.locator('textarea#motivo').or(page.locator('textarea[name="motivo_reporte"], textarea[placeholder*="Describe detalladamente"]')).first();
    // Textarea para información adicional - buscar después del motivo
    this.reportAdditionalInfoTextarea = page.locator('textarea[placeholder*="adicional"], textarea[placeholder*="URLs"], textarea').filter({ hasNot: page.locator('[placeholder*="motivo"]') }).first();
    // Botón de enviar reporte - buscar por texto "🚩 Enviar Reporte" (exacto del componente)
    this.submitReportButton = page.locator('button:has-text("🚩 Enviar Reporte")').or(page.locator('button[type="submit"]:has-text("Enviar Reporte")')).first();
    // Botón de cancelar - buscar el botón "Cancelar" en el modal o el botón X del header
    this.cancelReportButton = page.locator('button:has-text("Cancelar")').or(
      page.locator('button:has(svg):has(> svg)').filter({ has: page.locator('path[d*="M18 6L6 18"]') }) // X icon path
    ).first();
    // Título del producto
    this.productTitle = page.locator('h1, h2').filter({ hasText: /.+/ }).first();
    // Mensajes de éxito/error - buscar por texto o clases
    this.successMessage = page.locator('div:has-text("Reporte enviado"), div:has-text("exitosamente"), div:has-text("¡Reporte enviado!")').or(
      page.locator('div[class*="from-emerald"], div[class*="from-green"]').filter({ hasText: /éxito|exitosamente|enviado/i })
    ).first();
    this.errorMessage = page.locator('div:has-text("Error"), div[class*="from-red"], div[class*="text-red"]').filter({ hasText: /error|Error/i }).first();
  }

  /**
   * Navegar a la página de detalle de un producto
   */
  async goto(productId: number) {
    await this.page.goto(`/products/${productId}`);
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    } catch {
      // Si networkidle falla, esperar domcontentloaded
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Abrir el modal de reporte
   */
  async openReportModal() {
    // Esperar a que la página cargue completamente
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Buscar el botón de reportar (puede estar en diferentes lugares)
    // El texto exacto es "Reportar producto" (minúscula) según el código
    const reportButtons = [
      this.page.locator('button:has-text("Reportar producto")'),
      this.page.locator('button:has-text("Reportar")').filter({ hasText: /Reportar/i }).filter({ hasNot: this.page.locator('text=/Moderar|Gestionar/i') }),
      this.page.locator('button').filter({ hasText: /Reportar/i }).filter({ hasNot: this.page.locator('text=/Moderar|Gestionar/i') })
    ];
    
    let buttonFound = false;
    for (const btn of reportButtons) {
      const isVisible = await btn.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await btn.click();
        buttonFound = true;
        break;
      }
    }
    
    if (!buttonFound) {
      throw new Error('No se encontró el botón de reportar');
    }
    
    // Esperar a que el modal aparezca - buscar por el h2 "Reportar Producto"
    await this.page.waitForSelector('h2:has-text("Reportar Producto")', { 
      state: 'visible', 
      timeout: 15000 
    });
    
    // También esperar a que el formulario esté listo (tipo de reporte visible)
    await this.page.waitForSelector('input[type="radio"][name="tipo_reporte"]', {
      state: 'visible',
      timeout: 10000
    });
    
    // Esperar un poco más para que la animación termine
    await this.page.waitForTimeout(1000);
  }

  /**
   * Seleccionar tipo de reporte
   */
  async selectReportType(type: 'contenido_inapropiado' | 'producto_prohibido' | 'informacion_falsa' | 'spam' | 'otro') {
    // Buscar el radio button dentro del modal - el label es clickeable también
    const radio = this.page.locator(`input[type="radio"][name="tipo_reporte"][value="${type}"]`);
    // También buscar el label que contiene el radio
    const label = this.page.locator(`label:has(input[type="radio"][name="tipo_reporte"][value="${type}"])`);
    
    // Esperar a que el radio esté disponible
    await radio.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {
      throw new Error(`No se encontró el radio button para el tipo de reporte: ${type}`);
    });
    
    // Verificar que la página no se haya cerrado
    if (this.page.isClosed()) {
      throw new Error('La página se cerró antes de seleccionar el tipo de reporte');
    }
    
    // Hacer scroll si es necesario
    await radio.scrollIntoViewIfNeeded();
    // Hacer clic en el label (más confiable que el radio en algunos casos)
    const labelVisible = await label.isVisible({ timeout: 3000 }).catch(() => false);
    if (labelVisible) {
      await label.click().catch(() => {
        // Si falla, intentar con el radio directamente
        return radio.click();
      });
    } else {
      await radio.click().catch(() => {
        throw new Error(`No se pudo hacer clic en el radio button para ${type}`);
      });
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Ingresar motivo del reporte
   */
  async enterReportReason(reason: string) {
    // Buscar el textarea por id="motivo" (específico del componente)
    const textarea = this.page.locator('textarea#motivo');
    await textarea.waitFor({ state: 'visible', timeout: 10000 });
    await textarea.scrollIntoViewIfNeeded();
    await textarea.fill(reason);
    await this.page.waitForTimeout(500);
  }

  /**
   * Ingresar información adicional del reporte
   */
  async enterAdditionalInfo(info: string) {
    if (await this.reportAdditionalInfoTextarea.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.reportAdditionalInfoTextarea.fill(info);
    }
  }

  /**
   * Enviar reporte
   */
  async submitReport() {
    // Buscar el botón de enviar dentro del modal
    const submitBtn = this.page.locator('button:has-text("Enviar Reporte"), button:has-text("🚩 Enviar Reporte"), button[type="submit"]').filter({ 
      hasText: /Enviar/i 
    }).first();
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    // Esperar a que el modal se cierre o aparezca mensaje
    await this.page.waitForTimeout(3000);
  }

  /**
   * Cancelar reporte
   */
  async cancelReport() {
    // Buscar botón Cancelar en el modal
    const cancelBtn = this.page.locator('button:has-text("Cancelar")').first();
    const cancelVisible = await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (cancelVisible) {
      await cancelBtn.click();
    } else {
      // Intentar con el botón X del header
      const closeBtn = this.page.locator('button:has(svg)').filter({ 
        has: this.page.locator('svg path') 
      }).first();
      await closeBtn.click({ timeout: 5000 }).catch(() => {});
    }
    
    // Esperar a que el modal se cierre
    await this.reportModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Verificar si el botón de reportar está visible
   */
  async isReportButtonVisible(): Promise<boolean> {
    // Verificar que la página no esté cerrada
    if (this.page.isClosed()) {
      return false;
    }
    
    // Esperar a que la página cargue
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    // Verificar nuevamente antes de hacer waitForTimeout
    if (this.page.isClosed()) {
      return false;
    }
    
    await this.page.waitForTimeout(1000);
    
    // Buscar el botón de múltiples formas
    const buttons = [
      this.page.locator('button:has-text("Reportar producto")'),
      this.page.locator('button:has-text("Reportar")').filter({ hasText: /Reportar/i }),
      this.page.locator('button').filter({ hasText: /Reportar/i }).filter({ hasNot: this.page.locator('text=/Moderar|Gestionar/i') })
    ];
    
    for (const btn of buttons) {
      const isVisible = await btn.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Crear reporte completo
   */
  async createReport(type: 'contenido_inapropiado' | 'producto_prohibido' | 'informacion_falsa' | 'spam' | 'otro', reason: string, additionalInfo?: string) {
    await this.openReportModal();
    await this.selectReportType(type);
    await this.enterReportReason(reason);
    if (additionalInfo) {
      await this.enterAdditionalInfo(additionalInfo);
    }
    await this.submitReport();
  }

  /**
   * Verificar mensaje de éxito
   */
  async hasSuccessMessage(): Promise<boolean> {
    // Buscar mensaje de éxito de múltiples formas
    const successSelectors = [
      this.page.locator('div:has-text("Reporte enviado")'),
      this.page.locator('div:has-text("exitosamente")'),
      this.page.locator('div:has-text("¡Reporte enviado!")'),
      this.page.locator('div[class*="from-emerald"], div[class*="from-green"]').filter({ hasText: /éxito|exitosamente|enviado/i }),
      this.page.locator('[role="alert"]').filter({ hasText: /éxito|success/i })
    ];
    
    for (const selector of successSelectors) {
      const visible = await selector.isVisible({ timeout: 5000 }).catch(() => false);
      if (visible) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Verificar mensaje de error
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }
}

