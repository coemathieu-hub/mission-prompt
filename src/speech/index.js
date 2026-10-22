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

export { speechHelp, speechHint, canRetry, diagnose } from './help.js';
