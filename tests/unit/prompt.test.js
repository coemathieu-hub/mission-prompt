import { describe, it, expect } from 'vitest';
import { buildPrompt, finalPrompt, OPTIMIZE_PREAMBLE, METHOD } from '../../src/prompt/builder.js';
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

describe('méthode brainstorming', () => {
  it('pose le cadre : pourquoi, une question à la fois, approches, conception validée avant le code', () => {
    const p = buildPrompt(createMission({ title: 'Test' }));
    const method = p.slice(p.indexOf('## Méthode'));
    expect(method).toContain('Comprends le pourquoi');
    expect(method).toContain('une question à la fois');
    expect(method).toContain('choix multiples');
    expect(method).toContain('Propose 2 ou 3 approches');
    expect(method).toContain('document de conception');
    expect(method).toContain('Attends mon accord');
    expect(method).toMatch(/Si je te dis de foncer, fonce/);
  });
  it('rendu Markdown : liste numérotée avec titres en gras', () => {
    const html = renderMarkdown(`## Méthode\n${METHOD}`);
    expect(html).toContain('<ol><li><strong>Comprends le pourquoi.</strong>');
    expect((html.match(/<li>/g) || []).length).toBe(6);
  });
});
