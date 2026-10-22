import { h, autosize, textField } from '../../ui/dom.js';
import { CONTEXTS } from '../../data/defaults.js';
import { haptic } from '../../core/platform.js';

export function stepContext({ ctx, m, scroll, save, tip }) {
  const defaults = ctx.store.settings.constraints;
  const constraints = textField('textarea', {
    id: 'constraints', class: 'input', rows: 2, value: m.contextConstraints,
    placeholder: 'Ex : charte graphique de l\'entreprise, données traitées en local…',
    oninput: () => { m.contextConstraints = constraints.value; save(); },
  });
  const fit = autosize(constraints);

  const card = (id, sub) => h('button', {
    class: 'choice big', role: 'radio', 'aria-checked': String(m.context === id), dataset: { ctx: id },
    onclick: () => choose(id),
  }, h('span', { class: 'emo', 'aria-hidden': 'true' }, CONTEXTS[id].emoji), h('b', {}, CONTEXTS[id].label), h('small', {}, sub));

  const group = h('div', { class: 'choice-grid two', role: 'radiogroup', 'aria-label': 'Contexte du besoin' },
    card('pro', 'Pour le travail'),
    card('perso', 'Pour moi, à la maison'),
  );
  const constraintsField = h('div', { class: 'field', hidden: !m.context },
    h('label', { for: 'constraints' }, 'Contraintes ajoutées au prompt'),
    constraints,
    h('p', { class: 'hint' }, 'Modifiables ici pour cette mission, ou pour toutes dans ⚙️ Réglages.'),
  );

  function choose(id) {
    const wasDefault = !m.contextConstraints.trim() || Object.values(defaults).includes(m.contextConstraints);
    m.context = id;
    if (wasDefault) constraints.value = m.contextConstraints = defaults[id] || '';
    group.querySelectorAll('.choice').forEach(c => c.setAttribute('aria-checked', String(c.dataset.ctx === id)));
    constraintsField.hidden = false;
    fit();
    haptic();
    save();
  }

  scroll.append(h('h1', { class: 'title-xl', tabindex: -1 }, '🧭 Pro ou Perso ?'), tip(), group, constraintsField);
}
