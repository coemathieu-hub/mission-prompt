// Petits utilitaires texte partagés (comptage, phrases, normalisation).

const WORD = /[\p{L}\p{N}]/u;

export function countWords(text = '') {
  return text.split(/\s+/).filter(w => WORD.test(w)).length;
}

/** Découpe en phrases (fin : . ! ? … ou retour à la ligne). */
export function splitSentences(text = '') {
  return text
    .split(/(?<=[.!?…])\s+|\n+/u)
    .map(s => s.trim())
    .filter(s => WORD.test(s));
}

/** Minuscules, sans accents ni ponctuation : pour comparer deux textes. */
export function normalize(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Frontières de mot compatibles avec les lettres accentuées (\b ne les gère pas). */
export const B_START = '(?<![\\p{L}\\p{N}])';
export const B_END = '(?![\\p{L}\\p{N}])';

export function wordRegExp(body, flags = 'giu') {
  return new RegExp(`${B_START}(?:${body})${B_END}`, flags);
}
