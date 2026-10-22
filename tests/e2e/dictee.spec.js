import { test, expect } from '@playwright/test';
import { openApp, say, engineEnd, STOP, TRASH } from './helpers.js';

async function toStep3(page) {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.locator('.planet').nth(2).click();
  await expect(page.locator('.step-meta small')).toHaveText('Étape 3 sur 7');
}

test('provisoire en italique, pause, reprise dans le même bloc, stop', async ({ page }) => {
  await toStep3(page);
  await page.click('.mic');
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'rec');
  await expect(page.locator('.nav')).toBeHidden();
  await say(page, 'première partie', 'en cours');
  await expect(page.locator('.idea.live .final')).toHaveText('première partie ');
  await expect(page.locator('.idea.live .interim')).toHaveText('en cours');
  await expect(page.locator('.idea.live .interim')).toHaveCSS('font-style', 'italic');

  await page.click('.mic'); // pause
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'pause');
  await expect(page.locator('.mic-label')).toHaveText('Reprendre');
  await expect(page.locator('.idea.live .final')).toHaveText('première partie en cours');

  await page.click('.mic'); // reprendre
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'rec');
  await say(page, 'deuxième partie');
  await page.click(STOP);
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'idle');
  await expect(page.locator('.nav')).toBeVisible();
  await expect(page.locator('textarea.idea-text')).toHaveValue('première partie en cours deuxième partie');
});

test('relance automatique après un silence', async ({ page }) => {
  await toStep3(page);
  await page.click('.mic');
  await say(page, 'avant le silence');
  await engineEnd(page);
  await page.waitForTimeout(500);
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'rec');
  await say(page, 'après le silence');
  await page.click(STOP);
  await expect(page.locator('textarea.idea-text')).toHaveValue('avant le silence après le silence');
});

test('supprimer la prise puis annuler pendant 5 s', async ({ page }) => {
  await toStep3(page);
  await page.click('.mic');
  await say(page, 'texte précieux');
  await page.click(TRASH);
  await expect(page.locator('.idea.live')).toBeHidden();
  await expect(page.locator('.toast')).toContainText('Prise supprimée');
  await page.click('.toast-undo');
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'pause');
  await page.click(STOP);
  await expect(page.locator('textarea.idea-text')).toHaveValue('texte précieux');
});

test('ponctuation dictée convertie à la volée', async ({ page }) => {
  await toStep3(page);
  await page.click('.mic');
  await say(page, 'un virgule deux point d\'interrogation à la ligne trois');
  await page.click(STOP);
  await expect(page.locator('textarea.idea-text')).toHaveValue('un, deux ?\ntrois');
});

test('fermeture brutale en pleine dictée : le texte est récupéré', async ({ page }) => {
  await toStep3(page);
  await page.click('.mic');
  await say(page, 'idée dictée juste avant la coupure', 'et la fin');
  await page.waitForTimeout(100);
  const url = page.url();
  await page.goto('about:blank'); // l'app est tuée sans rien valider
  await page.goto(url);
  await expect(page.locator('textarea.idea-text')).toHaveValue('idée dictée juste avant la coupure et la fin');
});

test('sans moteur de dictée : bascule en mode texte avec un message clair', async ({ page }) => {
  await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
  await openApp(page, { speech: false });
  await page.click('[data-tour="new"]');
  await page.locator('.planet').nth(2).click();
  await page.click('.mic');
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'off');
  await expect(page.locator('.toast')).toContainText('micro');
  await page.click('.mic'); // en mode texte : ouvre un bloc à remplir au clavier
  await expect(page.locator('textarea.idea-text:focus')).toBeVisible();
});

test.describe('micro autorisé pour le site', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write', 'microphone'] });
  test('micro indisponible malgré tout : message sans « refusé », texte conservé', async ({ page }) => {
  await toStep3(page);
  await page.click('.mic');
  await say(page, 'début conservé');
  await page.evaluate(() => window.__speech.error('not-allowed'));
  await expect(page.locator('.toast')).toContainText("Chrome n'a pas pu utiliser le micro");
  await expect(page.locator('.toast')).not.toContainText('refusé');
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'off');
  await expect(page.locator('textarea.idea-text')).toHaveValue('début conservé');
  });
});

test('micro bloqué pour le site : explique le cadenas, puis « Réessayer » relance', async ({ page }) => {
  await page.addInitScript(() => {
    window.__micState = 'denied';
    const q = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = d => (d && d.name === 'microphone' ? Promise.resolve({ state: window.__micState }) : q(d));
  });
  await toStep3(page);
  await page.click('.mic');
  await page.evaluate(() => window.__speech.error('not-allowed'));
  await expect(page.locator('.toast')).toContainText('cadenas');
  await expect(page.locator('.dock-hint')).toContainText('Micro bloqué pour ce site');
  await page.evaluate(() => { window.__micState = 'granted'; });
  await page.click('.dock-retry');
  await expect(page.locator('.dock')).toHaveAttribute('data-mic', 'rec');
  await say(page, 'ça marche');
  await page.click(STOP);
  await expect(page.locator('textarea.idea-text')).toHaveValue('ça marche');
});
