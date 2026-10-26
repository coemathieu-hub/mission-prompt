import { h, icon, pressGroup, autosize } from '../../ui/dom.js';
import { toast } from '../../ui/overlay.js';
import { launchOverlay } from '../../ui/launch.js';
import { renderMarkdown } from '../../prompt/markdown.js';
import { finalPrompt } from '../../prompt/builder.js';
import { copyText, shareText, saveFile, canShare, haptic } from '../../core/platform.js';
import { alertRow } from '../wizard.js';

export const slug = text => (text || 'mission')
  .toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'mission';

export function stepLaunch({ ctx, m, scroll, bottom, save, tip, goto, onChecks }) {
  const preview = h('div', { class: 'md' });
  const editor = h('textarea', { class: 'md-edit', hidden: true, spellcheck: 'true', lang: 'fr', 'aria-label': 'Prompt final, modifiable' });
  const fitEditor = autosize(editor);
  const resetLink = h('button', { class: 'link-btn', hidden: true, onclick: () => { m.promptOverride = null; save(); refresh(); toast('Prompt régénéré depuis ta mission'); } }, '↺ Revenir au prompt généré');
  const fuel = h('section', { class: 'glass card fuel-card', 'data-tour': 'fuel-card' });

  function refresh() {
    const text = finalPrompt(m);
    preview.innerHTML = renderMarkdown(text);
    if (document.activeElement !== editor) { editor.value = text; fitEditor(); }
    resetLink.hidden = m.promptOverride == null;
  }
  editor.addEventListener('input', () => { m.promptOverride = editor.value; save(); preview.innerHTML = renderMarkdown(editor.value); resetLink.hidden = false; });

  const tabs = h('div', { class: 'prompt-tabs', role: 'group', 'aria-label': 'Affichage du prompt' },
    h('button', { 'aria-pressed': 'true', onclick: e => { pressGroup(tabs, e.currentTarget); editor.hidden = true; preview.hidden = false; refresh(); } }, '👁️ Aperçu'),
    h('button', { 'aria-pressed': 'false', onclick: e => { pressGroup(tabs, e.currentTarget); preview.hidden = true; editor.hidden = false; refresh(); fitEditor(); editor.focus(); } }, '✏️ Modifier'),
  );

  const dest = h('div', { class: 'seg', role: 'group', 'aria-label': 'Destination' },
    [['code', '🤖 Claude Code direct'], ['opt', '✨ Claude optimise']].map(([id, label]) => h('button', {
      'aria-pressed': String(m.destination === id),
      onclick: e => {
        pressGroup(dest, e.currentTarget);
        m.destination = id;
        if (m.promptOverride != null) toast('Ton prompt modifié est conservé. Touche « Revenir au prompt généré » pour l\'appliquer.', { duration: 4500 });
        save(); refresh();
      },
    }, label)));

  function renderFuel(checks) {
    const warn = checks.alerts.filter(a => a.level === 'warn');
    const shown = warn.slice(0, 2);
    fuel.replaceChildren(
      h('div', { class: 'fuel-head' }, h('span', {}, 'Carburant ⛽'), h('b', { class: 'fuel-val' }, `${checks.fuel} %`)),
      h('div', { class: 'gauge', style: { '--v': `${checks.fuel}%` } }),
      h('p', { class: 'fuel-note' }, !warn.length ? 'Le plein est fait ! 🚀' : checks.fuel >= 60 ? 'Presque le plein ! Un conseil de Bip :' : 'Il manque du carburant :'),
      ...shown.map(a => alertRow(a, goto)),
    );
  }
  onChecks(renderFuel);

  const markSent = () => {
    if (m.status !== 'sent') { m.status = 'sent'; save(); }
  };
  async function copy() {
    const ok = await copyText(finalPrompt(m));
    if (!ok) { toast('Copie impossible ici : passe par « Modifier », sélectionne tout et copie.', { duration: 5000 }); return; }
    markSent();
    haptic('double');
    launchOverlay({
      message: 'Prompt copié 📋<br>Colle-le dans Claude Code ou dans Claude.',
      actions: [
        { label: '🏠 Accueil', primary: true, onClick: () => ctx.nav('/') },
        { label: 'Fermer' },
      ],
    });
  }
  async function share() {
    if (await shareText(m.title || 'Prompt', finalPrompt(m))) { markSent(); return; }
    if (!canShare()) { await copyText(finalPrompt(m)); toast('Partage indisponible ici : prompt copié à la place 📋'); markSent(); }
  }
  async function exportMd() {
    const res = await saveFile(`${slug(m.title)}.md`, finalPrompt(m), 'text/markdown');
    if (res !== 'cancelled') { markSent(); if (res === 'downloaded') toast('Fichier .md enregistré dans tes téléchargements 📄'); }
  }
  function keep() {
    if (m.status === 'draft') m.status = 'ready';
    save();
    toast('Mission enregistrée dans le hangar ✅');
    ctx.nav('/');
  }

  scroll.append(
    h('h1', { class: 'title-xl', tabindex: -1 }, '🚀 Lancement'),
    tip(),
    fuel,
    dest,
    h('section', { class: 'glass prompt-card' }, tabs, preview, editor, resetLink),
  );
  bottom.append(
    h('div', { class: 'row' },
      h('button', { class: 'icon-btn lg', 'aria-label': 'Étape précédente', onclick: () => goto(6) }, icon('back')),
      h('button', { class: 'btn btn-primary btn-xl', 'data-tour': 'copy', onclick: copy }, icon('copy'), 'Copier le prompt'),
    ),
    h('div', { class: 'row' },
      h('button', { class: 'btn btn-stack', onclick: share }, icon('share'), 'Partager'),
      h('button', { class: 'btn btn-stack', onclick: exportMd }, icon('download'), 'Exporter'),
      h('button', { class: 'btn btn-stack', onclick: keep }, icon('save'), 'Enregistrer'),
    ),
  );
  refresh();
}
