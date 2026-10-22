// Toasts (avec « Annuler »), feuilles du bas et confirmations.
import { h, icon } from './dom.js';

let toastHost;
let current = null;

/** toast('Prise supprimée', { undo: () => …, duration: 5000 }) */
export function toast(message, { undo, duration = undo ? 5000 : 2600 } = {}) {
  if (!toastHost) {
    toastHost = h('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.append(toastHost);
  }
  current?.dismiss();
  let timer;
  const el = h('div', { class: 'toast', style: { '--dur': `${duration}ms` } },
    h('span', { class: 'toast-msg' }, message),
    undo && h('button', { class: 'toast-undo', onclick: () => { dismiss(); undo(); } }, 'Annuler'),
    undo && h('i', { class: 'toast-bar' }),
  );
  const dismiss = () => { clearTimeout(timer); el.remove(); if (current?.el === el) current = null; };
  timer = setTimeout(dismiss, duration);
  toastHost.append(el);
  current = { el, dismiss };
  return current;
}

/** Feuille du bas. Retourne { el, close, body, foot }. */
export function sheet({ title, body = [], foot = [], onClose } = {}) {
  const prevFocus = document.activeElement;
  const close = () => {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    onClose?.();
    prevFocus?.focus?.();
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const bodyEl = h('div', { class: 'sheet-body' }, body);
  const footEl = h('div', { class: 'sheet-foot' }, foot);
  const panel = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'sheet-head' },
      h('h2', {}, title),
      h('button', { class: 'icon-btn ghost', 'aria-label': 'Fermer', onclick: close }, icon('x')),
    ),
    bodyEl,
    foot.length ? footEl : null,
  );
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: e => { if (e.target === backdrop) close(); } }, panel);
  document.body.append(backdrop);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => (panel.querySelector('input, textarea, button.btn') || panel.querySelector('button'))?.focus({ preventScroll: true }));
  return { el: panel, body: bodyEl, foot: footEl, close };
}

/** confirm({ title, message, ok: 'Supprimer', danger: true }) → Promise<boolean> */
export function confirmBox({ title, message, ok = 'Confirmer', cancel = 'Annuler', danger = false }) {
  return new Promise(resolve => {
    let answered = false;
    const answer = v => { answered = true; s.close(); resolve(v); };
    const s = sheet({
      title,
      body: [h('p', { class: 'muted', style: { fontSize: '15.5px' } }, message)],
      foot: [
        h('button', { class: 'btn', onclick: () => answer(false) }, cancel),
        h('button', { class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, onclick: () => answer(true) }, ok),
      ],
      onClose: () => { if (!answered) resolve(false); },
    });
  });
}

/** Menu d'actions : menu('Titre', [{ label, emoji, danger, action }]) */
export function menu(title, items) {
  const s = sheet({
    title,
    body: [h('div', { class: 'menu-list' }, items.map(it =>
      h('button', { class: `menu-item${it.danger ? ' danger' : ''}`, onclick: () => { s.close(); it.action(); } },
        h('span', { 'aria-hidden': 'true' }, it.emoji), it.label),
    ))],
  });
  return s;
}
