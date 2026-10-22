// Fond « mission spatiale » : aurore lente + deux couches d'étoiles en parallaxe.
import { h } from './dom.js';

export function mountSky(root = document.body) {
  const sky = h('div', { class: 'sky', 'aria-hidden': 'true' },
    h('div', { class: 'par p1' }, h('div', { class: 'stars s1' })),
    h('div', { class: 'par p2' }, h('div', { class: 'stars s2' })),
    h('i', { class: 'blob b1' }), h('i', { class: 'blob b2' }), h('i', { class: 'blob b3' }),
  );
  root.prepend(sky);

  let frame = 0;
  const move = (x, y) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      sky.style.setProperty('--px', x.toFixed(3));
      sky.style.setProperty('--py', y.toFixed(3));
    });
  };
  addEventListener('pointermove', e => move(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  return sky;
}
