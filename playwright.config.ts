// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Define la ruta como una constante local (o simplemente úsala directamente abajo)
const storageStatePath = 'storageState.json'; // <- RUTA DEFINIDA AQUÍ

export default defineConfig({
  timeout: 5 * 60 * 1000,
  globalSetup: require.resolve('./src/global.setup.ts'),

  projects: [
    {
      name: 'chromium-crawler',
      use: {
        // Usar la constante local o la cadena directamente
        storageState: storageStatePath, // o directamente 'storageState.json'
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: { slowMo: 50 },
        viewport: null,
      },
    },
  ],
});