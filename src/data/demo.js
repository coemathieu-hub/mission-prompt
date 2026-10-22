// « 🧪 Mission démo » : pré-remplie pour s'entraîner sans risque.
import { createMission, createIdea, createSource } from '../core/mission.js';
import { DEFAULT_CONSTRAINTS } from './defaults.js';

export function createDemoMission(constraints = DEFAULT_CONSTRAINTS) {
  return createMission({
    demo: true,
    title: 'Outil HTML de suivi des notes de frais',
    context: 'pro',
    contextConstraints: constraints.pro,
    goal: 'Suivre mes notes de frais du mois et sortir un total par catégorie.',
    ideas: [
      createIdea('Saisir une dépense avec la date, le montant, la catégorie et une photo du justificatif.'),
      createIdea('Afficher un tableau récapitulatif par mois, avec un graphique en barres.'),
      // Volontairement imparfaite : de quoi tester la relecture.
      createIdea('euh exporter le tout en excel pour ma comptable virgule avec un onglet par mois'),
    ],
    sources: [Object.assign(createSource('excel'), {
      name: 'frais_2026.xlsx',
      role: 'Données de départ',
      description: 'Mes dépenses depuis janvier, à importer au premier lancement.',
      sheets: [
        { name: 'Janvier', headers: ['Date', 'Fournisseur', 'Montant TTC', 'Catégorie'] },
        { name: 'Février', headers: ['Date', 'Fournisseur', 'Montant TTC', 'Catégorie'] },
      ],
    })],
    deliverable: {
      type: 'html', typeOther: '', target: 'both',
      constraints: ['offline', 'fr'], constraintsOther: '',
      criteria: ['open', 'calc'], criteriaOther: '',
    },
    lastStep: 3,
    maxStep: 5,
  });
}
