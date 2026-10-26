// 🛸 Hangar : liste des missions, recherche, filtres, actions.
import { h, icon, bipFace, formatDate, pressGroup } from '../ui/dom.js';
import { toast, menu, confirmBox } from '../ui/overlay.js';
import { createMission } from '../core/mission.js';
import { checkMission } from '../text/checker.js';
import { CONTEXTS, STATUSES } from '../data/defaults.js';
import { BIP_TIPS } from '../data/help.js';
import { normalize } from '../text/words.js';
import { installApp, isInstalled } from '../ui/install.js';

const FILTERS = [
  ['all', 'Toutes'], ['pro', '💼 Pro'], ['perso', '🏠 Perso'],
  ['draft', '📝 Brouillon'], ['ready', '✅ Prête'], ['sent', '📤 Envoyée'],
];

/** Bouton « Accueil » présent en haut de chaque écran (sauf l'accueil lui-même). */
export function homeButton(ctx) {
  return h('button', {
    class: 'icon-btn home-btn', 'aria-label': "Retour à l'accueil", title: 'Accueil', 'data-tour': 'home',
    onclick: () => ctx.nav('/'),
  }, icon('home'));
}

export function tabbar(ctx, current) {
  const tab = (path, emoji, label) => h('button', {
    'aria-current': current === path ? 'page' : null, onclick: () => ctx.nav(path), 'data-tour': `tab-${label.toLowerCase()}`,
  }, h('span', { 'aria-hidden': 'true' }, emoji), label);
  return h('nav', { class: 'tabbar', 'aria-label': 'Navigation principale' },
    tab('/', '🛸', 'Hangar'), tab('/guide', '📖', 'Guide'), tab('/reglages', '⚙️', 'Réglages'));
}

