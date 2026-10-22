// Parcours en 7 étapes : en-tête (jauge, aide), trajectoire, contenu de l'étape, navigation en bas.
import { h, icon, bipFace } from '../ui/dom.js';
import { sheet } from '../ui/overlay.js';
import { trajectory } from '../ui/trajectory.js';
import { checkMission } from '../text/checker.js';
import { STEPS } from '../data/defaults.js';
import { BIP_TIPS, STEP_HELP } from '../data/help.js';
import { stepTitle } from './steps/step1-title.js';
import { stepContext } from './steps/step2-context.js';
import { stepNeed } from './steps/step3-need.js';
import { stepSources } from './steps/step4-sources.js';
import { stepDeliverable } from './steps/step5-deliverable.js';
import { stepReview } from './steps/step6-review.js';
import { stepLaunch } from './steps/step7-launch.js';

const RENDERERS = { 1: stepTitle, 2: stepContext, 3: stepNeed, 4: stepSources, 5: stepDeliverable, 6: stepReview, 7: stepLaunch };

export function bipTip(text) {
  return h('div', { class: 'bip' }, bipFace(), h('p', { class: 'bubble glass', html: text }));
}

export function alertRow(alert, onGo) {
  return h('button', { class: `alert-row ${alert.level}`, onclick: () => onGo(alert.step) },
    h('span', { 'aria-hidden': 'true' }, alert.level === 'warn' ? '⚠️' : '💡'),
    h('span', {}, h('b', {}, `Étape ${alert.step} · ${STEPS[alert.step - 1].title}`), alert.message),
    icon('next'),
  );
}

export function wizardView(ctx, { id, step }) {
  const m = ctx.store.get(id);
  if (!m) { ctx.nav('/'); return null; }
  const n = Math.min(7, Math.max(1, Number(step) || 1));
  m.lastStep = n;
  m.maxStep = Math.max(m.maxStep || 1, n);
  if (n === 7 && m.status === 'draft') m.status = 'ready';
  ctx.store.save(m, { touch: false });

  const goto = k => ctx.nav(`/m/${m.id}/${k}`);
  const fuelGauge = h('span', { class: 'gauge' });
  const fuelText = h('span', {}, '0 %');
  const fuelBtn = h('button', { class: 'fuel-pill', 'data-tour': 'fuel', 'aria-label': 'Carburant : voir ce qui manque', onclick: showChecks },
    h('span', { 'aria-hidden': 'true' }, '⛽'), fuelGauge, fuelText);
  const traj = trajectory({ current: n, reached: m.maxStep, badges: {}, onGo: goto });
  const scroll = h('div', { class: 'scroll', 'data-step': n });
  const bottom = h('div', { class: 'bottom' });
  const screen = h('div', { class: `screen wizard step-${n}` },
    h('header', { class: 'app-top' },
      h('button', { class: 'icon-btn', 'aria-label': 'Retour au hangar', onclick: () => ctx.nav('/') }, icon('back')),
      h('div', { class: 'step-meta' },
        h('small', {}, `Étape ${n} sur 7`),
        h('strong', {}, `${STEPS[n - 1].emoji} ${STEPS[n - 1].title}`)),
      fuelBtn,
      h('button', { class: 'icon-btn', 'aria-label': 'Aide sur cette étape', 'data-tour': 'help', onclick: showHelp }, '❓'),
    ),
    traj.el,
    scroll,
    bottom,
  );

  let checks = checkMission(m);
  let refreshTimer = null;
  const listeners = new Set();
  function refresh() {
    checks = checkMission(m);
    fuelGauge.style.setProperty('--v', `${checks.fuel}%`);
    fuelText.textContent = `${checks.fuel} %`;
    const badges = {};
    for (let k = 1; k <= 7; k++) badges[k] = checks.alerts.some(a => a.step === k && a.level === 'warn') ? '!' : '✓';
    traj.update({ badges });
    listeners.forEach(fn => fn(checks));
  }
  function save() {
    ctx.store.save(m);
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, 250);
  }

  function showHelp() {
    const help = STEP_HELP[n];
    sheet({ title: help.title, body: help.body.map(p => h('p', { class: 'help-p' }, p)) });
  }
  function showChecks() {
    const s = sheet({
      title: `Carburant ⛽ ${checks.fuel} %`,
      body: [
        h('div', { class: 'gauge', style: { '--v': `${checks.fuel}%` } }),
        checks.alerts.length
          ? h('div', { class: 'alerts' }, checks.alerts.map(a => alertRow(a, k => { s.close(); goto(k); })))
          : h('p', { class: 'muted' }, 'Rien à signaler, le plein est fait 🚀'),
      ],
    });
  }

  // Masque le dock et la navigation quand le clavier est ouvert (plus de place pour écrire).
  const touch = matchMedia('(pointer: coarse)').matches;
  scroll.addEventListener('focusin', e => { if (touch && e.target.matches('textarea, input[type="text"], input:not([type])')) screen.classList.add('typing'); });
  scroll.addEventListener('focusout', () => setTimeout(() => {
    if (!scroll.contains(document.activeElement) || !document.activeElement.matches('textarea, input')) screen.classList.remove('typing');
  }, 120));

  const nav = h('nav', { class: 'nav row hide-typing' },
    h('button', { class: 'btn', onclick: () => (n > 1 ? goto(n - 1) : ctx.nav('/')) }, icon('back'), n > 1 ? 'Retour' : 'Hangar'),
    n < 7 && h('button', { class: 'btn btn-primary', 'data-tour': 'next', onclick: () => goto(n + 1) }, 'Suivant', icon('next')),
  );

  const api = {
    ctx, m, n, screen, scroll, bottom, nav, save, goto,
    tip: () => bipTip(BIP_TIPS[n][0]),
    get checks() { return checks; },
    onChecks(fn) { listeners.add(fn); },
  };
  const stepView = RENDERERS[n](api) || {};
  if (!bottom.contains(nav) && n < 7) bottom.append(nav);
  refresh();

  return {
    el: screen,
    focus: () => scroll.querySelector('h1')?.focus?.(),
    destroy() {
      stepView.destroy?.();
      traj.destroy();
      clearTimeout(refreshTimer);
      ctx.store.save(m, { touch: false });
    },
  };
}
