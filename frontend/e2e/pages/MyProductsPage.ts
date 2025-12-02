import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página "Mis Productos"
 */
export class MyProductsPage {
  readonly page: Page;
  readonly productsList: Locator;
  readonly productCard: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly appealButton: Locator;
  readonly emptyState: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsList = page.locator('[data-testid="products-list"], .products-list, div:has(> div:has-text("Producto"))').first();
    this.productCard = page.locator('[data-testid="product-card"], .product-card, div:has(h3, h4)').first();
    this.editButton = page.locator('button:has-text("Editar"), a:has-text("Editar")').first();
    this.deleteButton = page.locator('button:has-text("Eliminar"), button:has-text("Borrar")').first();
    this.appealButton = page.locator('button:has-text("Apelar"), a:has-text("Apelar")').first();
    this.emptyState = page.locator('text=/No hay productos|No tienes productos|Lista vacía/i').first();
    this.successMessage = page.locator('div:has-text("éxito"), div[class*="from-green"]').first();
    this.errorMessage = page.locator('div:has-text("Error"), div[class*="from-red"]').first();
  }

  /**
   * Navegar a la página "Mis Productos"
   */
  async goto() {
    await this.page.goto('/my-products');
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
  }

  /**
   * Verificar si hay productos en la lista
   */
  async hasProducts(): Promise<boolean> {
    // Verificar si hay productos en cualquier estado
    const hasProducts = await this.productCard.isVisible({ timeout: 5000 }).catch(() => false);
    const isEmpty = await this.emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    
    // También verificar contadores de productos (puede haber productos aunque la lista esté vacía por filtros)
    const totalCount = await this.page.locator('text=/Total productos.*[1-9]/i').isVisible({ timeout: 2000 }).catch(() => false);
    const pendientesCount = await this.page.locator('text=/Pendientes.*[1-9]/i').isVisible({ timeout: 2000 }).catch(() => false);
    const activosCount = await this.page.locator('text=/Activos.*[1-9]/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Hay productos si:
    // 1. Hay cards visibles Y no está vacío
    // 2. O hay contadores que muestran productos
    return (hasProducts && !isEmpty) || totalCount || pendientesCount || activosCount;
  }

  /**
   * Seleccionar un producto por índice
   */
  async selectProductByIndex(index: number = 0) {
    const products = this.page.locator('[data-testid="product-card"], .product-card, div:has(h3, h4)');
    const count = await products.count();
    if (count > index) {
      await products.nth(index).scrollIntoViewIfNeeded();
      await products.nth(index).click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Seleccionar un producto por nombre
   */
  async selectProductByName(nombre: string) {
    const product = this.page.locator(`text="${nombre}"`).first();
    await product.waitFor({ state: 'visible', timeout: 10000 });
    await product.scrollIntoViewIfNeeded();
    await product.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Hacer clic en editar producto
   */
  async clickEdit(productIndex: number = 0) {
    const products = this.page.locator('[data-testid="product-card"], .product-card');
    const product = products.nth(productIndex);
    await product.scrollIntoViewIfNeeded();
    
    const editBtn = product.locator('button:has-text("Editar"), a:has-text("Editar")').first();
    await editBtn.waitFor({ state: 'visible', timeout: 10000 });
    await editBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Hacer clic en eliminar producto
   */
  async clickDelete(productIndex: number = 0) {
    const products = this.page.locator('[data-testid="product-card"], .product-card');
    const product = products.nth(productIndex);
    await product.scrollIntoViewIfNeeded();
    
    const deleteBtn = product.locator('button:has-text("Eliminar"), button:has-text("Borrar")').first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
    await deleteBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Confirmar eliminación
   */
  async confirmDelete() {
    const confirmButton = this.page.locator('button:has-text("Confirmar"), button:has-text("Eliminar")').filter({ 
      hasText: /Confirmar|Eliminar/i 
    }).last();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Hacer clic en apelar producto
   */
  async clickAppeal(productIndex: number = 0) {
    const products = this.page.locator('[data-testid="product-card"], .product-card');
    const product = products.nth(productIndex);
    await product.scrollIntoViewIfNeeded();
    
    const appealBtn = product.locator('button:has-text("Apelar"), a:has-text("Apelar")').first();
    await appealBtn.waitFor({ state: 'visible', timeout: 10000 });
    await appealBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verificar si un producto está bloqueado para edición
   */
  async isProductBlocked(productIndex: number = 0): Promise<boolean> {
    const products = this.page.locator('[data-testid="product-card"], .product-card');
    const product = products.nth(productIndex);
    
    const blockedMessage = product.locator('text=/peligroso|suspendido|no se puede editar/i');
    return await blockedMessage.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Verificar si hay mensaje de éxito
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Verificar si hay mensaje de error
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Obtener el número de productos en la lista
   */
  async getProductCount(): Promise<number> {
    const products = this.page.locator('[data-testid="product-card"], .product-card');
    return await products.count();
  }
}

