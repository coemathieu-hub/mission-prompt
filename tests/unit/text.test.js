import { describe, it, expect } from 'vitest';
import { convertDictatedPunctuation } from '../../src/text/punctuation.js';
import {
  removeFillers, removeDuplicateWords, applyGlossary, capitalizeSentences, frenchTypography, normalizeSpaces, cleanText,
} from '../../src/text/cleaner.js';
import { countWords, splitSentences } from '../../src/text/words.js';
import { DEFAULT_GLOSSARY, DEFAULT_FILLERS } from '../../src/data/defaults.js';

const NB = ' ', NNB = ' ';

describe('ponctuation dictée', () => {
  it('convertit les signes simples', () => {
    expect(convertDictatedPunctuation('bonjour virgule ça va point d\'interrogation'))
      .toBe('bonjour, ça va ?');
    expect(convertDictatedPunctuation('attention point d’exclamation')).toBe('attention !');
    expect(convertDictatedPunctuation('voici la liste deux points pommes virgule poires'))
      .toBe('voici la liste : pommes, poires');
    expect(convertDictatedPunctuation('fin de phrase point Ensuite')).toBe('fin de phrase. Ensuite');
  });
  it('gère retours à la ligne et paragraphes', () => {
    expect(convertDictatedPunctuation('ligne un à la ligne ligne deux')).toBe('ligne un\nligne deux');
    expect(convertDictatedPunctuation('partie un nouveau paragraphe partie deux')).toBe('partie un\n\npartie deux');
  });
  it('ne touche pas au mot « point » dans une expression', () => {
    expect(convertDictatedPunctuation('le point important est le point de vue'))
      .toBe('le point important est le point de vue');
    expect(convertDictatedPunctuation('un point clé')).toBe('un point clé');
  });
  it('point-virgule et points de suspension', () => {
    expect(convertDictatedPunctuation('a point virgule b')).toBe('a ; b');
    expect(convertDictatedPunctuation('et puis points de suspension')).toBe('et puis…');
  });
});

describe('nettoyage', () => {
  it('retire les mots parasites, y compris étirés', () => {
    expect(removeFillers('euh je veux, ben, un outil euuuh simple', DEFAULT_FILLERS)).toBe('je veux, un outil simple');
    expect(removeFillers('Heu, bonjour', DEFAULT_FILLERS)).toBe('bonjour');
    expect(removeFillers('un benchmark', DEFAULT_FILLERS)).toBe('un benchmark');
  });
  it('retire les mots doublés sauf nous nous / vous vous', () => {
    expect(removeDuplicateWords('je veux le le tableau')).toBe('je veux le tableau');
    expect(removeDuplicateWords('nous nous sommes trompés')).toBe('nous nous sommes trompés');
    expect(removeDuplicateWords('très très très bien')).toBe('très bien');
  });
  it('applique le glossaire (insensible à la casse, espaces souples)', () => {
    expect(applyGlossary('envoie ça à cloud code puis zeen doc', DEFAULT_GLOSSARY))
      .toBe('envoie ça à Claude Code puis Zeendoc');
    expect(applyGlossary('un fichier excel et un power point', DEFAULT_GLOSSARY)).toBe('un fichier Excel et un PowerPoint');
    expect(applyGlossary('excellent', DEFAULT_GLOSSARY)).toBe('excellent');
  });
  it('majuscules et espaces', () => {
    expect(capitalizeSentences('bonjour. ça va ? oui\nsuite')).toBe('Bonjour. Ça va ? Oui\nSuite');
    expect(normalizeSpaces('  a   b \n\n\n\n c  ')).toBe('a b\n\nc');
  });
  it('typographie française', () => {
    expect(frenchTypography('Quoi ? Oui ! Voilà : fini ; ok')).toBe(`Quoi${NNB}? Oui${NNB}! Voilà${NB}: fini${NNB}; ok`);
    expect(frenchTypography('https://site.fr à 10:30 ?!')).toBe(`https://site.fr à 10:30${NNB}?!`);
    expect(frenchTypography('« bonjour »')).toBe(`«${NB}bonjour${NB}»`);
  });
  it('chaîne complète', () => {
    const out = cleanText('euh je veux un un outil html virgule simple point il doit marcher hors ligne', {
      fillers: DEFAULT_FILLERS, glossary: DEFAULT_GLOSSARY,
    });
    expect(out).toBe('Je veux un outil HTML, simple. Il doit marcher hors ligne');
  });
});

describe('mots et phrases', () => {
  it('compte les mots', () => {
    expect(countWords("L'outil doit - vraiment - marcher")).toBe(4);
    expect(countWords('   ')).toBe(0);
  });
  it('découpe les phrases', () => {
    expect(splitSentences('Un. Deux ? Trois\nQuatre')).toEqual(['Un.', 'Deux ?', 'Trois', 'Quatre']);
  });
});
