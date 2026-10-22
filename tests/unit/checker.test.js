import { describe, it, expect } from 'vitest';
import { checkMission, fileMentions } from '../../src/text/checker.js';
import { createMission, createIdea, createSource } from '../../src/core/mission.js';

const full = () => createMission({
  title: 'Outil de suivi des notes de frais',
  context: 'pro',
  contextConstraints: 'Données en local.',
  goal: 'Suivre mes notes de frais du mois facilement.',
  ideas: [
    createIdea('Saisir une dépense avec la date et le montant.'),
    createIdea('Afficher un récapitulatif mensuel par catégorie.'),
    createIdea('Exporter les données pour la comptable chaque mois.'),
  ],
  noSources: true,
  reviewed: true,
  deliverable: { type: 'html', typeOther: '', target: 'both', constraints: ['offline'], constraintsOther: '', criteria: ['calc'], criteriaOther: '' },
});

describe('contrôleur de mission', () => {
  it('mission vide : alertes de base, jauge à 0', () => {
    const { alerts, fuel } = checkMission(createMission());
    const ids = alerts.map(a => a.id);
    expect(ids).toEqual(expect.arrayContaining(['title-empty', 'context', 'goal', 'ideas-none', 'deliverable']));
    expect(fuel).toBe(5);
    expect(alerts.find(a => a.id === 'deliverable').step).toBe(5);
  });
  it('mission complète : 100 % et aucune alerte bloquante', () => {
    const { alerts, fuel } = checkMission(full());
    expect(alerts.filter(a => a.level === 'warn')).toEqual([]);
    expect(fuel).toBe(100);
  });
  it('titre court, idée courte, doublon, phrase longue', () => {
    const m = full();
    m.title = 'Notes frais';
    m.ideas.push(createIdea('Un graphique'));
    m.ideas.push(createIdea('saisir une dépense avec la date et le montant'));
    m.goal = Array.from({ length: 45 }, (_, i) => `mot${i}`).join(' ') + '.';
    const { alerts, fuel } = checkMission(m);
    const ids = alerts.map(a => a.id).join(' ');
    expect(ids).toContain('title-short');
    expect(ids).toContain('idea-short');
    expect(ids).toContain('idea-dup');
    expect(ids).toContain('long-');
    expect(fuel).toBeLessThan(100);
  });
  it('fichier évoqué sans source déclarée', () => {
    const m = full();
    m.noSources = false;
    m.ideas[0].text = 'Importer le fichier Excel de mes dépenses et les photos.';
    expect(fileMentions(m).map(x => x.word)).toEqual(expect.arrayContaining(['excel', 'photos', 'fichier']));
    const { alerts } = checkMission(m);
    const a = alerts.find(x => x.id === 'sources-missing');
    expect(a.step).toBe(4);
    expect(a.level).toBe('warn');
  });
  it('source déclarée mais type évoqué différent : simple info', () => {
    const m = full();
    m.noSources = false;
    m.sources = [Object.assign(createSource('excel'), { name: 'frais.xlsx' })];
    m.ideas[0].text = 'Ajouter une photo du justificatif à chaque dépense.';
    const { alerts } = checkMission(m);
    expect(alerts.find(x => x.id === 'sources-kind-image').level).toBe('info');
  });
});

describe('mentions de fichiers', () => {
  const withIdea = text => createMission({ ideas: [createIdea(text)] });
  it('ignore le format de sortie (« exporter en PDF », « générer un Excel »)', () => {
    expect(fileMentions(withIdea('Exporter le devis en PDF avec le logo.')).map(x => x.word)).toEqual(['logo']);
    expect(fileMentions(withIdea('Générer un fichier Excel récapitulatif.')).map(x => x.word)).toEqual(['fichier']);
  });
  it('garde les fichiers à fournir', () => {
    expect(fileMentions(withIdea('Importer mon Excel des tarifs.')).map(x => x.word)).toEqual(['excel']);
    expect(fileMentions(withIdea('Le citoyen Excel')).map(x => x.word)).toEqual(['excel']);
  });
});
