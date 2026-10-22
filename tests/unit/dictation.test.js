import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDictation, joinText } from '../../src/speech/dictation.js';
import { createWebEngine } from '../../src/speech/web.js';
import { convertDictatedPunctuation } from '../../src/text/punctuation.js';

/** Moteur simulé : on pilote à la main start / résultats / fin. */
function mockEngine() {
  let h = {};
  const e = {
    starts: 0, stops: 0, aborts: 0, running: false,
    on(x) { h = x; },
    start() { e.starts++; e.running = true; queueMicrotask(() => h.start?.()); },
    stop() { e.stops++; },
    abort() { e.aborts++; e.running = false; },
    say(final, interim = '') { h.result?.({ final, interim }); },
    end() { e.running = false; h.end?.(); },
    error(code) { h.error?.(code); },
  };
  return e;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup() {
  const engine = mockEngine();
  const changes = [];
  const errors = [];
  const d = createDictation({
    engine,
    transform: convertDictatedPunctuation,
    onChange: v => changes.push(v),
    onError: c => errors.push(c),
  });
  return { engine, d, changes, errors, last: () => changes.at(-1) };
}

describe('contrôleur de dictée', () => {
  it('texte provisoire puis définitif, avec ponctuation dictée', async () => {
    const { engine, d, last } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(0);
    engine.say('', 'bonjour');
    expect(last()).toMatchObject({ state: 'rec', final: '', interim: 'bonjour' });
    engine.say('bonjour virgule le monde', '');
    expect(last().final).toBe('bonjour, le monde');
  });

  it('pause garde le texte, reprendre complète la même prise', async () => {
    const { engine, d, last } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(0);
    engine.say('première partie', 'en cours');
    d.pause();
    expect(engine.stops).toBe(1);
    engine.end();
    expect(last()).toMatchObject({ state: 'pause', final: 'première partie en cours', interim: '' });
    d.resume();
    expect(engine.starts).toBe(2);
    await vi.advanceTimersByTimeAsync(0);
    engine.say('deuxième partie');
    expect(last().final).toBe('première partie en cours deuxième partie');
  });

  it('redémarre tout seul après un silence pendant l\'enregistrement', async () => {
    const { engine, d, last } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(0);
    engine.say('une phrase');
    engine.end(); // le moteur coupe (silence)
    expect(last().state).toBe('rec');
    await vi.advanceTimersByTimeAsync(300);
    expect(engine.starts).toBe(2);
    await vi.advanceTimersByTimeAsync(0);
    engine.say('la suite');
    expect(last().final).toBe('une phrase la suite');
  });

  it('stop valide la prise et attend les derniers mots', async () => {
    const { engine, d } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(0);
    engine.say('', 'presque fini');
    const p = d.stop();
    expect(d.state).toBe('stopping');
    engine.say('presque fini point');
    engine.end();
    await expect(p).resolves.toBe('presque fini.');
    expect(d.state).toBe('idle');
  });

  it('stop sans réponse du moteur : on garde quand même le texte', async () => {
    const { engine, d } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(0);
    engine.say('rien ne se perd');
    const p = d.stop();
    await vi.advanceTimersByTimeAsync(2000);
    await expect(p).resolves.toBe('rien ne se perd');
    expect(engine.aborts).toBe(1);
  });

  it('supprimer jette la prise, annuler la remet en pause', async () => {
    const { engine, d, last } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(0);
    engine.say('texte à jeter');
    const snap = d.discard();
    expect(last()).toMatchObject({ state: 'idle', final: '' });
    engine.end(); // événement tardif ignoré
    expect(last().final).toBe('');
    d.restore(snap);
    expect(last()).toMatchObject({ state: 'pause', final: 'texte à jeter' });
    const p = d.stop();
    await expect(p).resolves.toBe('texte à jeter');
  });

  it('micro refusé : passe en pause et signale l\'erreur, sans perdre le texte', async () => {
    const { engine, d, errors, last } = setup();
    d.start('déjà dicté');
    await vi.advanceTimersByTimeAsync(0);
    engine.error('not-allowed');
    expect(errors).toEqual(['not-allowed']);
    expect(last()).toMatchObject({ state: 'pause', final: 'déjà dicté' });
  });

  it('moteur muet (aucun démarrage) : indisponible', async () => {
    const engine = mockEngine();
    engine.start = () => { engine.starts++; }; // ne confirme jamais
    const errors = [];
    const d = createDictation({ engine, onError: c => errors.push(c) });
    d.start();
    await vi.advanceTimersByTimeAsync(4100);
    expect(errors).toEqual(['no-start']);
  });

  it('pause automatique après un long silence', async () => {
    const { engine, d, errors, last } = setup();
    d.start();
    for (let i = 0; i < 12; i++) {
      await vi.advanceTimersByTimeAsync(8000);
      if (d.state !== 'rec') break;
      engine.end();
      await vi.advanceTimersByTimeAsync(300);
    }
    expect(last().state).toBe('pause');
    expect(errors).toContain('silence');
  });

  it('chronomètre : ne compte pas les pauses', async () => {
    const { engine, d } = setup();
    d.start();
    await vi.advanceTimersByTimeAsync(3000);
    d.pause(); engine.end();
    await vi.advanceTimersByTimeAsync(10000);
    expect(Math.round(d.view().elapsed / 1000)).toBe(3);
  });

  it('jointure du texte', () => {
    expect(joinText('a', ', b')).toBe('a, b');
    expect(joinText('ligne\n', 'suite')).toBe('ligne\nsuite');
    expect(joinText('', 'x')).toBe('x');
  });
});

describe('moteur Web Speech', () => {
  it('agrège résultats définitifs et provisoires de la session', () => {
    let inst;
    class FakeRec {
      constructor() { inst = this; }
      start() { this.onstart?.(); }
      stop() { this.onend?.(); }
      abort() { this.onend?.(); }
    }
    const engine = createWebEngine({ win: { SpeechRecognition: FakeRec }, android: true });
    const got = [];
    engine.on({ result: r => got.push(r), start() {}, end() {} });
    engine.start('fr-FR');
    expect(inst.continuous).toBe(false);
    expect(inst.lang).toBe('fr-FR');
    const res = (t, isFinal) => Object.assign([{ transcript: t }], { isFinal });
    inst.onresult({ results: [res('bonjour', true), res(' le mon', false)] });
    expect(got.at(-1)).toEqual({ final: 'bonjour', interim: 'le mon' });
  });
});
