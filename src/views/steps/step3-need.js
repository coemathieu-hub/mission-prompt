import { h, icon, autosize, textField } from '../../ui/dom.js';
import { micDock } from '../../ui/dock.js';
import { ideasList } from '../../ui/ideas.js';
import { fieldTarget, interimLine } from './fields.js';
import { createIdea } from '../../core/mission.js';

export function stepNeed({ ctx, m, screen, scroll, bottom, nav, save, tip }) {
  // Une prise interrompue (app fermée en pleine dictée) devient un bloc : rien ne se perd.
  if (m.liveTake?.trim()) {
    m.ideas.push(createIdea(m.liveTake.trim()));
    m.liveTake = null;
    save();
  }

  const goal = textField('textarea', {
    id: 'goal', class: 'input', rows: 1, value: m.goal,
    placeholder: 'Ex : suivre mes notes de frais et sortir un total par catégorie',
    oninput: () => { m.goal = goal.value; save(); },
  });
  autosize(goal);
  const goalInterim = interimLine();
  const ideas = ideasList({ m, save });

  const goalTarget = fieldTarget({
    input: goal, interimEl: goalInterim, label: "🎯 L'objectif", hint: '',
    write: text => { m.goal = text; save(); },
  });
  const ideaTarget = {
    label: '💡 Nouvelle idée',
    hint: 'Touche le micro pour dicter une idée',
    begin() { return ''; },
    live(v) {
      if (v.state === 'idle') { ideas.setLive(null); return; }
      ideas.setLive(v);
      m.liveTake = [v.final, v.interim].filter(Boolean).join(' ');
      save();
      ideas.scrollToLive();
    },
    commit(text) {
      ideas.setLive(null);
      m.liveTake = null;
      if (text.trim()) ideas.add(text.trim());
      else save();
    },
    discard() { ideas.setLive(null); m.liveTake = null; save(); },
    restore(text) { ideas.setLive({ state: 'pause', final: text, interim: '' }); },
    focus() { ideas.add('', { focus: true }); },
  };

  const dock = micDock(ctx, screen, ideaTarget);
  const goalMic = h('button', {
    class: 'mini-mic', 'aria-label': "Dicter l'objectif",
    onclick: async () => { await dock.toggle(goalTarget); goalMic.classList.toggle('on', dock.isTarget(goalTarget)); },
  }, icon('mic'));
  const syncGoalMic = () => goalMic.classList.toggle('on', dock.isTarget(goalTarget));
  const observer = new MutationObserver(syncGoalMic);
  observer.observe(screen, { attributes: true, attributeFilter: ['data-mic'] });

  scroll.append(
    h('h1', { class: 'title-xl', tabindex: -1 }, '💡 Le besoin'),
    tip(),
    h('div', { class: 'field' },
      h('label', { for: 'goal' }, "🎯 L'objectif en une phrase"),
      h('div', { class: 'input-row' }, goal, ctx.speechOff ? null : goalMic),
      goalInterim,
    ),
    h('div', { class: 'ideas-head' }, h('h2', { class: 'sec-title' }, 'Idées ', ideas.count)),
    ideas.el,
    h('button', { class: 'add-idea', onclick: () => ideas.add('', { focus: true }) }, icon('plus'), 'Ajouter une idée au clavier'),
  );
  bottom.append(dock.el, nav);

  return {
    destroy() {
      observer.disconnect();
      dock.destroy();
    },
  };
}
