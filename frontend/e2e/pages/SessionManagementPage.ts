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
    // Buscar todas las sesiones activas primero - buscar por el badge "Activa"
    const sessions = this.page.locator('div[class*="emerald-50"], div[class*="green-50"]').filter({ 
      has: this.page.locator('text=/Activa/i') 
    });
    
    // Si no se encuentran con ese filtro, buscar por cualquier div que contenga "Activa"
    let sessionCount = await sessions.count();
    let targetSession;
    
    if (sessionCount === 0) {
      // Buscar de forma más amplia
      const allSessions = this.page.locator('div[class*="emerald"], div[class*="green-50"]').filter({
        has: this.page.locator('text=/Activa|Iniciada|Expira/i')
      });
      await allSessions.first().waitFor({ state: 'visible', timeout: 10000 });
      sessionCount = await allSessions.count();
      console.log(`[DEBUG] Sesiones encontradas (búsqueda amplia): ${sessionCount}`);
      
      if (sessionCount === 0) {
        throw new Error('No se encontraron sesiones activas en la página');
      }
      if (sessionIndex >= sessionCount) {
        throw new Error(`Índice de sesión ${sessionIndex} fuera de rango. Solo hay ${sessionCount} sesiones activas.`);
      }
      targetSession = allSessions.nth(sessionIndex);
    } else {
      await sessions.first().waitFor({ state: 'visible', timeout: 10000 });
      console.log(`[DEBUG] Total de sesiones activas encontradas: ${sessionCount}`);
      
      if (sessionIndex >= sessionCount) {
        throw new Error(`Índice de sesión ${sessionIndex} fuera de rango. Solo hay ${sessionCount} sesiones activas.`);
      }
      targetSession = sessions.nth(sessionIndex);
    }
    await targetSession.waitFor({ state: 'visible', timeout: 15000 });
    await targetSession.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    
    // ESTRATEGIA DEFINITIVA: Buscar botones con icono X que NO tienen texto
    // El botón "Cerrar Todas las Sesiones" tiene texto, el botón de sesión individual solo tiene el icono
    const allButtonsWithX = this.page.locator('button').filter({ 
      has: this.page.locator('svg.lucide-x, svg[class*="lucide-x"]')
    });
    const xButtonCount = await allButtonsWithX.count();
    console.log(`[DEBUG] Total botones con icono X encontrados: ${xButtonCount}`);
    
    let closeBtn = null;
    let closeBtnVisible = false;
    
    if (xButtonCount > 0) {
      // Obtener el bounding box de la sesión objetivo
      const sessionBox = await targetSession.boundingBox();
      console.log(`[DEBUG] Bounding box de sesión ${sessionIndex}:`, sessionBox);
      
      // Iterar sobre todos los botones con X y encontrar el que está dentro de la sesión
      for (let i = 0; i < xButtonCount; i++) {
        const btn = allButtonsWithX.nth(i);
        const isVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          // Verificar que NO tiene texto (para excluir "Cerrar Todas las Sesiones")
          const btnText = await btn.textContent().catch(() => '');
          const hasText = btnText && btnText.trim().length > 0 && !btnText.trim().match(/^\s*$/);
          
          const btnBox = await btn.boundingBox();
          const btnClasses = await btn.getAttribute('class').catch(() => '');
          const hasRedClasses = btnClasses?.includes('text-red-600') || btnClasses?.includes('border-red-300');
          
          console.log(`[DEBUG] Botón X ${i}: visible=${isVisible}, tieneTexto=${hasText}, texto="${btnText}", clasesRojas=${hasRedClasses}, box=`, btnBox);
          
          // El botón correcto NO tiene texto y tiene clases rojas
          if (sessionBox && btnBox && hasRedClasses && !hasText) {
            // Verificar si el botón está en la misma fila vertical que la sesión
            // El botón puede estar a la derecha de la sesión, así que verificamos principalmente la altura Y
            const verticalMargin = 20; // margen vertical
            const horizontalMargin = 500; // margen horizontal más amplio (el botón puede estar a la derecha)
            
            const isInSameRow = 
              btnBox.y >= (sessionBox.y - verticalMargin) &&
              btnBox.y <= (sessionBox.y + sessionBox.height + verticalMargin);
            
            // También verificar que esté a la derecha de la sesión (no antes)
            const isToTheRight = btnBox.x >= sessionBox.x - horizontalMargin;
            
            console.log(`[DEBUG] Botón X ${i} - mismaFila=${isInSameRow}, aLaDerecha=${isToTheRight}`);
            
            if (isInSameRow && isToTheRight) {
              closeBtn = btn;
              closeBtnVisible = true;
              console.log(`[DEBUG] ✅ Botón correcto encontrado en índice ${i} (sin texto, misma fila)`);
              break;
            }
          }
        }
      }
    }
    
    // Si no se encontró, buscar botones sin texto dentro de las sesiones activas
    if (!closeBtnVisible) {
      console.log(`[DEBUG] Estrategia alternativa: buscar botones sin texto en sesiones activas`);
      const allSessions = this.page.locator('div[class*="emerald-50"], div[class*="green-50"]').filter({ 
        has: this.page.locator('text=/Activa/i') 
      });
      const sessionCount = await allSessions.count();
      
      if (sessionCount > sessionIndex) {
        const targetSessionAlt = allSessions.nth(sessionIndex);
        // Buscar botones dentro de esta sesión que tengan X pero no texto
        const buttonsInSession = targetSessionAlt.locator('button').filter({ 
          has: this.page.locator('svg.lucide-x, svg[class*="lucide-x"]')
        });
        const buttonsCount = await buttonsInSession.count();
        console.log(`[DEBUG] Botones con X en sesión ${sessionIndex}: ${buttonsCount}`);
        
        for (let i = 0; i < buttonsCount; i++) {
          const btn = buttonsInSession.nth(i);
          const btnText = await btn.textContent().catch(() => '');
          const hasText = btnText && btnText.trim().length > 0 && !btnText.trim().match(/^\s*$/);
          
          if (!hasText) {
            closeBtn = btn;
            closeBtnVisible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
            console.log(`[DEBUG] Botón sin texto encontrado en sesión ${sessionIndex}, botón ${i}: ${closeBtnVisible}`);
            if (closeBtnVisible) break;
          }
        }
      }
    }
    
    if (!closeBtnVisible || !closeBtn) {
      // Debug: obtener información de la sesión
      const sessionHtml = await targetSession.innerHTML().catch(() => 'No se pudo obtener HTML');
      console.log(`[DEBUG] HTML de la sesión ${sessionIndex}: ${sessionHtml.substring(0, 500)}`);
      throw new Error(`No se encontró el botón de cerrar sesión en la sesión del índice ${sessionIndex}.`);
    }
    
    await closeBtn.waitFor({ state: 'visible', timeout: 15000 });
    await closeBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    console.log(`[DEBUG] Haciendo clic en el botón de cerrar sesión ${sessionIndex}`);
    await closeBtn.click();
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

