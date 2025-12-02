import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model para la página de Creación/Edición de Productos
 */
export class CreateProductPage {
  readonly page: Page;
  readonly codigoInput: Locator;
  readonly nombreInput: Locator;
  readonly descripcionTextarea: Locator;
  readonly precioInput: Locator;
  readonly tipoProductoButton: Locator;
  readonly tipoServicioButton: Locator;
  readonly categoriaSelect: Locator;
  readonly provinciaSelect: Locator;
  readonly cantonSelect: Locator;
  readonly distritoSelect: Locator;
  readonly imagenInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  
  // Campos específicos de servicio
  readonly horarioAtencionInput: Locator;
  readonly diasDisponiblesInput: Locator;
  readonly duracionEstimadaInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codigoInput = page.locator('input[name="codigo"], input[id="codigo"]').first();
    this.nombreInput = page.locator('input[name="nombre"], input[id="nombre"]').first();
    this.descripcionTextarea = page.locator('textarea[name="descripcion"], textarea[id="descripcion"]').first();
    this.precioInput = page.locator('input[name="precio"], input[id="precio"], input[type="number"]').filter({ hasNot: page.locator('[name="duracion"]') }).first();
    
    // Botones de tipo
    this.tipoProductoButton = page.locator('button:has-text("Producto")').first();
    this.tipoServicioButton = page.locator('button:has-text("Servicio")').first();
    
    // Selectores de categoría y ubicación (pueden ser componentes personalizados)
    this.categoriaSelect = page.locator('input[placeholder*="categoría" i], input[placeholder*="Categoría"], select[name="categoria_id"]').first();
    // El componente HierarchicalLocationSearch usa <select> para provincia y cantón, e <input> para distrito
    this.provinciaSelect = page.locator('label:has-text("Provincia") + div select, select:has(option:has-text("Selecciona una provincia"))').first();
    this.cantonSelect = page.locator('label:has-text("Cantón") + div select, select:has(option:has-text("Selecciona un cantón"))').first();
    // El distrito es un input de texto, buscar por el label o placeholder
    this.distritoSelect = page.locator('label:has-text("Distrito"), label:has-text("Parroquia")').locator('..').locator('input[type="text"]').first();
    
    // Input de imágenes
    this.imagenInput = page.locator('input[type="file"][accept*="image"]').first();
    
    // Botón de submit - El texto es "Publicar {tipo}" o "Actualizar {tipo}"
    this.submitButton = page.locator('button:has-text("Publicar"), button:has-text("Actualizar"), button[type="submit"]').filter({ hasText: /Publicar|Actualizar/i }).first();
    
    // Mensajes
    this.successMessage = page.locator('div:has-text("éxito"), div:has-text("exitosamente"), div[class*="from-green"], div[class*="from-emerald"]').first();
    this.errorMessage = page.locator('div:has-text("Error"), div[class*="from-red"], div[class*="text-red"]').first();
    
