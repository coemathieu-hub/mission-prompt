import { describe, it, expect } from 'vitest';
import { buildPrompt, finalPrompt, OPTIMIZE_PREAMBLE, METHOD, QUESTIONS } from '../../src/prompt/builder.js';
import { renderMarkdown } from '../../src/prompt/markdown.js';
import { createMission, createIdea, createSource } from '../../src/core/mission.js';

const mission = () => createMission({
  title: 'Outil HTML de suivi des notes de frais',
  context: 'pro',
  contextConstraints: 'Charte graphique AXGROUP, données clients traitées 100 % en local.',
  goal: 'Suivre mes notes de frais du mois.',
  ideas: [createIdea('Saisir une dépense.'), createIdea('Exporter en Excel.\nUn onglet par mois.')],
  sources: [Object.assign(createSource('excel'), {
    name: 'frais_2026.xlsx', role: 'Données de départ', description: 'Mes dépenses depuis janvier.',
    sheets: [{ name: 'Janvier', headers: ['Date', 'Montant'] }],
  })],
  deliverable: { type: 'html', typeOther: '', target: 'both', constraints: ['offline', 'fr'], constraintsOther: 'Couleurs sobres', criteria: ['calc'], criteriaOther: 'Total visible en haut' },
});

describe('générateur de prompt', () => {
  it('mode Claude Code direct', () => {
    const p = buildPrompt(mission());
    expect(p).toBe(`# 🎯 Outil HTML de suivi des notes de frais

Contexte : besoin pro. Charte graphique AXGROUP, données clients traitées 100 % en local.

## Objectif
Suivre mes notes de frais du mois.

## Fonctionnalités attendues
1. Saisir une dépense.
2. Exporter en Excel.
   Un onglet par mois.

## Fichiers sources
- **frais_2026.xlsx** · Excel / CSV · rôle : données de départ · Mes dépenses depuis janvier.
  - Onglet « Janvier » : colonnes Date, Montant

## Livrable
- Type : HTML autonome (un seul fichier .html)
- Pour : mobile et ordinateur
- Contraintes : fonctionne hors ligne, en français, couleurs sobres

## Critères de réussite
- Les calculs sont justes
- Total visible en haut

## Questions à me poser d'abord
${QUESTIONS}

## Méthode
${METHOD}`);
  });
  it('mode Claude pour optimiser : même contenu précédé du préambule', () => {
    const m = mission();
    const direct = buildPrompt(m);
    m.destination = 'opt';
    expect(buildPrompt(m)).toBe(`${OPTIMIZE_PREAMBLE}\n\n${direct}`);
  });
  it('mission minimale : titre par défaut et méthode', () => {
    const p = buildPrompt(createMission());
    expect(p.startsWith('# 🎯 Mission sans titre')).toBe(true);
    expect(p).toContain('## Méthode');
    expect(p).not.toContain('## Fichiers sources');
  });
  it('prompt modifié à la main', () => {
    const m = mission();
    m.promptOverride = 'mon texte';
    expect(finalPrompt(m)).toBe('mon texte');
  });
});

describe('aperçu Markdown', () => {
  it('titres, listes imbriquées, gras, échappement', () => {
    const html = renderMarkdown('# T\n\nUn <b>x</b>\n\n1. a\n2. b\n   suite\n- **gras**\n  - sous');
    expect(html).toBe('<h1>T</h1><p>Un &lt;b&gt;x&lt;/b&gt;</p><ol><li>a</li><li>b<br>suite</li></ol><ul><li><strong>gras</strong><ul><li>sous</li></ul></li></ul>');
  });
});

describe('méthode : skill brainstorming complet', () => {
  it('le skill traduit est collé en entier, avec les deux règles qui priment', () => {
    const p = buildPrompt(createMission({ title: 'Test' }));
    const method = p.slice(p.indexOf('## Méthode'));
    expect(method).toContain('Applique à la lettre le skill « Brainstorming »');
    expect(method).toContain('**Toutes tes questions sont à choix multiples**');
    expect(method).toContain('**La charte graphique fait partie du terrain à couvrir**');
    for (const part of ["#### D'abord : que sais-tu vraiment ?", '#### Regarde avant de demander', '#### Ton premier message',
      '#### La conversation', '#### Reformule au fur et à mesure', '#### Dimensionner le travail', '#### La conception écrite',
      '<HARD-GATE>', '</HARD-GATE>', "#### Signaux d'alerte", '#### Compagnon visuel', '**Présenter les approches.**']) {
      expect(method).toContain(part);
    }
    expect(method).not.toMatch(/builder-check-prompt\.md|visual-companion\.md/);
  });
  it('rendu Markdown : tableaux, citations et sous-titres', () => {
    const html = renderMarkdown(`## Méthode\n${METHOD}`);
    expect((html.match(/<table>/g) || []).length).toBe(2);
    expect(html).toContain('<th>Taille</th>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain("<h4>D&#39;abord : que sais-tu vraiment ?</h4>");
    expect(html).toContain('&lt;HARD-GATE&gt;');
  });
});

describe('questions à choix multiples', () => {
  it('toujours demandées sur le projet et sur la charte graphique, dans les deux modes', () => {
    for (const destination of ['code', 'opt']) {
      const p = buildPrompt(createMission({ title: 'Test', destination }));
      expect(p).toContain("## Questions à me poser d'abord");
      expect(p).toContain('**sous forme de choix multiples**');
      expect(p).toContain('**sur le projet**');
      expect(p).toContain('**sur la charte graphique à mettre en place**');
    }
  });
});
