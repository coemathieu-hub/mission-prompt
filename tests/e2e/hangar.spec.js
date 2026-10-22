import { test, expect } from '@playwright/test';
import { openApp } from './helpers.js';

test('tuto au premier lancement, puis plus jamais, et « Revoir le tuto »', async ({ page }) => {
  await openApp(page, { tutorial: true });
  await expect(page.locator('.tour-count')).toHaveText('1/8');
  for (let i = 2; i <= 8; i++) {
    await page.click('.tour-bubble .btn-primary');
    await expect(page.locator('.tour-count')).toHaveText(`${i}/8`);
  }
  await expect(page.locator('.tour-bubble .btn-primary')).toHaveText("C'est parti ! 🚀");
  await page.click('.tour-bubble .btn-primary');
  await expect(page.locator('.tour')).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(800);
  await expect(page.locator('.tour')).toHaveCount(0);
  await page.click('[data-tour="tab-réglages"]');
  await page.click('text=Revoir le tuto');
  await expect(page.locator('.tour-count')).toHaveText('1/8');
});

test('recherche, filtres, dupliquer, supprimer avec confirmation et annuler', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.fill('#title', 'Comparatif Zeendoc Yooz');
  await page.click('[aria-label="Retour à l\'accueil"]');
  await expect(page.locator('.mission')).toHaveCount(2);

  await page.fill('.search input', 'yooz');
  await expect(page.locator('.mission')).toHaveCount(1);
  await page.fill('.search input', '');
  await page.click('.chip:has-text("📝 Brouillon")');
  await expect(page.locator('.mission')).toHaveCount(2);
  await page.click('.chip:has-text("📤 Envoyée")');
  await expect(page.locator('.mission')).toHaveCount(0);
  await page.click('.chip:has-text("Toutes")');

  await page.click('[aria-label="Actions pour Comparatif Zeendoc Yooz"]');
  await page.click('.menu-item:has-text("Dupliquer")');
  await expect(page.locator('.mission', { hasText: '(copie)' })).toHaveCount(1);

  await page.click('[aria-label="Actions pour Comparatif Zeendoc Yooz (copie)"]');
  await page.click('.menu-item:has-text("Supprimer")');
  await page.click('.sheet .btn-danger');
  await expect(page.locator('.mission', { hasText: '(copie)' })).toHaveCount(0);
  await page.click('.toast-undo');
  await expect(page.locator('.mission', { hasText: '(copie)' })).toHaveCount(1);
});

test('mission démo supprimable en un geste', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="demo-delete"]');
  await expect(page.locator('.mission.demo')).toHaveCount(0);
  await expect(page.locator('.toast')).toContainText('Mission démo supprimée');
});

test('saisie conservée après rechargement immédiat', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.fill('#title', 'Texte tapé puis app fermée');
  await page.reload();
  await expect(page.locator('#title')).toHaveValue('Texte tapé puis app fermée');
});

test('export puis import de la sauvegarde JSON', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="tab-réglages"]');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('text=Exporter')]);
  const json = JSON.parse(await (await download.createReadStream()).toArray().then(c => Buffer.concat(c).toString()));
  expect(json.format).toBe('mission-prompt');
  expect(json.missions.length).toBe(1);
  json.missions[0] = { ...json.missions[0], id: 'importee', title: 'Mission importée', demo: false };
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('text=Importer')]);
  await chooser.setFiles({ name: 'sauvegarde.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(json)) });
  await expect(page.locator('.mission', { hasText: 'Mission importée' })).toHaveCount(1);
});

test('bouton Accueil présent sur chaque écran', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('[data-tour="home"]')).toHaveCount(0); // déjà sur l'accueil
  const screens = [
    async () => page.click('.mission.demo .mission-open'),
    ...[0, 1, 2, 3, 4, 5, 6].map(i => async () => { await page.click('.mission.demo .mission-open'); await page.locator('.planet').nth(i).click(); }),
    async () => page.click('[data-tour="tab-réglages"]'),
    async () => page.click('[data-tour="tab-guide"]'),
  ];
  for (const go of screens) {
    await go();
    await page.click('[data-tour="home"]');
    await expect(page.locator('.screen.hangar')).toBeVisible();
  }
});
