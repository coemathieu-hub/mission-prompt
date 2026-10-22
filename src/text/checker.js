// Contrôleur de mission : alertes cliquables (avec l'étape à corriger) et jauge « Carburant ».
import { countWords, splitSentences, normalize, wordRegExp } from './words.js';

const LONG_SENTENCE = 40;
const SHORT_IDEA = 5;

// Mots qui évoquent un fichier. kind = type de source attendu (null : générique).
const FILE_WORDS = [
  ['excel', 'excel'], ['xlsx', 'excel'], ['csv', 'excel'], ['tableur', 'excel'], ['classeur', 'excel'],
  ['feuille de calcul', 'excel'],
  ['pdf', 'pdf'],
  ['image', 'image'], ['photo', 'image'], ['capture', 'image'], ['jpeg', 'image'], ['jpg', 'image'], ['png', 'image'],
  ['logo', 'image'],
  ['word', 'word'], ['docx', 'word'],
  ['powerpoint', 'ppt'], ['pptx', 'ppt'], ['diaporama', 'ppt'],
  ['fichier', null], ['tableau', null], ['document', null], ['pièce jointe', null],
].map(([word, kind]) => ({ word, kind, re: wordRegExp(`${word.replace(/ /g, '\\s+')}[sx]?`, 'iu') }));

const KIND_NAMES = { excel: 'fichier Excel', pdf: 'PDF', image: 'image', word: 'document Word', ppt: 'PowerPoint' };

const excerpt = text => {
  const words = text.trim().split(/\s+/);
  return words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : '');
};

// « exporter en PDF », « générer un Excel » : c'est le résultat attendu, pas un fichier à fournir.
const OUTPUT_BEFORE = /(?<![\p{L}])(?:export\p{L}*|g[ée]n[ée]r\p{L}*|cr[ée]\p{L}*|produi\p{L}*|sorti\p{L}*|t[ée]l[ée]charg\p{L}*|imprim\p{L}*|envoy\p{L}*|sous forme d['’]?|au format|en)\s+(?:(?:le|la|les|un|une|des|du|de|d['’]|tout|en|au|format|fichier|forme)\s+){0,3}$/iu;

export function fileMentions(m) {
  const text = [m.title, m.goal, ...m.ideas.map(i => i.text)].join('\n');
  const found = [];
  for (const f of FILE_WORDS) {
    if (found.some(x => x.word === f.word)) continue;
    for (const hit of text.matchAll(new RegExp(f.re.source, 'giu'))) {
      const before = text.slice(Math.max(0, hit.index - 40), hit.index);
      if (f.kind && OUTPUT_BEFORE.test(before)) continue;
      found.push({ word: hit[0].toLowerCase(), kind: f.kind });
      break;
    }
  }
  return found;
}

function textFields(m) {
  return [
    { step: 1, label: 'le titre', text: m.title },
    { step: 2, label: 'les contraintes', text: m.contextConstraints },
    { step: 3, label: "l'objectif", text: m.goal },
    ...m.ideas.map((i, k) => ({ step: 3, label: `l'idée ${k + 1}`, text: i.text })),
    ...m.sources.map(s => ({ step: 4, label: `la source « ${s.name || 'sans nom'} »`, text: s.description })),
  ];
}

function similar(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const A = new Set(na.split(' ')), B = new Set(nb.split(' '));
  if (A.size < 3 || B.size < 3) return false;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter) >= 0.8;
}

