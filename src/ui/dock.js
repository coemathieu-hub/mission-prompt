// Dock micro : gros bouton central (Démarrer → Pause → Reprendre), Supprimer et Stop sur les côtés.
// Il pilote un contrôleur de dictée vers une « cible » (nouveau bloc d'idée, titre, objectif…).
import { h, icon } from './dom.js';
import { toast } from './overlay.js';
import { createDictation } from '../speech/dictation.js';
import { speechHelp, speechHint, canRetry, diagnose } from '../speech/index.js';
import { micForbiddenByFrame } from '../speech/help.js';
import { ONLINE_URL } from './install.js';
import { convertDictatedPunctuation } from '../text/punctuation.js';
import { haptic } from '../core/platform.js';

const UI = {
  idle: { icon: 'mic', label: 'Démarrer', aria: 'Démarrer la dictée' },
  rec: { icon: 'pause', label: 'Pause', aria: 'Mettre en pause' },
  pause: { icon: 'play', label: 'Reprendre', aria: 'Reprendre la dictée' },
  stopping: { icon: 'pause', label: 'Un instant…', aria: 'Validation en cours' },
  off: { icon: 'keyboard', label: 'Mode texte', aria: 'Écrire au clavier' },
};

const fmt = ms => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Une cible : { label, hint, begin():string, live(view), commit(text), discard(), restore(text), focus() }
 * @param {object} ctx  contexte de l'app (engine, events, speechOff)
 * @param {HTMLElement} screen  l'écran (reçoit data-mic pour masquer la navigation)
 * @param {object} defaultTarget
 */
