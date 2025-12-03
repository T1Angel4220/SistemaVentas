import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Perfil
 */
export class ProfilePage {
  readonly page: Page;
  readonly editProfileButton: Locator;
  readonly nombreInput: Locator;
  readonly apellidoInput: Locator;
  readonly telefonoInput: Locator;
  readonly direccionInput: Locator;
  readonly saveProfileButton: Locator;
  readonly changePasswordButton: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly savePasswordButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editProfileButton = page.locator('button:has-text("Editar"), button:has-text("Modificar")');
    this.nombreInput = page.locator('input[name="nombre"]');
    this.apellidoInput = page.locator('input[name="apellido"]');
    this.telefonoInput = page.locator('input[name="telefono"]');
    this.direccionInput = page.locator('input[name="direccion"]');
    this.saveProfileButton = page.locator('button[type="submit"]:has-text("Guardar"), button:has-text("Actualizar")');
    this.changePasswordButton = page.locator('button:has-text("Cambiar Contraseña"), button:has-text("Cambiar contraseña"), button:has-text("Contraseña")').first();
    this.currentPasswordInput = page.locator('input[name="currentPassword"]');
    this.newPasswordInput = page.locator('input[name="newPassword"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.savePasswordButton = page.locator('button[type="submit"]:has-text("Cambiar"), button:has-text("Actualizar")');
    // Los mensajes de éxito/error se muestran en divs con gradientes específicos
    // Separar selectores de texto y CSS
    this.successMessage = page.locator('text=/éxito|actualizado|exitosamente|Contraseña cambiada/i').or(
      page.locator('[class*="from-green-50"]').or(
        page.locator('[class*="via-emerald-50"]').or(
          page.locator('[class*="to-teal-50"]').or(
            page.locator('[class*="border-green-300"]').or(
              page.locator('.text-green-700')
            )
          )
        )
      )
    ).first();
    this.errorMessage = page.locator('text=/error|Error|incorrecto|inválido|no coinciden|diferentes/i').or(
      page.locator('[class*="from-red-50"]').or(
        page.locator('[class*="via-rose-50"]').or(
          page.locator('[class*="to-pink-50"]').or(
            page.locator('[class*="border-red-300"]').or(
              page.locator('.text-red-700')
            )
          )
        )
      )
    ).first();
  }

  /**
   * Navegar a la página de perfil
   */
  async goto() {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Esperar a que la página esté completamente cargada
    // Puede que haya un loading state
    await this.page.waitForFunction(
      () => {
        // Verificar que no hay spinner de carga
        const spinners = document.querySelectorAll('[class*="spinner"], [class*="loading"], [class*="animate-spin"]');
        return spinners.length === 0 || Array.from(spinners).every(el => !el.classList.contains('animate-spin'));
      },
      { timeout: 10000 }
    ).catch(() => {
      // Si falla, continuar de todas formas
    });
    
    // Esperar a que los elementos principales estén visibles
    try {
      // Esperar a que al menos un input o botón esté visible
      await this.page.waitForSelector('input[name="nombre"], button:has-text("Editar"), button:has-text("Cambiar")', { 
        state: 'visible', 
        timeout: 10000 
      });
    } catch (e) {
      // Si no se encuentra, continuar de todas formas
      console.log('No se encontraron elementos principales, continuando...');
    }
    
    await this.page.waitForTimeout(1000);
  }

  /**
   * Editar información del perfil
   */
  async editProfile(data: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    direccion?: string;
  }) {
    await this.editProfileButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(800);
    await this.editProfileButton.click();
    await this.page.waitForTimeout(1000);
    
    if (data.nombre) {
      await this.nombreInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.nombreInput.fill(data.nombre);
      await this.page.waitForTimeout(600);
    }
    if (data.apellido) {
      await this.apellidoInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.apellidoInput.fill(data.apellido);
      await this.page.waitForTimeout(600);
    }
    if (data.telefono) {
      await this.telefonoInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.telefonoInput.fill(data.telefono);
      await this.page.waitForTimeout(600);
    }
    if (data.direccion) {
      await this.direccionInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.direccionInput.fill(data.direccion);
      await this.page.waitForTimeout(600);
    }
    
    await this.saveProfileButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.saveProfileButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    // Asegurar que la página esté completamente cargada
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Buscar el botón de cambiar contraseña con múltiples estrategias
    const buttonSelectors = [
      'button:has-text("Cambiar Contraseña")',
      'button:has-text("Cambiar contraseña")',
      'button:has-text("Contraseña")',
      'button:has([class*="Lock"])',
      'button[class*="purple"]'
    ];
    
    let buttonFound = false;
    for (const selector of buttonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        await button.waitFor({ state: 'visible', timeout: 5000 });
        await this.page.waitForTimeout(800);
        await button.click();
        buttonFound = true;
        break;
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }
    
    if (!buttonFound) {
      throw new Error('No se pudo encontrar el botón de cambiar contraseña');
    }
    
    await this.page.waitForTimeout(1000);
    
    await this.currentPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.currentPasswordInput.fill(currentPassword);
    await this.page.waitForTimeout(600);
    
    await this.newPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.newPasswordInput.fill(newPassword);
    await this.page.waitForTimeout(600);
    
    await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.page.waitForTimeout(600);
    
    await this.savePasswordButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.savePasswordButton.click();
    await this.page.waitForTimeout(2000);
  }
}

