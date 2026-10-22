import { h, autosize, textField } from '../../ui/dom.js';
import { DELIVERABLE_TYPES, TARGETS, CONSTRAINT_OPTIONS, CRITERIA_OPTIONS, DESTINATIONS } from '../../data/defaults.js';
import { haptic } from '../../core/platform.js';

const radioGroup = (cls, label, items, isOn, onPick, render) => {
  const group = h('div', { class: cls, role: 'radiogroup', 'aria-label': label });
  const sync = () => group.querySelectorAll('[role="radio"]').forEach(b => b.setAttribute('aria-checked', String(isOn(b.dataset.id))));
  items.forEach(item => group.append(Object.assign(render(item), {
    onclick: () => { onPick(item.id); sync(); haptic(); },
  })));
  items.forEach((item, i) => { group.children[i].dataset.id = item.id; group.children[i].setAttribute('role', 'radio'); });
  sync();
  return group;
};

function checkList(options, selected, onChange) {
  return h('div', { class: 'check-list' }, options.map(o => h('label', { class: 'check-row' },
    h('input', {
      type: 'checkbox', checked: selected.includes(o.id),
      onchange: e => onChange(o.id, e.target.checked),
    }),
    h('span', {}, o.label),
  )));
}

export function stepDeliverable({ m, scroll, save, tip }) {
  const d = m.deliverable;
  const toggleIn = (arr, id, on) => {
    const i = arr.indexOf(id);
    if (on && i < 0) arr.push(id);
    if (!on && i >= 0) arr.splice(i, 1);
    save();
  };
  const other = textField('input', { class: 'input', value: d.typeOther, placeholder: 'Ex : application Python, macro VBA…', 'aria-label': 'Autre type de livrable', oninput: e => { d.typeOther = e.target.value; save(); } });
  const otherWrap = h('div', { hidden: d.type !== 'other' }, other);

  const types = radioGroup('choice-grid', 'Type de livrable', DELIVERABLE_TYPES, id => d.type === id,
    id => { d.type = id; otherWrap.hidden = id !== 'other'; if (id === 'other') other.focus(); save(); },
    t => h('button', { class: 'choice' }, h('span', { class: 'emo', 'aria-hidden': 'true' }, t.emoji), h('b', {}, t.label)));

  const targets = radioGroup('seg', 'Cible', TARGETS, id => d.target === id,
    id => { d.target = id; save(); },
    t => h('button', {}, `${t.emoji} ${t.label}`));

  const area = (value, placeholder, label, set) => {
    const ta = textField('textarea', { class: 'input', rows: 1, value, placeholder, 'aria-label': label, oninput: () => { set(ta.value); save(); } });
    autosize(ta);
    return ta;
  };

  const destinations = radioGroup('choice-grid two', 'Destination du prompt', Object.entries(DESTINATIONS).map(([id, v]) => ({ id, ...v })),
    id => m.destination === id,
    id => { m.destination = id; save(); },
    t => h('button', { class: 'choice' },
      h('span', { class: 'emo', 'aria-hidden': 'true' }, t.emoji), h('b', {}, t.label),
      h('small', {}, t.id === 'code' ? 'Prompt prêt à coller dans Claude Code.' : 'Claude améliore d\'abord ton prompt.')));

  scroll.append(
    h('h1', { class: 'title-xl', tabindex: -1 }, '🎯 Livrable attendu'),
    tip(),
    h('section', { class: 'field' }, h('h2', { class: 'label' }, 'Type de livrable'), types, otherWrap),
    h('section', { class: 'field' }, h('h2', { class: 'label' }, 'Pour quel écran ?'), targets),
    h('section', { class: 'field glass card' },
      h('h2', { class: 'label' }, 'Contraintes'),
      checkList(CONSTRAINT_OPTIONS, d.constraints, (id, on) => toggleIn(d.constraints, id, on)),
      area(d.constraintsOther, 'Autre contrainte (une par ligne)…', 'Autres contraintes', v => { d.constraintsOther = v; }),
    ),
    h('section', { class: 'field glass card' },
      h('h2', { class: 'label' }, 'Critères de réussite ', h('span', { class: 'hint' }, '(optionnel)')),
      checkList(CRITERIA_OPTIONS, d.criteria, (id, on) => toggleIn(d.criteria, id, on)),
      area(d.criteriaOther, 'Autre critère (un par ligne)…', 'Autres critères', v => { d.criteriaOther = v; }),
    ),
    h('section', { class: 'field', 'data-tour': 'destination' }, h('h2', { class: 'label' }, 'Destination du prompt'), destinations),
  );
}
