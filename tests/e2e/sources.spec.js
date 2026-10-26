import { test, expect } from '@playwright/test';
import { openApp } from './helpers.js';

async function toSources(page) {
  await openApp(page);
  await page.click('[data-tour="new"]');
  await page.locator('.planet').nth(3).click();
  await expect(page.locator('.step-meta small')).toHaveText('Étape 4 sur 7');
}

const file = (name, mimeType, body = 'x') => ({ name, mimeType, buffer: Buffer.from(body) });

test('tous types de fichiers, plusieurs à la fois, sans choisir de type', async ({ page }) => {
  await toSources(page);
  await expect(page.locator('.kind-grid')).toHaveCount(0);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-tour="add-source"]')]);
  await chooser.setFiles([
    file('tarifs.csv', 'text/csv', 'Offre;Prix\nStarter;12\n'),
    file('logo.png', 'image/png'),
    file('cahier-des-charges.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    file('export.zip', 'application/zip'),
  ]);
  await expect(page.locator('.toast')).toContainText('4 fichiers ajoutés');
  await expect(page.locator('.source[data-kind="excel"]')).toContainText('Colonnes : Offre, Prix');
  await expect(page.locator('.source[data-kind="image"]')).toContainText('logo.png');
  await expect(page.locator('.source[data-kind="word"]')).toContainText('cahier-des-charges.docx');
  await expect(page.locator('.source[data-kind="other"]')).toContainText('export.zip');
  await expect(page.locator('.source-todo')).toHaveCount(4);
  await expect(page.locator('.toggle-row', { hasText: 'Aucun fichier' })).toBeHidden();

  // Même fichier choisi à nouveau : mis à jour, pas en double
  const [again] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-tour="add-source"]')]);
  await again.setFiles([file('tarifs.csv', 'text/csv', 'Offre;Prix;Stockage\n')]);
  await expect(page.locator('.toast')).toContainText('1 mis à jour');
  await expect(page.locator('.source')).toHaveCount(4);
  await expect(page.locator('.source[data-kind="excel"]')).toContainText('Offre, Prix, Stockage');
});

test('lien ou accès : bouton à part, choix entre les deux', async ({ page }) => {
  await toSources(page);
  await page.click('.add-link');
  await page.click('.seg button:has-text("Accès / connexion")');
  await expect(page.locator('.warn-box')).toBeVisible();
  await page.fill('#src-name', 'Compte de test Zeendoc');
  await page.click('[data-tour="source-save"]');
  await expect(page.locator('.source[data-kind="access"]')).toContainText('Compte de test Zeendoc');
});

test('glisser-déposer plusieurs fichiers', async ({ page }) => {
  await toSources(page);
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['%PDF'], 'devis.pdf', { type: 'application/pdf' }));
    dt.items.add(new File(['img'], 'photo.jpg', { type: 'image/jpeg' }));
    const target = document.querySelector('.scroll');
    for (const type of ['dragenter', 'dragover', 'drop']) target.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
  });
  await expect(page.locator('.source')).toHaveCount(2);
  await expect(page.locator('.scroll.dropping')).toHaveCount(0);
});
