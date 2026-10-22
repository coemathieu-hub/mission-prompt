// Trajectoire en haut du parcours : 7 planètes, la fusée avance de l'une à l'autre.
import { h } from './dom.js';
import { STEPS } from '../data/defaults.js';

const STEP_COUNT = STEPS.length;

/**
 * @param {{ current:number, reached:number, badges:Record<number,'✓'|'!'>, onGo:(n:number)=>void }} opts
 */
export function trajectory(opts) {
  const el = h('nav', { class: 'traj', 'aria-label': 'Étapes de la mission' });
  let state = { ...opts };

  function draw() {
    const W = el.clientWidth, H = el.clientHeight;
    if (!W) return;
    const sx = x => (x / 360 * W).toFixed(1);
    const d = `M${sx(4)} 46 C${sx(50)} 8 ${sx(96)} 10 ${sx(122)} 34 S${sx(196)} 62 ${sx(232)} 32 S${sx(306)} 6 ${sx(356)} 30`;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="track" d="${d}"/><path class="done" d="${d}"/></svg>`;
    const path = el.querySelector('.track');
    const L = path.getTotalLength();
    const at = i => path.getPointAtLength(L * i / (STEP_COUNT - 1));
    el.querySelector('.done').style.strokeDasharray = `${L * (state.current - 1) / (STEP_COUNT - 1)} ${L}`;

    STEPS.forEach((step, i) => {
      const n = i + 1, p = at(i);
      const badge = n !== state.current && n <= state.reached ? state.badges?.[n] : null;
      el.append(h('button', {
        class: `planet${n <= state.reached ? ' reached' : ''}${n === state.current ? ' current' : ''}`,
        style: { left: `${p.x}px`, top: `${p.y}px` },
        'aria-label': `Étape ${n} : ${step.title}${n === state.current ? ' (en cours)' : ''}`,
        'aria-current': n === state.current ? 'step' : null,
        title: step.title,
        dataset: badge ? { badge } : {},
        onclick: () => state.onGo?.(n),
      }, step.emoji));
    });

    // La fusée vole entre la planète précédente et l'actuelle, un peu au-dessus de la trajectoire.
    const len = Math.max(L * (state.current - 1.5) / (STEP_COUNT - 1), 8);
    const a = path.getPointAtLength(len - 1), c = path.getPointAtLength(len + 1), p = path.getPointAtLength(len);
    const norm = Math.hypot(c.x - a.x, c.y - a.y) || 1;
    let nx = -(c.y - a.y) / norm, ny = (c.x - a.x) / norm;
    if (ny > 0) { nx = -nx; ny = -ny; }
    el.append(h('span', {
      class: 'rocket', 'aria-hidden': 'true',
      style: { left: `${p.x + nx * 11}px`, top: `${p.y + ny * 11}px`, '--rot': `${Math.atan2(c.y - a.y, c.x - a.x) * 180 / Math.PI + 45}deg` },
    }, '🚀'));
  }

  const ro = new ResizeObserver(draw);
  ro.observe(el);
  document.fonts?.ready.then(draw);
  return {
    el,
    update(next) { state = { ...state, ...next }; draw(); },
    destroy() { ro.disconnect(); },
  };
}
