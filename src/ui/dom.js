// Mini outils DOM (pas de framework).

/**
 * h('button', { class: 'btn', onclick: fn, 'aria-label': 'x' }, 'Texte', enfant…)
 * Props spéciales : class, style (objet ou texte), dataset, html, on<event>.
 */
export function h(tag, props = {}, ...children) {
  const el = tag === 'svg' || tag === 'use'
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.setAttribute('class', value);
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (v == null) continue;
        if (prop.startsWith('--')) el.style.setProperty(prop, v);
        else el.style[prop] = v;
      }
    }
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'html') el.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else if (key === 'value') el.value = value;
    else if (key in el && !key.includes('-') && typeof value !== 'string') el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function icon(name, cls = 'ic') {
  const svg = h('svg', { class: cls, 'aria-hidden': 'true', focusable: 'false' });
  svg.append(h('use', { href: `#i-${name}` }));
  return svg;
}

export function bipFace(cls = 'bip-face') {
  const svg = h('svg', { class: cls, 'aria-hidden': 'true', viewBox: '0 0 64 64' });
  svg.append(h('use', { href: '#bip' }));
  return svg;
}

/** Zone de texte qui s'agrandit avec son contenu. */
export function autosize(textarea) {
  const fit = () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 2 + 'px';
  };
  textarea.addEventListener('input', fit);
  requestAnimationFrame(fit);
  return fit;
}

/** Champ de saisie français : correcteur natif activé. */
export function textField(tag, props = {}) {
  return h(tag, { spellcheck: 'true', lang: 'fr', autocapitalize: 'sentences', autocomplete: 'off', ...props });
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `aujourd'hui ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}

export function pressGroup(group, button, attr = 'aria-pressed') {
  [...group.querySelectorAll(`[${attr}]`)].forEach(b => b.setAttribute(attr, String(b === button)));
}
