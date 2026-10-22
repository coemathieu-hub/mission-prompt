// Choix du moteur de dictée selon la plateforme, derrière une interface unique :
//   { id, supported, ensurePermission(), prepare(lang), on({start,result,error,end}), start(lang), stop(), abort() }
import { createWebEngine } from './web.js';

const nullEngine = {
  id: 'none',
  supported: false,
  async ensurePermission() { return false; },
  async prepare() {},
  on() {},
  start() { throw new Error('not-available'); },
  stop() {},
  abort() {},
};

export async function createEngine() {
  if (__TARGET__ === 'app' && globalThis.Capacitor?.isNativePlatform?.()) {
    const { createNativeEngine } = await import('./native.js');
    const engine = createNativeEngine();
    return (await engine.available()) ? engine : nullEngine;
  }
  const web = createWebEngine();
  return web.supported ? web : nullEngine;
}

/** Messages clairs, sans jargon, pour chaque cause d'indisponibilité. */
export function speechHelp(code) {
  const keyboard = 'Tape ton idée, ou utilise le micro 🎤 de ton clavier.';
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return `🎤 Le micro est refusé. Autorise-le dans les réglages du téléphone (ou du navigateur). ${keyboard}`;
    case 'audio-capture':
      return `🎤 Aucun micro détecté. ${keyboard}`;
    case 'network':
      return `📶 La dictée a besoin d'Internet sur cet appareil. ${keyboard}`;
    case 'silence':
      return '⏸️ Je me suis mis en pause : plus rien entendu depuis un moment.';
    case 'unsupported':
    case 'not-available':
    case 'no-start':
    case 'restart-loop':
    default:
      return `🎤 La dictée n'est pas disponible ici. ${keyboard}`;
  }
}
