// Diff mot à mot entre le texte d'origine et le texte corrigé.
// Chaque modification devient un « morceau » que l'on peut accepter ou refuser.

const TOKEN = /\s+|[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\s\p{L}\p{N}]/gu;
const MAX_CELLS = 4_000_000;

export const tokenize = text => text.match(TOKEN) || [];
const isSpace = s => /^\s+$/.test(s);

function lcsOps(A, B) {
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { ops.push(['=', A[i]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(['-', A[i++]]);
    else ops.push(['+', B[j++]]);
  }
  while (i < n) ops.push(['-', A[i++]]);
  while (j < m) ops.push(['+', B[j++]]);
  return ops;
}

function kindOf(change) {
  if (change.from.replace(/\s/g, '') === change.to.replace(/\s/g, '')) return 'space';
  if (!change.to.trim()) return 'remove';
  if (!change.from.trim()) return 'add';
  return 'replace';
}

/**
 * @returns {Array<{type:'same', text:string} | {type:'change', id:number, from:string, to:string, kind:string}>}
 */
export function diffWords(original = '', corrected = '') {
  if (original === corrected) return original ? [{ type: 'same', text: original }] : [];
  const A = tokenize(original), B = tokenize(corrected);
  if ((A.length + 1) * (B.length + 1) > MAX_CELLS) {
    return [{ type: 'change', id: 0, from: original, to: corrected, kind: 'replace' }];
  }

  const segments = [];
  const pushSame = text => {
    const last = segments.at(-1);
    if (last && last.type === 'same') last.text += text;
    else segments.push({ type: 'same', text });
  };
  let change = null;
  let pending = ''; // espace « identique » coincé entre deux modifications : on le fusionne

  for (const [op, tok] of lcsOps(A, B)) {
    if (op === '=') {
      if (change && !pending && isSpace(tok)) { pending = tok; continue; }
      if (change) { segments.push(change); change = null; }
      if (pending) { pushSame(pending); pending = ''; }
      pushSame(tok);
    } else {
      if (change && pending) { change.from += pending; change.to += pending; pending = ''; }
      if (!change) change = { type: 'change', from: '', to: '' };
      if (op === '-') change.from += tok; else change.to += tok;
    }
  }
  if (change) segments.push(change);
  if (pending) pushSame(pending);

  let id = 0;
  for (const s of segments) if (s.type === 'change') { s.id = id++; s.kind = kindOf(s); }
  return segments;
}

/** Reconstruit le texte. decisions[id] === false → modification refusée. */
export function applyDecisions(segments, decisions = {}) {
  return segments
    .map(s => (s.type === 'same' ? s.text : decisions[s.id] === false ? s.from : s.to))
    .join('');
}

export const countChanges = segments => segments.filter(s => s.type === 'change').length;
