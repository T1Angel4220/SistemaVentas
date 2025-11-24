import { Page } from '@playwright/test';

/**
 * Helper para operaciones de autenticación en tests E2E
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Esperar un tiempo para visualizar la acción
   */
  private async waitForVisualization(ms: number = 1000) {
    // COMENTADO: Para identificar errores más rápido
    // const waitTime = Math.min(ms, 2000); // Máximo 2 segundos
    // await this.page.waitForTimeout(waitTime);
  }

  /**
   * Login como un rol específico
   */
  async loginAs(role: 'comprador' | 'vendedor' | 'moderador' | 'administrador') {
    const credentials = {
      comprador: { 
        email: process.env.E2E_COMPRADOR_EMAIL || 'comprador@test.com', 
        password: process.env.E2E_PASSWORD || 'password123' 
      },
      vendedor: { 
        email: process.env.E2E_VENDEDOR_EMAIL || 'vendedor@test.com', 
        password: process.env.E2E_PASSWORD || 'password123' 
      },
      moderador: { 
        email: process.env.E2E_MODERADOR_EMAIL || 'moderador@test.com', 
        password: process.env.E2E_PASSWORD || 'password123' 
      },
      administrador: { 
        email: process.env.E2E_ADMIN_EMAIL || 'admin@test.com', 
        password: process.env.E2E_PASSWORD || 'password123' 
      }
    };

    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    await this.waitForVisualization(1500);

    const emailInput = this.page.locator('input[name="correo"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(credentials[role].email);
    await this.waitForVisualization(800);

    const passwordInput = this.page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(credentials[role].password);
    await this.waitForVisualization(800);

    const submitButton = this.page.locator('button[type="submit"]').first();
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.waitFor({ state: 'attached' });
    await this.waitForVisualization(1000);
    
    await submitButton.click();
    await this.waitForVisualization(2000);

    // Esperar redirección - puede ser dashboard, products, o cualquier ruta autenticada
    try {
      await this.page.waitForURL(/.*dashboard|.*products|.*profile|.*users/, { timeout: 15000 });
    } catch {
      // Si no redirige, verificar si hay error
      const errorVisible = await this.page.locator('.text-red-500, [role="alert"]').isVisible().catch(() => false);
      if (errorVisible) {
        throw new Error('Login falló - verificar credenciales');
      }
      // Si no hay error y no redirige, puede que ya esté logueado
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        // Ya está en una página autenticada
        return;
      }
      throw new Error('Login timeout - no se redirigió después del login');
    }
    await this.waitForVisualization(1000);
  }

  /**
   * Login con credenciales personalizadas
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    await this.waitForVisualization(1500);

    const emailInput = this.page.locator('input[name="correo"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(email);
    await this.waitForVisualization(800);

    const passwordInput = this.page.locator('input[name="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(password);
    await this.waitForVisualization(800);

    const submitButton = this.page.locator('button[type="submit"]').first();
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.waitForVisualization(1000);
    
    await submitButton.click();
    await this.waitForVisualization(2000);

    try {
      await this.page.waitForURL(/.*dashboard|.*products|.*profile|.*users/, { timeout: 15000 });
    } catch {
      const errorVisible = await this.page.locator('.text-red-500, [role="alert"]').isVisible().catch(() => false);
      if (errorVisible) {
        throw new Error('Login falló - verificar credenciales');
      }
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        return;
      }
      throw new Error('Login timeout - no se redirigió después del login');
    }
    await this.waitForVisualization(1000);
  }

  /**
   * Logout del usuario actual
   */
  async logout() {
    await this.waitForVisualization(1000);
    
    // Buscar botón de logout en navbar (puede ser "Salir" o "Cerrar Sesión")
    const logoutButton = this.page.locator('button:has-text("Salir"), button:has-text("Cerrar Sesión")').first();
    
    // Esperar a que el botón esté visible
    await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.waitForVisualization(800);
    
    // Hacer clic en el botón de logout (esto abre el modal)
    await logoutButton.click();
    await this.waitForVisualization(1500);
    
    // Esperar y confirmar en el modal de logout
    // El botón del modal tiene un gradiente naranja-rojo
    // Buscar el botón del modal que está dentro del modal (no en el navbar)
    const modalConfirmButton = this.page.locator('button:has-text("Cerrar Sesión")').filter({ 
      has: this.page.locator('[class*="from-orange-500"], [class*="to-red-600"]') 
    }).or(
      // Alternativa: buscar por el contexto del modal
      this.page.locator('[class*="z-[9999]"] button:has-text("Cerrar Sesión")')
    ).first();
    
    // Si no encuentra por clase, intentar por posición (el último botón "Cerrar Sesión" es el del modal)
    const allLogoutButtons = this.page.locator('button:has-text("Cerrar Sesión")');
    const buttonCount = await allLogoutButtons.count();
    
    let finalButton;
    if (buttonCount > 1) {
      // El último botón "Cerrar Sesión" es el del modal
      finalButton = allLogoutButtons.last();
    } else if (buttonCount === 1) {
      // Si solo hay uno, puede ser el del modal o del navbar, intentar hacer clic
      finalButton = allLogoutButtons.first();
    } else {
      // Si no hay botones, buscar alternativas
      finalButton = this.page.locator('button:has-text("Confirmar")').or(
        this.page.locator('button:has-text("Salir")')
      ).first();
    }
    
    await finalButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.waitForVisualization(800);
    await finalButton.click();
    
    // Esperar a que se procese el logout y redirija
    await this.waitForVisualization(2000);
    
    // El logout puede redirigir usando window.location.href, así que esperamos más tiempo
    try {
      await this.page.waitForURL(/.*login/, { timeout: 15000 });
    } catch {
      // Si no redirige automáticamente, verificar la URL actual
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        // Intentar navegar manualmente a login
        await this.page.goto('/login');
      }
    }
    await this.waitForVisualization(1000);
  }

  /**
   * Verificar si el usuario está logueado
   */
  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/dashboard') || 
           url.includes('/products') ||
           await this.page.locator('text=Dashboard').isVisible().catch(() => false);
  }
}

