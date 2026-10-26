import { h, icon, autosize, textField, pressGroup } from '../../ui/dom.js';
import { sheet, toast } from '../../ui/overlay.js';
import { SOURCE_KINDS, SOURCE_ROLES } from '../../data/defaults.js';
import { createSource } from '../../core/mission.js';
import { pickFiles } from '../../core/platform.js';
import { readSheetMeta } from '../../files/sheet.js';
import { detectKind } from '../../files/kinds.js';

const kindOf = id => SOURCE_KINDS.find(k => k.id === id) || SOURCE_KINDS.find(k => k.id === 'other');
const isManual = id => !!kindOf(id).manual;

function sheetsSummary(sheets) {
  if (!sheets?.length) return null;
  if (sheets[0].csv) return `Colonnes : ${sheets[0].headers.join(', ') || '—'}`;
  return sheets.map(s => `${s.name} (${s.headers.length} col.)`).join(' · ');
}

/** Source créée à partir d'un fichier : type détecté, onglets et colonnes lus si c'est un tableur. */
async function sourceFromFile(file) {
  const source = { ...createSource(detectKind(file)), name: file.name };
  let readError = false;
  if (source.kind === 'excel') {
    try { source.sheets = await readSheetMeta(file); } catch (err) { console.warn(err); readError = true; }
  }
  return { source, readError };
}

