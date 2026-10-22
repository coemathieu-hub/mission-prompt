// Valeurs par défaut et listes de choix. Tout est éditable dans les Réglages ou au fil des étapes.

export const DEFAULT_GLOSSARY = [
  { from: 'cloud code', to: 'Claude Code' },
  { from: 'clode code', to: 'Claude Code' },
  { from: 'zendoc', to: 'Zeendoc' },
  { from: 'zeen doc', to: 'Zeendoc' },
  { from: 'excel', to: 'Excel' },
  { from: 'html', to: 'HTML' },
  { from: 'pdf', to: 'PDF' },
  { from: 'power point', to: 'PowerPoint' },
  { from: 'csv', to: 'CSV' },
  { from: 'json', to: 'JSON' },
];

export const DEFAULT_FILLERS = ['euh', 'heu', 'bah', 'ben', 'hum', 'hmm', 'hein'];

export const DEFAULT_CONSTRAINTS = {
  pro: 'Charte graphique AXGROUP, données clients traitées 100 % en local.',
  perso: 'Usage personnel : interface simple, rapide à prendre en main.',
};

export const DEFAULT_SETTINGS = {
  glossary: DEFAULT_GLOSSARY,
  fillers: DEFAULT_FILLERS,
  constraints: DEFAULT_CONSTRAINTS,
  theme: 'auto',
  vibrations: true,
  tutorialDone: false,
  demoSeeded: false,
};

export const CONTEXTS = {
  pro: { emoji: '💼', label: 'Pro' },
  perso: { emoji: '🏠', label: 'Perso' },
};

export const SOURCE_KINDS = [
  { id: 'pdf', emoji: '📄', label: 'PDF', accept: '.pdf,application/pdf' },
  { id: 'image', emoji: '🖼️', label: 'Image', accept: 'image/jpeg,image/png,.jpg,.jpeg,.png' },
  { id: 'excel', emoji: '📊', label: 'Excel / CSV', accept: '.xlsx,.xlsm,.xls,.csv,text/csv' },
  { id: 'word', emoji: '📝', label: 'Word', accept: '.doc,.docx' },
  { id: 'ppt', emoji: '📽️', label: 'PowerPoint', accept: '.ppt,.pptx' },
  { id: 'link', emoji: '🔗', label: 'Lien web' },
  { id: 'access', emoji: '🔑', label: 'Accès / connexion' },
  { id: 'other', emoji: '📦', label: 'Autre', accept: '' },
];

export const SOURCE_ROLES = [
  'Données de départ',
  'Modèle à reproduire',
  'Exemple à suivre',
  'Logo / charte graphique',
  'Documentation',
];

export const DELIVERABLE_TYPES = [
  { id: 'html', emoji: '🌐', label: 'HTML autonome', prompt: 'HTML autonome (un seul fichier .html)' },
  { id: 'excel', emoji: '📊', label: 'Excel', prompt: 'fichier Excel (.xlsx)' },
  { id: 'ppt', emoji: '📽️', label: 'PowerPoint', prompt: 'présentation PowerPoint (.pptx)' },
  { id: 'pdf', emoji: '📄', label: 'PDF', prompt: 'document PDF' },
  { id: 'script', emoji: '⚙️', label: 'Script', prompt: 'script' },
  { id: 'other', emoji: '✨', label: 'Autre', prompt: '' },
];

export const TARGETS = [
  { id: 'mobile', emoji: '📱', label: 'Mobile', prompt: 'mobile' },
  { id: 'desktop', emoji: '💻', label: 'Ordinateur', prompt: 'ordinateur' },
  { id: 'both', emoji: '🔁', label: 'Les deux', prompt: 'mobile et ordinateur' },
];

export const CONSTRAINT_OPTIONS = [
  { id: 'offline', label: 'Fonctionne hors ligne', prompt: 'fonctionne hors ligne' },
  { id: 'brand', label: 'Respecte la charte graphique', prompt: 'respecte la charte graphique' },
  { id: 'fr', label: 'En français', prompt: 'en français' },
  { id: 'local', label: 'Aucune donnée envoyée sur Internet', prompt: 'aucune donnée envoyée sur Internet' },
  { id: 'nolib', label: 'Sans installation', prompt: 'aucune installation nécessaire' },
];

export const CRITERIA_OPTIONS = [
  { id: 'open', label: "S'ouvre d'un double-clic, sans rien installer" },
  { id: 'offline', label: 'Marche sans connexion Internet' },
  { id: 'phone', label: 'Lisible et utilisable sur téléphone' },
  { id: 'calc', label: 'Les calculs sont justes' },
  { id: 'errors', label: "Aucun message d'erreur à l'usage" },
  { id: 'print', label: 'Imprimable proprement' },
];

export const DESTINATIONS = {
  code: { emoji: '🤖', label: 'Claude Code direct' },
  opt: { emoji: '✨', label: 'Claude pour optimiser' },
};

export const STEPS = [
  { n: 1, emoji: '🏷️', title: 'Titre' },
  { n: 2, emoji: '🧭', title: 'Pro ou Perso' },
  { n: 3, emoji: '💡', title: 'Le besoin' },
  { n: 4, emoji: '📎', title: 'Sources' },
  { n: 5, emoji: '🎯', title: 'Livrable' },
  { n: 6, emoji: '🧹', title: 'Relecture' },
  { n: 7, emoji: '🚀', title: 'Lancement' },
];

export const STATUSES = {
  draft: { emoji: '📝', label: 'Brouillon' },
  ready: { emoji: '✅', label: 'Prête' },
  sent: { emoji: '📤', label: 'Envoyée' },
};
