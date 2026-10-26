import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { FAKE_SPEECH } from './helpers.js';

const SINGLE = fileURLToPath(new URL('../../dist/single/mission-prompt.html', import.meta.url));

test('fichier HTML autonome : marche hors ligne, sans aucune requête réseau', async ({ page }) => {
  test.skip(!existsSync(SINGLE), 'Lancer « npm run build:single » avant');
  const requests = [];
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith('file:') || url.startsWith('data:')) return route.continue();
    requests.push(url);
    return route.abort();
  });
  await page.goto(`file://${SINGLE}`);
  await page.locator('.tour .link-btn').click();
  await page.click('[data-tour="new"]');
  await page.fill('#title', 'Mission créée hors ligne');
  await page.click('[aria-label="Retour à l\'accueil"]');
  await expect(page.locator('.mission', { hasText: 'Mission créée hors ligne' })).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.mission', { hasText: 'Mission créée hors ligne' })).toHaveCount(1);
  const fontsLoaded = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "Inter Variable"'); });
  expect(fontsLoaded).toBe(true);
  expect(requests).toEqual([]);
});

test('fichier local : la dictée explique pourquoi elle ne marche pas', async ({ page }) => {
  test.skip(!existsSync(SINGLE), 'Lancer « npm run build:single » avant');
  await page.addInitScript({ path: FAKE_SPEECH });
  await page.goto(`file://${SINGLE}`);
  await page.locator('.tour .link-btn').click();
  await page.click('.mission.demo .mission-open');
  await page.locator('.planet').nth(2).click();
  await page.click('.mic');
  await page.evaluate(() => window.__speech.error('not-allowed'));
  await expect(page.locator('.toast')).toContainText('simple fichier, même si le micro est autorisé pour Chrome');
  await expect(page.locator('.dock-hint')).toContainText('fichier ouvert en local');
  await expect(page.locator('.dock-retry:not(.dock-online)')).toBeHidden();
});

test('PWA : relancée sans connexion après une première visite', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); // le service worker contrôle maintenant la page
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.brand strong')).toHaveText('Mission Prompt');
  await context.setOffline(false);
});

test('PWA : manifest et méta iPhone présents', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(async () => {
    const href = document.querySelector('link[rel="manifest"]').href;
    return (await fetch(href)).json();
  });
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some(i => i.purpose === 'maskable')).toBe(true);
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /apple-touch-icon/);
});
