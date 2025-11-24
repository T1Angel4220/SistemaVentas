import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Registro
 */
export class RegisterPage {
  readonly page: Page;
  readonly cedulaInput: Locator;
  readonly nombreInput: Locator;
  readonly apellidoInput: Locator;
  readonly correoInput: Locator;
  readonly telefonoInput: Locator;
  readonly direccionInput: Locator;
  readonly generoSelect: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly tipoUsuarioRadioComprador: Locator;
  readonly tipoUsuarioRadioVendedor: Locator;
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
    this.direccionInput = page.locator('input[name="direccion"]');
    this.generoSelect = page.locator('select[name="genero"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.tipoUsuarioRadioComprador = page.locator('input[type="radio"][name="tipo_usuario"][value="comprador"]');
    this.tipoUsuarioRadioVendedor = page.locator('input[type="radio"][name="tipo_usuario"][value="vendedor"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("Registrar"), button:has-text("Crear")');
    // Errores pueden estar en mensajes generales o en campos específicos
    this.errorMessage = page.locator('text=/error|Error|incorrecto|inválido|duplicado/i').or(
      page.locator('.text-red-500, .text-red-600, .text-red-700').first()
    ).or(
      page.locator('[class*="from-red-50"], [class*="via-rose-50"]').first()
    ).first();
    this.successMessage = page.locator('.text-green-500, .text-green-600, .text-green-700, [role="alert"], .bg-green-50, .bg-green-100, .border-green-300').first();
  }

  /**
   * Navegar a la página de registro
   */
  async goto() {
    try {
      await this.page.goto('/register');
      await this.page.waitForLoadState('networkidle');
      // await this.page.waitForTimeout(1500); // COMENTADO
    } catch (error) {
      // Si la página se cerró, intentar de nuevo
      if (this.page.isClosed()) {
        throw new Error('La página se cerró inesperadamente');
      }
      throw error;
    }
  }

  /**
   * Llenar formulario de registro
   */
  async fillForm(data: {
    cedula: string;
    nombre: string;
    apellido: string;
    correo: string;
    password: string;
    confirmPassword: string;
    telefono?: string;
    direccion?: string;
    genero?: string;
    tipo_usuario?: 'comprador' | 'vendedor';
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
    
    if (data.direccion) {
      await this.direccionInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.direccionInput.fill(data.direccion);
      // await this.page.waitForTimeout(600); // COMENTADO
    }
    
    if (data.genero) {
      await this.generoSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.generoSelect.selectOption(data.genero);
      // await this.page.waitForTimeout(600); // COMENTADO
    }
    
    if (data.tipo_usuario) {
      // tipo_usuario es un radio button, no un select
      if (data.tipo_usuario === 'comprador') {
        await this.tipoUsuarioRadioComprador.waitFor({ state: 'visible', timeout: 10000 });
        // await this.page.waitForTimeout(600); // COMENTADO
        await this.tipoUsuarioRadioComprador.click();
        // await this.page.waitForTimeout(600); // COMENTADO
      } else if (data.tipo_usuario === 'vendedor') {
        await this.tipoUsuarioRadioVendedor.waitFor({ state: 'visible', timeout: 10000 });
        // await this.page.waitForTimeout(600); // COMENTADO
        await this.tipoUsuarioRadioVendedor.click();
        // await this.page.waitForTimeout(600); // COMENTADO
      }
    }
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
   * Verificar si el registro fue exitoso (redirección a verificación)
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForURL(/.*verify-email|.*verify-code/, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

