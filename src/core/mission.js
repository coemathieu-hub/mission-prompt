// Modèle d'une mission (fonctions pures, sans stockage).

export function uid() {
  try {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  } catch { /* contexte non sécurisé */ }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function emptyDeliverable() {
  return {
    type: null,
    typeOther: '',
    target: null,
    constraints: [],
    constraintsOther: '',
    criteria: [],
    criteriaOther: '',
  };
}

export function createMission(overrides = {}) {
  const now = Date.now();
  return {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    demo: false,
    title: '',
    context: null,
    contextConstraints: '',
    goal: '',
    ideas: [],
    sources: [],
    noSources: false,
    deliverable: emptyDeliverable(),
    destination: 'code',
    reviewed: false,
    promptOverride: null,
    liveTake: null,
    lastStep: 1,
    maxStep: 1,
    ...overrides,
  };
}

export function createIdea(text = '') {
  return { id: uid(), text };
}

export function createSource(kind = 'other') {
  return { id: uid(), kind, name: '', role: '', description: '', sheets: [] };
}

/** Copie indépendante, nouvel identifiant, repart en brouillon. */
export function duplicateMission(m) {
  const copy = structuredClone(m);
  const now = Date.now();
  return {
    ...copy,
    id: uid(),
    title: m.title ? `${m.title} (copie)` : '',
    status: 'draft',
    demo: false,
    createdAt: now,
    updatedAt: now,
    ideas: copy.ideas.map(i => ({ ...i, id: uid() })),
    sources: copy.sources.map(s => ({ ...s, id: uid() })),
  };
}

/** Complète une mission venue d'un ancien export ou d'un import JSON. */
export function migrateMission(raw) {
  const base = createMission();
  const m = { ...base, ...raw };
  m.deliverable = { ...emptyDeliverable(), ...(raw?.deliverable || {}) };
  m.ideas = Array.isArray(raw?.ideas) ? raw.ideas.map(i => ({ id: i.id || uid(), text: String(i.text ?? '') })) : [];
  m.sources = Array.isArray(raw?.sources)
    ? raw.sources.map(s => ({ ...createSource(s.kind), ...s, id: s.id || uid(), sheets: Array.isArray(s.sheets) ? s.sheets : [] }))
    : [];
  return m;
}
