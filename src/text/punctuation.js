// Ponctuation dictée → signes. « virgule » devient « , », « à la ligne » un retour, etc.
import { wordRegExp } from './words.js';

const APOS = "['’]";

// Ordre important : expressions longues d'abord.
const RULES = [
  [wordRegExp('nouveau paragraphe'), '\n\n'],
  [wordRegExp('point à la ligne'), '.\n'],
  [wordRegExp('(?:retour )?[àa] la ligne'), '\n'],
  [wordRegExp(`points? d${APOS}interrogation`), '?'],
  [wordRegExp(`points? d${APOS}exclamation`), '!'],
  [wordRegExp('points de suspension'), '…'],
  [wordRegExp('point[- ]virgule'), ';'],
  [wordRegExp('deux[- ]points'), ':'],
  [wordRegExp('point final'), '.'],
  [wordRegExp('virgule'), ','],
];

// « point » seul est ambigu (« le point important », « point de vue ») :
// on ne le convertit pas après un déterminant ni devant « de / du / des ».
const POINT_BEFORE = /(?:^|[\s(])(?:le|un|ce|cet|du|au|mon|ton|son|notre|votre|leur|chaque|quel|quelle|premier|dernier|bon|gros|à|en|sur|ce|deuxième|troisième|dernier|même)\s+$/iu;
const POINT_AFTER = /^\s+(?:de|du|des|d['’]|par|sur|fort|faible|commun|clé|cle|important)(?![\p{L}])/iu;

function convertPoint(text) {
  return text.replace(wordRegExp('point'), (match, offset, whole) => {
    const before = whole.slice(Math.max(0, offset - 20), offset);
    const after = whole.slice(offset + match.length, offset + match.length + 20);
    if (POINT_BEFORE.test(before) || POINT_AFTER.test(after)) return match;
    return '.';
  });
}

/** Remet les espaces au propre autour des signes insérés. */
export function tidyPunctuationSpacing(text) {
  return text
    .replace(/[ \t  ]+([,.…)])/g, '$1')
    .replace(/[ \t  ]+([;:!?])/g, ' $1')
    .replace(/([,;:!?.…])(?=[\p{L}])/gu, (m, sign, off, whole) => {
      // pas d'espace dans « 3.5 », « www.site.fr » ou « https: »
      const prev = whole[off - 1] || '';
      if (sign === '.' && /[\p{L}\p{N}]/u.test(prev) && /[\p{Ll}]/u.test(whole[off + 1] || '')) return sign;
      return sign + ' ';
    })
    .replace(/,\s*([.!?])/g, '$1')
    .replace(/([.!?])\s*\./g, '$1')
    .replace(/[ \t]*\n[ \t]*/g, '\n');
}

export function convertDictatedPunctuation(text = '') {
  let out = text;
  for (const [re, sign] of RULES) out = out.replace(re, sign);
  out = convertPoint(out);
  return tidyPunctuationSpacing(out);
}
