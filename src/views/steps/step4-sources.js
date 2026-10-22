import { h, icon, autosize, textField } from '../../ui/dom.js';
import { sheet, toast } from '../../ui/overlay.js';
import { SOURCE_KINDS, SOURCE_ROLES } from '../../data/defaults.js';
import { createSource } from '../../core/mission.js';
import { pickFile } from '../../core/platform.js';
import { readSheetMeta } from '../../files/sheet.js';

const kindOf = id => SOURCE_KINDS.find(k => k.id === id) || SOURCE_KINDS.at(-1);

function sheetsSummary(sheets) {
  if (!sheets?.length) return null;
  if (sheets[0].csv) return `Colonnes : ${sheets[0].headers.join(', ') || '—'}`;
  return sheets.map(s => `${s.name} (${s.headers.length} col.)`).join(' · ');
}

/** Éditeur d'une source (feuille du bas). */
export function editSource(source, { onSave }) {
  const draft = structuredClone(source);
  const nameInput = textField('input', { id: 'src-name', class: 'input', value: draft.name, placeholder: 'Ex : frais_2026.xlsx', oninput: () => { draft.name = nameInput.value; } });
  const roleInput = textField('input', { id: 'src-role', class: 'input', value: draft.role, placeholder: 'Ex : données de départ', oninput: () => { draft.role = roleInput.value; syncRoles(); } });
  const desc = textField('textarea', { id: 'src-desc', class: 'input', rows: 2, value: draft.description, placeholder: 'Ce que contient le fichier, ce que Claude doit en faire…', oninput: () => { draft.description = desc.value; } });
  autosize(desc);
  const fileInfo = h('div', { class: 'file-info' });
  const accessWarn = h('p', { class: 'warn-box' }, '🔒 Ne note jamais de mot de passe ou de clé secrète ici. Décris seulement l\'accès (ex : « compte de test Zeendoc »).');
  const pickBtn = h('button', { class: 'btn btn-sm', onclick: choose }, icon('file'), 'Choisir le fichier');
  const pickRow = h('div', { class: 'pick-row' }, pickBtn, h('span', { class: 'hint' }, 'Lu sur ton appareil, jamais envoyé.'));

  const kinds = h('div', { class: 'kind-grid', role: 'radiogroup', 'aria-label': 'Type de source' },
    SOURCE_KINDS.map(k => h('button', {
      class: 'kind', role: 'radio', 'aria-checked': String(draft.kind === k.id), dataset: { kind: k.id },
      onclick: () => { draft.kind = k.id; syncKind(); },
    }, h('span', { class: 'emo', 'aria-hidden': 'true' }, k.emoji), k.label)));

  const roles = h('div', { class: 'chips' }, SOURCE_ROLES.map(r => h('button', {
    class: 'chip', 'aria-pressed': 'false', dataset: { role: r },
    onclick: () => { draft.role = roleInput.value = r; syncRoles(); },
  }, r)));

  function syncRoles() {
    roles.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.role === draft.role)));
  }
  function syncKind() {
    kinds.querySelectorAll('.kind').forEach(c => c.setAttribute('aria-checked', String(c.dataset.kind === draft.kind)));
    const k = kindOf(draft.kind);
    pickRow.hidden = k.accept === undefined;
    accessWarn.hidden = draft.kind !== 'access';
    nameInput.placeholder = draft.kind === 'link' ? 'https://…' : draft.kind === 'access' ? 'Ex : compte de test Zeendoc' : 'Ex : frais_2026.xlsx';
    if (draft.kind !== 'excel') draft.sheets = [];
    renderFileInfo();
  }
  function renderFileInfo() {
    const summary = draft.kind === 'excel' ? sheetsSummary(draft.sheets) : null;
    fileInfo.replaceChildren(...(summary ? [h('p', { class: 'sheet-summary' }, '📊 ', summary)] : []));
  }
  async function choose() {
    const file = await pickFile(kindOf(draft.kind).accept);
    if (!file) return;
    draft.name = nameInput.value = file.name;
    if (draft.kind === 'excel') {
      pickBtn.disabled = true;
      fileInfo.replaceChildren(h('p', { class: 'hint' }, '⏳ Je lis les onglets et les colonnes…'));
      try {
        draft.sheets = await readSheetMeta(file);
      } catch (err) {
        console.warn(err);
        draft.sheets = [];
        toast("Je n'ai pas pu lire ce fichier. Décris ses colonnes dans la description.", { duration: 5000 });
      }
      pickBtn.disabled = false;
      renderFileInfo();
    }
  }

  const s = sheet({
    title: source.name ? 'Modifier la source' : 'Nouvelle source',
    body: [
      h('div', { class: 'field' }, h('span', { class: 'label' }, 'Type'), kinds),
      pickRow,
      fileInfo,
      h('div', { class: 'field' }, h('label', { for: 'src-name' }, 'Nom'), nameInput),
      accessWarn,
      h('div', { class: 'field' }, h('label', { for: 'src-role' }, 'Rôle dans le projet'), roles, roleInput),
      h('div', { class: 'field' }, h('label', { for: 'src-desc' }, 'Description'), desc),
    ],
    foot: [
      h('button', { class: 'btn', onclick: () => s.close() }, 'Annuler'),
      h('button', { class: 'btn btn-primary', 'data-tour': 'source-save', onclick: () => {
        if (!draft.name.trim()) { nameInput.focus(); toast('Donne un nom à la source.'); return; }
        onSave(draft);
        s.close();
      } }, icon('check'), 'Enregistrer'),
    ],
  });
  syncKind();
  syncRoles();
  return s;
}

