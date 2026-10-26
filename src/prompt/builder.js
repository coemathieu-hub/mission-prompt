// Génération du prompt final (Markdown), prêt à coller dans Claude Code ou Claude.
import { fileExt } from '../files/kinds.js';
import {
  CONTEXTS, SOURCE_KINDS, DELIVERABLE_TYPES, TARGETS, CONSTRAINT_OPTIONS, CRITERIA_OPTIONS,
} from '../data/defaults.js';

export const OPTIMIZE_PREAMBLE =
  'Je veux faire réaliser ce besoin par Claude Code. Analyse-le, pose-moi tes questions à choix multiples si nécessaire, puis rédige le prompt Claude Code le plus complet et précis possible. Garde la section « Méthode » telle quelle dans le prompt final.';

// Méthode « brainstorming » condensée : comprendre le pourquoi avant de construire.
export const METHOD = `Avant d'écrire la moindre ligne de code :
1. **Comprends le pourquoi.** Lis d'abord tout ce que je t'ai fourni (fichiers, projet existant) : ne me demande jamais ce qui y figure déjà. Si tout ce qui compte est dans cette demande, dis-le et passe à l'étape 3.
2. **Questionne-moi une question à la fois**, sous forme de choix multiples, en commençant par le point qui changerait le plus ce que tu vas construire, et dis-moi pourquoi tu la poses. Reformule au fur et à mesure ce que tu as compris, en séparant ce que j'ai dit de ce que tu proposes, puis demande-moi ce qui manque.
3. **Propose 2 ou 3 approches** dans un message dédié : ce que chacune implique et sacrifie, ta recommandation et pourquoi. Je choisis.
4. **Rédige un document de conception** (court si la demande est petite) : intention, objectifs, non-objectifs, ce qui ferait échouer le projet même s'il fonctionne, contraintes, approche retenue, et les choix que tu as faits à ma place, signalés comme tels. Relis-le comme le développeur qui devrait le réaliser sans moi, et pose-moi en une fois les questions qui restent.
5. **Attends mon accord sur ce document** : pas de code, pas d'installation, pas de création de projet avant.
6. Ensuite seulement : un plan par étapes, puis le code étape par étape.

Si c'est visuel (écran, page, mise en page), propose-moi une maquette jetable avant de trancher. Si je te dis de foncer, fonce, en annonçant en une ligne tes choix techniques importants.`;

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

  out.push(`## Méthode\n${METHOD}`);

  const body = out.join('\n\n');
  return m.destination === 'opt' ? `${OPTIMIZE_PREAMBLE}\n\n${body}` : body;
}

/** Le prompt affiché : la version modifiée à la main si elle existe. */
export const finalPrompt = m => (m.promptOverride != null ? m.promptOverride : buildPrompt(m));
