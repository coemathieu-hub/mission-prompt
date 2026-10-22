// 📖 Guide hors ligne : le parcours en images, la dictée, et une FAQ simple.
import { h } from '../ui/dom.js';
import { FAQ, GUIDE_STEPS } from '../data/help.js';
import { tabbar, homeButton } from './hangar.js';

// Illustrations SVG (dessinées à la main, aucun fichier externe).
const ART_FLOW = `<svg viewBox="0 0 320 90" role="img" aria-label="Tes idées deviennent un prompt, que Claude transforme en livrable">
  <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#7C3AED"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs>
  <g font-family="system-ui" font-size="11" text-anchor="middle" fill="currentColor">
    <circle cx="45" cy="38" r="26" fill="url(#gg)" opacity=".9"/><text x="45" y="45" font-size="22">🎙️</text><text x="45" y="82">Tes idées</text>
    <path d="M80 38h40" stroke="url(#gg)" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>
    <rect x="128" y="12" width="64" height="52" rx="12" fill="url(#gg)" opacity=".9"/><text x="160" y="45" font-size="22">📋</text><text x="160" y="82">Le prompt</text>
    <path d="M200 38h40" stroke="url(#gg)" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>
    <circle cx="275" cy="38" r="26" fill="url(#gg)" opacity=".9"/><text x="275" y="45" font-size="22">🚀</text><text x="275" y="82">Le livrable</text>
  </g></svg>`;

const ART_MIC = `<svg viewBox="0 0 320 96" role="img" aria-label="Les boutons de dictée : supprimer, démarrer ou pause, stop">
  <g font-family="system-ui" font-size="11" text-anchor="middle" fill="currentColor">
    <circle cx="70" cy="40" r="22" fill="none" stroke="#FB7185" stroke-width="2"/><text x="70" y="46" font-size="18">🗑️</text><text x="70" y="88">Supprimer</text>
    <circle cx="160" cy="40" r="34" fill="#7C3AED"/><circle cx="160" cy="40" r="40" fill="none" stroke="#06B6D4" stroke-width="2" opacity=".6"/>
    <text x="160" y="48" font-size="24">🎙️</text><text x="160" y="92">Démarrer · Pause</text>
    <circle cx="250" cy="40" r="22" fill="none" stroke="#22C55E" stroke-width="2"/><text x="250" y="46" font-size="18">⏹️</text><text x="250" y="88">Stop = valider</text>
  </g></svg>`;

export function guideView(ctx) {
  const section = (title, ...children) => h('section', { class: 'glass card guide-sec' }, h('h2', { class: 'sec-title' }, title), ...children);
  const el = h('div', { class: 'screen guide' },
    h('header', { class: 'app-top' },
      homeButton(ctx),
      h('div', { class: 'step-meta' }, h('strong', {}, '📖 Guide')),
    ),
    h('div', { class: 'scroll' },
      section('🚀 À quoi sert Mission Prompt ?',
        h('div', { class: 'art', html: ART_FLOW }),
        h('p', {}, 'Tu dictes ou tapes ton besoin. L\'app le range en prompt clair, que tu colles dans Claude Code ou dans Claude.')),
      section('🪐 Les 7 étapes',
        h('ol', { class: 'guide-steps' }, GUIDE_STEPS.map(([emo, title, text]) =>
          h('li', {}, h('span', { class: 'gs-emo', 'aria-hidden': 'true' }, emo), h('span', {}, h('b', {}, title), ' : ', text))))),
      section('🎙️ Dicter',
        h('div', { class: 'art', html: ART_MIC }),
        h('ul', { class: 'guide-list' },
          h('li', {}, 'La première fois, autorise le micro.'),
          h('li', {}, 'Touche 🎙️ et parle. Le texte gris est provisoire, il devient noir quand c\'est sûr.'),
          h('li', {}, '⏸️ Pause garde ton texte. ▶️ Reprendre continue le même bloc.'),
          h('li', {}, '⏹️ Stop valide le bloc. 🗑️ jette la prise (« Annuler » pendant 5 s).'),
          h('li', {}, 'Dis « virgule », « point », « à la ligne », « nouveau paragraphe »…'))),
      section('❓ Questions fréquentes',
        h('div', { class: 'faq' }, FAQ.map(item => h('details', { class: 'faq-item' },
          h('summary', {}, item.q),
          h('div', { class: 'faq-a' }, item.a.map(p => h('p', {}, p))))))),
      h('button', { class: 'btn btn-block', onclick: () => ctx.startTour() }, '🎓 Revoir le tuto'),
    ),
    tabbar(ctx, '/guide'),
  );
  return { el };
}
