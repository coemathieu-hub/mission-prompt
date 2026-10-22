// Liste des blocs d'idées : édition en place, ↑↓, glisser-déposer tactile, suppression avec « Annuler ».
import { h, icon, autosize, textField, reducedMotion } from './dom.js';
import { toast } from './overlay.js';
import { createIdea } from '../core/mission.js';
import { haptic } from '../core/platform.js';

export function ideasList({ m, save }) {
  const list = h('div', { class: 'ideas', 'data-tour': 'ideas' });
  const count = h('span', { class: 'count' }, '0');
  const live = h('article', { class: 'idea glass live', hidden: true },
    h('div', { class: 'grip' }, icon('grip')),
    h('div', { class: 'idea-body' },
      h('div', { class: 'live-tag' }, h('i', { class: 'dot' }), h('span', { class: 'live-label' }, "J'écoute…")),
      h('div', { class: 'idea-text live-text', 'aria-live': 'polite' },
        h('span', { class: 'final' }), h('span', { class: 'interim' }), h('i', { class: 'caret' })),
    ),
  );

  function card(idea, index) {
    const ta = textField('textarea', {
      class: 'idea-text', rows: 1, value: idea.text, 'aria-label': `Idée ${index + 1}`, placeholder: 'Écris ton idée…',
      oninput: () => { idea.text = ta.value; save(); },
    });
    autosize(ta);
    const el = h('article', { class: 'idea glass', dataset: { id: idea.id } },
      h('div', { class: 'grip', title: 'Glisser pour déplacer', 'aria-hidden': 'true', onpointerdown: e => startDrag(e, el) }, icon('grip')),
      h('div', { class: 'idea-body' },
        ta,
        h('div', { class: 'idea-foot' },
          h('span', { class: 'num' }, `IDÉE ${index + 1}`),
          h('span', { class: 'acts' },
            h('button', { class: 'ia', 'aria-label': `Monter l'idée ${index + 1}`, onclick: () => move(idea.id, -1) }, icon('up')),
            h('button', { class: 'ia', 'aria-label': `Descendre l'idée ${index + 1}`, onclick: () => move(idea.id, 1) }, icon('down')),
            h('button', { class: 'ia danger', 'aria-label': `Supprimer l'idée ${index + 1}`, onclick: () => remove(idea.id) }, icon('trash')),
          ),
        ),
      ),
    );
    return el;
  }

  function render(focusId) {
    list.replaceChildren(...m.ideas.map(card), live);
    count.textContent = String(m.ideas.length);
    if (focusId) list.querySelector(`[data-id="${focusId}"] textarea`)?.focus();
  }

  function move(id, dir) {
    const i = m.ideas.findIndex(x => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= m.ideas.length) return;
    [m.ideas[i], m.ideas[j]] = [m.ideas[j], m.ideas[i]];
    save();
    render();
    const el = list.querySelector(`[data-id="${id}"]`);
    if (!reducedMotion()) el?.animate([{ transform: `translateY(${-dir * 24}px)` }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
    el?.querySelectorAll('.ia')[dir < 0 ? 0 : 1]?.focus();
  }

  function remove(id) {
    const i = m.ideas.findIndex(x => x.id === id);
    if (i < 0) return;
    const [idea] = m.ideas.splice(i, 1);
    save();
    render();
    toast('Idée supprimée', { undo: () => { m.ideas.splice(Math.min(i, m.ideas.length), 0, idea); save(); render(); } });
  }

  // ---------- Glisser-déposer (souris et doigt) ----------
  function startDrag(e, el) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const scroller = list.closest('.scroll');
    const rect = el.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const ph = h('div', { class: 'idea-ph', style: { height: `${rect.height}px` } });
    el.after(ph);
    Object.assign(el.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, zIndex: 50 });
    el.classList.add('dragging');
    let y = e.clientY, raf = 0, lastIndex = -1;
    haptic();

    const place = () => {
      el.style.top = `${y - offset}px`;
      const siblings = [...list.querySelectorAll('.idea:not(.dragging):not(.live)')];
      let before = null;
      for (const s of siblings) {
        const r = s.getBoundingClientRect();
        if (y < r.top + r.height / 2) { before = s; break; }
      }
      const index = before ? siblings.indexOf(before) : siblings.length;
      if (index !== lastIndex) {
        lastIndex = index;
        if (before) before.before(ph); else live.before(ph);
      }
    };
    const autoScroll = () => {
      const r = scroller.getBoundingClientRect();
      if (y < r.top + 60) scroller.scrollTop -= 10;
      else if (y > r.bottom - 60) scroller.scrollTop += 10;
      place();
      raf = requestAnimationFrame(autoScroll);
    };
    const onMove = ev => { y = ev.clientY; };
    const onUp = () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp);
      ph.replaceWith(el);
      el.removeAttribute('style');
      el.classList.remove('dragging');
      const order = [...list.querySelectorAll('.idea:not(.live)')].map(x => x.dataset.id);
      const before = m.ideas.map(x => x.id).join();
      m.ideas.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      if (m.ideas.map(x => x.id).join() !== before) { save(); haptic(); }
      render();
    };
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
    raf = requestAnimationFrame(autoScroll);
  }

  render();

  return {
    el: list,
    count,
    render,
    add(text = '', { focus = false } = {}) {
      const idea = createIdea(text);
      m.ideas.push(idea);
      save();
      render(focus ? idea.id : null);
      return idea;
    },
    /** Bloc « en cours d'écoute » (null pour le cacher). */
    setLive(view) {
      if (!view) { live.hidden = true; return; }
      live.hidden = false;
      live.dataset.mic = view.state;
      live.querySelector('.final').textContent = view.final ? view.final + (view.interim ? ' ' : '') : '';
      live.querySelector('.interim').textContent = view.interim;
      live.querySelector('.live-label').textContent = view.state === 'pause'
        ? 'En pause · touche Reprendre pour continuer'
        : view.state === 'stopping' ? 'Je finis d\'écrire…' : "J'écoute…";
    },
    scrollToLive() { live.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); },
  };
}
