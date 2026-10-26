import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { openApp } from './helpers.js';

const SINGLE = fileURLToPath(new URL('../../dist/single/mission-prompt.html', import.meta.url));

test('Android : installation en un geste quand Chrome la propose', async ({ page }) => {
  await page.addInitScript(() => {
    window.__prompted = 0;
    addEventListener('load', () => {
      const ev = new Event('beforeinstallprompt', { cancelable: true });
      ev.prompt = async () => { window.__prompted++; };
      ev.userChoice = Promise.resolve({ outcome: 'accepted' });
      dispatchEvent(ev);
    });
  });
  await openApp(page);
  await page.click('[data-tour="install"]');
  expect(await page.evaluate(() => window.__prompted)).toBe(1);
  await expect(page.locator('.toast')).toContainText('Installée');
});

test('Android sans proposition du navigateur : instructions « menu ⋮ »', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="install"]');
  await expect(page.locator('.install-steps')).toContainText('menu ⋮');
  await expect(page.locator('.install-steps')).toContainText("Installer l'application");
});

test('iPhone : instructions Safari > Partager > Sur l\'écran d\'accueil', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  await openApp(page);
  await page.click('[data-tour="install"]');
  await expect(page.locator('.install-steps')).toContainText("Sur l'écran d'accueil");
  await ctx.close();
});

test('fichier local : explique qu\'il faut la version en ligne', async ({ page }) => {
  await page.goto(`file://${SINGLE}`);
  await page.locator('.tour .link-btn').click();
  await page.click('[data-tour="install"]');
  await expect(page.locator('.install-steps')).toContainText('simple fichier');
});

test('Réglages : bouton « Installer sur mon téléphone »', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="tab-réglages"]');
  await page.click('text=📲 Installer sur mon téléphone');
  await expect(page.locator('.install-steps')).toBeVisible();
});
