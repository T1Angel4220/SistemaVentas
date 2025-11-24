import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Gestión de Sesiones
 */
export class SessionManagementPage {
  readonly page: Page;
  readonly sessionsList: Locator;
  readonly closeSessionButton: Locator;
  readonly closeAllSessionsButton: Locator;
  readonly modal: Locator;
  readonly modalReasonInput: Locator;
  readonly modalConfirmButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Las sesiones están en divs con clases específicas (emerald-50, green-50, gray-50, slate-50)
    this.sessionsList = page.locator('div[class*="emerald-50"], div[class*="green-50"], div[class*="gray-50"], div[class*="slate-50"]').filter({ has: page.locator('text=/Activa|Cerrada|Iniciada|Expira/') });
    // El botón de cerrar es solo un icono X
    this.closeSessionButton = page.locator('button:has(svg)').filter({ has: page.locator('svg') }).first();
    // El botón de cerrar todas tiene el texto "Cerrar Todas las Sesiones"
    this.closeAllSessionsButton = page.locator('button:has-text("Cerrar Todas las Sesiones"), button:has-text("Cerrar Todas")');
    this.modal = page.locator('[role="dialog"], .modal, div[class*="fixed"][class*="inset-0"]');
    this.modalReasonInput = page.locator('textarea[placeholder*="motivo"], input[placeholder*="motivo"], textarea[name="motivo"], input[name="motivo"]');
    // El botón de confirmar tiene el texto "Cerrar Sesión" o "Cerrar Todas" pero solo el del modal
    // Buscar dentro del modal (z-50) para evitar conflictos con otros botones
    this.modalConfirmButton = page.locator('div[class*="z-50"] button:has-text("Cerrar Sesión"), div[class*="z-50"] button:has-text("Cerrar Todas")').first();
    // El mensaje de éxito usa gradiente from-emerald-500 via-green-600 to-teal-600
    this.successMessage = page.locator('div[class*="from-emerald-500"], div[class*="via-green-600"]').filter({ has: page.locator('text=/Éxito|éxito|exitosamente/i') }).first();
    this.errorMessage = page.locator('div[class*="from-red-500"], div[class*="via-red-600"]').filter({ has: page.locator('text=/Error|error/i') }).or(
      page.locator('.text-red-500, [role="alert"]:has-text("error")').first()
    ).first();
  }

  /**
   * Navegar a la página de gestión de sesiones
   */
  async goto(userId?: number) {
    if (userId) {
      await this.page.goto(`/sessions/${userId}`);
    } else {
      await this.page.goto('/sessions');
    }
    await this.page.waitForLoadState('networkidle');
    // await this.page.waitForTimeout(2000); // COMENTADO
  }

  /**
   * Cerrar una sesión específica
   */
  async closeSession(sessionIndex: number = 0, motivo?: string) {
    // Las sesiones activas están en divs con clases emerald-50 o green-50
    // Pero el botón puede estar en un contenedor diferente
    // Buscar todas las sesiones activas primero
    const sessions = this.page.locator('div[class*="emerald-50"], div[class*="green-50"]').filter({ 
      has: this.page.locator('text=/Activa|Iniciada|Expira/') 
    });
    await sessions.first().waitFor({ state: 'visible', timeout: 10000 });
    
    const sessionCount = await sessions.count();
    console.log(`[DEBUG] Total de sesiones activas encontradas: ${sessionCount}`);
    
    if (sessionIndex >= sessionCount) {
      throw new Error(`Índice de sesión ${sessionIndex} fuera de rango. Solo hay ${sessionCount} sesiones activas.`);
    }
    
    // En lugar de buscar dentro de la sesión, buscar el botón de cerrar asociado a cada sesión
    // El botón está en el mismo nivel que la sesión o en un contenedor padre
    // Buscar todos los botones con clase text-red-600 en la página
    const allRedButtons = this.page.locator('button[class*="text-red-600"], button[class*="border-red-300"]');
    const redButtonCount = await allRedButtons.count();
    console.log(`[DEBUG] Total de botones rojos encontrados en la página: ${redButtonCount}`);
    
    if (redButtonCount === 0) {
      // Si no hay botones rojos, buscar cualquier botón que contenga SVG
      const allButtonsWithSvg = this.page.locator('button').filter({ has: this.page.locator('svg') });
      const svgButtonCount = await allButtonsWithSvg.count();
      console.log(`[DEBUG] Total de botones con SVG encontrados: ${svgButtonCount}`);
      
      if (svgButtonCount === 0) {
        throw new Error('No se encontró ningún botón de cerrar sesión. Verifica que haya sesiones activas.');
      }
      
      // Usar el botón con SVG en el índice correspondiente a la sesión
      const closeBtn = allButtonsWithSvg.nth(sessionIndex);
      await closeBtn.waitFor({ state: 'visible', timeout: 15000 });
      await closeBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await closeBtn.click();
    } else {
      // Usar el botón rojo en el índice correspondiente a la sesión
      const closeBtn = allRedButtons.nth(sessionIndex);
      await closeBtn.waitFor({ state: 'visible', timeout: 15000 });
      await closeBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await closeBtn.click();
    }
    // await this.page.waitForTimeout(1500); // COMENTADO
    
    if (motivo && await this.modalReasonInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.modalReasonInput.fill(motivo);
      // await this.page.waitForTimeout(800); // COMENTADO
    }
    
    // Esperar a que el modal aparezca
    await this.page.waitForTimeout(1000);
    
    // Buscar el modal primero
    const modal = this.page.locator('div[class*="z-50"], [role="dialog"]').first();
    const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[DEBUG] Modal visible: ${modalVisible}`);
    
    if (!modalVisible) {
      // Esperar un poco más
      await this.page.waitForTimeout(2000);
    }
    
    // Buscar el botón de confirmar dentro del modal
    // El modal tiene z-50 y el botón puede tener diferentes textos
    // Intentar múltiples selectores
    let confirmBtn = null;
    let btnVisible = false;
    
    // Estrategia 1: Buscar por texto exacto "Cerrar Sesión"
    confirmBtn = this.page.locator('button:has-text("Cerrar Sesión")').first();
    btnVisible = await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`[DEBUG] Botón "Cerrar Sesión" visible: ${btnVisible}`);
    
    if (!btnVisible) {
      // Estrategia 2: Buscar cualquier botón con texto que contenga "Cerrar"
      const allButtons = this.page.locator('button');
      const btnCount = await allButtons.count();
      console.log(`[DEBUG] Total de botones en la página: ${btnCount}`);
      
      for (let i = 0; i < btnCount; i++) {
        const btn = allButtons.nth(i);
        const btnText = await btn.textContent().catch(() => '');
        const isVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
        console.log(`[DEBUG] Botón ${i}: texto="${btnText}", visible=${isVisible}`);
        
        if (isVisible && btnText && (btnText.includes('Cerrar') || btnText.includes('cerrar'))) {
          // Verificar que no es el botón de cancelar
          if (!btnText.includes('Cancelar') && !btnText.includes('cancelar')) {
            confirmBtn = btn;
            btnVisible = true;
            console.log(`[DEBUG] Botón de confirmar encontrado en índice ${i}: "${btnText}"`);
            break;
          }
        }
      }
    }
    
    if (!btnVisible && !confirmBtn) {
      // Estrategia 3: Buscar botón rojo dentro del modal
      confirmBtn = this.page.locator('div[class*="z-50"] button[class*="red"], div[class*="z-50"] button[class*="bg-red"]').first();
      btnVisible = await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`[DEBUG] Botón rojo en modal visible: ${btnVisible}`);
    }
    
    if (!btnVisible && !confirmBtn) {
      // Estrategia 4: Buscar el último botón visible en la página (puede ser el del modal)
      const allVisibleButtons = this.page.locator('button').filter({ has: this.page.locator(':visible') });
      const visibleBtnCount = await allVisibleButtons.count();
      console.log(`[DEBUG] Total de botones visibles: ${visibleBtnCount}`);
      
      if (visibleBtnCount > 0) {
        // Buscar el botón que tiene texto relacionado con cerrar
        for (let i = visibleBtnCount - 1; i >= 0; i--) {
          const btn = allVisibleButtons.nth(i);
          const btnText = await btn.textContent().catch(() => '');
          if (btnText && (btnText.includes('Cerrar') || btnText.includes('cerrar')) && !btnText.includes('Cancelar')) {
            confirmBtn = btn;
            btnVisible = true;
            console.log(`[DEBUG] Botón de confirmar encontrado (último visible): "${btnText}"`);
            break;
          }
        }
      }
    }
    
    if (!btnVisible || !confirmBtn) {
      throw new Error('No se encontró el botón de confirmar en el modal de cerrar sesión');
    }
    
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    await confirmBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await confirmBtn.click();
    // await this.page.waitForTimeout(2000); // COMENTADO
  }

  /**
   * Cerrar todas las sesiones
   */
  async closeAllSessions(motivo?: string) {
    await this.closeAllSessionsButton.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await this.closeAllSessionsButton.click();
    // await this.page.waitForTimeout(1500); // COMENTADO
    
    if (motivo && await this.modalReasonInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.modalReasonInput.fill(motivo);
      // await this.page.waitForTimeout(800); // COMENTADO
    }
    
    // Buscar el botón de confirmar dentro del modal (z-50) con texto "Cerrar Todas"
    const confirmBtn = this.page.locator('div[class*="z-50"] button:has-text("Cerrar Todas")').first();
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(800); // COMENTADO
    await confirmBtn.click();
    // await this.page.waitForTimeout(2000); // COMENTADO
  }

  /**
   * Verificar número de sesiones activas
   */
  async getActiveSessionsCount(): Promise<number> {
    // Buscar sesiones que tienen el texto "Activa"
    const activeSessions = this.page.locator('div[class*="emerald-50"], div[class*="green-50"]').filter({ has: this.page.locator('text=Activa') });
    return await activeSessions.count();
  }
}

