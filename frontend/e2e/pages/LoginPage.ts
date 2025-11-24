import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Login
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="correo"]');
    this.passwordInput = page.locator('input[name="password"]');
    // Selector más flexible para el botón de submit
    this.submitButton = page.locator('button[type="submit"]').first();
    // Selector más amplio para mensajes de error - usar .or() para combinar selectores
    this.errorMessage = page.locator('text=/error|Error|incorrecto|incorrecta|inválido|inválida|suspendida|suspendido/i')
      .or(page.locator('.text-red-500, .text-red-600, .text-red-700, .text-red-800'))
      .or(page.locator('[class*="red"], [class*="error"]'))
      .first();
    this.successMessage = page.locator('.text-green-500, [role="alert"]:has-text("éxito"), .text-green-600');
    this.forgotPasswordLink = page.locator('a:has-text("Olvidaste"), a:has-text("contraseña"), a[href*="forgot"]').first();
    this.registerLink = page.locator('a:has-text("Regístrate"), a:has-text("Registro"), a[href*="register"]').first();
  }

  /**
   * Navegar a la página de login
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    // await this.page.waitForTimeout(1000); // COMENTADO: Para identificar errores
  }

  /**
   * Realizar login
   */
  async login(email: string, password: string) {
    // Esperar a que la página esté completamente cargada
    await this.page.waitForLoadState('domcontentloaded');
    // await this.page.waitForTimeout(1000); // COMENTADO
    
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    // await this.page.waitForTimeout(1000); // COMENTADO
    
    await this.passwordInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    // await this.page.waitForTimeout(1000); // COMENTADO
    
    // Esperar a que el botón esté habilitado
    await this.submitButton.waitFor({ state: 'visible', timeout: 15000 });
    // Verificar que no esté deshabilitado
    await this.page.waitForFunction(
      () => {
        const btn = document.querySelector('button[type="submit"]');
        return btn && !(btn as HTMLButtonElement).disabled;
      },
      { timeout: 5000 }
    ).catch(() => {
      // Si falla, continuar de todas formas
    });
    
    // await this.page.waitForTimeout(1000); // COMENTADO
    await this.submitButton.click();
    
    // Esperar a que se procese el login (puede redirigir o mostrar error)
    // await this.page.waitForTimeout(3000); // COMENTADO
  }

  /**
   * Verificar si el login fue exitoso
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Esperar a que la URL cambie (puede ser dashboard, home, o cualquier ruta autenticada)
      await this.page.waitForURL(/.*dashboard|.*products|.*profile|.*users|.*admin/, { timeout: 15000 });
      // await this.page.waitForTimeout(2000); // COMENTADO
      
      // Verificar adicionalmente que no estamos en login
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        return false;
      }
      
      return true;
    } catch {
      // Si no redirige, verificar si hay error
      const hasError = await this.hasErrorMessage();
      return !hasError && !this.page.url().includes('/login');
    }
  }

  /**
   * Verificar si hay mensaje de error
   */
  async hasErrorMessage(): Promise<boolean> {
    // Esperar un poco para que aparezca el error
    // await this.page.waitForTimeout(2000); // COMENTADO
    // Buscar cualquier mensaje de error en la página
    const errorSelectors = [
      'text=/error|Error|incorrecto|incorrecta|inválido|inválida|suspendida|suspendido/i',
      '.text-red-500',
      '.text-red-600',
      '.text-red-700',
      '.text-red-800',
      '[class*="red"]',
      '[class*="error"]'
    ];
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Obtener texto del mensaje de error
   */
  async getErrorMessage(): Promise<string> {
    // await this.page.waitForTimeout(2000); // COMENTADO
    // Buscar cualquier mensaje de error
    const errorSelectors = [
      'text=/error|Error|incorrecto|incorrecta|inválido|inválida|suspendida|suspendido/i',
      '.text-red-500',
      '.text-red-600',
      '.text-red-700',
      '.text-red-800'
    ];
    
    for (const selector of errorSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    }
    return '';
  }

  /**
   * Ir a recuperación de contraseña
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(500); // COMENTADO
    await this.forgotPasswordLink.click();
    await this.page.waitForURL(/.*forgot-password/, { timeout: 10000 });
    // await this.page.waitForTimeout(1000); // COMENTADO
  }

  /**
   * Ir a registro
   */
  async goToRegister() {
    await this.registerLink.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(500); // COMENTADO
    await this.registerLink.click();
    await this.page.waitForURL(/.*register/, { timeout: 10000 });
    // await this.page.waitForTimeout(1000); // COMENTADO
  }
}

