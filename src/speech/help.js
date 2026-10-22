// Pourquoi la dictée ne marche pas ? Diagnostic + messages clairs, sans jargon.
//
// Chrome renvoie la même erreur « not-allowed » quand l'utilisateur a refusé le micro
// ET quand la page n'a tout simplement pas le droit d'y accéder (fichier ouvert en local,
// aperçu intégré dans une autre app, adresse non sécurisée). On distingue les cas.

const KEYBOARD = 'En attendant, tape ton idée ou utilise le micro 🎤 de ton clavier.';
const KEYBOARD_SHORT = 'Tape, ou utilise le 🎤 du clavier.';

// [court (dans le dock), détaillé (dans le message)]
const MESSAGES = {
  file: [
    '📁 Pas de dictée dans un fichier ouvert en local.',
    "📁 Chrome bloque la dictée quand l'app est ouverte comme simple fichier, même si le micro est autorisé pour Chrome. Pour dicter, utilise la version en ligne ou l'app Android.",
  ],
  frame: [
    "🪟 Pas de dictée dans un aperçu.",
    "🪟 La dictée ne marche pas quand l'app est affichée dans une autre app (aperçu de fichier, Claude…). Ouvre-la directement dans Chrome.",
  ],
  insecure: [
    '🔒 Pas de dictée sans adresse sécurisée.',
    "🔒 La dictée a besoin d'une adresse sécurisée (qui commence par https).",
  ],
  'site-denied': [
    '🔒 Micro bloqué pour ce site.',
    "🔒 Chrome bloque le micro pour ce site. C'est un réglage à part de l'autorisation de l'appli Chrome : touche le cadenas à gauche de l'adresse > Autorisations > Micro > Autoriser, puis « Réessayer ».",
  ],
  'app-denied': [
    '🎤 Micro non autorisé pour Mission Prompt.',
    '🎤 Le micro est refusé pour Mission Prompt. Android : Paramètres > Applications > Mission Prompt > Autorisations > Micro > Autoriser, puis « Réessayer ».',
  ],
  'not-allowed': [
    "🎤 Chrome n'a pas pu utiliser le micro.",
    "🎤 Chrome n'a pas pu utiliser le micro sur cette page. Vérifie le cadenas à gauche de l'adresse > Autorisations > Micro, puis « Réessayer ».",
  ],
  'service-not-allowed': [
    '🎤 Dictée refusée par le navigateur.',
    '🎤 Le navigateur refuse la dictée sur cette page (navigation privée, réglage du navigateur…).',
  ],
  'audio-capture': ['🎤 Aucun micro détecté.', '🎤 Aucun micro détecté, ou il est déjà utilisé par une autre app.'],
  network: ['📶 Pas de connexion pour la dictée.', "📶 Sur cet appareil, la dictée a besoin d'Internet."],
  silence: ['', '⏸️ Je me suis mis en pause : plus rien entendu depuis un moment.'],
  unavailable: ['🎤 Dictée indisponible ici.', "🎤 La dictée n'est pas disponible sur ce navigateur ou cet appareil."],
};

const ALIASES = { unsupported: 'unavailable', 'not-available': 'unavailable', 'no-start': 'unavailable', 'restart-loop': 'unavailable', 'language-not-supported': 'unavailable' };
const pick = code => MESSAGES[code] || MESSAGES[ALIASES[code]] || MESSAGES.unavailable;

/** Message détaillé (affiché quelques secondes). */
export const speechHelp = code => (code === 'silence' ? pick(code)[1] : `${pick(code)[1]} ${KEYBOARD}`);

/** Rappel court, laissé dans le dock en mode texte. */
export const speechHint = code => `${pick(code)[0]} ${KEYBOARD_SHORT}`;

/** Causes qu'on peut corriger sans quitter l'app : on propose « Réessayer ». */
const RETRYABLE = new Set(['site-denied', 'app-denied', 'not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'no-start', 'restart-loop']);
export const canRetry = code => RETRYABLE.has(code);

/** Contexte où une page web ne peut pas utiliser le micro, quoi qu'on autorise. */
export function blockReason(win = globalThis) {
  const proto = win.location?.protocol;
  if (proto === 'file:' || proto === 'content:') return 'file';
  let framed;
  try { framed = win.self !== win.top; } catch { framed = true; }
  if (framed) return 'frame';
  if (win.isSecureContext === false) return 'insecure';
  return null;
}

/** Aperçu intégré qui interdit explicitement le micro : inutile d'essayer. */
export function micForbiddenByFrame(win = globalThis) {
  if (blockReason(win) !== 'frame') return false;
  const policy = win.document?.permissionsPolicy || win.document?.featurePolicy;
  try { return policy?.allowsFeature ? !policy.allowsFeature('microphone') : false; } catch { return false; }
}

/** Transforme le code brut du moteur en vraie cause. */
export async function diagnose(code, { native = false, win = globalThis } = {}) {
  if (native) return code === 'not-allowed' ? 'app-denied' : code;
  if (!['not-allowed', 'service-not-allowed', 'no-start', 'audio-capture'].includes(code)) return code;
  const block = blockReason(win);
  if (block) return block;
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    try {
      // Certains navigateurs ne répondent jamais : on n'attend pas plus d'une seconde.
      const status = await Promise.race([
        win.navigator.permissions.query({ name: 'microphone' }),
        new Promise(resolve => setTimeout(() => resolve({ state: 'unknown' }), 1000)),
      ]);
      if (status.state === 'denied') return 'site-denied';
    } catch { /* API absente : on garde le code d'origine */ }
  }
  return code;
}
