import { test, expect } from '@playwright/test';
import { openApp } from './helpers.js';

test('en tapant une idée (clavier ouvert), « Suivant » reste visible et marche du premier coup', async ({ page }) => {
  await openApp(page);
  await page.click('.mission.demo .mission-open');
  await page.locator('.planet').nth(2).click();
  await page.locator('textarea.idea-text').first().click();
  await page.keyboard.type(' Et encore un détail.');
  await expect(page.locator('.screen')).toHaveClass(/typing/);
  await expect(page.locator('.dock')).toBeHidden();        // le gros micro laisse la place au texte
  await expect(page.locator('[data-tour="next"]')).toBeVisible();
  await page.click('[data-tour="next"]');
  await expect(page.locator('.step-meta small')).toHaveText('Étape 4 sur 7');
});

test('titre : « Suivant » visible pendant la saisie', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.click('#title');
  await page.keyboard.type('Devis');
  await page.click('[data-tour="next"]');
  await expect(page.locator('.step-meta small')).toHaveText('Étape 2 sur 7');
});

test('idée très longue : affichée en entier, rien n\'est coupé ni limité', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.locator('.planet').nth(2).click();
  await page.click('.add-idea');
  const long = Array.from({ length: 300 }, (_, i) => `mot${i}`).join(' ');
  await page.keyboard.insertText(long);
  await page.locator('h1').click();
  const ta = page.locator('textarea.idea-text').first();
  await expect(ta).toHaveValue(long);
  const clipped = await ta.evaluate(el => el.scrollHeight > el.clientHeight + 2);
  expect(clipped).toBe(false);
  await page.reload();
  await expect(page.locator('textarea.idea-text').first()).toHaveValue(long);
});