/** Éditeur d'une source (feuille du bas). */
export function editSource(source, { onSave }) {
  const draft = structuredClone(source);
  const nameInput = textField('input', { id: 'src-name', class: 'input', value: draft.name, oninput: () => { draft.name = nameInput.value; } });
  const roleInput = textField('input', { id: 'src-role', class: 'input', value: draft.role, placeholder: 'Ex : données de départ', oninput: () => { draft.role = roleInput.value; syncRoles(); } });
  const desc = textField('textarea', { id: 'src-desc', class: 'input', rows: 2, value: draft.description, placeholder: 'Ce que ça contient, ce que Claude doit en faire…', oninput: () => { draft.description = desc.value; } });
  autosize(desc);
  const fileInfo = h('div', { class: 'file-info' });
  const accessWarn = h('p', { class: 'warn-box' }, '🔒 Ne note jamais de mot de passe ou de clé secrète ici. Décris seulement l\'accès (ex : « compte de test Zeendoc »).');

  // Fichier : type affiché (détecté), possibilité de remplacer le fichier.
  const kindBadge = h('p', { class: 'kind-badge' });
  const replaceBtn = h('button', { class: 'btn btn-sm', onclick: replace }, icon('file'), 'Remplacer le fichier');
  const fileRow = h('div', { class: 'field' }, h('span', { class: 'label' }, 'Type'),
    h('div', { class: 'pick-row' }, kindBadge, replaceBtn), fileInfo);

  // Lien ou accès : choix entre les deux.
  const manualSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Type' },
    SOURCE_KINDS.filter(k => k.manual).map(k => h('button', {
      'aria-pressed': String(draft.kind === k.id), dataset: { kind: k.id },
      onclick: e => { pressGroup(manualSeg, e.currentTarget); draft.kind = k.id; sync(); },
    }, `${k.emoji} ${k.label}`)));
  const manualRow = h('div', { class: 'field' }, h('span', { class: 'label' }, 'Type'), manualSeg);

  const roles = h('div', { class: 'chips' }, SOURCE_ROLES.map(r => h('button', {
    class: 'chip', 'aria-pressed': 'false', dataset: { role: r },
    onclick: () => { draft.role = roleInput.value = r; syncRoles(); },
  }, r)));

  function syncRoles() {
    roles.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.role === draft.role)));
  }
  function sync() {
    const manual = isManual(draft.kind);
    const k = kindOf(draft.kind);
    fileRow.hidden = manual;
    manualRow.hidden = !manual;
    accessWarn.hidden = draft.kind !== 'access';
    kindBadge.textContent = `${k.emoji} ${k.label} · détecté automatiquement`;
    nameInput.placeholder = draft.kind === 'link' ? 'https://…' : draft.kind === 'access' ? 'Ex : compte de test Zeendoc' : 'Ex : frais_2026.xlsx';
    const summary = draft.kind === 'excel' ? sheetsSummary(draft.sheets) : null;
    fileInfo.replaceChildren(...(summary ? [h('p', { class: 'sheet-summary' }, '📊 ', summary)] : []));
  }
  async function replace() {
    const [file] = await pickFiles({ multiple: false });
    if (!file) return;
    replaceBtn.disabled = true;
    const { source: fresh, readError } = await sourceFromFile(file);
    replaceBtn.disabled = false;
    draft.kind = fresh.kind;
    draft.sheets = fresh.sheets;
    draft.name = nameInput.value = fresh.name;
    if (readError) toast("Je n'ai pas pu lire les colonnes de ce fichier. Décris-les dans la description.", { duration: 5000 });
    sync();
  }

  const s = sheet({
    title: source.name ? 'Modifier la source' : 'Nouveau lien ou accès',
    body: [
      fileRow,
      manualRow,
      h('div', { class: 'field' }, h('label', { for: 'src-name' }, draft.kind === 'link' ? 'Adresse ou nom' : 'Nom'), nameInput),
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
  sync();
  syncRoles();
  return s;
}

export function stepSources({ m, scroll, save, tip }) {
  const list = h('div', { class: 'sources' });
  const noneInput = h('input', { type: 'checkbox', class: 'switch', checked: !!m.noSources, onchange: e => { m.noSources = e.target.checked; save(); } });
  const none = h('label', { class: 'toggle-row glass card-row' }, h('span', {}, '🙅 Aucun fichier à fournir'), noneInput);

  function render() {
    list.replaceChildren(...m.sources.map((s, i) => {
      const k = kindOf(s.kind);
      const summary = sheetsSummary(s.sheets);
      return h('article', { class: 'source glass', dataset: { kind: s.kind } },
        h('div', { class: 'm-ico', 'aria-hidden': 'true' }, k.emoji),
        h('div', { class: 'source-main' },
          h('h3', { class: 'm-title' }, s.name || 'Sans nom'),
          h('p', { class: 'm-meta' }, [k.label, s.role].filter(Boolean).join(' · ')),
          s.description && h('p', { class: 'source-desc' }, s.description),
          summary && h('p', { class: 'sheet-summary' }, '📊 ', summary),
          !s.role && !s.description && h('button', { class: 'link-btn source-todo', onclick: () => edit(i) }, '✏️ Préciser son rôle'),
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

  /** Ajoute un ou plusieurs fichiers d'un coup. Même nom = le fichier est mis à jour. */
  async function addFiles(files) {
    if (!files.length) return;
    addBtn.disabled = true;
    const results = await Promise.all(files.map(sourceFromFile));
    addBtn.disabled = false;
    let added = 0, updated = 0;
    for (const { source } of results) {
      const known = m.sources.find(x => !isManual(x.kind) && x.name === source.name);
      if (known) { Object.assign(known, { kind: source.kind, sheets: source.sheets }); updated++; }
      else { m.sources.push(source); added++; }
    }
    m.noSources = false;
    noneInput.checked = false;
    save();
    render();
    const parts = [];
    if (added) parts.push(`${added} fichier${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''}`);
    if (updated) parts.push(`${updated} mis à jour`);
    const unread = results.filter(r => r.readError).length;
    toast(`📎 ${parts.join(', ')}${unread ? ` · ${unread} tableur${unread > 1 ? 's' : ''} illisible${unread > 1 ? 's' : ''}` : ''}. Touche ✏️ pour préciser le rôle.`, { duration: 4500 });
  }

  function addLink() {
    editSource(createSource('link'), { onSave: d => { m.sources.push(d); m.noSources = false; noneInput.checked = false; save(); render(); } });
  }

  const addBtn = h('button', {
    class: 'btn btn-block add-source', 'data-tour': 'add-source',
    onclick: async () => addFiles(await pickFiles({ multiple: true })),
  }, icon('plus'), 'Ajouter des fichiers', h('span', { class: 'drop-hint' }, ' (ou glisse-les ici)'));

  // Glisser-déposer depuis l'ordinateur, n'importe où sur l'étape.
  let depth = 0;
  scroll.addEventListener('dragenter', e => { if (e.dataTransfer?.types?.includes('Files')) { depth++; scroll.classList.add('dropping'); } });
  scroll.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) scroll.classList.remove('dropping'); });
  scroll.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
  scroll.addEventListener('drop', e => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    depth = 0;
    scroll.classList.remove('dropping');
    addFiles([...e.dataTransfer.files]);
  });

  render();
  scroll.append(
    h('h1', { class: 'title-xl', tabindex: -1 }, '📎 Sources & ressources'),
    tip(),
    list,
    addBtn,
    h('p', { class: 'hint center' }, 'Tous types de fichiers, plusieurs à la fois. Lus sur ton appareil, jamais envoyés.'),
    h('button', { class: 'link-btn add-link', onclick: addLink }, '🔗 Ajouter un lien ou un accès'),
    none,
  );
}