export function micDock(ctx, screen, defaultTarget) {
  let target = defaultTarget;
  let mode = ctx.speechOff ? 'off' : 'idle';
  let tick = null;

  const wave = h('span', { class: 'wave', 'aria-hidden': 'true' },
    Array.from({ length: 16 }, () => h('i', {
      style: {
        '--d': `${(-Math.random()).toFixed(2)}s`,
        '--h': (0.45 + Math.random() * 0.55).toFixed(2),
        animationDuration: `${(0.55 + Math.random() * 0.6).toFixed(2)}s`,
      },
    })));
  const chrono = h('span', { class: 'chrono' }, '00:00');
  const stateWord = h('span', {}, "J'écoute");
  const targetChip = h('span', { class: 'dock-target' });
  const info = h('div', { class: 'rec-info' }, h('span', { class: 'rec-dot' }), chrono, wave, stateWord);
  const hint = h('p', { class: 'dock-hint' });
  const retryBtn = h('button', { class: 'link-btn dock-retry', hidden: true, onclick: retry }, '↻ Réessayer le micro');
  const onlineLink = h('a', { class: 'link-btn dock-retry dock-online', hidden: true, href: ONLINE_URL || '#', target: '_blank', rel: 'noopener' }, '🌐 Ouvrir la version en ligne (avec micro)');
  const micIcon = icon('mic', 'ic ic-xl');
  const micLabel = h('span', { class: 'mic-label' }, 'Démarrer');
  const micBtn = h('button', { class: 'mic', 'data-tour': 'mic', onclick: main }, micIcon);
  const trashBtn = h('button', { class: 'round del', 'aria-label': 'Supprimer cette prise', onclick: trash }, icon('trash'));
  const stopBtn = h('button', { class: 'round ok', 'aria-label': "Stop : valider l'idée", onclick: stop }, icon('stop'));

  const el = h('div', { class: 'dock glass hide-typing' },
    targetChip,
    info,
    hint,
    retryBtn,
    onlineLink,
    h('div', { class: 'controls' },
      h('div', { class: 'side' }, trashBtn, 'Supprimer'),
      h('div', { class: 'center' }, micBtn, micLabel),
      h('div', { class: 'side' }, stopBtn, 'Stop ✓'),
    ),
  );

  const dictation = createDictation({
    engine: ctx.engine,
    transform: convertDictatedPunctuation,
    onChange: v => {
      if (mode !== 'off' || v.state !== 'idle') setMode(v.state);
      target.live?.(v);
      chrono.textContent = fmt(v.elapsed);
    },
    onError: async code => {
      if (code === 'silence') { toast(speechHelp(code)); return; }
      // Indisponible : on valide ce qui a été dicté, puis bascule en mode texte.
      const text = await dictation.stop();
      if (text) target.commit(text);
      disable(await diagnose(code, { native: ctx.engine.id === 'native' }));
    },
  });

  function setMode(next) {
    mode = next;
    el.dataset.mic = next;
    screen.dataset.mic = next;
    const ui = UI[next];
    micIcon.querySelector('use').setAttribute('href', `#i-${ui.icon}`);
    micBtn.setAttribute('aria-label', ui.aria);
    micLabel.textContent = ui.label;
    stateWord.textContent = next === 'pause' ? 'En pause' : "J'écoute";
    targetChip.textContent = next === 'idle' || next === 'off' ? '' : target.label;
    const off = typeof ctx.speechOff === 'string' ? ctx.speechOff : 'unsupported';
    hint.textContent = next === 'off' ? speechHint(off) : target.hint || 'Touche le micro pour dicter';
    retryBtn.hidden = next !== 'off' || !canRetry(off);
    onlineLink.hidden = next !== 'off' || !ONLINE_URL || !['file', 'frame'].includes(off);
    clearInterval(tick);
    if (next === 'rec') tick = setInterval(() => { chrono.textContent = fmt(dictation.view().elapsed); }, 250);
  }

  async function begin(t = defaultTarget) {
    if (mode === 'off') { t.focus?.(); return; }
    if (!ctx.engine.supported) return disable('unsupported');
    if (ctx.engine.id === 'web' && micForbiddenByFrame()) return disable('frame');
    target = t;
    let allowed = true;
    try { allowed = await ctx.engine.ensurePermission(); } catch { allowed = false; }
    if (!allowed) return disable(ctx.engine.id === 'native' ? 'app-denied' : 'not-allowed');
    haptic();
    dictation.start(target.begin());
  }

  /** Passe en mode texte en expliquant la vraie cause. */
  function disable(reason) {
    ctx.speechOff = reason;
    target = defaultTarget;
    setMode('off');
    toast(speechHelp(reason), { duration: 8000 });
  }

  function retry() {
    ctx.speechOff = false;
    setMode('idle');
    begin(defaultTarget);
  }

  function main() {
    const s = dictation.state;
    if (mode === 'off') return defaultTarget.focus?.();
    if (s === 'idle') begin(defaultTarget);
    else if (s === 'rec') dictation.pause();
    else if (s === 'pause') dictation.resume();
  }

  async function stop() {
    if (dictation.state === 'idle' || dictation.state === 'stopping') return;
    haptic('double');
    const t = target;
    const text = await dictation.stop();
    t.commit(text);
    target = defaultTarget;
    setMode('idle');
  }

  function trash() {
    if (dictation.state === 'idle') return;
    const t = target;
    const snap = dictation.discard();
    t.discard();
    target = defaultTarget;
    setMode('idle');
    if (snap.text) {
      toast('Prise supprimée', {
        undo: () => {
          if (dictation.state !== 'idle') return;
          target = t;
          t.restore(snap.text);
          dictation.restore(snap);
        },
      });
    }
  }

  const offBackground = ctx.on('background', () => { if (dictation.state === 'rec') dictation.pause(); });
  setMode(mode);

  return {
    el,
    get state() { return dictation.state; },
    /** Démarre la dictée vers une autre cible (ex. le champ Objectif). Retape = stop. */
    async toggle(t) {
      if (dictation.state !== 'idle' && target === t) return stop();
      if (dictation.state !== 'idle') await stop();
      return begin(t);
    },
    isTarget: t => target === t && dictation.state !== 'idle',
    /** En quittant l'écran : on garde tout ce qui a été dicté. */
    destroy() {
      offBackground();
      clearInterval(tick);
      if (dictation.state !== 'idle') {
        const v = dictation.view();
        const text = [v.final, v.interim].filter(Boolean).join(' ');
        dictation.dispose();
        target.commit(convertDictatedPunctuation(text));
      }
      delete screen.dataset.mic;
    },
  };
}
