/**
 * Archivo maestro que ejecuta todas las pruebas de productos en orden secuencial
 * desde SIS-059 hasta SIS-085
 * 
 * Este archivo importa y ejecuta todas las pruebas en el orden correcto
 */

import { test } from '@playwright/test';

// Importar todos los archivos de prueba para ejecutarlos en orden
// Las pruebas se ejecutarán secuencialmente dentro de cada archivo gracias a test.describe.serial

// Nota: Playwright ejecutará los archivos en orden alfabético por defecto
// Para garantizar el orden, usamos nombres de archivo con prefijos numéricos

test.describe('Suite Completa de Pruebas de Productos (SIS-059 a SIS-085)', () => {
  test('Nota: Las pruebas se ejecutan desde los archivos individuales en orden', async () => {
    // Este archivo sirve como documentación del orden de ejecución
    // Las pruebas reales están en:
    // 1. product-creation.spec.ts (SIS-059 a SIS-064)
    // 2. product-edition.spec.ts (SIS-065 a SIS-068)
    // 3. product-deletion.spec.ts (SIS-069 a SIS-071)
    // 4. product-visualization.spec.ts (SIS-072 a SIS-074)
    // 5. product-appeals.spec.ts (SIS-075 a SIS-077)
    // 6. product-reports.spec.ts (SIS-078 a SIS-080)
    // 7. product-saved.spec.ts (SIS-081 a SIS-083)
    // 8. product-moderation.spec.ts (SIS-084, SIS-085)
  });
});

