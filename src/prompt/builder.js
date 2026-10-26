// Génération du prompt final (Markdown), prêt à coller dans Claude Code ou Claude.
import { fileExt } from '../files/kinds.js';
import { BRAINSTORMING_SKILL_FR } from './skill-brainstorming.js';
import {
  CONTEXTS, SOURCE_KINDS, DELIVERABLE_TYPES, TARGETS, CONSTRAINT_OPTIONS, CRITERIA_OPTIONS,
} from '../data/defaults.js';

export const OPTIMIZE_PREAMBLE =
  `Je veux faire réaliser ce besoin par Claude Code. Analyse-le, pose-moi tes questions à choix multiples si nécessaire, puis rédige le prompt Claude Code le plus complet et précis possible. Garde les sections « Questions à me poser d'abord » et « Méthode » telles quelles dans le prompt final.`;

// Toujours présent : questions à choix multiples sur le projet ET sur la charte graphique.
export const QUESTIONS = `Avant de coder, pose-moi tes questions **sous forme de choix multiples**, une à la fois :
- **sur le projet** : tout ce qui reste flou dans cette demande (usages, utilisateurs, données, priorités, cas particuliers) ;
- **sur la charte graphique à mettre en place** : couleurs, typographies, style visuel, logo, ton, mise en page, composants.`;

// Méthode : le skill « brainstorming » complet (traduit), avec les deux règles de l'utilisateur qui priment.
export const METHOD = `Applique à la lettre le skill « Brainstorming » ci-dessous : c'est le copié-collé, traduit en français, du skill que je t'ai donné. Ton partenaire humain, c'est moi.

Deux règles priment sur ce skill :
- **Toutes tes questions sont à choix multiples**, une à la fois, avec toujours une option « Autre » pour que je puisse répondre avec mes mots. Cela remplace les passages du skill qui demandent des questions ouvertes ou déconseillent les menus.
- **La charte graphique fait partie du terrain à couvrir** : pose-moi aussi tes questions à choix multiples sur la charte à mettre en place.

${BRAINSTORMING_SKILL_FR}`;

const byId = (list, id) => list.find(x => x.id === id);
const lines = text => (text || '').split('\n').map(l => l.trim()).filter(Boolean);
const oneLine = text => (text || '').replace(/\s*\n+\s*/g, ' ').trim();
const lowerFirst = s => s.charAt(0).toLowerCase() + s.slice(1);

/** Texte multi-ligne dans une liste : lignes suivantes indentées sous le point. */
const listItem = (marker, text) => {
  const [first, ...rest] = lines(text);
  return [`${marker} ${first ?? ''}`, ...rest.map(l => ' '.repeat(marker.length + 1) + l)].join('\n');
};

function sourceBlock(s) {
  const kind = byId(SOURCE_KINDS, s.kind);
  const ext = s.kind === 'other' ? fileExt(s.name) : '';
  const parts = [`**${oneLine(s.name) || 'Fichier sans nom'}**`, ext ? `Fichier .${ext}` : kind?.label];
  if (s.role?.trim()) parts.push(`rôle : ${lowerFirst(oneLine(s.role))}`);
  if (s.description?.trim()) parts.push(oneLine(s.description));
  const out = [`- ${parts.filter(Boolean).join(' · ')}`];
  for (const sheet of s.sheets || []) {
    const headers = (sheet.headers || []).filter(Boolean);
    if (sheet.csv) out.push(`  - Colonnes : ${headers.join(', ') || '(aucune en-tête détectée)'}`);
    else out.push(`  - Onglet « ${sheet.name} » : ${headers.length ? `colonnes ${headers.join(', ')}` : 'aucune en-tête détectée'}`);
  }
  return out.join('\n');
}

export function buildPrompt(m) {
  const out = [];
  out.push(`# 🎯 ${oneLine(m.title) || 'Mission sans titre'}`);

  if (m.context) {
    const constraints = oneLine(m.contextConstraints);
    out.push(`Contexte : besoin ${CONTEXTS[m.context].label.toLowerCase()}.${constraints ? ' ' + constraints : ''}`);
  }

  if (m.goal?.trim()) out.push(`## Objectif\n${oneLine(m.goal)}`);

  const ideas = m.ideas.filter(i => i.text.trim());
  if (ideas.length) out.push(`## Fonctionnalités attendues\n${ideas.map((i, k) => listItem(`${k + 1}.`, i.text)).join('\n')}`);

  if (m.sources.length) out.push(`## Fichiers sources\n${m.sources.map(sourceBlock).join('\n')}`);
  else if (m.noSources) out.push('## Fichiers sources\nAucun fichier à fournir.');

  const d = m.deliverable;
  const deliverable = [];
  const type = byId(DELIVERABLE_TYPES, d.type);
  const typeText = d.type === 'other' ? oneLine(d.typeOther) : type?.prompt;
  if (typeText) deliverable.push(`- Type : ${typeText}`);
  const target = byId(TARGETS, d.target);
  if (target) deliverable.push(`- Pour : ${target.prompt}`);
  const constraints = [
    ...d.constraints.map(id => byId(CONSTRAINT_OPTIONS, id)?.prompt).filter(Boolean),
    ...lines(d.constraintsOther).map(lowerFirst),
  ];
  if (constraints.length) deliverable.push(`- Contraintes : ${constraints.join(', ')}`);
  if (deliverable.length) out.push(`## Livrable\n${deliverable.join('\n')}`);

  const criteria = [
    ...d.criteria.map(id => byId(CRITERIA_OPTIONS, id)?.label).filter(Boolean),
    ...lines(d.criteriaOther),
  ];
  if (criteria.length) out.push(`## Critères de réussite\n${criteria.map(c => `- ${c}`).join('\n')}`);

  out.push(`## Questions à me poser d'abord\n${QUESTIONS}`);
  out.push(`## Méthode\n${METHOD}`);

  const body = out.join('\n\n');
  return m.destination === 'opt' ? `${OPTIMIZE_PREAMBLE}\n\n${body}` : body;
}

/** Le prompt affiché : la version modifiée à la main si elle existe. */
export const finalPrompt = m => (m.promptOverride != null ? m.promptOverride : buildPrompt(m));
