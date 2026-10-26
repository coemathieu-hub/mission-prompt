// Tuto « Premier vol » : Bip guide l'utilisateur avec une surbrillance (spotlight), 8 bulles max.
import { h, bipFace, $ } from './dom.js';
import { createDemoMission } from '../data/demo.js';

export function tourSteps(demoId) {
  const at = n => `/m/${demoId}/${n}`;
  return [
    { route: '/', target: '[data-tour="brand"]', text: 'Salut, moi c\'est <b>Bip</b> 🤖 ! Mission Prompt transforme tes idées, dictées ou tapées, en <b>prompt clair pour Claude</b>.' },
    { route: '/', target: '[data-tour="new"]', text: 'Tout commence ici : <b>🚀 Nouvelle mission</b>. Pour t\'entraîner sans risque, on ouvre la <b>🧪 mission démo</b>.' },
    { route: at(3), target: '.traj', text: '<b>7 étapes = 7 planètes</b> : Titre, Pro/Perso, Besoin, Sources, Livrable, Relecture, Lancement. Touche une planète pour y aller.' },
    { route: at(3), target: '[data-tour="mic"]', text: '🎙️ <b>Touche pour dicter</b> (autorise le micro la 1re fois). ⏸️ Pause garde ton texte, ⏹️ Stop valide l\'idée, 🗑️ jette la prise.' },
    { route: at(3), target: '[data-tour="ideas"] .idea', text: 'Touche le texte d\'une idée pour <b>la modifier</b>. Déplace-la avec <b>↑ ↓</b> ou en glissant la poignée <b>⠿</b>.' },
    { route: at(4), target: '[data-tour="add-source"]', text: 'Ajoute ici <b>les fichiers utiles</b>, tous types, <b>plusieurs d\'un coup</b>. Ils restent sur ton appareil : seules leurs infos vont dans le prompt.' },
    { route: at(7), target: '[data-tour="fuel-card"]', text: 'La jauge <b>Carburant ⛽</b> dit si ta mission est complète. Touche une alerte pour corriger l\'étape concernée.' },
    { route: at(7), target: '[data-tour="copy"]', text: '<b>Copie le prompt</b>, puis colle-le dans Claude Code ou dans Claude. Bon vol ! 🚀' },
  ];
}

function waitFor(selector, timeout = 2000) {
  return new Promise(resolve => {
    const t0 = performance.now();
    (function look() {
      const el = $(selector);
      if (el && el.getBoundingClientRect().width) return resolve(el);
      if (performance.now() - t0 > timeout) return resolve(null);
      requestAnimationFrame(look);
    })();
  });
}

export function startTour(ctx) {
  let demo = ctx.store.list().find(m => m.demo);
  if (!demo) {
    demo = createDemoMission(ctx.store.settings.constraints);
    ctx.store.save(demo);
  }
  const steps = tourSteps(demo.id);
  let i = 0;
  let target = null;

  const spot = h('div', { class: 'tour-spot', 'aria-hidden': 'true' });
  const text = h('p', { class: 'tour-text', id: 'tour-text' });
  const bar = h('i', {});
  const counter = h('span', { class: 'tour-count' });
  const next = h('button', { class: 'btn btn-primary btn-sm', onclick: () => go(i + 1) });
  const bubble = h('div', { class: 'tour-bubble glass', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-text' },
    h('div', { class: 'tour-head' }, bipFace(), text),
    h('div', { class: 'tour-progress', 'aria-hidden': 'true' }, bar),
    h('div', { class: 'tour-actions' },
      counter,
      h('button', { class: 'link-btn', onclick: () => finish(false) }, 'Passer'),
      next,
    ),
  );
  const layer = h('div', { class: 'tour' }, spot, bubble);
  document.body.append(layer);

  function place() {
    if (!target?.isConnected) return;
    const r = target.getBoundingClientRect();
    const pad = 8;
    Object.assign(spot.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    const bh = bubble.offsetHeight;
    const below = r.bottom + pad + 14;
    const top = below + bh < innerHeight - 8 ? below : Math.max(8, r.top - pad - 14 - bh);
    bubble.style.top = `${top}px`;
  }

  async function go(k) {
    if (k >= steps.length) return finish(true);
    i = k;
    const step = steps[i];
    if (ctx.currentPath() !== step.route) ctx.nav(step.route);
    text.innerHTML = step.text;
    counter.textContent = `${i + 1}/${steps.length}`;
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    next.textContent = i === steps.length - 1 ? 'C\'est parti ! 🚀' : 'Suivant';
    layer.classList.add('moving');
    target = await waitFor(step.target);
    target?.scrollIntoView({ block: 'center', behavior: 'instant' });
    layer.classList.remove('moving');
    spot.hidden = !target;
    place();
    next.focus({ preventScroll: true });
  }

  async function finish(done) {
    removeEventListener('resize', place);
    document.removeEventListener('keydown', onKey);
    await ctx.store.updateSettings({ tutorialDone: true }); // enregistré avant de fermer
    layer.remove();
    ctx.nav('/');
    if (done) ctx.toast('À toi de jouer ! Lance ta première mission 🚀');
  }

  const onKey = e => {
    if (e.key === 'Escape') finish(false);
    if (e.key === 'ArrowRight') go(i + 1);
  };
  addEventListener('resize', place);
  document.addEventListener('keydown', onKey);
  go(0);
}
