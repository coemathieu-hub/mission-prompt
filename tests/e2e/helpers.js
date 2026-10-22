import { fileURLToPath } from 'node:url';

export const FAKE_SPEECH = fileURLToPath(new URL('./fake-speech.js', import.meta.url));

/** Ouvre l'app (tuto déjà vu ou non) avec le faux moteur de dictée. */
export async function openApp(page, { tutorial = false, speech = true } = {}) {
  if (speech) await page.addInitScript({ path: FAKE_SPEECH });
  await page.goto('/');
  await page.waitForSelector('.screen');
  if (!tutorial) {
    await page.locator('.tour .link-btn').click();
    await page.waitForSelector('.tour', { state: 'detached' });
  }
}

export const say = (page, final, interim = '') => page.evaluate(([f, i]) => window.__speech.say(f, i), [final, interim]);
export const engineEnd = page => page.evaluate(() => window.__speech.end());
export const STOP = '[aria-label="Stop : valider l\'idée"]';
export const TRASH = '[aria-label="Supprimer cette prise"]';
