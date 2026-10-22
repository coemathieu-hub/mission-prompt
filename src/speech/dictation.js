// Contrôleur de dictée, indépendant du moteur et du DOM.
//
// Les moteurs (Web Speech, reconnaissance Android) n'ont pas de vraie pause :
//  - Pause    = on arrête la session en gardant le texte.
//  - Reprendre = nouvelle session qui complète la même prise.
//  - Si le moteur coupe tout seul (silence) alors qu'on est en « enregistrement », on relance.
//
// États : idle → rec ⇄ pause → (stop) idle. « stopping » = on attend les derniers mots du moteur.

const FATAL = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported', 'not-available', 'no-start', 'restart-loop']);
const START_TIMEOUT = 4000;   // pas de démarrage du moteur au bout de 4 s → indisponible
const END_TIMEOUT = 1800;     // le moteur doit rendre la main après stop()
const RESTART_DELAY = 250;
const SILENCE_PAUSE = 90_000; // 1 min 30 sans rien entendre → pause automatique

export const joinText = (a = '', b = '') => {
  a = a.replace(/^\s+/, '').replace(/[ \t]+$/, '');
  b = b.replace(/^[ \t]+/, '').replace(/\s+$/, '');
  if (!a.trim() || !b.trim()) return (a + b).trim();
  return /^[,.;:!?…\n]/.test(b) || /\n$/.test(a) ? `${a}${b}` : `${a} ${b}`;
};

export function createDictation({
  engine,
  lang = 'fr-FR',
  transform = t => t,
  onChange = () => {},
  onError = () => {},
  now = () => Date.now(),
  timers = { set: (fn, ms) => setTimeout(fn, ms), clear: id => clearTimeout(id) },
}) {
  let state = 'idle';
  let committed = '';
  let session = { final: '', interim: '' };
  let open = false;            // une session moteur est en cours
  let token = 0;               // invalide les événements d'une session abandonnée
  let started = false;         // le moteur a confirmé le démarrage
  let elapsed = 0, since = 0;
  let lastHeard = 0;
  let emptyRestarts = 0;
  let stopResolve = null;
  const t = { start: null, end: null, restart: null };

  const clear = key => { if (t[key] != null) { timers.clear(t[key]); t[key] = null; } };
  const sessionText = () => joinText(session.final, session.interim);
  const view = () => ({
    state,
    final: joinText(committed, transform(session.final)),
    interim: session.interim.trim(),
    elapsed: elapsed + (state === 'rec' && since ? now() - since : 0),
  });
  const emit = () => onChange(view());

  engine.on({
    start: () => {
      if (!open) return;
      started = true;
      clear('start');
      emit();
    },
    result: r => {
      if (!open) return;
      session = { final: r.final || '', interim: r.interim || '' };
      if (sessionText()) lastHeard = now();
      emit();
    },
    error: code => {
      if (!open && !FATAL.has(code)) return;
      if (FATAL.has(code)) fail(code);
      // « no-speech », « aborted »… : la fin de session suit, on relancera.
    },
    end: () => handleEnd(token),
  });

  function openSession() {
    clear('restart');
    token++;
    open = true;
    started = false;
    session = { final: '', interim: '' };
    if (state === 'rec') since = now();
    const my = token;
    t.start = timers.set(() => { if (my === token && open && !started) fail('no-start'); }, START_TIMEOUT);
    try {
      engine.start(lang);
    } catch {
      fail('not-available');
    }
  }

  function closeSession() {
    const text = transform(sessionText());
    if (text) committed = joinText(committed, text);
    session = { final: '', interim: '' };
    open = false;
    clear('start');
    clear('end');
    return text;
  }

  function pauseClock() {
    if (since) { elapsed += now() - since; since = 0; }
  }

  function handleEnd(my) {
    if (my !== token || !open) return;
    const text = closeSession();
    if (state === 'rec') {
      emptyRestarts = text ? 0 : emptyRestarts + 1;
      if (emptyRestarts >= 6 && !started) return fail('restart-loop');
      if (now() - lastHeard > SILENCE_PAUSE) {
        pauseClock();
        state = 'pause';
        emit();
        onError('silence');
        return;
      }
      emit();
      t.restart = timers.set(() => { if (state === 'rec' && !open) openSession(); }, RESTART_DELAY);
    } else if (state === 'stopping') {
      finishStop();
    } else {
      emit();
    }
  }

  function finishStop() {
    const text = committed;
    committed = '';
    elapsed = 0;
    since = 0;
    state = 'idle';
    emit();
    stopResolve?.(text);
    stopResolve = null;
  }

  /** Ferme la session en cours sans attendre le moteur (sécurité si `end` n'arrive jamais). */
  function forceEnd() {
    const my = token;
    clear('end');
    t.end = timers.set(() => {
      if (my !== token || !open) return;
      try { engine.abort(); } catch { /* ignoré */ }
      handleEnd(my);
    }, END_TIMEOUT);
  }

  function fail(code) {
    token++;
    if (open) { try { engine.abort(); } catch { /* ignoré */ } }
    if (open) closeSession();
    open = false;
    clear('start'); clear('end'); clear('restart');
    pauseClock();
    if (state === 'stopping') finishStop();
    else if (state !== 'idle') { state = 'pause'; emit(); }
    onError(code);
  }

  return {
    get state() { return state; },
    view,

    start(initial = '') {
      if (state !== 'idle') return;
      committed = initial;
      elapsed = 0;
      emptyRestarts = 0;
      lastHeard = now();
      state = 'rec';
      openSession();
      emit();
    },

    pause() {
      if (state !== 'rec') return;
      clear('restart');
      pauseClock();
      state = 'pause';
      if (open) { engine.stop(); forceEnd(); }
      emit();
    },

    resume() {
      if (state !== 'pause') return;
      state = 'rec';
      emptyRestarts = 0;
      lastHeard = now();
      if (!open) openSession();
      else since = now(); // la session de pause n'est pas encore close : on la garde
      emit();
    },

    /** Valide la prise. Résout avec le texte complet. */
    stop() {
      if (state === 'idle') return Promise.resolve('');
      clear('restart');
      pauseClock();
      return new Promise(resolve => {
        stopResolve = resolve;
        if (open) {
          state = 'stopping';
          engine.stop();
          forceEnd();
          emit();
        } else {
          finishStop();
        }
      });
    },

    /** Jette la prise en cours. Retourne de quoi l'annuler. */
    discard() {
      const snap = { text: joinText(committed, transform(sessionText())), elapsed: view().elapsed };
      token++;
      if (open) { try { engine.abort(); } catch { /* ignoré */ } }
      open = false;
      clear('start'); clear('end'); clear('restart');
      committed = '';
      session = { final: '', interim: '' };
      elapsed = 0; since = 0;
      state = 'idle';
      stopResolve?.('');
      stopResolve = null;
      emit();
      return snap;
    },

    /** Annule une suppression : la prise revient, en pause. */
    restore(snap) {
      if (state !== 'idle') return;
      committed = snap.text;
      elapsed = snap.elapsed;
      state = 'pause';
      emit();
    },

    dispose() {
      token++;
      if (open) { try { engine.abort(); } catch { /* ignoré */ } }
      open = false;
      clear('start'); clear('end'); clear('restart');
    },
  };
}
