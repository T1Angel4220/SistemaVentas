import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Recuperación de Contraseña
 */
export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[id="email"], input[type="email"], input[name="correo"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("Enviar"), button:has-text("Solicitar"), button:has-text("Enviar Código")');
    // Selector más amplio para errores (incluye los divs con gradientes y el texto específico)
    this.errorMessage = page.locator('text=/correo electrónico válido|email válido|Por favor ingresa|error|Error|incorrecto|inválido|no encontrado|no existe/i, .text-red-500, .text-red-600, .text-red-700, .text-red-800, [role="alert"], .bg-red-50, .bg-red-100, .border-red-300, [class*="red-50"], [class*="red-100"], [class*="border-red"], [class*="from-red-50"]').first();
    // El mensaje de éxito se muestra cuando emailSent es true, mostrando un componente diferente
    // Buscar por el texto "Email Enviado" o por las clases del contenedor de éxito
    this.successMessage = page.locator('text=/Email Enviado|email enviado|éxito/i, [class*="from-green-50"], [class*="to-emerald-50"], [class*="border-green-200"], .text-green-700, .text-green-800').first();
  }

  /**
   * Navegar a la página de recuperación
   */
  async goto() {
    await this.page.goto('/forgot-password');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestReset(email: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(800);
    
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.submitButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verificar si la solicitud fue exitosa
   */
  async isRequestSuccessful(): Promise<boolean> {
    // Esperar un poco para que se renderice el mensaje de éxito
    await this.page.waitForTimeout(2000);
    
    // Buscar múltiples indicadores de éxito
    const successIndicators = [
      this.page.locator('text=/Email Enviado|email enviado/i'),
      this.page.locator('[class*="from-green-50"]'),
      this.page.locator('[class*="to-emerald-50"]'),
      this.page.locator('text=/éxito/i'),
      this.page.locator('.text-green-700, .text-green-800').first()
    ];
    
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        return true;
      }
    }
    
    return false;
  }
}

