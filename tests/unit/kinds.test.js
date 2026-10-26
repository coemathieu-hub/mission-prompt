import { describe, it, expect } from 'vitest';
import { detectKind, fileExt } from '../../src/files/kinds.js';
import { buildPrompt } from '../../src/prompt/builder.js';
import { createMission, createSource } from '../../src/core/mission.js';

const f = (name, type = '') => ({ name, type });

describe('type de fichier détecté automatiquement', () => {
  it('par extension', () => {
    expect(detectKind(f('tarifs.XLSX'))).toBe('excel');
    expect(detectKind(f('export.csv'))).toBe('excel');
    expect(detectKind(f('contrat.pdf'))).toBe('pdf');
    expect(detectKind(f('logo.PNG'))).toBe('image');
    expect(detectKind(f('photo.heic'))).toBe('image');
    expect(detectKind(f('cahier.docx'))).toBe('word');
    expect(detectKind(f('pitch.pptx'))).toBe('ppt');
  });
  it('par type MIME si pas d\'extension connue', () => {
    expect(detectKind(f('scan', 'application/pdf'))).toBe('pdf');
    expect(detectKind(f('capture', 'image/webp'))).toBe('image');
  });
  it('tout le reste est un fichier générique, avec son extension dans le prompt', () => {
    expect(detectKind(f('archive.zip'))).toBe('other');
    expect(fileExt('notes.MD')).toBe('md');
    const m = createMission({ sources: [{ ...createSource('other'), name: 'archive.zip' }] });
    expect(buildPrompt(m)).toContain('- **archive.zip** · Fichier .zip');
  });
});
