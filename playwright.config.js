import { defineConfig, devices } from '@playwright/test';

// Tests de bout en bout sur la version web (PWA) servie localement, en taille téléphone.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    ...devices['Pixel 7'],
    locale: 'fr-FR',
    colorScheme: 'dark',
    permissions: ['clipboard-read', 'clipboard-write'],
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'npx vite build --mode pwa && npx vite preview --mode pwa --outDir dist/pwa --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
