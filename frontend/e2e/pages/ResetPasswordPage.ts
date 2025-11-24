import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Reset de Contraseña
 */
export class ResetPasswordPage {
  readonly page: Page;
  readonly codeInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeInput = page.locator('input[name="code"], input[type="text"][maxlength="6"], input[placeholder*="código"]');
    this.newPasswordInput = page.locator('input[name="newPassword"], input[name="password"][type="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("Restablecer"), button:has-text("Cambiar"), button:has-text("Actualizar")').first();
    this.errorMessage = page.locator('text=/error|Error|incorrecto|inválido|no coinciden/i, .text-red-500, .text-red-600, .text-red-700, [role="alert"], [class*="red-50"]').first();
    this.successMessage = page.locator('.text-green-500, [role="alert"]:has-text("éxito"), .text-green-600').first();
  }

  /**
   * Navegar a la página de reset
   * Nota: Puede requerir token en query params o puede ser /reset-password-code
   */
  async goto(token?: string) {
    if (token) {
      await this.page.goto(`/reset-password?token=${encodeURIComponent(token)}`);
    } else {
      // Intentar primero /reset-password-code que es la que usa código
      await this.page.goto('/reset-password-code');
      // Si no funciona, intentar /reset-password
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/forgot-password')) {
        await this.page.goto('/reset-password');
      }
    }
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Resetear contraseña
   */
  async resetPassword(code: string, newPassword: string, confirmPassword: string) {
    await this.codeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.codeInput.fill(code);
    await this.page.waitForTimeout(600);
    
    await this.newPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.newPasswordInput.fill(newPassword);
    await this.page.waitForTimeout(600);
    
    await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.page.waitForTimeout(600);
    
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.submitButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verificar si el reset fue exitoso
   */
  async isResetSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL(/.*login/, { timeout: 5000 });
      return true;
    } catch {
      return await this.successMessage.isVisible();
    }
  }
}

