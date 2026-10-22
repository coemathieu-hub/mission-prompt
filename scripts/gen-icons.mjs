// Génère les icônes PNG (web + sources Android) à partir des SVG, via Chromium (Playwright).
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const rounded = read('public/icons/icon.svg');
const full = scale => read('assets/icon-full.svg').replace('SCALE', String(scale));
const foreground = scale => full(scale).replace(/<rect width="64" height="64" fill="url\(#bg\)"\/>/, '');

const jobs = [
  ['public/icons/icon-192.png', rounded, 192],
  ['public/icons/icon-512.png', rounded, 512],
  ['public/icons/icon-maskable-512.png', full(0.72), 512],
  ['public/icons/apple-touch-icon.png', full(0.9), 180],
  // Sources pour @capacitor/assets (icônes et écran de démarrage Android)
  ['assets/icon-only.png', full(0.9), 1024],
  ['assets/icon-foreground.png', foreground(0.62), 1024],
  ['assets/icon-background.png', full(0).replace(/<g [\s\S]*<\/g>/, ''), 1024],
  ['assets/splash.png', splash('#0A0D2A'), 2732],
  ['assets/splash-dark.png', splash('#0A0D2A'), 2732],
];

function splash(bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="${bg}"/>` +
    `<svg x="1166" y="1166" width="400" height="400" viewBox="0 0 64 64">${rounded.replace(/^<svg[^>]*>|<\/svg>\s*$/g, '')}</svg></svg>`;
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const [out, svg, size] of jobs) {
  mkdirSync(new URL(out.replace(/[^/]+$/, ''), root), { recursive: true });
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: new URL(out, root).pathname, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('✓', out);
}
await browser.close();
