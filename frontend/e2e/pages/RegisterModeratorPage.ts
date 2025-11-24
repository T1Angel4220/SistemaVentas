import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Registro de Moderadores (Admin)
 */
export class RegisterModeratorPage {
  readonly page: Page;
  readonly cedulaInput: Locator;
  readonly nombreInput: Locator;
  readonly apellidoInput: Locator;
  readonly correoInput: Locator;
  readonly telefonoInput: Locator;
  readonly direccionInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cedulaInput = page.locator('input[name="cedula"]');
    this.nombreInput = page.locator('input[name="nombre"]');
    this.apellidoInput = page.locator('input[name="apellido"]');
    this.correoInput = page.locator('input[name="correo"]');
    this.telefonoInput = page.locator('input[name="telefono"]');
    this.direccionInput = page.locator('textarea[name="direccion"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("Registrar"), button:has-text("Crear")');
    // Errores pueden estar en mensajes generales o en campos específicos (validationErrors)
    this.errorMessage = page.locator('text=/error|Error|incorrecto|inválido|duplicado/i').or(
      page.locator('.text-red-500, .text-red-600, .text-red-700').first()
    ).or(
      page.locator('[class*="from-red-50"], [class*="via-rose-50"]').first()
    ).or(
      page.locator('p.text-red-500').first() // Errores de validación en campos
    ).first();
    this.successMessage = page.locator('text=/éxito|exitosamente|registrado/i').or(
      page.locator('.text-green-500, [class*="from-green-50"]').first()
    ).first();
  }

  /**
   * Navegar a la página de registro de moderadores
   */
  async goto() {
    await this.page.goto('/admin/register-moderator');
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    // await this.page.waitForTimeout(2000); // COMENTADO

    // Verificar que la página se cargó correctamente
    // Esperar a que aparezca al menos un campo del formulario
    // Intentar múltiples selectores posibles
    const possibleSelectors = [
      'input[name="cedula"]',
      'input[name="nombre"]',
      'input[name="correo"]',
      'input[type="text"]',
      'form input'
    ];

    let found = false;
    for (const selector of possibleSelectors) {
      try {
        await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 5000 });
        found = true;
        break;
      } catch {
        // Continuar con el siguiente selector
      }
    }

    if (!found) {
      // Si no se encuentra ningún campo, esperar un poco más y verificar la URL
      // await this.page.waitForTimeout(2000); // COMENTADO
      const currentUrl = this.page.url();
      if (!currentUrl.includes('register-moderator')) {
        throw new Error(`No se pudo cargar la página de registro de moderador. URL actual: ${currentUrl}`);
      }
    }
  }

  /**
   * Llenar formulario de registro de moderador
   */
  async fillForm(data: {
    cedula: string;
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    confirmPassword: string;
    telefono?: string;
    direccion: string;
  }) {
    await this.cedulaInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.cedulaInput.fill(data.cedula);
    // await this.page.waitForTimeout(600); // COMENTADO

    await this.nombreInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nombreInput.fill(data.nombre);
    // await this.page.waitForTimeout(600); // COMENTADO

    await this.apellidoInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.apellidoInput.fill(data.apellido);
    // await this.page.waitForTimeout(600); // COMENTADO

    await this.correoInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.correoInput.fill(data.correo);
    // await this.page.waitForTimeout(600); // COMENTADO

    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(data.password);
    // await this.page.waitForTimeout(600); // COMENTADO

    await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmPasswordInput.fill(data.confirmPassword);
    // await this.page.waitForTimeout(600); // COMENTADO

    if (data.telefono) {
      await this.telefonoInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.telefonoInput.fill(data.telefono);
      // await this.page.waitForTimeout(600); // COMENTADO
    }

    await this.direccionInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.direccionInput.fill(data.direccion);
  }

  /**
   * Enviar formulario
   */
  async submit() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.submitButton.waitFor({ state: 'attached' });
    // await this.page.waitForTimeout(1000); // COMENTADO
    await this.submitButton.click();
    // await this.page.waitForTimeout(2000); // COMENTADO
  }

  /**
   * Verificar si el registro fue exitoso
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    // Esperar un poco para que aparezca el mensaje
    // await this.page.waitForTimeout(2000); // COMENTADO

    // Verificar mensaje de éxito o redirección
    const hasSuccessMessage = await this.successMessage.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasSuccessMessage) {
      return true;
    }

    // También verificar si redirigió a /admin/users (después de 3 segundos)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/admin/users')) {
      return true;
    }

    // Verificar texto de éxito en la página
    const pageText = await this.page.textContent('body') || '';
    return pageText.includes('éxito') ||
      pageText.includes('exitosamente') ||
      pageText.includes('registrado');
  }
}