export function checkMission(m) {
  const alerts = [];
  const add = (id, step, level, message) => alerts.push({ id, step, level, message });

  // Titre
  const titleWords = countWords(m.title);
  if (!titleWords) add('title-empty', 1, 'warn', 'Donne un titre à ta mission.');
  else if (titleWords < 3) add('title-short', 1, 'warn', `Ton titre fait ${titleWords} mot${titleWords > 1 ? 's' : ''} : précise-le un peu (3 mots minimum).`);

  // Contexte
  if (!m.context) add('context', 2, 'warn', 'Choisis si le besoin est Pro ou Perso.');

  // Objectif et idées
  const goalWords = countWords(m.goal);
  if (!goalWords) add('goal', 3, 'warn', "Écris l'objectif en une phrase.");
  const ideas = m.ideas.filter(i => countWords(i.text));
  if (!ideas.length) add('ideas-none', 3, 'warn', 'Ajoute au moins une idée.');
  let quality = 0;
  m.ideas.forEach((idea, k) => {
    const n = countWords(idea.text);
    if (n && n < SHORT_IDEA) {
      add(`idea-short-${idea.id}`, 3, 'warn', `L'idée ${k + 1} est très courte (${n} mot${n > 1 ? 's' : ''}) : détaille-la.`);
      quality++;
    }
  });
  for (let a = 0; a < m.ideas.length; a++) {
    for (let b = a + 1; b < m.ideas.length; b++) {
      if (similar(m.ideas[a].text, m.ideas[b].text)) {
        add(`idea-dup-${m.ideas[a].id}-${m.ideas[b].id}`, 3, 'warn', `Les idées ${a + 1} et ${b + 1} se ressemblent beaucoup : fusionne-les ou supprime l'une d'elles.`);
        quality++;
      }
    }
  }

  // Phrases trop longues
  for (const field of textFields(m)) {
    for (const sentence of splitSentences(field.text || '')) {
      const n = countWords(sentence);
      if (n > LONG_SENTENCE) {
        add(`long-${field.label}-${normalize(sentence).slice(0, 24)}`, field.step, 'warn',
          `Une phrase de ${n} mots dans ${field.label} (« ${excerpt(sentence)} ») : coupe-la en deux.`);
        quality++;
      }
    }
  }

  // Sources
  const mentions = fileMentions(m);
  const declaredKinds = new Set(m.sources.map(s => s.kind));
  if (!m.sources.length && !m.noSources) {
    if (mentions.length) {
      const words = mentions.slice(0, 3).map(x => `« ${x.word} »`).join(', ');
      add('sources-missing', 4, 'warn', `Tu parles de ${words} mais aucun fichier n'est déclaré. Ajoute-le, ou coche « Aucun fichier à fournir ».`);
    } else {
      add('sources-none', 4, 'info', 'Pas de fichier à fournir ? Coche « Aucun fichier à fournir » à l\'étape Sources.');
    }
  } else if (m.sources.length) {
    for (const mention of mentions) {
      if (mention.kind && !declaredKinds.has(mention.kind)) {
        add(`sources-kind-${mention.kind}`, 4, 'info', `Tu parles de « ${mention.word} » mais aucun ${KIND_NAMES[mention.kind]} n'est déclaré. Normal si c'est le résultat attendu.`);
      }
    }
  }

  // Livrable
  const d = m.deliverable;
  const hasType = d.type && (d.type !== 'other' || d.typeOther.trim());
  if (!hasType) add('deliverable', 5, 'warn', 'Précise le livrable attendu (HTML, Excel, PDF…).');
  if (!d.target) add('target', 5, 'info', 'Précise la cible : mobile, ordinateur ou les deux.');
  const hasCriteria = d.criteria.length || d.criteriaOther.trim();
  if (!hasCriteria) add('criteria', 5, 'info', 'Ajoute un critère de réussite : Claude saura quand il a fini.');

  // Jauge
  const fuelParts = {
    title: titleWords >= 3 ? 12 : titleWords ? 6 : 0,
    context: m.context ? 8 : 0,
    goal: goalWords >= 5 ? 15 : goalWords ? 8 : 0,
    ideas: ideas.length ? 12 + (ideas.length >= 3 ? 8 : ideas.length === 2 ? 4 : 0) : 0,
    sources: m.sources.length || m.noSources ? 10 : mentions.length ? 0 : 5,
    deliverable: (hasType ? 10 : 0) + (d.target ? 5 : 0) + (hasCriteria ? 5 : 0),
    review: m.reviewed ? 10 : 0,
    details: m.contextConstraints.trim() || d.constraints.length || d.constraintsOther.trim() ? 5 : 0,
  };
  const raw = Object.values(fuelParts).reduce((a, b) => a + b, 0);
  const fuel = Math.max(0, Math.min(100, raw - Math.min(10, quality * 2)));

  alerts.sort((a, b) => a.step - b.step || (a.level === b.level ? 0 : a.level === 'warn' ? -1 : 1));
  return { alerts, fuel, fuelParts };
}
