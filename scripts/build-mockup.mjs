// Injecte les polices (base64) dans la maquette pour obtenir un fichier 100 % autonome.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const b64 = p => readFileSync(new URL(`node_modules/${p}`, root)).toString('base64');
const face = (family, file) =>
  `@font-face{font-family:'${family}';font-style:normal;font-display:swap;font-weight:300 700;` +
  `src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;

const fonts = [
  face('Inter Variable', '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
  face('Space Grotesk Variable', '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2'),
].join('\n');

const src = readFileSync(new URL('mockup/maquette.src.html', root), 'utf8');
writeFileSync(new URL('mockup/maquette.html', root), src.replace('/*@FONTS@*/', fonts));
console.log('mockup/maquette.html généré');
