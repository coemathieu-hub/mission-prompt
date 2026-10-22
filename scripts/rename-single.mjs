// dist/single/index.html → dist/single/mission-prompt.html (nom parlant pour le fichier autonome)
import { renameSync, statSync } from 'node:fs';
const from = new URL('../dist/single/index.html', import.meta.url);
const to = new URL('../dist/single/mission-prompt.html', import.meta.url);
renameSync(from, to);
console.log(`dist/single/mission-prompt.html (${Math.round(statSync(to).size / 1024)} Ko)`);
