import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Verificación de Código
 */
export class VerifyCodePage {
  readonly page: Page;
  readonly codeInput: Locator;
  readonly submitButton: Locator;
  readonly resendButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeInput = page.locator('input[name="code"], input[type="text"][maxlength="6"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("Verificar"), button:has-text("Confirmar")');
    this.resendButton = page.locator('button:has-text("Reenviar"), button:has-text("Reenviar código")');
    this.errorMessage = page.locator('.text-red-500, .text-red-600, .text-red-700, .text-red-800, [role="alert"], .bg-red-50, .bg-red-100, .border-red-300').first();
    this.successMessage = page.locator('.text-green-500, .text-green-600, .text-green-700, [role="alert"], .bg-green-50, .bg-green-100, .border-green-300').first();
  }

  /**
   * Navegar a la página de verificación
   */
  async goto(email?: string) {
    if (email) {
      await this.page.goto(`/verify-code?email=${encodeURIComponent(email)}`);
    } else {
      await this.page.goto('/verify-code');
    }
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
  }

  /**
   * Ingresar código de verificación
   */
  async enterCode(code: string) {
    await this.codeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.codeInput.clear();
    await this.codeInput.fill(code);
    await this.page.waitForTimeout(1500);
    // Esperar a que el botón se habilite después de ingresar el código
    // El botón puede estar deshabilitado si el código no tiene 6 dígitos
    if (code.length === 6) {
      await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
      // Esperar a que el botón no esté deshabilitado (máximo 5 segundos)
      let attempts = 0;
      while (attempts < 10) {
        const isDisabled = await this.submitButton.isDisabled();
        if (!isDisabled) {
          break;
        }
        await this.page.waitForTimeout(500);
        attempts++;
      }
    }
    await this.page.waitForTimeout(800);
  }

  /**
   * Enviar código
   */
  async submit() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    // Verificar que el botón no esté deshabilitado
    const isDisabled = await this.submitButton.isDisabled();
    if (isDisabled) {
      // Si está deshabilitado, puede ser porque el código no tiene 6 dígitos
      // En ese caso, simplemente intentamos hacer clic y esperamos el error
      await this.page.waitForTimeout(1000);
      // Intentar hacer clic de todas formas (puede que el error se muestre después)
      try {
        await this.submitButton.click({ force: true });
      } catch {
        // Si no se puede hacer clic, esperar a que aparezca el error
        await this.page.waitForTimeout(2000);
      }
    } else {
      await this.page.waitForTimeout(1000);
      await this.submitButton.click();
    }
    await this.page.waitForTimeout(2000);
  }

  /**
   * Reenviar código
   */
  async resendCode() {
    await this.resendButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    await this.resendButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verificar si la verificación fue exitosa
   */
  async isVerificationSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL(/.*login|.*dashboard/, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

