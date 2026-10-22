import { h, icon } from '../../ui/dom.js';
import { toast } from '../../ui/overlay.js';
import { cleanText } from '../../text/cleaner.js';
import { diffWords, applyDecisions, countChanges } from '../../text/diff.js';
import { alertRow } from '../wizard.js';

/** Champs relus : [clé stable, libellé, lecture, écriture]. */
function reviewFields(m) {
  return [
    ['title', '🏷️ Titre', () => m.title, v => { m.title = v; }],
    ['constraints', '🧭 Contraintes', () => m.contextConstraints, v => { m.contextConstraints = v; }],
    ['goal', '🎯 Objectif', () => m.goal, v => { m.goal = v; }],
    ...m.ideas.map((idea, i) => [`idea:${idea.id}`, `💡 Idée ${i + 1}`, () => idea.text, v => { idea.text = v; }]),
    ...m.sources.map(s => [`source:${s.id}`, `📎 ${s.name || 'Source'}`, () => s.description, v => { s.description = v; }]),
    ['constraintsOther', '🎯 Autres contraintes', () => m.deliverable.constraintsOther, v => { m.deliverable.constraintsOther = v; }],
    ['criteriaOther', '🎯 Autres critères', () => m.deliverable.criteriaOther, v => { m.deliverable.criteriaOther = v; }],
  ];
}

// Une correction refusée n'est plus proposée ensuite.
const signature = (key, seg) => `${key}|${seg.from}|${seg.to}`;

function changeButton(seg, decisions, onToggle) {
  const btn = h('button', { class: `chg chg-${seg.kind}`, 'aria-pressed': 'true' });
  const paint = () => {
    const ok = decisions[seg.id] !== false;
    btn.setAttribute('aria-pressed', String(ok));
    btn.setAttribute('aria-label', `${ok ? 'Correction acceptée' : 'Correction refusée'} : « ${seg.from.trim() || '∅'} » → « ${seg.to.trim() || '∅'} ». Touche pour ${ok ? 'refuser' : 'accepter'}.`);
    if (seg.kind === 'space') {
      btn.replaceChildren(ok ? seg.to : seg.from, h('span', { class: 'nb', 'aria-hidden': 'true' }, '⍽'));
    } else {
      btn.replaceChildren(
        seg.from && h('del', {}, seg.from),
        ok && seg.to && h('ins', {}, seg.to),
      );
    }
  };
  btn.addEventListener('click', () => { decisions[seg.id] = decisions[seg.id] === false; paint(); onToggle(); });
  paint();
  return btn;
}

export function stepReview({ ctx, m, scroll, save, tip, goto, onChecks }) {
  const corrections = h('section', { class: 'review-list' });
  const report = h('section', { class: 'glass card report', 'data-tour': 'report' });
  let items = [];

  function compute() {
    const settings = ctx.store.settings;
    const skip = new Set(m.reviewSkip || []);
    items = reviewFields(m).map(([key, label, get, set]) => {
      const original = get() || '';
      const cleaned = cleanText(original, settings);
      let segments = diffWords(original, cleaned)
        .map(seg => (seg.type === 'change' && skip.has(signature(key, seg)) ? { type: 'same', text: seg.from } : seg));
      let id = 0;
      segments = segments.map(seg => (seg.type === 'change' ? { ...seg, id: id++ } : seg));
      return { key, label, set, segments, decisions: {} };
    }).filter(it => countChanges(it.segments));
  }

  function renderCorrections() {
    compute();
    if (!items.length) {
      corrections.replaceChildren(h('div', { class: 'glass card empty-ok' }, h('p', {}, '✨ Rien à corriger, ton texte est propre.')));
      if (!m.reviewed) { m.reviewed = true; save(); }
      return;
    }
    const total = items.reduce((n, it) => n + countChanges(it.segments), 0);
    const counter = h('span', { class: 'count' }, String(total));
    const updateCounter = () => {
      counter.textContent = String(items.reduce((n, it) => n + it.segments.filter(s => s.type === 'change' && it.decisions[s.id] !== false).length, 0));
    };
    corrections.replaceChildren(
      h('div', { class: 'review-head' },
        h('h2', { class: 'sec-title' }, 'Corrections proposées ', counter),
        h('p', { class: 'hint' }, h('ins', {}, 'ajouté'), ' · ', h('del', {}, 'retiré'), ' · ⍽ espace insécable. Touche une correction pour la refuser.'),
      ),
      ...items.map(it => h('article', { class: 'glass card review-item' },
        h('h3', { class: 'review-label' }, it.label),
        h('p', { class: 'review-text' }, it.segments.map(seg => seg.type === 'same'
          ? seg.text
          : changeButton(seg, it.decisions, updateCounter))),
      )),
      h('div', { class: 'row review-actions' },
        h('button', { class: 'btn', onclick: ignoreAll }, 'Tout ignorer'),
        h('button', { class: 'btn btn-primary', onclick: apply }, icon('check'), 'Appliquer'),
      ),
    );
  }

  function ignoreAll() {
    const skip = new Set(m.reviewSkip || []);
    for (const it of items) for (const seg of it.segments) if (seg.type === 'change') skip.add(signature(it.key, seg));
    m.reviewSkip = [...skip].slice(-300);
    m.reviewed = true;
    save();
    toast('Corrections ignorées');
    renderCorrections();
  }

  function apply() {
    let n = 0;
    const skip = new Set(m.reviewSkip || []);
    for (const it of items) {
      for (const seg of it.segments) {
        if (seg.type !== 'change') continue;
        if (it.decisions[seg.id] === false) skip.add(signature(it.key, seg));
        else n++;
      }
      it.set(applyDecisions(it.segments, it.decisions));
    }
    m.reviewSkip = [...skip].slice(-300);
    m.reviewed = true;
    m.promptOverride = null;
    save();
    toast(`${n} correction${n > 1 ? 's' : ''} appliquée${n > 1 ? 's' : ''} ✅`);
    renderCorrections();
  }

  function renderReport(checks = ctx_checks()) {
    const warn = checks.alerts.filter(a => a.level === 'warn');
    report.replaceChildren(
      h('div', { class: 'fuel-head' }, h('h2', { class: 'sec-title' }, 'Rapport de cohérence'), h('b', { class: 'fuel-val' }, `${checks.fuel} %`)),
      h('div', { class: 'gauge', style: { '--v': `${checks.fuel}%` } }),
      checks.alerts.length
        ? h('div', { class: 'alerts' }, checks.alerts.map(a => alertRow(a, goto)))
        : h('p', {}, '✅ Tout est cohérent. Cap sur le lancement !'),
      warn.length ? null : h('p', { class: 'hint' }, 'Les 💡 sont de simples conseils.'),
    );
  }
  let latest = null;
  const ctx_checks = () => latest;
  onChecks(c => { latest = c; renderReport(c); });

  scroll.append(h('h1', { class: 'title-xl', tabindex: -1 }, '🧹 Relecture'), tip(), corrections, report);
  renderCorrections();
}
