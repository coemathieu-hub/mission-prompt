// Démarrage, routeur (#/…) et contexte partagé entre les écrans.
import { injectSprite } from './ui/icons.js';
import { mountSky } from './ui/sky.js';
import { applyTheme, watchSystemTheme } from './ui/theme.js';
import { toast } from './ui/overlay.js';
import { startTour } from './ui/tour.js';
import { openDb } from './core/db.js';
import { createStore } from './core/store.js';
import { setVibrations, onAppEvents, exitApp } from './core/platform.js';
import { createEngine } from './speech/index.js';
import { createDemoMission } from './data/demo.js';
import { hangarView } from './views/hangar.js';
import { wizardView } from './views/wizard.js';
import { settingsView } from './views/settings.js';
import { guideView } from './views/guide.js';

function parse(hash) {
  const path = hash.replace(/^#/, '') || '/';
  let m;
  if ((m = path.match(/^\/m\/([^/]+)\/(\d)$/))) return { name: 'wizard', id: m[1], step: +m[2], path };
  if (path === '/reglages') return { name: 'settings', path };
  if (path === '/guide') return { name: 'guide', path };
  return { name: 'hangar', path: '/' };
}

export async function startApp(root = document.getElementById('app')) {
  injectSprite();
  mountSky();
  const db = await openDb();
  const store = createStore({ db });
  await store.load();
  applyTheme(store.settings.theme);
  watchSystemTheme(() => store.settings.theme);
  setVibrations(store.settings.vibrations);

  if (!store.settings.demoSeeded) {
    if (!store.list().some(m => m.demo)) store.save(createDemoMission(store.settings.constraints));
    await store.updateSettings({ demoSeeded: true });
  }

  const events = new Map();
  let view = null;

  const ctx = {
    store,
    engine: await createEngine(),
    speechOff: false,
    toast,
    hangarFilter: 'all',
    nav(path) {
      const next = `#${path}`;
      if (location.hash === next) render();
      else location.hash = next;
    },
    currentPath: () => parse(location.hash).path,
    on(name, fn) {
      if (!events.has(name)) events.set(name, new Set());
      events.get(name).add(fn);
      return () => events.get(name).delete(fn);
    },
    emit(name, data) { events.get(name)?.forEach(fn => fn(data)); },
    startTour: () => startTour(ctx),
    restart: () => location.reload(),
  };
  ctx.engine.prepare?.('fr-FR').catch(() => {});

  function render() {
    view?.destroy?.();
    const route = parse(location.hash);
    const make = { hangar: hangarView, wizard: wizardView, settings: settingsView, guide: guideView }[route.name];
    view = make(ctx, route);
    if (!view) return;
    root.replaceChildren(view.el);
    const bottom = view.el.querySelector('.bottom, .tabbar');
    const measure = () => document.documentElement.style.setProperty('--bottom-h', `${view?.el.querySelector('.bottom')?.offsetHeight || 0}px`);
    if (bottom) requestAnimationFrame(measure);
    view.el.querySelector('h1')?.focus?.({ preventScroll: true });
  }

  addEventListener('hashchange', render);
  onAppEvents({
    back: () => {
      const route = parse(location.hash);
      if (route.name === 'hangar') exitApp();
      else if (route.name === 'wizard' && route.step > 1) ctx.nav(`/m/${route.id}/${route.step - 1}`);
      else ctx.nav('/');
    },
    background: () => {
      ctx.emit('background');
      store.flush().catch(() => {});
    },
  });

  render();
  if (!store.persistent) toast('⚠️ Stockage indisponible ici : tes missions ne seront pas gardées. Exporte-les avant de fermer.', { duration: 8000 });
  if (!store.settings.tutorialDone) setTimeout(() => ctx.startTour(), 400);
  return ctx;
}
