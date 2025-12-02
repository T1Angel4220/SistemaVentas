import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Moderación de Productos
 */
export class ProductModerationPage {
  readonly page: Page;
  readonly productsTable: Locator;
  readonly filterStateSelect: Locator;
  readonly searchProductInput: Locator;
  readonly searchSellerInput: Locator;
  readonly searchButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly suspendButton: Locator;
  readonly markDangerousButton: Locator;
  readonly moderationModal: Locator;
  readonly moderationReasonTextarea: Locator;
  readonly confirmModerationButton: Locator;
  readonly cancelModerationButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly statisticsCards: Locator;
  readonly loadingIndicator: Locator;
  readonly emptyState: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    // Tabla o lista de productos
    this.productsTable = page.locator('[role="table"], table, div:has-text("producto"), [class*="product"]').first();
    // Filtro por estado - buscar por label "Estado del Producto"
    this.filterStateSelect = page.locator('label:has-text("Estado del Producto") + select, label:has-text("Estado") + select, select').filter({ 
      has: page.locator('option:has-text("Activo"), option:has-text("Pendiente"), option:has-text("Suspendido"), option:has-text("Rechazado")') 
    }).first();
    // Búsqueda por nombre de producto - buscar por label "Buscar por Nombre de Producto"
    this.searchProductInput = page.locator('label:has-text("Buscar por Nombre de Producto") + input, label:has-text("Nombre de Producto") + input, input[placeholder*="nombre" i], input[placeholder*="producto" i]').first();
    // Búsqueda por nombre de vendedor - buscar por label "Buscar por Nombre del Vendedor"
    this.searchSellerInput = page.locator('label:has-text("Buscar por Nombre del Vendedor") + input, label:has-text("Nombre del Vendedor") + input, input[placeholder*="vendedor" i]').first();
    // Botón de búsqueda (si existe)
    this.searchButton = page.locator('button:has-text("Buscar"), button[type="submit"]').filter({ hasText: /Buscar/i });
    // Botones de acción de moderación
    this.approveButton = page.locator('button:has-text("Aprobar"), button[title*="Aprobar"], button').filter({ hasText: /✓|Aprobar/i });
    this.rejectButton = page.locator('button:has-text("Rechazar"), button[title*="Rechazar"], button').filter({ hasText: /✗|Rechazar/i });
    this.suspendButton = page.locator('button:has-text("Suspender"), button[title*="Suspender"]');
    this.markDangerousButton = page.locator('button:has-text("Peligroso"), button[title*="Peligroso"], button:has-text("Marcar como Peligroso")');
    // Modal de moderación
    this.moderationModal = page.locator('[role="dialog"], .modal, [class*="modal"]').filter({ hasText: /Motivo|Moderación|Rechazar|Suspender/i });
    // Textarea para motivo
    this.moderationReasonTextarea = page.locator('textarea[name="motivo"], textarea[placeholder*="motivo"], textarea').first();
    // Botones del modal
    this.confirmModerationButton = page.locator('button:has-text("Confirmar"), button:has-text("Aprobar"), button:has-text("Rechazar"), button[type="submit"]').filter({ hasText: /Confirmar|Aprobar|Rechazar|Suspender/i }).first();
    this.cancelModerationButton = page.locator('button:has-text("Cancelar"), button:has-text("Cerrar")');
    // Mensajes
    this.successMessage = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') }).first();
    this.errorMessage = page.locator('div[class*="from-red-500"], div[class*="via-red-600"]').filter({ has: page.locator('text=/Error|error/i') }).first();
    // Estadísticas
    this.statisticsCards = page.locator('[class*="stat"], div:has-text("Pendientes"), div:has-text("Aprobados")');
    // Loading
    this.loadingIndicator = page.locator('text=/Cargando|Loading/i, [class*="spinner"], [class*="animate-spin"]');
    // Estado vacío
    this.emptyState = page.locator('text=/No hay productos|No se encontraron/i');
    // Paginación
    this.pagination = page.locator('[class*="pagination"], button:has-text("Siguiente"), button:has-text("Anterior")');
  }

  /**
   * Navegar a la página de moderación de productos
   */
  async goto() {
    await this.page.goto('/products/moderation');
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
   * Filtrar por estado
   */
  async filterByState(state: string) {
    // Verificar que la página no se haya cerrado
    if (this.page.isClosed()) {
      return;
    }
    
    try {
      await this.filterStateSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.filterStateSelect.selectOption(state);
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      
      // Verificar nuevamente que la página no se haya cerrado antes de esperar
      if (!this.page.isClosed()) {
        await this.page.waitForTimeout(1500).catch(() => {});
      }
    } catch (error) {
      // Si la página se cerró o hubo un error, simplemente retornar
      if (this.page.isClosed()) {
        return;
      }
      throw error;
    }
  }

  /**
   * Buscar producto por nombre
   */
  async searchByProductName(productName: string) {
    // Esperar a que el input esté disponible
    await this.searchProductInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchProductInput.scrollIntoViewIfNeeded();
    await this.searchProductInput.fill(productName);
    
    // Esperar un momento para que se actualice el estado
    await this.page.waitForTimeout(500);
    
    // Buscar el botón de búsqueda - puede estar dentro del mismo Card
    const searchBtn = this.page.locator('button:has-text("Buscar")').filter({ 
      has: this.page.locator('svg') // El botón tiene un ícono Search
    }).first();
    
    const btnVisible = await searchBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (btnVisible) {
      await searchBtn.scrollIntoViewIfNeeded();
      await searchBtn.click();
      // Esperar a que se procese la búsqueda
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(1500);
    } else {
      // Si no hay botón, puede ser que se busque automáticamente al presionar Enter
      // Simular Enter
      await this.searchProductInput.press('Enter');
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(1500);
    }
    
    // Verificar que seguimos en la misma página (no navegamos a 404)
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/products/moderation')) {
      throw new Error(`Se navegó a una página incorrecta: ${currentUrl}. Se esperaba /products/moderation`);
    }
  }

  /**
   * Buscar por nombre de vendedor
   */
  async searchBySellerName(sellerName: string) {
    await this.searchSellerInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchSellerInput.fill(sellerName);
    if (await this.searchButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.searchButton.click();
    }
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  /**
   * Seleccionar un producto (por índice o por texto)
   */
  async selectProduct(productId?: number, productName?: string) {
    // Esperar a que la página cargue
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.waitForTimeout(1500);
    
    // Buscar Cards de productos - están en un grid con clase grid-cols
    let productCards = this.page.locator('[class*="Card"]').filter({ 
      has: this.page.locator('h3:has-text(/.+/)'), // Título del producto
      has: this.page.locator('button:has-text("Aprobar"), button:has-text("Rechazar"), button:has-text("Suspender"), button:has-text("Peligroso")')
    });
    
    const count = await productCards.count().catch(() => 0);
    
    if (count === 0) {
      // Fallback: buscar solo Cards con h3
      productCards = this.page.locator('[class*="Card"]').filter({ 
        has: this.page.locator('h3:has-text(/.+/)')
      });
      const fallbackCount = await productCards.count().catch(() => 0);
      if (fallbackCount === 0) {
        // Si no hay productos, verificar si hay estado vacío
        const emptyState = await this.emptyState.isVisible({ timeout: 3000 }).catch(() => false);
        if (emptyState) {
          // Lanzar un error especial que puede ser capturado para hacer test.skip()
          const error = new Error('No hay productos disponibles para moderar');
          (error as any).skipTest = true;
          throw error;
        }
        // Si no hay productos, retornar null en lugar de lanzar error
        // Esto permite que la prueba maneje el caso
        return null as any;
      }
    }
    
    // Si se especifica un ID o nombre, buscar ese específico
    if (productId) {
      const specificCard = productCards.filter({ 
        has: this.page.locator(`text="${productId}"`)
      }).first();
      const visible = await specificCard.isVisible({ timeout: 5000 }).catch(() => false);
      if (visible) {
        await specificCard.waitFor({ state: 'visible', timeout: 10000 });
        return specificCard;
      }
    }
    
    if (productName) {
      // Buscar por nombre del producto (en el h3)
      const specificCard = productCards.filter({ 
        has: this.page.locator(`h3:has-text("${productName}")`)
      }).first();
      const visible = await specificCard.isVisible({ timeout: 5000 }).catch(() => false);
      if (visible) {
        await specificCard.waitFor({ state: 'visible', timeout: 10000 });
        return specificCard;
      }
    }
    
    // Retornar el primer producto disponible
    const firstCard = productCards.first();
    await firstCard.waitFor({ state: 'visible', timeout: 10000 });
    return firstCard;
  }

  /**
   * Aprobar producto
   */
  async approveProduct(productId?: number, productName?: string) {
    const productCard = await this.selectProduct(productId, productName);
    
    // Si no hay productos, lanzar error
    if (!productCard) {
      throw new Error('No se encontró ningún producto visible en la página');
    }
    
    // Buscar botón "Aprobar" dentro del Card - puede tener ícono CheckCircle
    const approveBtn = productCard.locator('button:has-text("Aprobar"), button').filter({ 
      has: this.page.locator('svg, text=/Aprobar|✓/')
    }).first();
    await approveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await approveBtn.scrollIntoViewIfNeeded();
    await approveBtn.click();
    
    // Esperar confirmación si hay modal
    if (await this.moderationModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.confirmModerationButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.confirmModerationButton.click();
    }
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Rechazar producto
   */
  async rejectProduct(productId?: number, productName?: string, motivo?: string) {
    let productCard = await this.selectProduct(productId, productName);
    
    // Si no hay productos, esperar un poco más y recargar
    if (!productCard) {
      await this.page.waitForTimeout(3000);
      await this.page.reload();
      await this.page.waitForTimeout(3000);
      productCard = await this.selectProduct(productId, productName);
    }
    
    // Si aún no hay productos después de recargar, lanzar error
    if (!productCard) {
      throw new Error('No se encontró ningún producto visible en la página después de recargar');
    }
    
    // Buscar botón "Rechazar" dentro del Card
    const rejectBtn = productCard.locator('button:has-text("Rechazar")').first();
    await rejectBtn.waitFor({ state: 'visible', timeout: 10000 });
    await rejectBtn.scrollIntoViewIfNeeded();
    await rejectBtn.click();
    
    // Si hay modal, ingresar motivo y confirmar
    if (await this.moderationModal.isVisible({ timeout: 10000 }).catch(() => false)) {
      if (motivo) {
        await this.enterModerationReason(motivo);
      }
      await this.confirmModerationButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.confirmModerationButton.click();
    }
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Suspender producto
   */
  async suspendProduct(productId?: number, productName?: string, motivo?: string) {
    const productCard = await this.selectProduct(productId, productName);
    
    // Si no hay productos, lanzar error
    if (!productCard) {
      throw new Error('No se encontró ningún producto visible en la página');
    }
    
    // Buscar botón "Suspender" dentro del Card - usar .first() para evitar strict mode violation
    const suspendBtn = productCard.locator('button:has-text("Suspender")').first();
    await suspendBtn.waitFor({ state: 'visible', timeout: 10000 });
    await suspendBtn.scrollIntoViewIfNeeded();
    await suspendBtn.click();
    
    if (await this.moderationModal.isVisible({ timeout: 10000 }).catch(() => false)) {
      if (motivo) {
        await this.enterModerationReason(motivo);
      }
      await this.confirmModerationButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.confirmModerationButton.click();
    }
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Marcar producto como peligroso
   */
  async markProductAsDangerous(productId?: number, productName?: string, motivo?: string) {
    const productCard = await this.selectProduct(productId, productName);
    // Buscar botón "Marcar como Peligroso" dentro del Card - el texto exacto incluye emoji
    const dangerBtn = productCard.locator('button:has-text("Marcar como Peligroso"), button:has-text("Peligroso")').first();
    await dangerBtn.waitFor({ state: 'visible', timeout: 10000 });
    await dangerBtn.scrollIntoViewIfNeeded();
    await dangerBtn.click();
    
    if (await this.moderationModal.isVisible({ timeout: 10000 }).catch(() => false)) {
      if (motivo) {
        await this.enterModerationReason(motivo);
      }
      await this.confirmModerationButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.confirmModerationButton.click();
    }
    
    await this.page.waitForTimeout(2000);
  }

  /**
   * Ingresar motivo de moderación
   */
  async enterModerationReason(motivo: string) {
    await this.moderationReasonTextarea.waitFor({ state: 'visible', timeout: 10000 });
    await this.moderationReasonTextarea.fill(motivo);
  }

  /**
   * Confirmar moderación
   */
  async confirmModeration() {
    await this.confirmModerationButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmModerationButton.click();
    await this.moderationModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  /**
   * Cancelar moderación
   */
  async cancelModeration() {
    await this.cancelModerationButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.cancelModerationButton.click();
    await this.moderationModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * Verificar si hay productos visibles
   */
  async hasProducts(): Promise<boolean> {
    const hasEmpty = await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    return !hasEmpty && await this.productsTable.isVisible({ timeout: 5000 }).catch(() => false);
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
}
