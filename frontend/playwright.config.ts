import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Ejecutar tests secuencialmente (uno a la vez) */
  fullyParallel: false,
  
  /* Fallar el build en CI si dejas test.only */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos en CI, 0 en desarrollo */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers: 1 para ejecutar tests secuencialmente */
  workers: 1,
  
  /* Reporter a usar */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en navegación */
    baseURL: 'http://localhost:5173',
    
    /* Recopilar traza cuando se reintenta el test */
    trace: 'on-first-retry',
    
    /* Screenshot solo en fallos */
    screenshot: 'only-on-failure',
    
    /* Video solo en fallos */
    video: 'retain-on-failure',
    
    /* Timeout para acciones */
    actionTimeout: 15000,
    
    /* Timeout de navegación */
    navigationTimeout: 30000,
    
    /* Timeout para cada test */
    testTimeout: 60000,
  },

  /* Configurar proyectos para múltiples navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Ejecutar servidor de desarrollo antes de los tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