export function hangarView(ctx) {
  const { store } = ctx;
  let filter = ctx.hangarFilter || 'all';
  let query = '';

  const list = h('div', { class: 'missions' });
  const count = h('span', { class: 'count' }, '0');
  const search = h('input', {
    type: 'search', placeholder: 'Rechercher une mission', 'aria-label': 'Rechercher une mission',
    spellcheck: 'true', lang: 'fr', enterkeyhint: 'search',
    oninput: e => { query = normalize(e.target.value); render(); },
  });
  const chips = h('div', { class: 'chips scroll-x', role: 'group', 'aria-label': 'Filtres' },
    FILTERS.map(([id, label]) => h('button', {
      class: 'chip', 'aria-pressed': String(filter === id),
      onclick: e => { filter = ctx.hangarFilter = id; pressGroup(chips, e.currentTarget); render(); },
    }, label)));

  const matches = m => {
    if (filter === 'pro' || filter === 'perso') { if (m.context !== filter) return false; }
    else if (filter !== 'all' && m.status !== filter) return false;
    if (!query) return true;
    return normalize([m.title, m.goal, ...m.ideas.map(i => i.text)].join(' ')).includes(query);
  };

  const open = m => ctx.nav(`/m/${m.id}/${m.lastStep || 1}`);

  async function remove(m) {
    if (!m.demo) {
      const ok = await confirmBox({
        title: 'Supprimer la mission ?',
        message: `« ${m.title || 'Mission sans titre'} » sera supprimée de cet appareil.`,
        ok: 'Supprimer', danger: true,
      });
      if (!ok) return;
    }
    const copy = structuredClone(m);
    await store.remove(m.id);
    render();
    toast(m.demo ? 'Mission démo supprimée' : 'Mission supprimée', { undo: async () => { await store.restore(copy); render(); } });
  }

  function actions(m) {
    menu(m.title || 'Mission sans titre', [
      { emoji: '✏️', label: 'Rouvrir', action: () => open(m) },
      { emoji: '📄', label: 'Dupliquer', action: () => { store.duplicate(m.id); render(); toast('Mission dupliquée'); } },
      { emoji: '🗑️', label: 'Supprimer', danger: true, action: () => remove(m) },
    ]);
  }

  function card(m) {
    const fuel = checkMission(m).fuel;
    const st = STATUSES[m.status] || STATUSES.draft;
    return h('article', { class: `mission glass${m.demo ? ' demo' : ''}` },
      h('button', { class: 'mission-open', onclick: () => open(m), 'aria-label': `Ouvrir ${m.title || 'Mission sans titre'}` },
        h('span', { class: 'm-ico', 'aria-hidden': 'true' }, m.demo ? '🧪' : CONTEXTS[m.context]?.emoji || '🚀'),
        h('span', { class: 'm-main' },
          h('span', { class: 'm-title' }, m.demo ? `Mission démo · ${m.title}` : m.title || 'Mission sans titre'),
          h('span', { class: 'm-meta' },
            m.demo ? h('span', { class: 'status st-demo' }, "🧪 Pour t'entraîner") : h('span', { class: `status st-${m.status}` }, `${st.emoji} ${st.label}`),
            m.context && h('span', {}, `${CONTEXTS[m.context].emoji} ${CONTEXTS[m.context].label}`),
            h('span', {}, formatDate(m.updatedAt)),
            h('span', { class: 'gauge', style: { '--v': `${fuel}%` }, 'aria-hidden': 'true' }),
            h('span', { class: 'sr-only' }, `Carburant ${fuel} %`),
            h('span', { 'aria-hidden': 'true' }, `${fuel} %`),
          ),
        ),
      ),
      m.demo
        ? h('button', { class: 'icon-btn ghost', 'aria-label': 'Supprimer la mission démo', 'data-tour': 'demo-delete', onclick: () => remove(m) }, icon('trash'))
        : h('button', { class: 'icon-btn ghost', 'aria-label': `Actions pour ${m.title || 'cette mission'}`, onclick: () => actions(m) }, icon('more')),
    );
  }

  function render() {
    const all = store.list();
    const shown = all.filter(matches);
    count.textContent = String(all.length);
    if (!all.length) {
      list.replaceChildren(h('div', { class: 'empty glass card' },
        h('p', { class: 'empty-emo', 'aria-hidden': 'true' }, '🛸'),
        h('p', {}, 'Ton hangar est vide. Lance ta première mission !'),
      ));
    } else if (!shown.length) {
      list.replaceChildren(h('p', { class: 'muted empty-line' }, 'Aucune mission ne correspond. Essaie un autre filtre.'));
    } else {
      list.replaceChildren(...shown.map(card));
    }
  }

  function create() {
    const m = createMission();
    store.save(m);
    ctx.nav(`/m/${m.id}/1`);
  }

  const off = store.subscribe(what => { if (what !== 'save') render(); });
  render();

  const tipText = BIP_TIPS.hangar[store.list().length > 3 ? 1 : 0];
  const el = h('div', { class: 'screen hangar' },
    h('header', { class: 'app-top' },
      h('svg', { class: 'logo', 'aria-hidden': 'true', viewBox: '0 0 64 64', html: '<use href="#logo"/>' }),
      h('div', { class: 'brand', 'data-tour': 'brand' }, h('strong', {}, 'Mission Prompt'), h('small', {}, 'Tes idées → un prompt clair')),
      !isInstalled() && h('button', { class: 'icon-btn', 'aria-label': 'Installer sur mon téléphone', 'data-tour': 'install', onclick: installApp }, '📲'),
      h('button', { class: 'icon-btn', 'aria-label': 'Aide', onclick: () => ctx.nav('/guide') }, '❓'),
    ),
    h('div', { class: 'scroll' },
      h('div', { class: 'bip' }, bipFace(), h('p', { class: 'bubble glass', html: tipText })),
      h('label', { class: 'search glass' }, icon('search'), search),
      chips,
      h('h2', { class: 'sec-title' }, '🛸 Hangar ', count),
      list,
    ),
    h('div', { class: 'bottom bottom-tight' },
      h('button', { class: 'btn btn-primary btn-xl', 'data-tour': 'new', onclick: create }, '🚀 Nouvelle mission'),
    ),
    tabbar(ctx, '/'),
  );
  return { el, destroy: off };
}
