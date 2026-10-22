// Moteur « Web Speech API » (navigateur / PWA).
// Chrome Android répète les résultats en mode continu : on y coupe le mode continu,
// le contrôleur relance la session à chaque fin.

export function webSpeechCtor(win = globalThis) {
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function createWebEngine({ win = globalThis, android = /Android/i.test(globalThis.navigator?.userAgent || '') } = {}) {
  const Ctor = webSpeechCtor(win);
  let handlers = {};
  let rec = null;
  let local = null; // reconnaissance sur l'appareil disponible (Chrome récent)

  async function checkLocal(lang) {
    if (local !== null) return local;
    try {
      if (typeof Ctor?.available === 'function') {
        local = (await Ctor.available({ langs: [lang], processLocally: true })) === 'available';
      } else local = false;
    } catch { local = false; }
    return local;
  }

  return {
    id: 'web',
    supported: !!Ctor,
    async ensurePermission() { return true; }, // le navigateur demande lui-même à la 1re écoute
    async prepare(lang) { await checkLocal(lang); },
    on(h) { handlers = h; },
    start(lang = 'fr-FR') {
      if (!Ctor) throw new Error('not-available');
      const r = new Ctor();
      rec = r;
      r.lang = lang;
      r.continuous = !android;
      r.interimResults = true;
      r.maxAlternatives = 1;
      if (local && 'processLocally' in r) r.processLocally = true;
      r.onstart = () => rec === r && handlers.start?.();
      r.onresult = e => {
        if (rec !== r) return;
        let final = '', interim = '';
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) final += ' ' + res[0].transcript;
          else interim += ' ' + res[0].transcript;
        }
        handlers.result?.({ final: final.replace(/\s+/g, ' ').trim(), interim: interim.replace(/\s+/g, ' ').trim() });
      };
      r.onerror = e => rec === r && handlers.error?.(e.error);
      r.onend = () => {
        if (rec !== r) return;
        rec = null;
        handlers.end?.();
      };
      r.start();
    },
    stop() { rec?.stop(); },
    abort() {
      const r = rec;
      rec = null;
      r?.abort();
    },
  };
}
