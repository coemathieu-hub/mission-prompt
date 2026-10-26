// « 📲 Installer sur mon téléphone » : icône sur l'écran d'accueil, comme une app.
// Android/Chrome : installation en un geste quand le navigateur la propose (beforeinstallprompt).
// Sinon : instructions adaptées (iPhone, Android, ordinateur, fichier local).
import { h } from './dom.js';
import { sheet, toast } from './overlay.js';
import { platform } from '../core/platform.js';

/** Adresse de la version en ligne (définie au build : VITE_ONLINE_URL). */
export const ONLINE_URL = import.meta.env.VITE_ONLINE_URL || '';

let deferred = null;
let installed = false;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
addEventListener('appinstalled', () => { deferred = null; installed = true; });

export const isInstalled = () => installed || platform.native || platform.standalone
  || !!globalThis.matchMedia?.('(display-mode: standalone)').matches;

function steps() {
  if (platform.file) {
    return [
      "Ici, l'app est ouverte comme simple fichier : impossible de l'installer, et Chrome y bloque le micro.",
      ONLINE_URL
        ? 'Ouvre la version en ligne (bouton ci-dessous) dans Chrome ou Safari, puis touche à nouveau « 📲 Installer ».'
        : "La version en ligne n'est pas encore publiée. Une fois en ligne (voir README, GitHub Pages), ouvre son lien puis touche « 📲 Installer ».",
    ];
  }
  if (platform.ios) {
    return [
      "Ouvre cette page dans Safari (pas dans une autre app).",
      'Touche le bouton Partager : le carré avec une flèche vers le haut ⬆️.',
      'Choisis « Sur l\'écran d\'accueil », puis « Ajouter ».',
      "L'icône 🚀 apparaît. Sur iPhone, utilise le micro 🎤 du clavier pour dicter.",
    ];
  }
  if (platform.android) {
    return [
      'Dans Chrome, touche le menu ⋮ en haut à droite.',
      'Choisis « Installer l\'application » (ou « Ajouter à l\'écran d\'accueil »).',
      'Confirme : l\'icône 🚀 apparaît sur ton écran d\'accueil, avec le micro qui marche.',
    ];
  }
  return [
    "Dans Chrome ou Edge, clique sur l'icône d'installation à droite de la barre d'adresse.",
    'Ou menu ⋮ > « Installer Mission Prompt ».',
  ];
}

export async function installApp() {
  if (isInstalled()) { toast("C'est déjà installé ✅"); return; }
  if (deferred) {
    const ev = deferred;
    deferred = null;
    await ev.prompt();
    const choice = await ev.userChoice.catch(() => null);
    if (choice?.outcome === 'accepted') toast('Installée ! L\'icône 🚀 est sur ton écran d\'accueil.');
    return;
  }
  const s = sheet({
    title: '📲 Installer sur mon téléphone',
    body: [
      h('ol', { class: 'install-steps' }, steps().map(t => h('li', {}, t))),
    ],
    foot: [
      platform.file && ONLINE_URL
        ? h('a', { class: 'btn btn-primary', href: ONLINE_URL, target: '_blank', rel: 'noopener' }, '🌐 Ouvrir la version en ligne')
        : h('button', { class: 'btn btn-primary', onclick: () => s.close() }, "C'est noté"),
    ].filter(Boolean),
  });
}
