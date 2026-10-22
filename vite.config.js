import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Trois cibles depuis la même base de code :
//   pwa    → dist/pwa    (GitHub Pages, installable sur iPhone)
//   single → dist/single (un seul fichier HTML, tout inline, hors ligne)
//   app    → dist/app    (contenu web de l'APK Capacitor)
const TARGETS = ['pwa', 'single', 'app'];

const BG_DARK = '#0A0D2A';

// En mode fichier unique : icône SVG en data URI, pas de manifest ni d'apple-touch-icon.
function singleFileHead() {
  const svg = readFileSync(new URL('./public/icons/icon.svg', import.meta.url), 'utf8');
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return {
    name: 'single-file-head',
    transformIndexHtml(html) {
      return html
        .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${dataUri}" type="image/svg+xml">`)
        .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '');
    },
  };
}

export default defineConfig(({ mode }) => {
  const target = TARGETS.includes(mode) ? mode : 'pwa';
  return {
    base: './',
    publicDir: target === 'single' ? false : 'public',
    define: { __TARGET__: JSON.stringify(target), __APP_VERSION__: JSON.stringify(pkg.version) },
    build: {
      outDir: `dist/${target}`,
      emptyOutDir: true,
      target: 'es2020',
      assetsInlineLimit: target === 'single' ? 100_000_000 : 4096,
    },
    plugins: [
      target === 'single' && singleFileHead(),
      target === 'single' && viteSingleFile({ removeViteModuleLoader: true }),
      target === 'pwa' &&
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'script-defer',
          includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
          manifest: {
            id: './',
            name: 'Mission Prompt',
            short_name: 'Mission Prompt',
            description: 'Transforme tes idées, dictées ou tapées, en prompt clair pour Claude.',
            lang: 'fr',
            dir: 'ltr',
            start_url: './',
            scope: './',
            display: 'standalone',
            orientation: 'portrait',
            background_color: BG_DARK,
            theme_color: BG_DARK,
            categories: ['productivity', 'utilities'],
            icons: [
              { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
            navigateFallback: 'index.html',
            cleanupOutdatedCaches: true,
          },
        }),
    ].filter(Boolean),
    test: {
      include: ['tests/unit/**/*.test.js'],
      environment: 'node',
    },
  };
});
