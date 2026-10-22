// ⚙️ Réglages : glossaire, mots parasites, contraintes par défaut, thème, vibrations, tuto, sauvegarde.
import { h, icon, autosize, textField, pressGroup } from '../ui/dom.js';
import { toast, confirmBox } from '../ui/overlay.js';
import { saveFile, pickFile, setVibrations } from '../core/platform.js';
import { applyTheme } from '../ui/theme.js';
import { createDemoMission } from '../data/demo.js';
import { DEFAULT_GLOSSARY, DEFAULT_FILLERS } from '../data/defaults.js';
import { tabbar, homeButton } from './hangar.js';

export function settingsView(ctx) {
  const { store } = ctx;
  const s = () => store.settings;
  const update = patch => store.updateSettings(patch);

  // ---- Apparence
  const theme = h('div', { class: 'seg', role: 'group', 'aria-label': 'Thème' },
    [['auto', '🌗 Auto'], ['light', '☀️ Clair'], ['dark', '🌙 Sombre']].map(([id, label]) => h('button', {
      'aria-pressed': String(s().theme === id),
      onclick: async e => { pressGroup(theme, e.currentTarget); await update({ theme: id }); applyTheme(id); },
    }, label)));
  const vib = h('label', { class: 'toggle-row' },
    h('span', {}, '📳 Vibrations (micro)'),
    h('input', { type: 'checkbox', class: 'switch', checked: s().vibrations, onchange: async e => { await update({ vibrations: e.target.checked }); setVibrations(e.target.checked); } }),
  );

  // ---- Contraintes par défaut
  const constraintArea = (key, label) => {
    const ta = textField('textarea', {
      class: 'input', rows: 2, value: s().constraints[key], id: `c-${key}`,
      onchange: () => update({ constraints: { ...s().constraints, [key]: ta.value } }),
    });
    autosize(ta);
    return h('div', { class: 'field' }, h('label', { for: `c-${key}` }, label), ta);
  };

  // ---- Glossaire
  const glossaryList = h('div', { class: 'glossary' });
  let glossary = s().glossary.map(g => ({ ...g }));
  const saveGlossary = () => update({ glossary: glossary.filter(g => g.from.trim() && g.to.trim()) });
  function renderGlossary(focusLast = false) {
    glossaryList.replaceChildren(...glossary.map((g, i) => {
      const from = textField('input', { class: 'input', value: g.from, placeholder: 'J\'entends…', 'aria-label': `Forme entendue ${i + 1}`, oninput: e => { g.from = e.target.value; }, onchange: saveGlossary });
      const to = textField('input', { class: 'input', value: g.to, placeholder: 'J\'écris…', 'aria-label': `Forme correcte ${i + 1}`, oninput: e => { g.to = e.target.value; }, onchange: saveGlossary });
      return h('div', { class: 'gloss-row' }, from, h('span', { 'aria-hidden': 'true' }, '→'), to,
        h('button', { class: 'icon-btn ghost', 'aria-label': `Retirer ${g.from || 'cette ligne'}`, onclick: () => { glossary.splice(i, 1); saveGlossary(); renderGlossary(); } }, icon('trash')));
    }));
    if (focusLast) glossaryList.querySelector('.gloss-row:last-child input')?.focus();
  }

  // ---- Mots parasites
  const fillerChips = h('div', { class: 'chips' });
  const fillerInput = textField('input', {
    class: 'input', placeholder: 'Ajouter un mot (ex : genre)', 'aria-label': 'Ajouter un mot parasite', enterkeyhint: 'done',
    onkeydown: e => { if (e.key === 'Enter') { e.preventDefault(); addFiller(); } },
  });
  async function addFiller() {
    const w = fillerInput.value.trim().toLowerCase();
    if (!w || s().fillers.includes(w)) { fillerInput.value = ''; return; }
    await update({ fillers: [...s().fillers, w] });
    fillerInput.value = '';
    renderFillers();
  }
  function renderFillers() {
    fillerChips.replaceChildren(...s().fillers.map(w => h('button', {
      class: 'chip', 'aria-label': `Retirer « ${w} »`,
      onclick: async () => { await update({ fillers: s().fillers.filter(x => x !== w) }); renderFillers(); },
    }, w, h('span', { class: 'x', 'aria-hidden': 'true' }, '×'))));
  }

  // ---- Sauvegarde
  async function exportAll() {
    const name = `mission-prompt-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    const res = await saveFile(name, JSON.stringify(store.exportData(), null, 2), 'application/json');
    if (res === 'downloaded') toast('Sauvegarde enregistrée dans tes téléchargements 💾');
  }
  async function importAll() {
    const file = await pickFile('application/json,.json');
    if (!file) return;
    try {
      const { added, updated } = await store.importData(JSON.parse(await file.text()));
      toast(`Import réussi : ${added} ajoutée${added > 1 ? 's' : ''}, ${updated} mise${updated > 1 ? 's' : ''} à jour ✅`);
      applyTheme(store.settings.theme);
      ctx.nav('/');
    } catch (err) {
      toast(err.message?.includes('Mission Prompt') ? err.message : "Ce fichier n'est pas lisible.", { duration: 5000 });
    }
  }
  async function reset() {
    const ok = await confirmBox({
      title: 'Tout réinitialiser ?',
      message: 'Toutes tes missions et tes réglages seront effacés de cet appareil. Pense à exporter une sauvegarde avant.',
      ok: 'Tout effacer', danger: true,
    });
    if (!ok) return;
    await store.reset();
    applyTheme('auto');
    toast('Application remise à zéro');
    ctx.restart();
  }
  function reloadDemo() {
    const demo = store.list().find(m => m.demo);
    if (demo) { toast('La mission démo est déjà dans ton hangar 🧪'); return; }
    store.save(createDemoMission(s().constraints));
    toast('Mission démo ajoutée au hangar 🧪');
  }

  renderGlossary();
  renderFillers();

  const section = (title, ...children) => h('section', { class: 'glass card' }, h('h2', { class: 'sec-title' }, title), ...children);
  const el = h('div', { class: 'screen settings' },
    h('header', { class: 'app-top' },
      homeButton(ctx),
      h('div', { class: 'step-meta' }, h('strong', {}, '⚙️ Réglages')),
    ),
    h('div', { class: 'scroll' },
      section('🎨 Apparence', theme, vib),
      section('🧭 Contraintes par défaut',
        h('p', { class: 'hint' }, 'Ajoutées au prompt quand tu choisis Pro ou Perso.'),
        constraintArea('pro', '💼 Pro'), constraintArea('perso', '🏠 Perso')),
      section('📖 Glossaire',
        h('p', { class: 'hint' }, 'Ce que la dictée entend → ce que tu veux lire. Appliqué à la relecture.'),
        glossaryList,
        h('div', { class: 'row' },
          h('button', { class: 'btn btn-sm', onclick: () => { glossary.push({ from: '', to: '' }); renderGlossary(true); } }, icon('plus'), 'Ajouter'),
          h('button', { class: 'link-btn', onclick: async () => { glossary = DEFAULT_GLOSSARY.map(g => ({ ...g })); await saveGlossary(); renderGlossary(); toast('Glossaire d\'origine rétabli'); } }, 'Valeurs d\'origine'),
        )),
      section('🧹 Mots parasites',
        h('p', { class: 'hint' }, 'Retirés à la relecture. Touche un mot pour l\'enlever de la liste.'),
        fillerChips,
        h('div', { class: 'input-row' }, fillerInput, h('button', { class: 'icon-btn', 'aria-label': 'Ajouter le mot', onclick: addFiller }, icon('plus'))),
        h('button', { class: 'link-btn', onclick: async () => { await update({ fillers: [...DEFAULT_FILLERS] }); renderFillers(); } }, 'Valeurs d\'origine')),
      section('🎓 Aide',
        h('button', { class: 'btn btn-block', onclick: () => ctx.startTour() }, '🎓 Revoir le tuto'),
        h('button', { class: 'btn btn-block', onclick: reloadDemo }, '🧪 Remettre la mission démo'),
        h('button', { class: 'btn btn-block', onclick: () => ctx.nav('/guide') }, '📖 Ouvrir le guide')),
      section('💾 Sauvegarde',
        h('p', { class: 'hint' }, 'Tes missions restent sur cet appareil. Exporte-les pour les garder ou les passer sur un autre téléphone.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn', style: { flex: 1 }, onclick: exportAll }, icon('download'), 'Exporter'),
          h('button', { class: 'btn', style: { flex: 1 }, onclick: importAll }, icon('upload'), 'Importer'))),
      section('⚠️ Zone sensible',
        h('button', { class: 'btn btn-danger btn-block', onclick: reset }, 'Tout réinitialiser')),
      h('p', { class: 'hint center' }, `Mission Prompt ${__APP_VERSION__} · tout est traité sur cet appareil.`),
    ),
    tabbar(ctx, '/reglages'),
  );
  return { el };
}
