import { describe, it, expect } from 'vitest';
import { diffWords, applyDecisions, countChanges } from '../../src/text/diff.js';

describe('diff mot à mot', () => {
  it('rien à faire si identique', () => {
    expect(diffWords('abc', 'abc')).toEqual([{ type: 'same', text: 'abc' }]);
  });
  it('isole chaque modification', () => {
    const a = 'euh je veux un outil html simple';
    const b = 'Je veux un outil HTML simple';
    const segs = diffWords(a, b);
    expect(countChanges(segs)).toBe(2);
    expect(applyDecisions(segs)).toBe(b);
    expect(applyDecisions(segs, { 0: false, 1: false })).toBe(a);
    expect(applyDecisions(segs, { 1: false })).toBe('Je veux un outil html simple');
  });
  it('classe les modifications', () => {
    const segs = diffWords('Quoi ?', 'Quoi ?').filter(s => s.type === 'change');
    expect(segs[0].kind).toBe('space');
    const rem = diffWords('le le chat', 'le chat').filter(s => s.type === 'change');
    expect(rem[0].kind).toBe('remove');
  });
  it('fusionne deux modifications séparées par un seul espace', () => {
    const segs = diffWords('euh ben voilà', 'Voilà');
    expect(countChanges(segs)).toBe(1);
  });
});