    // Campos de servicio
    this.horarioAtencionInput = page.locator('input[name="horario_atencion"], input[placeholder*="horario" i]').first();
    this.diasDisponiblesInput = page.locator('input[name="dias_disponibles"], input[placeholder*="días" i]').first();
    this.duracionEstimadaInput = page.locator('input[name="duracion_estimada"], input[placeholder*="duración" i]').first();
  }

  /**
   * Navegar a la página de creación de productos
   */
  async goto() {
    await this.page.goto('/products/create');
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
  }

  /**
   * Navegar a la página de edición de un producto
   */
  async gotoEdit(productId: number) {
    await this.page.goto(`/products/${productId}/edit`);
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
  }

  /**
   * Seleccionar tipo de publicación
   */
  async selectType(type: 'producto' | 'servicio') {
    if (type === 'producto') {
      await this.tipoProductoButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.tipoProductoButton.click();
    } else {
      await this.tipoServicioButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.tipoServicioButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Completar campo código
   */
  async fillCodigo(codigo: string) {
    await this.codigoInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.codigoInput.clear();
    await this.codigoInput.fill(codigo);
  }

  /**
   * Completar campo nombre
   */
  async fillNombre(nombre: string) {
    await this.nombreInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nombreInput.clear();
    await this.nombreInput.fill(nombre);
  }

  /**
   * Completar campo descripción
   */
  async fillDescripcion(descripcion: string) {
    await this.descripcionTextarea.waitFor({ state: 'visible', timeout: 10000 });
    await this.descripcionTextarea.clear();
    await this.descripcionTextarea.fill(descripcion);
  }

  /**
   * Completar campo precio
   */
  async fillPrecio(precio: string | number) {
    await this.precioInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.precioInput.clear();
    await this.precioInput.fill(String(precio));
  }

  /**
   * Seleccionar categoría
   */
  async selectCategoria(categoriaNombre: string) {
    await this.categoriaSelect.waitFor({ state: 'visible', timeout: 10000 });
    await this.categoriaSelect.click();
    await this.page.waitForTimeout(500);
    
    // Buscar la opción en el dropdown - puede ser un componente de búsqueda
    const option = this.page.locator(`text="${categoriaNombre}"`).first();
    const optionVisible = await option.isVisible({ timeout: 5000 }).catch(() => false);
    if (optionVisible) {
      await option.click();
    } else {
      // Si no se encuentra, intentar seleccionar la primera opción disponible
      const firstOption = this.page.locator('[role="option"]').first();
      const firstVisible = await firstOption.isVisible({ timeout: 3000 }).catch(() => false);
      if (firstVisible) {
        await firstOption.click();
      }
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Seleccionar ubicación (provincia, cantón, distrito)
   */
  async selectUbicacion(provincia: string, canton: string, distrito: string) {
    // Seleccionar provincia usando select
    // Buscar el select de provincia de múltiples formas
    const provinciaSelects = [
      this.page.locator('label:has-text("Provincia")').locator('..').locator('select').first(),
      this.page.locator('select').filter({ has: this.page.locator('option:has-text("Selecciona una provincia")') }).first(),
      this.page.locator('select').first()
    ];
    
    let provinciaSelect = provinciaSelects[0];
    for (const select of provinciaSelects) {
      const visible = await select.isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) {
        provinciaSelect = select;
        break;
      }
    }
    
    await provinciaSelect.waitFor({ state: 'visible', timeout: 15000 });
    await provinciaSelect.selectOption({ label: provincia });
    await this.page.waitForTimeout(2000);

    // Seleccionar cantón usando select (debe estar habilitado después de seleccionar provincia)
    const cantonSelects = [
      this.page.locator('label:has-text("Cantón")').locator('..').locator('select').first(),
      this.page.locator('select').filter({ has: this.page.locator('option:has-text("Selecciona un cantón")') }).first(),
      this.page.locator('select').nth(1)
    ];
    
    let cantonSelect = cantonSelects[0];
    for (const select of cantonSelects) {
      const visible = await select.isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) {
        cantonSelect = select;
        break;
      }
    }
    
    await cantonSelect.waitFor({ state: 'visible', timeout: 15000 });
    // Esperar a que el select esté habilitado
    await this.page.waitForFunction(
      (selectElement) => {
        return selectElement && !(selectElement as HTMLSelectElement).disabled;
      },
      await cantonSelect.elementHandle(),
      { timeout: 10000 }
    ).catch(() => {});
    
    await cantonSelect.selectOption({ label: canton });
    await this.page.waitForTimeout(2000);

    // Llenar distrito usando input (es un campo de texto)
    // El campo distrito puede estar después de seleccionar cantón
    if (distrito) {
      await this.page.waitForTimeout(1000); // Esperar a que se actualice el DOM
      
      // Buscar el input de distrito - el componente tiene placeholder "Ej: Centro, Norte, Sur..."
      // Primero intentar por placeholder
      let distritoInput = this.page.locator('input[placeholder*="Centro" i], input[placeholder*="Ej:" i]').first();
      const byPlaceholder = await distritoInput.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!byPlaceholder) {
        // Buscar por el label "Distrito / Parroquia"
        const distritoLabel = this.page.locator('label:has-text("Distrito"), label:has-text("Parroquia")').first();
        const labelVisible = await distritoLabel.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (labelVisible) {
          // El input está en el mismo div que el label
          const container = distritoLabel.locator('..'); // div padre
          distritoInput = container.locator('input[type="text"]').first();
        } else {
          // Último recurso: buscar todos los inputs de texto y encontrar el que está después de los selects
          const allInputs = this.page.locator('input[type="text"]');
          const inputCount = await allInputs.count();
          // El distrito es generalmente el primer input de texto después de los selects de ubicación
          // Buscar el que tiene placeholder relacionado con distrito/parroquia
          for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const input = allInputs.nth(i);
            const placeholder = await input.getAttribute('placeholder').catch(() => '');
            const name = await input.getAttribute('name').catch(() => '');
            if (placeholder && (placeholder.includes('Centro') || placeholder.includes('Ej:')) || 
                name && name.includes('distrito')) {
              distritoInput = input;
              break;
            }
          }
        }
      }
      
      await distritoInput.waitFor({ state: 'visible', timeout: 15000 });
      await distritoInput.clear();
      await distritoInput.fill(distrito);
      await this.page.waitForTimeout(500);
    }
    
    // También llenar dirección específica (obligatorio según el formulario)
    const direccionInput = this.page.locator('input[placeholder*="dirección" i], input[placeholder*="Dirección"], input[placeholder*="Av."]').first();
    const direccionVisible = await direccionInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (direccionVisible) {
      await direccionInput.fill('Dirección de prueba');
      await this.page.waitForTimeout(500);
    }
    
    // Marcar ubicación en el mapa (obligatorio) - hacer clic en el centro del mapa
    const mapContainer = this.page.locator('[class*="map"], [id*="map"], .leaflet-container').first();
    const mapVisible = await mapContainer.isVisible({ timeout: 5000 }).catch(() => false);
    if (mapVisible) {
      // Hacer clic en el centro del mapa para establecer coordenadas
      const boundingBox = await mapContainer.boundingBox();
      if (boundingBox) {
        await this.page.mouse.click(
          boundingBox.x + boundingBox.width / 2,
          boundingBox.y + boundingBox.height / 2
        );
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Subir imagen
   */
  async uploadImage(imagePath: string) {
    await this.imagenInput.waitFor({ state: 'attached', timeout: 10000 });
    await this.imagenInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Completar campos específicos de servicio
   */
  async fillServiceDetails(horario: string, dias: string, duracion: string) {
    if (await this.horarioAtencionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.horarioAtencionInput.clear();
      await this.horarioAtencionInput.fill(horario);
    }
    
    if (await this.diasDisponiblesInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.diasDisponiblesInput.clear();
      await this.diasDisponiblesInput.fill(dias);
    }
    
    if (await this.duracionEstimadaInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.duracionEstimadaInput.clear();
      await this.duracionEstimadaInput.fill(duracion);
    }
  }

  /**
   * Enviar formulario
   */
  async submit() {
    await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verificar si hay mensaje de éxito
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Verificar si hay mensaje de error
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible({ timeout: 10000 }).catch(() => false);
  }

  /**
   * Obtener mensaje de error
   */
  async getErrorMessage(): Promise<string> {
    if (await this.hasErrorMessage()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }

  /**
   * Verificar si hay errores de validación
   */
  async hasValidationErrors(): Promise<boolean> {
    const errorSelectors = [
      this.page.locator('text=/requerido|Requerido|obligatorio|Obligatorio/i'),
      this.page.locator('.text-red-500, .text-red-600'),
      this.page.locator('[class*="error"]')
    ];
    
    for (const selector of errorSelectors) {
      const visible = await selector.isVisible({ timeout: 2000 }).catch(() => false);
      if (visible) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verificar si el formulario está visible
   */
  async isFormVisible(): Promise<boolean> {
    return await this.nombreInput.isVisible({ timeout: 5000 }).catch(() => false);
  }
}

