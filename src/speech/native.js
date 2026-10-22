// Moteur natif Android via @capacitor-community/speech-recognition.
// Particularités du plugin (v7) prises en compte :
//  - les résultats partiels ET définitifs arrivent sur le même événement « partialResults » ;
//  - stop() ne rend jamais la main (on ne l'attend pas) ;
//  - une coupure sur silence sans parole ne déclenche aucun événement : on surveille isListening().
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const SETTLE = 900; // délai pour recevoir le résultat définitif après la fin de parole

function mapError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('permission')) return 'not-allowed';
  if (msg.includes('not available') || msg.includes('unavailable')) return 'not-available';
  if (msg.includes('network')) return 'network';
  return 'not-available';
}

export function createNativeEngine() {
  let handlers = {};
  let last = '';
  let active = false;
  let ready = null;
  let settle = null;
  let watchdog = null;

  function setup() {
    return Promise.all([
      SpeechRecognition.addListener('partialResults', data => {
        if (!active) return;
        last = data?.matches?.[0] ?? last;
        handlers.result?.({ final: '', interim: last });
      }),
      SpeechRecognition.addListener('listeningState', data => {
        if (active && data?.status === 'stopped') scheduleEnd(SETTLE);
      }),
    ]);
  }

  function scheduleEnd(ms) {
    clearTimeout(settle);
    settle = setTimeout(finish, ms);
  }

  function finish() {
    clearTimeout(settle); settle = null;
    clearInterval(watchdog); watchdog = null;
    if (!active) return;
    active = false;
    handlers.result?.({ final: last, interim: '' });
    last = '';
    handlers.end?.();
  }

  return {
    id: 'native',
    supported: true,
    async available() {
      try { return (await SpeechRecognition.available()).available; } catch { return false; }
    },
    async ensurePermission() {
      let p = await SpeechRecognition.checkPermissions();
      if (p.speechRecognition !== 'granted') p = await SpeechRecognition.requestPermissions();
      return p.speechRecognition === 'granted';
    },
    async prepare() { await (ready ||= setup()); },
    on(h) { handlers = h; },
    async start(lang = 'fr-FR') {
      await (ready ||= setup());
      last = '';
      clearTimeout(settle); settle = null;
      try {
        await SpeechRecognition.start({ language: lang, partialResults: true, popup: false, maxResults: 1 });
      } catch (err) {
        handlers.error?.(mapError(err));
        handlers.end?.();
        return;
      }
      active = true;
      handlers.start?.();
      clearInterval(watchdog);
      watchdog = setInterval(async () => {
        if (!active || settle) return;
        try {
          const { listening } = await SpeechRecognition.isListening();
          if (!listening) scheduleEnd(SETTLE);
        } catch { /* ignoré */ }
      }, 1500);
    },
    stop() {
      if (!active) return;
      SpeechRecognition.stop(); // ne résout jamais : on n'attend pas
      scheduleEnd(SETTLE + 400);
    },
    abort() {
      active = false;
      last = '';
      clearTimeout(settle); settle = null;
      clearInterval(watchdog); watchdog = null;
      SpeechRecognition.stop();
    },
  };
}
