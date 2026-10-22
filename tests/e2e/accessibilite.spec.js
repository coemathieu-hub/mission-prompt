import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openApp } from './helpers.js';

// Contrastes AA et règles d'accessibilité de base, en sombre et en clair.
for (const scheme of ['dark', 'light']) {
  test.describe(`thème ${scheme}`, () => {
    test.use({ colorScheme: scheme, reducedMotion: 'reduce' });

    const screens = [
      ['hangar', async () => {}],
      ['étape 3', async page => { await page.click('.mission.demo .mission-open'); await page.locator('.planet').nth(2).click(); }],
      ['étape 6', async page => { await page.click('.mission.demo .mission-open'); await page.locator('.planet').nth(5).click(); }],
      ['étape 7', async page => { await page.click('.mission.demo .mission-open'); await page.locator('.planet').nth(6).click(); }],
      ['réglages', async page => { await page.click('[data-tour="tab-réglages"]'); }],
    ];
    for (const [name, go] of screens) {
      test(name, async ({ page }) => {
        await openApp(page);
        await go(page);
        await page.waitForTimeout(400);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .exclude('.sky')
          .analyze();
        const issues = results.violations.map(v => `${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
        expect(issues).toEqual([]);
      });
    }
  });
}
