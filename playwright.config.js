// Configuración E2E: sirve el juego por HTTP (no file://) y lo prueba en navegadores reales.
import { defineConfig, devices } from '@playwright/test';

const base_url = process.env.PULSO_URL || 'http://localhost:8080/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 180_000,
  reporter: [['list']],
  use: { baseURL: base_url },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // Si PULSO_URL apunta a GitHub Pages no se levanta servidor local.
  webServer: process.env.PULSO_URL ? undefined : {
    command: 'python3 -m http.server 8080',
    url: 'http://localhost:8080/',
    reuseExistingServer: true,
  },
});
