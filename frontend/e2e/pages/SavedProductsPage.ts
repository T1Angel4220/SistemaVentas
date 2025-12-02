import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Productos Guardados
 */
export class SavedProductsPage {
  readonly page: Page;
  readonly productsList: Locator;
  readonly productCard: Locator;
  readonly emptyState: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsList = page.locator('[data-testid="saved-products-list"], .saved-products-list').first();
    this.productCard = page.locator('[data-testid="product-card"], .product-card').first();
    this.emptyState = page.locator('text=/No hay productos guardados|No tienes favoritos/i').first();
    this.pagination = page.locator('[data-testid="pagination"], .pagination').first();
  }

  /**
   * Navegar a la página de productos guardados
   */
  async goto() {
    // La ruta puede ser /products/saved o /saved-products, verificar ambas
    await this.page.goto('/products/saved');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      // Si falla, intentar con otra ruta
      await this.page.goto('/saved-products');
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Verificar si hay productos guardados
   */
  async hasProducts(): Promise<boolean> {
    const hasProducts = await this.productCard.isVisible({ timeout: 5000 }).catch(() => false);
    const isEmpty = await this.emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    return hasProducts && !isEmpty;
  }

  /**
   * Obtener el número de productos guardados
   */
  async getProductCount(): Promise<number> {
    const products = this.page.locator('[data-testid="product-card"], .product-card');
    return await products.count();
  }
}

