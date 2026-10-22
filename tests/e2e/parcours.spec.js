import { test, expect } from '@playwright/test';
import { openApp, say, engineEnd, STOP } from './helpers.js';

test('une mission complète, du titre au prompt copié', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="new"]');

  // 1. Titre dicté
  await page.click('.mic');
  await say(page, 'outil de suivi des tickets SAV');
  await page.click(STOP);
  await expect(page.locator('#title')).toHaveValue('outil de suivi des tickets SAV');
  await page.click('[data-tour="next"]');

  // 2. Pro : contraintes par défaut ajoutées
  await page.click('[data-ctx="pro"]');
  await expect(page.locator('#constraints')).toHaveValue(/AXGROUP/);
  await page.click('[data-tour="next"]');

  // 3. Objectif tapé + deux idées dictées + une tapée
  await page.fill('#goal', 'Suivre les tickets SAV des imprimantes Xerox et Brother.');
  await page.locator('h1').click();
  await page.click('.mic');
  await say(page, 'euh lister les tickets ouverts par client virgule avec la date', '');
  await page.click(STOP);
  await page.click('.mic');
  await say(page, 'envoyer un récap le le vendredi par mail point');
  await page.click(STOP);
  await page.click('.add-idea');
  await page.keyboard.type('Afficher le délai moyen de résolution par technicien.');
  await page.locator('h1').click();
  await expect(page.locator('textarea.idea-text')).toHaveCount(3);
  await page.click('[data-tour="next"]');

  // 4. Source Excel lue localement
  await page.click('[data-tour="add-source"]');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('.pick-row .btn')]);
  await chooser.setFiles({ name: 'tickets.csv', mimeType: 'text/csv', buffer: Buffer.from('N°;Client;Machine;Ouvert le\n1;ACME;Xerox C410;2026-10-01\n') });
  await expect(page.locator('.sheet .sheet-summary')).toContainText('Client, Machine');
  await page.click('[data-tour="source-save"]');
  await page.click('[data-tour="next"]');

  // 5. Livrable
  await page.click('.choice[data-id="html"]');
  await page.click('.seg [data-id="both"]');
  await page.click('text=Fonctionne hors ligne');
  await page.click('text=Les calculs sont justes');
  await page.click('[data-tour="next"]');

  // 6. Relecture : corrections proposées puis appliquées
  await expect(page.locator('.chg').first()).toBeVisible();
  await page.click('text=Appliquer');
  await expect(page.locator('.empty-ok')).toBeVisible();
  await page.click('[data-tour="next"]');

  // 7. Copier → décollage, prompt dans le presse-papiers
  await expect(page.locator('.fuel-val').first()).toHaveText('100 %');
  await page.click('[data-tour="copy"]');
  await expect(page.locator('.launch-card')).toContainText('Mission prête au lancement');
  const prompt = await page.evaluate(() => navigator.clipboard.readText());
  expect(prompt).toContain('# 🎯 Outil de suivi des tickets SAV');
  expect(prompt).toContain('Contexte : besoin pro. Charte graphique AXGROUP');
  expect(prompt).toContain('1. Lister les tickets ouverts par client, avec la date');
  expect(prompt).toContain('2. Envoyer un récap le vendredi par mail.');
  expect(prompt).toContain('- **tickets.csv** · Excel / CSV');
  expect(prompt).toContain('  - Colonnes : N°, Client, Machine, Ouvert le');
  expect(prompt).toContain('- Type : HTML autonome (un seul fichier .html)');
  expect(prompt).toContain('## Méthode');
  expect(prompt).not.toMatch(/euh|le le/);

  // Retour au hangar : statut « Envoyée »
  await page.click('.launch .btn-primary');
  await expect(page.locator('.mission').first()).toContainText('📤 Envoyée');
});

test('mode « Claude pour optimiser » : préambule ajouté', async ({ page }) => {
  await openApp(page);
  await page.click('.mission.demo .mission-open');
  await page.locator('.planet').nth(6).click();
  await page.click('text=✨ Claude optimise');
  await page.click('[data-tour="copy"]');
  const prompt = await page.evaluate(() => navigator.clipboard.readText());
  expect(prompt.startsWith('Je veux faire réaliser ce besoin par Claude Code.')).toBe(true);
  expect(prompt).toContain('# 🎯 Outil HTML de suivi des notes de frais');
});

test('contrôleur : alerte cliquable qui renvoie à l\'étape', async ({ page }) => {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.locator('.planet').nth(5).click();
  const alert = page.locator('.report .alert-row', { hasText: 'Étape 1' }).first();
  await expect(alert).toContainText('Donne un titre');
  await alert.click();
  await expect(page.locator('.step-meta small')).toHaveText('Étape 1 sur 7');
});
