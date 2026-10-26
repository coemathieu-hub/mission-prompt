import { h, autosize, textField } from '../../ui/dom.js';
import { micDock } from '../../ui/dock.js';
import { fieldTarget, interimLine } from './fields.js';

export function stepTitle({ ctx, m, screen, scroll, bottom, nav, save, tip, goto }) {
  const input = textField('textarea', {
    id: 'title', class: 'input input-lg', rows: 1, value: m.title, enterkeyhint: 'next',
    placeholder: 'Ex : Outil de suivi des notes de frais',
    oninput: () => { m.title = input.value.replace(/\n/g, ' '); save(); },
    onkeydown: e => { if (e.key === 'Enter') { e.preventDefault(); goto(2); } },
  });
  autosize(input);
  const interim = interimLine();

  scroll.append(
    h('h1', { class: 'title-xl', tabindex: -1 }, '🏷️ Titre du besoin'),
    tip(),
    h('div', { class: 'field' },
      h('label', { for: 'title' }, 'Le titre de ta mission'),
      input,
      interim,
      h('p', { class: 'hint' }, 'Dicte-le avec le gros bouton, ou tape-le ici.'),
    ),
  );

  const dock = micDock(ctx, screen, fieldTarget({
    input, interimEl: interim, label: '🏷️ Titre', hint: 'Touche le micro pour dicter le titre',
    write: text => { m.title = text.replace(/\n/g, ' '); save(); },
  }));
  bottom.append(dock.el, nav);
  return { destroy: () => dock.destroy() };
}
