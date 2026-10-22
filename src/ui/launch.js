// Fin de parcours : décollage de la fusée + confettis (canvas maison) + message.
import { h, reducedMotion } from './dom.js';

export function confetti(canvas) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, hgt = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = hgt * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const colors = ['#7C3AED', '#06B6D4', '#FB7185', '#FDE68A', '#22C55E', '#A78BFA'];
  const parts = Array.from({ length: 170 }, () => ({
    x: w / 2 + (Math.random() - 0.5) * 60, y: hgt * 0.5,
    vx: (Math.random() - 0.5) * 12, vy: -(Math.random() * 11 + 5), g: 0.2 + Math.random() * 0.12,
    r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.3, s: 5 + Math.random() * 6, ph: Math.random() * 6.3,
    c: colors[(Math.random() * colors.length) | 0], round: Math.random() < 0.3,
  }));
  let f = 0;
  (function frame() {
    ctx.clearRect(0, 0, w, hgt);
    let alive = 0;
    for (const p of parts) {
      p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.ph += 0.14;
      if (p.y < hgt + 20) alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.scale(Math.cos(p.ph), 1);
      ctx.globalAlpha = Math.max(0, 1 - f / 230);
      ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); }
      else ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      ctx.restore();
    }
    if (alive && ++f < 240) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, w, hgt);
  })();
}

/** Affiche l'écran de décollage. actions : [{ label, primary, onClick }] */
export function launchOverlay({ title = 'Mission prête au lancement ! 🎉', message, actions = [] }) {
  const reduced = reducedMotion();
  const canvas = h('canvas', { 'aria-hidden': 'true' });
  const close = () => { el.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const el = h('div', { class: `launch${reduced ? ' reduced' : ''}` },
    canvas,
    h('div', { class: 'lr', 'aria-hidden': 'true' }, h('span', { class: 'em' }, '🚀'), h('i', { class: 'trail' })),
    h('div', { class: 'launch-card glass', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('p', { class: 'big' }, title),
      h('p', { html: message }),
      h('div', { class: 'row' }, actions.map(a => h('button', {
        class: `btn${a.primary ? ' btn-primary' : ''}`, style: { flex: a.primary ? '1' : null },
        onclick: () => { close(); a.onClick?.(); },
      }, a.label))),
    ),
  );
  document.body.append(el);
  document.addEventListener('keydown', onKey);
  if (!reduced) setTimeout(() => confetti(canvas), 850);
  setTimeout(() => el.querySelector('.launch-card .btn')?.focus({ preventScroll: true }), reduced ? 0 : 1700);
  return { close };
}
