import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Catálogo de Productos
 */
export class ProductCatalogPage {
  readonly page: Page;
  readonly productsList: Locator;
  readonly productCard: Locator;
  readonly pagination: Locator;
  readonly searchInput: Locator;
  readonly filters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsList = page.locator('[data-testid="products-list"], .products-list, .catalog-grid').first();
    this.productCard = page.locator('[data-testid="product-card"], .product-card, a[href*="/products/"]').first();
    this.pagination = page.locator('[data-testid="pagination"], .pagination, nav:has(button)').first();
    this.searchInput = page.locator('input[placeholder*="buscar" i], input[type="search"]').first();
    this.filters = page.locator('[data-testid="filters"], .filters').first();
  }

  /**
   * Navegar al catálogo de productos
   */
  async goto() {
    try {
      await this.page.goto('/products/catalog');
      // Usar domcontentloaded como fallback si networkidle tarda mucho
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch {
        await this.page.waitForLoadState('domcontentloaded');
        // Verificar que la página no se cerró antes de hacer waitForTimeout
        if (!this.page.isClosed()) {
          await this.page.waitForTimeout(2000);
        }
      }
    } catch (error: any) {
      // Si la página se cerró, lanzar un error más descriptivo
      if (error.message && error.message.includes('closed')) {
        throw new Error('La página se cerró antes de completar la navegación');
      }
      throw error;
    }
  }

  /**
   * Verificar si hay productos visibles
   */
  async hasProducts(): Promise<boolean> {
    return await this.productCard.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Hacer clic en un producto por índice
   */
  async clickProductByIndex(index: number = 0) {
    const products = this.page.locator('[data-testid="product-card"], .product-card, a[href*="/products/"]');
    const count = await products.count();
    if (count > index) {
      await products.nth(index).scrollIntoViewIfNeeded();
      await products.nth(index).click();
      await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    }
  }

  /**
   * Verificar si la paginación está visible
   */
  async hasPagination(): Promise<boolean> {
    return await this.pagination.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Navegar a la siguiente página
   */
  async nextPage() {
    const nextButton = this.page.locator('button:has-text("Siguiente"), button:has-text(">"), a:has-text("Siguiente")').first();
    if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton.click();
      await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    }
  }

  /**
   * Obtener el número de productos visibles
   */
  async getProductCount(): Promise<number> {
    const products = this.page.locator('[data-testid="product-card"], .product-card, a[href*="/products/"]');
    return await products.count();
  }
}

