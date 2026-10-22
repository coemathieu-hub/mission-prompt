// Nettoyage local (aucune IA) : mots parasites, mots doublés, glossaire, majuscules,
// espaces et typographie française.
import { convertDictatedPunctuation } from './punctuation.js';
import { escapeRegExp, wordRegExp } from './words.js';

const NBSP = ' ';
const NNBSP = ' ';

// Formes étirées : « euuuh », « heeeu », « hummm », « hmmm »
const STRETCHED = 'e+u+h+|h+e+u+h*|h+u+m+|h+m+';

export function removeFillers(text = '', fillers = []) {
  const list = fillers.map(f => f.trim()).filter(Boolean).map(escapeRegExp);
  const body = [STRETCHED, ...list].join('|');
  return text
    .replace(new RegExp(`(^|[\\s,;.!?…(])(?:${body})(?![\\p{L}\\p{N}])[ \\t]*,?[ \\t]*`, 'giu'), '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/(^|\n)[ \t]*,[ \t]*/g, '$1')
    .replace(/,[ \t]*([,.!?])/g, '$1');
}

// « nous nous », « vous vous » sont corrects en français.
const LEGIT_DOUBLES = new Set(['nous', 'vous']);

export function removeDuplicateWords(text = '') {
  return text.replace(/(?<![\p{L}\p{N}])([\p{L}][\p{L}'’-]*)(?:[ \t]+\1)+(?![\p{L}\p{N}])/giu, (m, w) =>
    LEGIT_DOUBLES.has(w.toLowerCase()) ? m : w,
  );
}

export function applyGlossary(text = '', glossary = []) {
  const entries = glossary
    .filter(e => e && e.from && e.from.trim() && e.to != null)
    .sort((a, b) => b.from.length - a.from.length);
  let out = text;
  for (const { from, to } of entries) {
    const body = from.trim().split(/\s+/).map(escapeRegExp).join('[\\s-]+');
    out = out.replace(wordRegExp(body), to);
  }
  return out;
}

export function normalizeSpaces(text = '') {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function capitalizeSentences(text = '') {
  return text.replace(/(^|[.!?…]\s+|\n\s*)(\p{Ll})/gu, (m, before, letter) => before + letter.toUpperCase());
}

/**
 * Typographie française : espace insécable fine avant ; ! ? et insécable avant :
 * Ne touche ni aux URL (https://), ni aux heures (10:30), ni aux « ?! » collés.
 */
export function frenchTypography(text = '') {
  return text
    .replace(/[   ]*([;!?])(?=[\s"»);!?]|$)/gu, (m, sign, off, whole) => {
      const prev = whole.slice(0, off).at(-1);
      if (!prev || prev === '\n' || /[;!?]/.test(prev)) return m.trimStart();
      return NNBSP + sign;
    })
    .replace(/[   ]*:(?=[\s"»]|$)/gu, (m, off, whole) => {
      const prev = whole.slice(0, off).at(-1);
      if (!prev || prev === '\n') return m.trimStart();
      return NBSP + ':';
    })
    .replace(/«[   ]*/g, '«' + NBSP)
    .replace(/[   ]*»/g, NBSP + '»');
}

/** Chaîne complète utilisée par l'étape Relecture. */
export function cleanText(text = '', { fillers = [], glossary = [] } = {}) {
  let out = convertDictatedPunctuation(text);
  out = removeFillers(out, fillers);
  out = removeDuplicateWords(out);
  out = applyGlossary(out, glossary);
  out = normalizeSpaces(out);
  out = capitalizeSentences(out);
  out = frenchTypography(out);
  return out;
}