export function stepSources({ m, scroll, save, tip }) {
  const list = h('div', { class: 'sources' });
  const none = h('label', { class: 'toggle-row glass card-row' },
    h('span', {}, '🙅 Aucun fichier à fournir'),
    h('input', { type: 'checkbox', class: 'switch', checked: !!m.noSources, onchange: e => { m.noSources = e.target.checked; save(); } }),
  );

  function render() {
    list.replaceChildren(...m.sources.map((s, i) => {
      const k = kindOf(s.kind);
      const summary = sheetsSummary(s.sheets);
      return h('article', { class: 'source glass' },
        h('div', { class: 'm-ico', 'aria-hidden': 'true' }, k.emoji),
        h('div', { class: 'source-main' },
          h('h3', { class: 'm-title' }, s.name || 'Sans nom'),
          h('p', { class: 'm-meta' }, [k.label, s.role].filter(Boolean).join(' · ')),
          s.description && h('p', { class: 'source-desc' }, s.description),
          summary && h('p', { class: 'sheet-summary' }, '📊 ', summary),
        ),
        h('div', { class: 'source-acts' },
          h('button', { class: 'icon-btn ghost', 'aria-label': `Modifier ${s.name}`, onclick: () => edit(i) }, icon('edit')),
          h('button', { class: 'icon-btn ghost', 'aria-label': `Supprimer ${s.name}`, onclick: () => remove(i) }, icon('trash')),
        ),
      );
    }));
    none.hidden = m.sources.length > 0;
  }
  function edit(i) {
    editSource(m.sources[i], { onSave: d => { m.sources[i] = d; save(); render(); } });
  }
  function remove(i) {
    const [s] = m.sources.splice(i, 1);
    save(); render();
    toast('Source supprimée', { undo: () => { m.sources.splice(i, 0, s); save(); render(); } });
  }
  function add() {
    editSource(createSource('excel'), { onSave: d => { m.sources.push(d); m.noSources = false; none.querySelector('input').checked = false; save(); render(); } });
  }

  render();
  scroll.append(
    h('h1', { class: 'title-xl', tabindex: -1 }, '📎 Sources & ressources'),
    tip(),
    list,
    h('button', { class: 'btn btn-block add-source', 'data-tour': 'add-source', onclick: add }, icon('plus'), 'Ajouter une source'),
    none,
  );
}
